/**
 * EffectsManager.js
 * Gestión de efectos visuales cinematográficos:
 * - Llamaradas de motores con diamantes de choque y conos térmicos PBR
 * - Ráfagas de propulsores RCS de gas frío
 * - Envoltura de plasma incandescente durante la reentrada atmosférica
 * - Polvo lunar de alunizaje
 */

import * as THREE from 'three';

export class EffectsManager {
  constructor(scene) {
    this.scene = scene;
    this.effects = {};
    this.initFlameMaterials();
    this.createExhaustPlumes();
    this.createPlasmaEnvelope();
    this.createRCSPuffs();
  }

  initFlameMaterials() {
    // Textura de gradiente para las llamaradas de los motores
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');   // Núcleo blanco caliente
    grad.addColorStop(0.15, 'rgba(255, 200, 50, 0.95)'); // Amarillo brillante
    grad.addColorStop(0.5, 'rgba(255, 80, 0, 0.8)');     // Naranja intenso
    grad.addColorStop(0.85, 'rgba(180, 20, 0, 0.4)');    // Rojo térmico
    grad.addColorStop(1.0, 'rgba(50, 0, 0, 0.0)');       // Dispersión

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 512);

    const flameTex = new THREE.CanvasTexture(canvas);

    // Material de llama F-1 (Kerosene / LOX - Fuego masivo naranja)
    this.flameMaterialF1 = new THREE.MeshBasicMaterial({
      map: flameTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Material de llama J-2 (LH2 / LOX - Azul/púrpura casi transparente en vacío)
    const j2Canvas = document.createElement('canvas');
    j2Canvas.width = 128;
    j2Canvas.height = 512;
    const j2Ctx = j2Canvas.getContext('2d');

    const j2Grad = j2Ctx.createLinearGradient(0, 0, 0, 512);
    j2Grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    j2Grad.addColorStop(0.2, 'rgba(100, 200, 255, 0.7)');
    j2Grad.addColorStop(0.6, 'rgba(160, 120, 255, 0.4)');
    j2Grad.addColorStop(1.0, 'rgba(0, 50, 150, 0.0)');

    j2Ctx.fillStyle = j2Grad;
    j2Ctx.fillRect(0, 0, 128, 512);
    const j2Tex = new THREE.CanvasTexture(j2Canvas);

    this.flameMaterialJ2 = new THREE.MeshBasicMaterial({
      map: j2Tex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Material de gas frío RCS
    this.rcsMaterial = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Material de plasma de reentrada
    this.plasmaMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
  }

  createExhaustPlumes() {
    // 1. Penacho de los 5 motores F-1 de la primera etapa
    const f1PlumeGroup = new THREE.Group();
    f1PlumeGroup.name = 'F1_Exhaust_Plume';

    const f1Positions = [
      { x: 0, z: 0, scale: 1.2 },
      { x: 1.35, z: 0, scale: 1.0 },
      { x: -1.35, z: 0, scale: 1.0 },
      { x: 0, z: 1.35, scale: 1.0 },
      { x: 0, z: -1.35, scale: 1.0 }
    ];

    f1Positions.forEach((pos) => {
      // Cono de llama exterior
      const coneGeo = new THREE.ConeGeometry(0.85 * pos.scale, 8.5 * pos.scale, 16, 1, true);
      const cone = new THREE.Mesh(coneGeo, this.flameMaterialF1);
      cone.position.set(pos.x, -4.5 * pos.scale, pos.z);
      cone.rotation.x = Math.PI;
      f1PlumeGroup.add(cone);

      // Núcleo hipercaliente interior
      const coreGeo = new THREE.ConeGeometry(0.35 * pos.scale, 4.0 * pos.scale, 12, 1, true);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(pos.x, -2.0 * pos.scale, pos.z);
      core.rotation.x = Math.PI;
      f1PlumeGroup.add(core);
    });

    // Luz dinámica de fuego
    const f1Light = new THREE.PointLight(0xff6a00, 3.5, 45);
    f1Light.position.set(0, -6, 0);
    f1PlumeGroup.add(f1Light);

    f1PlumeGroup.visible = false;
    this.scene.add(f1PlumeGroup);
    this.effects.f1Plume = f1PlumeGroup;

    // 2. Penacho de vacío para etapa S-II / S-IVB
    const j2PlumeGroup = new THREE.Group();
    j2PlumeGroup.name = 'J2_Exhaust_Plume';

    const j2ConeGeo = new THREE.ConeGeometry(1.6, 6.0, 16, 1, true);
    const j2Cone = new THREE.Mesh(j2ConeGeo, this.flameMaterialJ2);
    j2Cone.position.y = -3.0;
    j2Cone.rotation.x = Math.PI;
    j2PlumeGroup.add(j2Cone);

    const j2Light = new THREE.PointLight(0x38bdf8, 2.0, 30);
    j2Light.position.set(0, -2, 0);
    j2PlumeGroup.add(j2Light);

    j2PlumeGroup.visible = false;
    this.scene.add(j2PlumeGroup);
    this.effects.j2Plume = j2PlumeGroup;
  }

  createPlasmaEnvelope() {
    // Envoltura de plasma de choque térmico durante reentrada
    const plasmaGroup = new THREE.Group();
    plasmaGroup.name = 'Reentry_Plasma_Envelope';

    const domeGeo = new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
    const dome = new THREE.Mesh(domeGeo, this.plasmaMaterial);
    dome.position.y = -0.3;
    dome.rotation.x = Math.PI;
    plasmaGroup.add(dome);

    const plasmaLight = new THREE.PointLight(0xff4400, 4.0, 20);
    plasmaLight.position.set(0, -0.5, 0);
    plasmaGroup.add(plasmaLight);

    plasmaGroup.visible = false;
    this.scene.add(plasmaGroup);
    this.effects.plasmaEnvelope = plasmaGroup;
  }

  createRCSPuffs() {
    const rcsGroup = new THREE.Group();
    rcsGroup.name = 'RCS_Puffs';

    for (let i = 0; i < 6; i++) {
      const puffGeo = new THREE.ConeGeometry(0.15, 0.9, 8);
      const puff = new THREE.Mesh(puffGeo, this.rcsMaterial);
      puff.position.set(Math.cos(i) * 1.2, 0, Math.sin(i) * 1.2);
      puff.rotation.set(Math.random(), Math.random(), Math.random());
      rcsGroup.add(puff);
    }

    rcsGroup.visible = false;
    this.scene.add(rcsGroup);
    this.effects.rcsPuffs = rcsGroup;
  }

  update(deltaTime, elapsed) {
    // Micro-oscilación de las llamas para dinamismo realista
    if (this.effects.f1Plume && this.effects.f1Plume.visible) {
      const flicker = 1.0 + Math.sin(elapsed * 45) * 0.08 + Math.cos(elapsed * 70) * 0.05;
      this.effects.f1Plume.scale.set(flicker, 0.95 + flicker * 0.1, flicker);
    }

    if (this.effects.j2Plume && this.effects.j2Plume.visible) {
      const flicker = 1.0 + Math.sin(elapsed * 35) * 0.06;
      this.effects.j2Plume.scale.set(flicker, flicker, flicker);
    }

    if (this.effects.plasmaEnvelope && this.effects.plasmaEnvelope.visible) {
      const flicker = 1.0 + Math.sin(elapsed * 50) * 0.12;
      this.effects.plasmaEnvelope.scale.set(flicker, flicker, flicker);
    }
  }

  setStageEffects(stageData, rocketParts) {
    // Apagar todos los efectos por defecto
    if (this.effects.f1Plume) this.effects.f1Plume.visible = false;
    if (this.effects.j2Plume) this.effects.j2Plume.visible = false;
    if (this.effects.plasmaEnvelope) this.effects.plasmaEnvelope.visible = false;
    if (this.effects.rcsPuffs) this.effects.rcsPuffs.visible = false;

    if (!stageData || !stageData.effects) return;

    const eff = stageData.effects;

    // Ignición primera etapa
    if (eff.ignition && (stageData.id === 2 || stageData.id === 3)) {
      if (this.effects.f1Plume && rocketParts.s1c) {
        this.effects.f1Plume.visible = true;
        this.effects.f1Plume.position.copy(rocketParts.s1c.position);
        this.effects.f1Plume.position.y -= 10.6;
      }
    }

    // Quema J-2 segunda o tercera etapa
    if (eff.exhaustPlume === 'j2-vacuum' || eff.spsBurn || stageData.id === 5 || stageData.id === 8) {
      if (this.effects.j2Plume) {
        this.effects.j2Plume.visible = true;
        if (stageData.id === 5 && rocketParts.s2) {
          this.effects.j2Plume.position.copy(rocketParts.s2.position);
          this.effects.j2Plume.position.y -= 5.65;
        } else if (stageData.id === 8 && rocketParts.s4b) {
          this.effects.j2Plume.position.copy(rocketParts.s4b.position);
          this.effects.j2Plume.position.y -= 4.25;
        } else if (rocketParts.sm) {
          this.effects.j2Plume.position.copy(rocketParts.sm.position);
          this.effects.j2Plume.position.y -= 2.7;
        }
      }
    }

    // Plasma de reentrada
    if (eff.plasmaGlow && rocketParts.cm) {
      if (this.effects.plasmaEnvelope) {
        this.effects.plasmaEnvelope.visible = true;
        this.effects.plasmaEnvelope.position.copy(rocketParts.cm.position);
      }
    }

    // Disparos RCS
    if (eff.rcsPuffs) {
      if (this.effects.rcsPuffs && rocketParts.sm) {
        this.effects.rcsPuffs.visible = true;
        this.effects.rcsPuffs.position.copy(rocketParts.sm.position);
      }
    }
  }
}
