/**
 * app.js
 * Orquestador principal de la Infografía Interactiva Apollo 11 & Saturn V.
 * Integra Three.js, animación de etapas, telemetría NASA, inspector de partes,
 * vistas de interior (cutaways) y comparativas de escala.
 */

import { MISSION_STAGES } from './data/missionData.js?v=stage-datetime';
import { SceneManager } from './three/SceneManager.js?v=experience-modes';
import { RocketBuilder } from './three/RocketBuilder.js';
import { InteriorModels } from './three/InteriorModels.js';
import { EffectsManager } from './three/EffectsManager.js';
import { StageAnimator } from './three/StageAnimator.js';
import { CameraChoreographer } from './three/CameraChoreographer.js?v=experience-modes';
import { TimelineUI } from './ui/TimelineUI.js?v=readable-time';
import { TelemetryUI } from './ui/TelemetryUI.js?v=experience-modes';
import { InspectorUI } from './ui/InspectorUI.js?v=white-actions';
import { CutawayUI } from './ui/CutawayUI.js?v=component-interior';
import { ScaleUI } from './ui/ScaleUI.js?v=experience-modes';
import { AudioController } from './ui/AudioController.js';

class SaturnVApp {
  constructor() {
    this.stageIndex = 0;
    this.experienceMode = 'timeline';
    this.selectedComponent = null;
    this.isMissionStarted = false;
    this.isInspectorOpen = false;
    this.isCutawayOpen = false;
    this.currentCutawayGroup = null;

    this.init();
  }

  init() {
    // 1. Contenedores DOM
    const canvasContainer = document.getElementById('canvas-container');
    const timelineContainer = document.getElementById('timeline-container');
    const telemetryContainer = document.getElementById('telemetry-container');
    const inspectorContainer = document.getElementById('inspector-container');
    inspectorContainer.hidden = true;
    const cutawayContainer = document.getElementById('cutaway-container');
    const scaleContainer = document.getElementById('scale-container');

    // 2. Audio espacial
    this.audio = new AudioController();

    // 3. Three.js Scene Manager
    this.sceneManager = new SceneManager(canvasContainer);

    // 4. Construcción del Cohete Modular
    this.rocketBuilder = new RocketBuilder();
    this.parts = this.rocketBuilder.buildCompleteRocket(this.sceneManager.rocketRoot);
    this.completeRocketState = this.captureRocketState();

    // 5. Modelos interiores para Cutaways
    this.interiorModels = new InteriorModels();
    this.cmCutaway = this.interiorModels.buildCommandModuleCutaway();
    this.lmCutaway = this.interiorModels.buildLunarModuleCutaway();
    this.cmCutaway.position.set(0, 19.29, 0);
    this.lmCutaway.position.set(0, 13.25, 0);
    this.cmCutaway.visible = false;
    this.lmCutaway.visible = false;
    this.sceneManager.scene.add(this.cmCutaway);
    this.sceneManager.scene.add(this.lmCutaway);

    // 6. Efectos visuales de motores y reentrada
    this.effectsManager = new EffectsManager(this.sceneManager.scene);

    // 7. Coreografía y Cinemática con Auto-Framing Dinámico
    this.stageAnimator = new StageAnimator(this.parts, this.sceneManager, this.effectsManager);
    this.cameraChoreographer = new CameraChoreographer(
      this.sceneManager.camera,
      this.sceneManager.controls,
      this.parts,
      this.sceneManager
    );

    // 8. Interfaz de Usuario
    this.telemetryUI = new TelemetryUI(telemetryContainer);

    this.timelineUI = new TimelineUI(timelineContainer, MISSION_STAGES, (stageData, index) => {
      this.onTimelineStageChange(stageData, index);
    });

    this.inspectorUI = new InspectorUI(inspectorContainer, {
      detailContainer: document.getElementById('component-detail-container'),
      onPartSelected: (partData) => {
        if (this.experienceMode !== 'components') return;
        if (this.isCutawayOpen) this.closeCutaway(false);
        if (!partData) {
          this.selectedComponent = null;
          this.cancelRocketAnimations();
          this.restoreRocketState(this.completeRocketState);
          this.sceneManager.camera.fov = 38;
          this.sceneManager.camera.updateProjectionMatrix();
          this.cameraChoreographer.autoFrameStage(MISSION_STAGES[0], 1.8);
          this.cameraChoreographer.currentStageData = null;
          this.cameraChoreographer.currentActiveParts = null;
          return;
        }
        this.selectedComponent = partData.id;
        // El LM está dentro del SLA: abrir sus pétalos permite inspeccionarlo.
        this.parts.sla.userData.petals.forEach(petal => {
          window.gsap.killTweensOf(petal.rotation);
          petal.rotation.z = partData.id === 'lm' ? 1.4 : 0;
        });
        this.cameraChoreographer.focusOnPart(partData);
      },
      onOpenCutaway: (partId) => {
        this.openCutaway(partId);
      },
      onViewScale: () => this.openScaleModal()
    });

    this.cutawayUI = new CutawayUI(cutawayContainer, {
      onClose: () => {
        this.closeCutaway();
      },
      onToggleModule: (partId) => {
        this.setCutawayModule(partId);
      }
    });

    this.scaleUI = new ScaleUI(scaleContainer, {
      onClose: () => {}
    });

    // 9. Interacción 3D directa con el ratón sobre piezas
    this.sceneManager.onPartClicked = (partId) => {
      if (!this.isCutawayOpen) {
        this.openInspector(partId);
      }
    };

    // 10. Pantalla de Bienvenida / Hero CTA
    this.setupHeroScreen();
    this.setupAudioButton();
    document.getElementById('btn-mode-timeline').addEventListener('click', () => this.setExperienceMode('timeline'));
    document.getElementById('btn-mode-components').addEventListener('click', () => this.setExperienceMode('components'));

    // 11. Bucle de Renderizado
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // La portada encuadra el modelo existente dentro de su propia columna.
    this.telemetryUI.updateStage(MISSION_STAGES[0]);
    this.frameHeroRocket();
  }

