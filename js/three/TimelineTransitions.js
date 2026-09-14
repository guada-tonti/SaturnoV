import * as THREE from 'three';

// Estados finales independientes del recorrido; un único tween por acontecimiento.
export class TimelineTransitions {
  constructor(animator, camera, stages) {
    this.animator = animator;
    this.camera = camera;
    this.scene = animator.sceneManager;
    this.root = this.scene.rocketRoot;
    this.parts = animator.parts;
    this.stages = stages;
    this.baseline = this.capture();
    this.states = new Map();
    this.currentIndex = 0;
    this.tween = null;
  }

  capture() {
    const state = [];
    this.root.traverse(object => state.push({ object, position: object.position.clone(),
      quaternion: object.quaternion.clone(), scale: object.scale.clone(), visible: object.visible }));
    return state;
  }

  apply(state, preserveRoot = true) {
    state.forEach((entry, i) => {
      if (i === 0 && preserveRoot) return;
      const { object, position, quaternion, scale, visible } = entry;
      object.position.copy(position);
      object.quaternion.copy(quaternion);
      object.scale.copy(scale);
      object.visible = visible;
    });
    this.root.updateMatrixWorld(true);
  }

  stateAt(index) {
    if (!this.states.has(index)) {
      const saved = this.capture();
      const previousId = this.animator.currentStageIndex;
      this.apply(this.baseline, false);
      // Las coreografías existentes siguen siendo la fuente de las poses finales.
      // Evaluarlas sin tiempo ni efectos no reproduce etapas intermedias.
      const context = window.gsap.context(() => this.animator.transitionToStage(this.stages[index], 0, false));
      context.getTweens().forEach(tween => tween.totalProgress(1));
      context.kill();
      const id = this.stages[index].id;
      const { s1c, s2, les, s4b, iu, sla, lm, cm, sm } = this.parts;
      if (id >= 4) { s1c.visible = false; les.visible = false; }
      if (id >= 6) s2.visible = false;
      if (id >= 12) { s4b.visible = false; iu.visible = false; sla.visible = false; }
      if (id >= 21) sm.visible = false;
      // Misma referencia espacial durante descenso, alunizaje y ascenso.
      if (id >= 16 && id <= 19) lm.position.set(-3, 15, 3);
      if (id === 19) {
        lm.userData.ascentStage.position.y = 3.5;
        cm.position.set(-3, 20.2, 3);
        sm.position.set(-3, 22.43, 3);
      }
      this.states.set(index, this.capture());
      this.apply(saved, false);
      this.animator.currentStageIndex = previousId;
    }
    return this.states.get(index);
  }

  cancel() {
    this.tween?.kill();
    this.tween = null;
    this.camera.cancel();
    this.root.traverse(object => window.gsap.killTweensOf([object.position, object.rotation, object.scale]));
    this.scene.isVehicleTransitioning = false;
  }

  setStageState(index, cameraDuration = 0.65) {
    this.cancel();
    this.currentIndex = index;
    this.apply(this.stateAt(index));
    this.animator.currentStageIndex = this.stages[index].id;
    this.animator.effectsManager.setStageEffects(this.stages[index], this.parts);
    this.camera.autoFrameStage(this.stages[index], cameraDuration);
  }

