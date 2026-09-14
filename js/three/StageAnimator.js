/**
 * StageAnimator.js
 * Orquestador de transformaciones físicas continuas del Saturn V en 3D.
 * Implementa ensamblaje continuo (sin espacios artificiales) y cinemáticas
 * de separación y transposición históricamente exactas.
 */

import * as THREE from 'three';

export class StageAnimator {
  constructor(rocketParts, sceneManager, effectsManager) {
    this.parts = rocketParts;
    this.sceneManager = sceneManager;
    this.effectsManager = effectsManager;

    // Posiciones y rotaciones base de cada componente (Ensamblaje flush continuo)
    this.baseTransforms = {
      s1c: { pos: new THREE.Vector3(0, -13.6, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      s2: { pos: new THREE.Vector3(0, -0.25, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      s4b: { pos: new THREE.Vector3(0, 8.25, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      iu: { pos: new THREE.Vector3(0, 11.98, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      sla: { pos: new THREE.Vector3(0, 13.86, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      lm: { pos: new THREE.Vector3(0, 13.25, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      sm: { pos: new THREE.Vector3(0, 17.06, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      cm: { pos: new THREE.Vector3(0, 19.29, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      les: { pos: new THREE.Vector3(0, 21.90, 0), rot: new THREE.Euler(0, 0, 0), visible: true },
      parachutes: { pos: new THREE.Vector3(0, 23.5, 0), rot: new THREE.Euler(0, 0, 0), visible: false }
    };

    this.currentStageIndex = 0;
    this.isTransitioning = false;
  }

  /* =========================================================================
   * TRANSICIÓN PRINCIPAL A UNA ETAPA ESPECÍFICA (1 a 24)
   * ========================================================================= */
  transitionToStage(stageData, duration = 1.6, updateEffects = true) {
    if (!stageData) return;
    this.currentStageIndex = stageData.id;

    // Efectos visuales de motores y telemetría
    if (updateEffects && this.effectsManager) {
      this.effectsManager.setStageEffects(stageData, this.parts);
    }

    const stageId = stageData.id;
    if (stageId === 16 && this.parts.lm) {
      this.parts.lm.position.set(-3, 15, 3);
      this.parts.lm.rotation.set(0.2, 0.3, 0);
    }

    // Reset de pétalos SLA a posición cerrada si no estamos en transposición
    this.resetSLAPetals(stageId < 10);

    // Reset de patas del LM por defecto
    this.setLMLegsDeployment(stageId >= 15);

    // Desde el acoplamiento, la transposición del CSM ya está completada.
    if (stageId >= 11 && stageId <= 15) {
      const cmY = stageId === 11 ? 24.5 - 1.115 : stageId === 12 ? 15.80 : 18.55;
      if (this.parts.cm) {
        this.parts.cm.position.set(0, cmY, 0);
        this.parts.cm.rotation.set(Math.PI, 0, 0);
      }
      if (this.parts.sm) {
        this.parts.sm.position.set(0, cmY + 2.23, 0);
        this.parts.sm.rotation.set(Math.PI, 0, 0);
      }
      if (this.parts.lm) this.parts.lm.position.set(0, stageId <= 12 ? 13.25 : 16, 0);
    }

    // 1. Etapa 1 a 3: Cohete completo ensamblado (Plataforma, Despegue y Max Q)
    if (stageId <= 3) {
      this.animateAssembleFullRocket(duration);
    }
    // 2. Etapa 4: Separación S-IC y eyección LES
    else if (stageId === 4) {
      this.animateS1CSeparation(duration);
    }
    // 3. Etapa 5: Vuelo S-II
    else if (stageId === 5) {
      this.animateS2Burn(duration);
    }
    // 4. Etapa 6: Separación S-II
    else if (stageId === 6) {
      this.animateS2Separation(duration);
    }
    // 5. Etapa 7 & 8: Órbita terrestre e Inyección Translunar (TLI)
    else if (stageId === 7 || stageId === 8) {
      this.animateTLIPhase(duration);
    }
    // 6. Etapa 9: Separación del CSM del S-IVB (Hero Step 1)
    else if (stageId === 9) {
      this.animateCSMSeparation(duration);
    }
    // 7. Etapa 10: Apertura pétalos SLA y giro 180° CSM (Hero Step 2)
    else if (stageId === 10) {
      this.animateTranspositionPitch(duration);
    }
    // 8. Etapa 11: Acoplamiento con el Lunar Module (Hero Step 3)
    else if (stageId === 11) {
      this.animateDocking(duration);
    }
    // 9. Etapa 12: Extracción del Lunar Module y alejamiento S-IVB (Hero Step 4)
    else if (stageId === 12) {
      this.animateLMExtraction(duration);
    }
    // 10. Etapa 13 & 14: Viaje translunar (PTC) e inserción órbita lunar (LOI)
    else if (stageId === 13 || stageId === 14) {
      this.animateTranslunarStack(duration);
    }
    // 11. Etapa 15: Separación lunar CSM y LM
    else if (stageId === 15) {
      this.animateLunarUndocking(duration);
    }
    // 12. Etapa 16 & 17: Descenso y Alunizaje
    else if (stageId === 16 || stageId === 17) {
      this.animateLunarLanding(duration);
    }
    // 13. Etapa 18: Ascenso lunar (Despegue desde etapa de descenso)
    else if (stageId === 18) {
      this.animateLunarAscent(duration);
    }
    // 14. Etapa 19: Reencuentro y acoplamiento lunar (CSM + LM Ascent)
    else if (stageId === 19) {
      this.animateLunarRendezvous(duration);
    }
    // 15. Etapa 20: Inyección Trans-Tierra (TEI - CSM Solo)
    else if (stageId === 20) {
      this.animateTransEarthStack(duration);
    }
    // 16. Etapa 21: Separación del Módulo de Servicio (SM)
    else if (stageId === 21) {
      this.animateSMSeparation(duration);
    }
    // 17. Etapa 22: Reentrada atmosférica (Columbia solo con escudo térmico hacia adelante)
    else if (stageId === 22) {
      this.animateReentry(duration);
    }
    // 18. Etapa 23: Despliegue de paracaídas
    else if (stageId === 23) {
      this.animateParachutes(duration);
    }
    // 19. Etapa 24: Amerizaje y flotación en el Pacífico
    else if (stageId === 24) {
      this.animateSplashdown(duration);
    }
    if (this.parts.sla?.userData.closedCover) {
      this.parts.sla.userData.closedCover.visible = stageId < 10;
      this.parts.sla.userData.petals.forEach(petal => { petal.visible = stageId >= 10; });
    }
    if (stageId < 10 && this.parts.lm) this.parts.lm.visible = false;
  }

  /* =========================================================================
   * CINEMÁTICAS ESPECÍFICAS DE CADA ETAPA
   * ========================================================================= */

  // Cohete 100% ensamblado y conectado físicamente sin espacios
  animateAssembleFullRocket(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    Object.keys(this.baseTransforms).forEach((key) => {
      const part = this.parts[key];
      const base = this.baseTransforms[key];
      if (!part) return;

      part.visible = key !== 'parachutes';
      gsap.to(part.position, {
        x: base.pos.x,
        y: base.pos.y,
        z: base.pos.z,
        duration: duration,
        ease: 'power2.inOut'
      });
      gsap.to(part.rotation, {
        x: base.rot.x,
        y: base.rot.y,
        z: base.rot.z,
        duration: duration,
        ease: 'power2.inOut'
      });
    });
  }

  // Separación S-IC: Comienza conectada y se aleja progresivamente
  animateS1CSeparation(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    if (this.parts.s1c) {
      this.parts.s1c.visible = true;
      gsap.to(this.parts.s1c.position, {
        y: -35.0,
        z: -10.0,
        duration: duration * 1.3,
        ease: 'power1.out'
      });
      gsap.to(this.parts.s1c.rotation, {
        x: 0.25,
        duration: duration * 1.3,
        ease: 'power1.out'
      });
    }

    // Eyección de la torre LES hacia adelante
    if (this.parts.les) {
      this.parts.les.visible = true;
      gsap.to(this.parts.les.position, {
        y: 48.0,
        z: 4.0,
        duration: duration * 0.8,
        ease: 'power2.in',
        onComplete: () => {
          if (this.currentStageIndex >= 4) this.parts.les.visible = false;
        }
      });
    }

    // Resto del cohete (S-II a CM) continúa conectado físicamente
    ['s2', 's4b', 'iu', 'sla', 'lm', 'sm', 'cm'].forEach((k) => {
      const part = this.parts[k];
      const base = this.baseTransforms[k];
      if (part) {
        part.visible = true;
        gsap.to(part.position, { x: base.pos.x, y: base.pos.y, z: base.pos.z, duration: duration });
        gsap.to(part.rotation, { x: 0, y: 0, z: 0, duration: duration });
      }
    });

    if (this.parts.parachutes) this.parts.parachutes.visible = false;
  }

  animateS2Burn(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    if (this.parts.s1c) this.parts.s1c.visible = false;
    if (this.parts.les) this.parts.les.visible = false;

    ['s2', 's4b', 'iu', 'sla', 'lm', 'sm', 'cm'].forEach((k) => {
      const part = this.parts[k];
      const base = this.baseTransforms[k];
      if (part) {
        part.visible = true;
        gsap.to(part.position, { x: base.pos.x, y: base.pos.y, z: base.pos.z, duration: duration });
        gsap.to(part.rotation, { x: 0, y: 0, z: 0, duration: duration });
      }
    });
  }

  // Separación S-II: Se desacopla de la S-IVB y se aleja progresivamente
  animateS2Separation(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    if (this.parts.s1c) this.parts.s1c.visible = false;
    if (this.parts.les) this.parts.les.visible = false;

    if (this.parts.s2) {
      this.parts.s2.visible = true;
      gsap.to(this.parts.s2.position, {
        y: -22.0,
        z: -8.0,
        duration: duration * 1.3,
        ease: 'power1.out'
      });
      gsap.to(this.parts.s2.rotation, {
        x: 0.18,
        duration: duration * 1.3
      });
    }

    // Tercera etapa y nave continúan unidos
    ['s4b', 'iu', 'sla', 'lm', 'sm', 'cm'].forEach((k) => {
      const part = this.parts[k];
      const base = this.baseTransforms[k];
      if (part) {
        part.visible = true;
        gsap.to(part.position, { x: base.pos.x, y: base.pos.y, z: base.pos.z, duration: duration });
        gsap.to(part.rotation, { x: 0, y: 0, z: 0, duration: duration });
      }
    });
  }

  animateTLIPhase(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    if (this.parts.s1c) this.parts.s1c.visible = false;
    if (this.parts.s2) this.parts.s2.visible = false;
    if (this.parts.les) this.parts.les.visible = false;

    ['s4b', 'iu', 'sla', 'lm', 'sm', 'cm'].forEach((k) => {
      const part = this.parts[k];
      const base = this.baseTransforms[k];
      if (part) {
        part.visible = true;
        gsap.to(part.position, { x: base.pos.x, y: base.pos.y, z: base.pos.z, duration: duration });
        gsap.to(part.rotation, { x: 0, y: 0, z: 0, duration: duration });
      }
    });
  }

  /* -------------------------------------------------------------------------
   * HERO SEQUENCE: TRANSPOSICIÓN, ACOPLAMIENTO Y EXTRACCIÓN
   * ------------------------------------------------------------------------- */

  // Paso 1: CSM se separa del S-IVB
  animateCSMSeparation(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideEarlyStages();
    this.keepS4BandLMInBase(duration);

    // El CSM avanza hacia adelante (+Y) unos 6 unidades
    const csmTargetY = this.baseTransforms.cm.pos.y + 6.0;
    const smTargetY = this.baseTransforms.sm.pos.y + 6.0;

    if (this.parts.cm) {
      gsap.to(this.parts.cm.position, { y: csmTargetY, z: 0, duration: duration, ease: 'power2.out' });
      gsap.to(this.parts.cm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }
    if (this.parts.sm) {
      gsap.to(this.parts.sm.position, { y: smTargetY, z: 0, duration: duration, ease: 'power2.out' });
      gsap.to(this.parts.sm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }

    this.openSLAPetals(0, duration);
  }

  // Paso 2: Apertura completa del SLA y giro 180° del CSM
  animateTranspositionPitch(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideEarlyStages();
    this.keepS4BandLMInBase(duration);
    this.openSLAPetals(Math.PI / 4, duration);

    // Un único ángulo y pivote para todo el CSM, sin alterar la unión CM–SM.
    const cm = this.parts.cm;
    const sm = this.parts.sm;
    if (!cm || !sm) return;
    // Comenzar en el punto final de Separación del CSM, incluso al saltar a esta etapa.
    cm.position.copy(this.baseTransforms.cm.pos).add(new THREE.Vector3(0, 6, 0));
    sm.position.copy(this.baseTransforms.sm.pos).add(new THREE.Vector3(0, 6, 0));
    const startCenter = cm.position.clone().add(sm.position).multiplyScalar(0.5);
    const targetCenter = new THREE.Vector3(0, 24.5, 0);
    const cmOffset = cm.position.clone().sub(startCenter);
    const smOffset = sm.position.clone().sub(startCenter);
    const axis = new THREE.Vector3(1, 0, 0);
    const updateCSM = () => {
      const angle = cm.rotation.x;
      const center = startCenter.clone().lerp(targetCenter, angle / Math.PI);
      cm.position.copy(cmOffset).applyAxisAngle(axis, angle).add(center);
      sm.position.copy(smOffset).applyAxisAngle(axis, angle).add(center);
      sm.rotation.copy(cm.rotation);
    };
    gsap.to(cm.rotation, {
      x: Math.PI,
      y: 0,
      z: 0,
      duration,
      ease: 'power2.inOut',
      onUpdate: updateCSM,
      onComplete: updateCSM
    });
  }

  // Paso 3: Acoplamiento (Docking proa con proa)
  animateDocking(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideEarlyStages();
    this.keepS4BandLMInBase(duration);
    this.setSLAPetalsOpen();

    // El CSM desciende hasta conectar exactamente su sonda en el puerto superior del LM
    const dockContactY = 15.80;

    if (this.parts.cm) {
      gsap.to(this.parts.cm.position, {
        x: 0,
        y: dockContactY,
        z: 0,
        duration: duration,
        ease: 'power1.inOut'
      });
    }

    if (this.parts.sm) {
      gsap.to(this.parts.sm.position, {
        x: 0,
        y: dockContactY + 2.23,
        z: 0,
        duration: duration,
        ease: 'power1.inOut'
      });
    }
  }

  // Paso 4: Extracción del LM de la bodega del S-IVB
  animateLMExtraction(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideEarlyStages();

    this.setSLAPetalsOpen();

    // S-IVB + SLA retroceden y se descartan
    if (this.parts.s4b) {
      gsap.to(this.parts.s4b.position, {
        y: -4.0,
        z: -14,
        duration: duration * 1.3,
        ease: 'power1.out'
      });
    }
    if (this.parts.iu) {
      gsap.to(this.parts.iu.position, {
        y: -0.27,
        z: -14,
        duration: duration * 1.3
      });
    }
    if (this.parts.sla) {
      gsap.to(this.parts.sla.position, {
        y: 1.61,
        z: -14,
        duration: duration * 1.3
      });
    }

    // El combo acoplado CSM + LM asciende unido
    const comboBaseY = 16.0;

    if (this.parts.lm) {
      gsap.to(this.parts.lm.position, {
        x: 0,
        y: comboBaseY,
        z: 0,
        duration: duration,
        ease: 'power2.out'
      });
      gsap.to(this.parts.lm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }

    if (this.parts.cm) {
      gsap.to(this.parts.cm.position, {
        x: 0,
        y: comboBaseY + 2.55,
        z: 0,
        duration: duration,
        ease: 'power2.out'
      });
    }

    if (this.parts.sm) {
      gsap.to(this.parts.sm.position, {
        x: 0,
        y: comboBaseY + 4.78,
        z: 0,
        duration: duration,
        ease: 'power2.out'
      });
    }
  }

  // Pila de viaje translunar (CSM + LM acoplados)
  animateTranslunarStack(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllRocketBoosters();

    const comboY = 16.0;
    if (this.parts.lm) {
      this.parts.lm.visible = true;
      gsap.to(this.parts.lm.position, { x: 0, y: comboY, z: 0, duration: duration });
      gsap.to(this.parts.lm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }
    if (this.parts.cm) {
      this.parts.cm.visible = true;
      gsap.to(this.parts.cm.position, { x: 0, y: comboY + 2.55, z: 0, duration: duration });
    }
    if (this.parts.sm) {
      this.parts.sm.visible = true;
      gsap.to(this.parts.sm.position, { x: 0, y: comboY + 4.78, z: 0, duration: duration });
    }
  }

  // Separación lunar: Eagle se desacopla del Columbia
  animateLunarUndocking(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllRocketBoosters();

    // LM Eagle se separa hacia adelante
    if (this.parts.lm) {
      this.parts.lm.visible = true;
      gsap.to(this.parts.lm.position, { x: -3.0, y: 15.0, z: 3.0, duration: duration });
      gsap.to(this.parts.lm.rotation, { x: 0.2, y: 0.3, z: 0, duration: duration });
    }

    // CSM Columbia permanece en órbita
    if (this.parts.cm) {
      this.parts.cm.visible = true;
      gsap.to(this.parts.cm.position, { x: 2.5, y: 18.0, z: -2.5, duration: duration });
    }
    if (this.parts.sm) {
      this.parts.sm.visible = true;
      gsap.to(this.parts.sm.position, { x: 2.5, y: 20.23, z: -2.5, duration: duration });
    }
  }

  // Alunizaje en el Mar de la Tranquilidad
  animateLunarLanding(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllExceptLM();

    if (this.parts.lm) {
      this.parts.lm.visible = true;
      if (this.currentStageIndex !== 16) {
        gsap.to(this.parts.lm.position, { x: 0, y: 15.0, z: 0, duration: duration });
      }
      gsap.to(this.parts.lm.rotation, {
        x: 0, y: 0, z: 0,
        duration,
        delay: this.currentStageIndex === 16 && duration > 0 ? 0.6 : 0
      });
    }
  }

  // Ascenso desde la Luna: Etapa de ascenso despega, la de descenso queda atrás
  animateLunarAscent(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllExceptLM();

    if (this.parts.lm) {
      this.parts.lm.visible = true;
      if (this.parts.lm.userData.ascentStage) {
        gsap.to(this.parts.lm.userData.ascentStage.position, {
          y: 3.5,
          duration: duration,
          ease: 'power2.in'
        });
      }
      if (this.parts.lm.userData.descentStage) {
        gsap.to(this.parts.lm.userData.descentStage.position, {
          y: -2.5,
          duration: duration
        });
      }
    }
  }

  // Acoplamiento lunar en órbita
  animateLunarRendezvous(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllRocketBoosters();

    if (this.parts.lm) {
      this.parts.lm.visible = true;
      if (this.parts.lm.userData.ascentStage) this.parts.lm.userData.ascentStage.position.y = 0.85;
      if (this.parts.lm.userData.descentStage) this.parts.lm.userData.descentStage.visible = false;
      gsap.to(this.parts.lm.position, { x: 0, y: 15.0, z: 0, duration: duration });
    }

    const cm = this.parts.cm;
    const sm = this.parts.sm;
    if (!cm || !sm) return;
    cm.visible = true;
    sm.visible = true;
    const startCenter = cm.position.clone().add(sm.position).multiplyScalar(0.5);
    const targetCenter = new THREE.Vector3(0, (17.55 + 19.78) / 2, 0);
    const cmOffset = cm.position.clone().sub(startCenter);
    const smOffset = sm.position.clone().sub(startCenter);
    const axis = new THREE.Vector3(1, 0, 0);
    const updateCSM = () => {
      const angle = cm.rotation.x;
      const center = startCenter.clone().lerp(targetCenter, angle / Math.PI);
      cm.position.copy(cmOffset).applyAxisAngle(axis, angle).add(center);
      sm.position.copy(smOffset).applyAxisAngle(axis, angle).add(center);
      sm.rotation.copy(cm.rotation);
    };
    gsap.to(cm.rotation, {
      x: Math.PI,
      y: 0,
      z: 0,
      duration,
      ease: 'power2.inOut',
      onUpdate: updateCSM,
      onComplete: updateCSM
    });
  }

  // Inyección Trans-Tierra (TEI - CSM Solo)
  animateTransEarthStack(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllExceptCSM();

    const csmY = 17.06;
    if (this.parts.cm) {
      this.parts.cm.visible = true;
      gsap.to(this.parts.cm.position, { x: 0, y: csmY + 2.23, z: 0, duration: duration });
      gsap.to(this.parts.cm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }
    if (this.parts.sm) {
      this.parts.sm.visible = true;
      gsap.to(this.parts.sm.position, { x: 0, y: csmY, z: 0, duration: duration });
      gsap.to(this.parts.sm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }
  }

  // Separación del Módulo de Servicio
  animateSMSeparation(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    if (this.parts.lm) this.parts.lm.visible = false;
    this.hideAllRocketBoosters();

    if (this.parts.sm) {
      this.parts.sm.visible = true;
      gsap.to(this.parts.sm.position, {
        y: 6.0,
        z: -8.0,
        duration: duration * 1.2,
        ease: 'power1.out'
      });
      gsap.to(this.parts.sm.rotation, {
        x: 0.4,
        z: 0.3,
        duration: duration * 1.2
      });
    }

    if (this.parts.cm) {
      this.parts.cm.visible = true;
      gsap.to(this.parts.cm.position, { x: 0, y: 19.29, z: 0, duration: duration });
      gsap.to(this.parts.cm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }
  }

  // Reentrada atmosférica con escudo térmico al frente
  animateReentry(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllExceptCM();

    if (this.parts.cm) {
      this.parts.cm.visible = true;
      gsap.to(this.parts.cm.position, { x: 0, y: 19.29, z: 0, duration: duration });
      gsap.to(this.parts.cm.rotation, {
        x: -0.45,
        y: 0,
        z: 0,
        duration: duration,
        ease: 'power2.inOut'
      });
    }
  }

  // Despliegue de paracaídas
  animateParachutes(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllExceptCM();

    if (this.parts.cm) {
      this.parts.cm.visible = true;
      gsap.to(this.parts.cm.position, { x: 0, y: 18.0, z: 0, duration: duration });
      gsap.to(this.parts.cm.rotation, { x: 0, y: 0, z: 0, duration: duration });
    }

    if (this.parts.parachutes) {
      this.parts.parachutes.visible = true;
      this.parts.parachutes.scale.set(0.1, 0.1, 0.1);
      gsap.to(this.parts.parachutes.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: duration * 0.8,
        ease: 'back.out(1.4)'
      });
      gsap.to(this.parts.parachutes.position, {
        x: 0,
        y: 18.73,
        z: 0,
        duration: duration
      });
    }
  }

  // Amerizaje
  animateSplashdown(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    this.hideAllExceptCM();
    if (this.parts.parachutes) this.parts.parachutes.visible = false;

    if (this.parts.cm) {
      this.parts.cm.visible = true;
      gsap.to(this.parts.cm.position, { x: 0, y: 18.0, z: 0, duration: duration });
      gsap.to(this.parts.cm.rotation, { x: 0.15, y: 0, z: 0.1, duration: duration });
    }
  }

  /* =========================================================================
   * HELPERS DE VISIBILIDAD Y PÉTALOS
   * ========================================================================= */

  setSLAPetalsOpen() {
    this.setSLAPetalAngle(Math.PI / 4);
  }

  setSLAPetalAngle(angle) {
    this.parts.sla.userData.petals.forEach((petal, index) => {
      const yaw = index * Math.PI / 2;
      petal.rotation.order = 'YXZ';
      petal.rotation.set(angle, yaw, 0);
      const radial = 1.32 * (1 - Math.cos(angle));
      petal.position.set(radial * Math.sin(yaw), -1.7 + 1.32 * Math.sin(angle), radial * Math.cos(yaw));
    });
  }

  openSLAPetals(angleRad, duration) {
    const gsap = window.gsap;
    if (!gsap || !this.parts.sla || !this.parts.sla.userData.petals) return;

    this.parts.sla.userData.petals.forEach((petal, index) => {
      const yaw = index * Math.PI / 2;
      // Cada cuadrante apunta hacia +Z local: abrir sobre X, después orientar en Y.
      petal.rotation.order = 'YXZ';
      petal.rotation.y = yaw;
      petal.rotation.z = 0;
      const updateHinge = () => {
        // Compensar el pivote central existente para girar desde el borde inferior.
        const radial = 1.32 * (1 - Math.cos(petal.rotation.x));
        petal.position.set(
          radial * Math.sin(yaw),
          -1.7 + 1.32 * Math.sin(petal.rotation.x),
          radial * Math.cos(yaw)
        );
      };
      gsap.killTweensOf(petal.rotation);
      gsap.to(petal.rotation, {
        x: angleRad,
        duration,
        ease: 'power2.inOut',
        onUpdate: updateHinge,
        onComplete: updateHinge
      });
    });
  }

  resetSLAPetals(isClosed) {
    if (!isClosed || !this.parts.sla?.userData.petals) return;
    this.parts.sla.userData.petals.forEach((petal, index) => {
      window.gsap.killTweensOf(petal.rotation);
      petal.rotation.order = 'YXZ';
      petal.rotation.set(0, index * Math.PI / 2, 0);
      petal.position.set(0, -1.7, 0);
    });
  }

  setLMLegsDeployment(isDeployed) {
    if (!this.parts.lm || !this.parts.lm.userData.descentStage) return;
    const legs = this.parts.lm.userData.descentStage.userData.legs;
    if (!legs) return;

    legs.forEach((leg) => {
      leg.visible = true;
    });
  }

  keepS4BandLMInBase(duration) {
    const gsap = window.gsap;
    if (!gsap) return;

    ['s4b', 'iu', 'sla', 'lm'].forEach((k) => {
      const part = this.parts[k];
      const base = this.baseTransforms[k];
      if (part) {
        part.visible = true;
        gsap.to(part.position, { x: base.pos.x, y: base.pos.y, z: base.pos.z, duration: duration });
      }
    });
  }

  hideEarlyStages() {
    if (this.parts.s1c) this.parts.s1c.visible = false;
    if (this.parts.s2) this.parts.s2.visible = false;
    if (this.parts.les) this.parts.les.visible = false;
    if (this.parts.parachutes) this.parts.parachutes.visible = false;
  }

  hideAllRocketBoosters() {
    this.hideEarlyStages();
    if (this.parts.s4b) this.parts.s4b.visible = false;
    if (this.parts.iu) this.parts.iu.visible = false;
    if (this.parts.sla) this.parts.sla.visible = false;
  }

  hideAllExceptLM() {
    this.hideAllRocketBoosters();
    if (this.parts.cm) this.parts.cm.visible = false;
    if (this.parts.sm) this.parts.sm.visible = false;
    if (this.parts.parachutes) this.parts.parachutes.visible = false;
  }

  hideAllExceptCSM() {
    this.hideAllRocketBoosters();
    if (this.parts.lm) this.parts.lm.visible = false;
    if (this.parts.parachutes) this.parts.parachutes.visible = false;
  }

  hideAllExceptCM() {
    this.hideAllExceptCSM();
    if (this.parts.sm) this.parts.sm.visible = false;
  }
}