  setupHeroScreen() {
    const heroOverlay = document.getElementById('hero-overlay');
    const startBtn = document.getElementById('btn-start-mission');
    const heroVisual = document.getElementById('hero-visual');
    const appElement = document.getElementById('app');

    heroVisual.appendChild(this.sceneManager.container);
    this.missionBackground = this.sceneManager.scene.background;
    this.sceneManager.scene.background = null;
    this.sceneManager.renderer.setClearAlpha(0);
    this.sceneManager.controls.enabled = false;
    this.heroResizeObserver = new ResizeObserver(() => {
      if (!this.isMissionStarted) this.frameHeroRocket();
    });
    this.heroResizeObserver.observe(heroVisual);

    // Recargar descarta todos los estados, temporizadores y transformaciones anteriores.
    document.getElementById('btn-home').addEventListener('click', () => {
      window.location.reload();
    });

    if (startBtn && heroOverlay) {
      startBtn.addEventListener('click', () => {
        this.isMissionStarted = true;
        this.sceneManager.scene.background = this.missionBackground;
        this.sceneManager.renderer.setClearAlpha(1);
        this.heroResizeObserver.disconnect();
        appElement.prepend(this.sceneManager.container);
        appElement.classList.remove('is-home');
        this.sceneManager.onWindowResize();
        this.sceneManager.controls.enabled = true;
        heroOverlay.classList.add('fade-out');
        setTimeout(() => {
          heroOverlay.style.display = 'none';
        }, 800);

        this.timelineUI.goToStage(0);
        this.cameraChoreographer.autoFrameStage(MISSION_STAGES[0], 1.8);
      });
    }
  }

