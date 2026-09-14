/**
 * CameraChoreographer.js
 * Control cinemático de cámara con AUTO-FRAMING inteligente.
 * Calcula automáticamente la distancia y encuadre óptimo según el tamaño y configuración
 * 3D de la nave activa en cada etapa, respetando el área disponible entre paneles UI.
 */

import * as THREE from 'three';

export class CameraChoreographer {
  constructor(camera, controls, rocketParts, sceneManager = null) {
    this.camera = camera;
    this.controls = controls;
    this.parts = rocketParts;
    this.sceneManager = sceneManager;
    this.isAnimating = false;
    this.currentActiveParts = null;
    this.currentStageData = null;

    // Escuchar redimensionamiento de ventana para recalcular auto-framing
    window.addEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Auto-framing matemático según los componentes activos de la etapa
   */
  autoFrameStage(stageData, duration = 1.6) {
    const frame = this.frameForStage(stageData);
    this.sceneManager.idleRotationPivot = frame.pivot;
    this.moveTo(frame.position, frame.target, duration);
  }

  frameForStage(stageData) {
    this.currentStageData = stageData;
    this.currentActiveParts = stageData.activeParts || Object.keys(this.parts);
    const box = this.computeActiveBoundingBox(this.currentActiveParts);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const width = window.innerWidth, height = window.innerHeight;
    const timelinePanel = document.getElementById('timeline-container');
    const telemetryPanel = document.getElementById('telemetry-container');
    const left = (timelinePanel?.hidden ? document.getElementById('inspector-container') : timelinePanel)?.getBoundingClientRect();
    const right = (telemetryPanel?.hidden ? document.getElementById('component-detail-container') : telemetryPanel)?.getBoundingClientRect();
    const availableWidth = width >= 1024 && left && right
      ? Math.max(160, right.left - left.right - 32) : width * 0.9;
    const availableHeight = Math.max(200, height - 150);
    const tanY = Math.tan(this.camera.fov * Math.PI / 360);
    const tanX = tanY * this.camera.aspect;
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    if (direction.lengthSq() === 0) direction.set(0.37, 0.12, 0.92).normalize();
    // Mantener el ángulo elegido; sólo desplazar el centro y ajustar la distancia necesaria.
    const distance = Math.max(
      Math.max(size.y, 2) / (2 * tanY * availableHeight / height),
      Math.max(size.x, size.z, 2) / (2 * tanX * availableWidth / width)
    ) * 1.15 + size.z * 0.5;
    return {
      position: center.clone().addScaledVector(direction, distance),
      target: center,
      pivot: this.sceneManager.rocketRoot.worldToLocal(center.clone())
    };
  }

  computeActiveBoundingBox(activePartKeys) {
    this.sceneManager.rocketRoot.updateMatrixWorld(true);
    const box = new THREE.Box3();
    activePartKeys.forEach(key => {
      const part = key === 'lm_ascent' ? this.parts.lm?.userData.ascentStage
        : key === 'sla_panels' ? this.parts.sla : this.parts[key];
      if (!part) return;
      for (let parent = part; parent; parent = parent.parent) if (!parent.visible) return;
      part.traverseVisible(object => {
        if (!object.geometry) return;
        if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
        box.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
      });
    });
    if (box.isEmpty()) { box.min.set(-2.5, -24.2, -2.5); box.max.set(2.5, 24.1, 2.5); }
    return box;
  }

  cancel() {
    window.gsap?.killTweensOf([this.camera.position, this.controls.target, this.camera]);
    this.sceneManager.targetZoomDistance = null;
    this.isAnimating = false;
  }

  /**
   * Mueve suavemente la cámara a una posición y objetivo determinados usando GSAP
   */
  moveTo(targetPos, targetLookAt, duration = 1.8, fov = null) {
    if (this.sceneManager) {
      this.sceneManager.targetZoomDistance = null;
    }

    const gsap = window.gsap;
    if (!gsap || duration === 0) {
      this.cancel();
      this.camera.position.copy(targetPos);
      this.controls.target.copy(targetLookAt);
      this.controls.update();
      if (fov) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      }
      return;
    }

    this.isAnimating = true;
    // Un cambio de modo/foco reemplaza la transición anterior, no la superpone.
    gsap.killTweensOf([this.camera.position, this.controls.target, this.camera]);

    // Animación de la posición de la cámara
    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.controls.update();
      },
      onComplete: () => {
        this.isAnimating = false;
      }
    });

    // Animación del centro de interés (lookAt / orbit target)
    gsap.to(this.controls.target, {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration: duration,
      ease: 'power2.inOut'
    });

    // Animación de campo de visión si se especifica
    if (fov && this.camera.fov !== fov) {
      gsap.to(this.camera, {
        fov: fov,
        duration: duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.camera.updateProjectionMatrix();
        }
      });
    }
  }

  /**
   * Encuadra una pieza específica del cohete en el Inspector
   */
  focusOnPart(partData) {
    if (!partData || !partData.cameraOffset || !partData.cameraTarget) return;

    this.moveTo(
      partData.cameraOffset,
      partData.cameraTarget,
      1.5,
      28
    );
  }

  /**
   * Vista general completa del Saturn V (110m)
   */
  viewFullRocket(duration = 1.8) {
    if (this.currentStageData) {
      this.autoFrameStage(this.currentStageData, duration);
    } else {
      this.autoFrameStage({ activeParts: ['s1c', 's2', 's4b', 'sla', 'lm', 'sm', 'cm', 'les'] }, duration);
    }
  }

  /**
   * Encuadre para el modo Cutaway / Interior
   */
  viewInteriorCutaway(partId) {
    if (partId === 'cm') {
      this.moveTo(
        { x: 2.2, y: 19.5, z: 3.8 },
        { x: 0, y: 19.3, z: 0 },
        1.5,
        24
      );
    } else if (partId === 'lm') {
      this.moveTo(
        { x: 2.5, y: 13.8, z: 4.2 },
        { x: 0, y: 13.3, z: 0 },
        1.5,
        26
      );
    }
  }

  onResize() {
    if (this.currentStageData && !this.isAnimating) {
      // Recalcular suavemente al redimensionar ventana
      this.autoFrameStage(this.currentStageData, 0.4);
    }
  }
}
