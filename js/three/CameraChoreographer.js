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
    this.currentStageData = stageData;
    const activePartKeys = stageData.activeParts || ['s1c', 's2', 's4b', 'sla', 'lm', 'sm', 'cm', 'les'];
    this.currentActiveParts = activePartKeys;

    // 1. Calcular el Bounding Box 3D de todos los componentes activos
    const box = this.computeActiveBoundingBox(activePartKeys);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Medidas mínimas de seguridad
    const height = Math.max(size.y, 2.0);
    const width = Math.max(size.x, size.z, 2.0);

    // 2. Calcular el área visual real disponible entre paneles UI
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    // Panel izquierdo (telemetría): ~380px + 32px margen = 412px
    // Panel derecho (cronología): ~280px + 32px margen = 312px
    const isDesktop = windowW >= 1024;
    const leftPanelW = isDesktop ? 412 : 0;
    const rightPanelW = isDesktop ? 312 : 0;
    const topMargin = 74;
    const bottomMargin = 40;

    const availW = Math.max(windowW - leftPanelW - rightPanelW, windowW * 0.45);
    const availH = Math.max(windowH - topMargin - bottomMargin, 300);

    // Centro óptico entre paneles UI
    const centerShiftPx = (leftPanelW - rightPanelW) / 2; // ~50px a la derecha en desktop

    // 3. Trigonometría de la cámara para que entre completo con un 12-15% de margen
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const tanHalfFovY = Math.tan(fovRad / 2);
    const tanHalfFovX = tanHalfFovY * (availW / availH);

    // Distancias necesarias para cubrir alto y ancho
    const distY = (height / 2) / tanHalfFovY;
    const distX = (width / 2) / tanHalfFovX;

    // Distancia final con margen del 15% (1.15)
    const marginFactor = 1.15;
    const targetDist = Math.max(distY, distX) * marginFactor;

    // 4. Desplazamiento horizontal para centrar el cohete en el espacio libre
    // Un shift en X en el target centra visualmente el cohete en el área disponible
    const normalizedShift = centerShiftPx / (availW / 2);
    const targetOffsetX = -(targetDist * tanHalfFovX * normalizedShift * 0.5);

    // 5. Ángulo cinemático de cámara (azimut ~22°, elevación suave ~6-8°)
    const azimuth = 0.38; // ~22 grados
    const elevation = 0.12; // ~7 grados

    const targetLookAt = new THREE.Vector3(
      targetOffsetX * 0.3,
      center.y,
      0
    );

    const targetPos = new THREE.Vector3(
      targetOffsetX * 0.3 + targetDist * Math.sin(azimuth) * Math.cos(elevation),
      center.y + targetDist * Math.sin(elevation),
      targetDist * Math.cos(azimuth) * Math.cos(elevation)
    );

    // 6. Transición suave con GSAP
    this.moveTo(targetPos, targetLookAt, duration);
  }

  computeActiveBoundingBox(activePartKeys) {
    const box = new THREE.Box3();
    let hasObjects = false;

    activePartKeys.forEach((key) => {
      const part = this.parts[key];
      if (part && part.visible) {
        // Expandir por la caja del objeto
        const partBox = new THREE.Box3().setFromObject(part);
        if (!partBox.isEmpty()) {
          box.union(partBox);
          hasObjects = true;
        }
      }
    });

    // Si por alguna razón está vacío, usar valores por defecto del Saturn V
    if (!hasObjects || box.isEmpty()) {
      box.min.set(-2.5, -24.2, -2.5);
      box.max.set(2.5, 24.1, 2.5);
    }

    return box;
  }

  /**
   * Mueve suavemente la cámara a una posición y objetivo determinados usando GSAP
   */
  moveTo(targetPos, targetLookAt, duration = 1.8, fov = null) {
    if (this.sceneManager) {
      this.sceneManager.targetZoomDistance = null;
    }

    const gsap = window.gsap;
    if (!gsap) {
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