  frameHeroRocket() {
    // Solo la portada: no usa ni cambia el auto-framing de la misión.
    this.sceneManager.onWindowResize();
    const box = this.cameraChoreographer.computeActiveBoundingBox(MISSION_STAGES[0].activeParts);
    const center = this.sceneManager.controls.target.clone();
    const size = center.clone();
    box.getCenter(center);
    box.getSize(size);
    const camera = this.sceneManager.camera;
    const halfFovY = camera.fov * Math.PI / 360;
    // Reproduce la escala en píxeles del encuadre inicial de la misión.
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const availW = Math.max(windowW - (windowW >= 1024 ? 724 : 0), windowW * 0.45);
    const availH = Math.max(windowH - 114, 300);
    const tanHalfFovY = Math.tan(halfFovY);
    const missionDistance = Math.max(
      Math.max(size.y, 2) / (2 * tanHalfFovY),
      Math.max(size.x, size.z, 2) / (2 * tanHalfFovY * availW / availH)
    ) * 1.15;
    const distance = missionDistance * this.sceneManager.height / windowH;
    this.sceneManager.controls.target.copy(center);
    camera.position.set(
      center.x + distance * Math.sin(0.38) * Math.cos(0.12),
      center.y + distance * Math.sin(0.12),
      center.z + distance * Math.cos(0.38) * Math.cos(0.12)
    );
    camera.lookAt(center);
    this.sceneManager.controls.update();
  }