  transitionTo(index) {
    const forward = index > this.currentIndex;
    const prepareCamera = index !== this.currentIndex + 1 || this.tween !== null || this.camera.isAnimating;
    this.cancel();
    // Retroceder es una consulta de estado, no una recuperación física de piezas descartadas.
    if (!forward) { this.setStageState(index); return; }
    this.currentIndex = index;
    const stage = this.stages[index];
    const clone = state => state.map(entry => ({ ...entry, position: entry.position.clone(),
      quaternion: entry.quaternion.clone(), scale: entry.scale.clone() }));
    const start = clone(this.stateAt(index - 1));
    const end = this.stateAt(index);
    const motionEnd = clone(end);
    const entry = (state, object) => state.find(item => item.object === object);
    const { cm, sm, lm, parachutes, sla } = this.parts;
    const departing = new Set();
    const departure = (object, offset = null) => {
      departing.add(object);
      // Un conjunto que sale conserva sus piezas y su configuración de origen.
      object.traverse(child => {
        if (child === object) return;
        const from = entry(start, child), to = entry(motionEnd, child);
        to.position.copy(from.position);
        to.quaternion.copy(from.quaternion);
        to.scale.copy(from.scale);
        to.visible = from.visible;
      });
      if (offset) {
        const from = entry(start, object), to = entry(motionEnd, object);
        to.position.copy(from.position).add(offset);
        to.quaternion.copy(from.quaternion);
      }
    };
    // Solo las salidas que pertenecen al acontecimiento N-1 → N.
    const discarded = { 4: ['s1c', 'les'], 6: ['s2'], 12: ['s4b', 'iu', 'sla'], 21: ['sm'] };
    (discarded[stage.id] || []).forEach(key => departure(this.parts[key]));
    if (stage.id === 16) {
      [cm, sm].forEach(part => departure(part, new THREE.Vector3(14, 6, -8)));
    }
    if (stage.id === 19) {
      departure(lm.userData.descentStage, new THREE.Vector3(0, -18, 0));
      // El CSM ya está orientado para acoplarse: se aproxima unido por su eje longitudinal.
      [cm, sm].forEach(part => {
        const from = entry(start, part), to = entry(end, part);
        from.position.copy(to.position).add(new THREE.Vector3(0, 16, 0));
        from.quaternion.copy(to.quaternion);
        from.visible = true;
      });
    }
    if (stage.id === 20) departure(lm, new THREE.Vector3(-16, -5, 0));
    if (stage.id === 23) {
      const from = entry(start, parachutes), to = entry(end, parachutes);
      from.position.copy(to.position);
      from.scale.setScalar(0.01);
      from.visible = true;
    }
    if (stage.id === 24) {
      departure(parachutes, new THREE.Vector3(0, 12, 0));
      entry(motionEnd, parachutes).scale.setScalar(0.1);
    }
    // Cambiar la cubierta cerrada por los cuatro pétalos antes de abrir, sin huecos previos.
    if (stage.id === 10) {
      entry(start, sla.userData.closedCover).visible = false;
      sla.userData.petals.forEach(petal => { entry(start, petal).visible = true; });
      entry(start, lm).visible = true;
    }
    const duration = 1.8;
    this.apply(start);
    if (prepareCamera) this.camera.autoFrameStage(this.stages[index - 1], 0);
    // Encuadrar el destino sin que los elementos descartados determinen el zoom.
    this.apply(end);
    const frame = this.camera.frameForStage(stage);
    this.apply(start);
    this.camera.moveTo(frame.position, frame.target, duration);
    this.scene.idleRotationPivot = frame.pivot;
    this.scene.isVehicleTransitioning = true;
    this.animator.currentStageIndex = stage.id;
    this.animator.effectsManager.setStageEffects(stage, this.parts);

    const tracks = start.map((from, i) => {
      const to = motionEnd[i], object = from.object;
      if (object === this.root) return null;
      const leaving = departing.has(object);
      object.visible = leaving || to.visible;
      if (!from.visible && to.visible) {
        object.position.copy(to.position);
        object.quaternion.copy(to.quaternion);
        object.scale.copy(to.scale);
        return null;
      }
      if (!object.visible) return null;
      if (from.position.equals(to.position) && from.quaternion.equals(to.quaternion) && from.scale.equals(to.scale)) return null;
      return { object, from, to };
    }).filter(Boolean);
    const cmFrom = entry(start, cm), smFrom = entry(start, sm);
    const cmTo = entry(motionEnd, cm), smTo = entry(motionEnd, sm);
    const joint = smFrom.position.clone().sub(cmFrom.position).applyQuaternion(cmFrom.quaternion.clone().invert());
    const endJoint = smTo.position.clone().sub(cmTo.position).applyQuaternion(cmTo.quaternion.clone().invert());
    const rigid = cm.visible && sm.visible && joint.distanceTo(endJoint) < 0.001;
    const progress = { value: 0 };
    this.tween = window.gsap.to(progress, {
      value: 1, duration, ease: 'power2.inOut',
      onUpdate: () => {
        const t = progress.value;
        tracks.forEach(({ object, from, to }) => {
          object.position.lerpVectors(from.position, to.position, t);
          object.quaternion.slerpQuaternions(from.quaternion, to.quaternion, t);
          object.scale.lerpVectors(from.scale, to.scale, t);
        });
        if (rigid) {
          sm.position.copy(joint).applyQuaternion(cm.quaternion).add(cm.position);
          sm.quaternion.copy(cm.quaternion);
        }
        // La bisagra del SLA requiere un arco, no interpolación lineal de sus extremos.
        if (stage.id === 10) this.animator.setSLAPetalAngle(Math.PI / 4 * t);
        if (stage.id === 23) {
          parachutes.position.copy(cm.position).add(new THREE.Vector3(0, 0.73, 0).applyQuaternion(cm.quaternion));
          parachutes.quaternion.copy(cm.quaternion);
        }
      },
      onComplete: () => {
        this.apply(end);
        this.tween = null;
        this.scene.isVehicleTransitioning = false;
      }
    });
  }
}