  setupAudioButton() {
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        audioBtn.classList.toggle('active', !isMuted);
        const iconOn = audioBtn.querySelector('.icon-sound-on');
        const iconOff = audioBtn.querySelector('.icon-sound-off');
        if (iconOn && iconOff) {
          iconOn.style.display = isMuted ? 'none' : 'block';
          iconOff.style.display = isMuted ? 'block' : 'none';
        }
      });
    }
  }

  onTimelineStageChange(stageData, index) {
    if (this.experienceMode !== 'timeline') return;
    this.stageIndex = index;

    // Si había un cutaway abierto, cerrarlo
    if (this.isCutawayOpen) {
      this.closeCutaway(false);
    }

    // Audio quindar y separación si procede
    if (index === 3 || index === 5 || index === 8 || index === 11 || index === 20) {
      this.audio.playStageSeparation();
    } else {
      this.audio.playQuindarBeep(true);
    }

    // Transformación 3D de la nave
    this.cancelRocketAnimations();
    this.restoreRocketState(this.completeRocketState);
    this.stageAnimator.transitionToStage(stageData);

    // Auto-Framing automático e inteligente según el tamaño de la nave activa
    this.cameraChoreographer.autoFrameStage(stageData, 1.8);

    // Actualizar datos de telemetría NASA
    this.telemetryUI.updateStage(stageData);
  }

  openInspector(partId) {
    if (this.experienceMode !== 'components') return;
    this.isInspectorOpen = true;
    this.inspectorUI.show(partId);
  }

  openCutaway(partId = 'cm') {
    if (this.experienceMode !== 'components') return;
    document.getElementById('component-detail-container').hidden = true;
    this.isCutawayOpen = true;
    this.sceneManager.isCutawayActive = true;
    this.sceneManager.setComponentPicking(false);

    // Ocultar modelo exterior para mostrar interior
    this.sceneManager.rocketRoot.visible = false;

    this.setCutawayModule(partId);
    this.cutawayUI.show(partId);
  }

  setCutawayModule(partId) {
    if (partId === 'cm') {
      this.cmCutaway.visible = true;
      this.lmCutaway.visible = false;
      this.cameraChoreographer.viewInteriorCutaway('cm');
    } else {
      this.cmCutaway.visible = false;
      this.lmCutaway.visible = true;
      this.cameraChoreographer.viewInteriorCutaway('lm');
    }
  }

  closeCutaway(restoreCamera = true) {
    this.cutawayUI.hide();
    document.getElementById('component-detail-container').hidden = false;
    this.isCutawayOpen = false;
    this.sceneManager.isCutawayActive = false;

    this.cmCutaway.visible = false;
    this.lmCutaway.visible = false;

    this.restoreRocketState(this.completeRocketState);
    this.sceneManager.setComponentPicking(this.experienceMode === 'components');
    if (restoreCamera) this.inspectorUI.selectPart(this.selectedComponent);
  }

  openScaleModal() {
    if (this.experienceMode !== 'components') return;
    this.scaleUI.show();
  }

  captureRocketState() {
    const state = [];
    this.sceneManager.rocketRoot.traverse(object => {
      state.push({ object, position: object.position.clone(), quaternion: object.quaternion.clone(),
        scale: object.scale.clone(), visible: object.visible });
    });
    return state;
  }

  restoreRocketState(state) {
    state.forEach(({ object, position, quaternion, scale, visible }) => {
      object.position.copy(position);
      object.quaternion.copy(quaternion);
      object.scale.copy(scale);
      object.visible = visible;
    });
    this.sceneManager.rocketRoot.updateMatrixWorld(true);
  }

  cancelRocketAnimations() {
    this.sceneManager.rocketRoot.traverse(object => {
      window.gsap.killTweensOf([object.position, object.rotation, object.scale]);
    });
  }

  setExperienceMode(mode) {
    if (!this.isMissionStarted || mode === this.experienceMode) return;
    this.cancelRocketAnimations();
    if (this.isCutawayOpen) {
      this.cutawayUI.hide();
      this.closeCutaway(false);
    }
    this.scaleUI.hide();
    if (mode === 'components') {
      this.resumeAutoplay = this.timelineUI.isPlaying;
      this.timelineUI.stopAutoPlay();
      this.missionFov = this.sceneManager.camera.fov;
      this.restoreRocketState(this.completeRocketState);
      this.effectsManager.setStageEffects(null, this.parts);
    }
    this.experienceMode = mode;
    const components = mode === 'components';
    this.sceneManager.scene.background = components ? null : this.missionBackground;
    this.sceneManager.renderer.setClearAlpha(components ? 0 : 1);
    document.getElementById('app').classList.toggle('is-components', components);
    document.getElementById('timeline-container').hidden = components;
    document.getElementById('telemetry-container').hidden = components;
    document.getElementById('inspector-container').hidden = !components;
    this.sceneManager.setComponentPicking(components);
    ['timeline', 'components'].forEach(name => {
      const button = document.getElementById(`btn-mode-${name}`);
      button.classList.toggle('active', name === mode);
      button.setAttribute('aria-pressed', String(name === mode));
    });
    this.isInspectorOpen = components;
    if (components) {
      this.inspectorUI.show(this.selectedComponent);
      // Presentar primero la anatomía completa; la selección siguiente enfoca la pieza.
      this.sceneManager.camera.fov = 38;
      this.sceneManager.camera.updateProjectionMatrix();
      this.cameraChoreographer.autoFrameStage(MISSION_STAGES[0], 1.8);
      this.cameraChoreographer.currentStageData = null;
      this.cameraChoreographer.currentActiveParts = null;
    } else {
      this.inspectorUI.hide();
      const stage = MISSION_STAGES[this.stageIndex];
      this.restoreRocketState(this.completeRocketState);
      this.stageAnimator.transitionToStage(stage, 0);
      this.effectsManager.setStageEffects(stage, this.parts);
      this.sceneManager.camera.fov = this.missionFov;
      this.sceneManager.camera.updateProjectionMatrix();
      this.cameraChoreographer.autoFrameStage(stage, 1.8);
      if (this.resumeAutoplay && this.stageIndex < MISSION_STAGES.length - 1) this.timelineUI.startAutoPlay();
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    const elapsed = now * 0.001;

    // Actualizar efectos de llamas y partículas
    if (this.effectsManager) {
      this.effectsManager.update(deltaTime, elapsed);
    }

    // Render Three.js
    this.sceneManager.render(deltaTime, elapsed);
  }
}

// Inicializar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SaturnVApp();
});
