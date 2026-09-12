/**
 * app.js
 * Orquestador principal de la Infografía Interactiva Apollo 11 & Saturn V.
 * Integra Three.js, animación de etapas, telemetría NASA, inspector de partes,
 * vistas de interior (cutaways) y comparativas de escala.
 */

import { MISSION_STAGES } from './data/missionData.js';
import { ROCKET_PARTS } from './data/partsData.js';
import { SceneManager } from './three/SceneManager.js';
import { RocketBuilder } from './three/RocketBuilder.js';
import { InteriorModels } from './three/InteriorModels.js';
import { EffectsManager } from './three/EffectsManager.js';
import { StageAnimator } from './three/StageAnimator.js';
import { CameraChoreographer } from './three/CameraChoreographer.js';
import { TimelineUI } from './ui/TimelineUI.js';
import { TelemetryUI } from './ui/TelemetryUI.js';
import { InspectorUI } from './ui/InspectorUI.js';
import { CutawayUI } from './ui/CutawayUI.js';
import { ScaleUI } from './ui/ScaleUI.js';
import { AudioController } from './ui/AudioController.js';

class SaturnVApp {
  constructor() {
    this.stageIndex = 0;
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
    const cutawayContainer = document.getElementById('cutaway-container');
    const scaleContainer = document.getElementById('scale-container');

    // 2. Audio espacial
    this.audio = new AudioController();

    // 3. Three.js Scene Manager
    this.sceneManager = new SceneManager(canvasContainer);

    // 4. Construcción del Cohete Modular
    this.rocketBuilder = new RocketBuilder();
    this.parts = this.rocketBuilder.buildCompleteRocket(this.sceneManager.rocketRoot);

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
    this.telemetryUI = new TelemetryUI(telemetryContainer, {
      onExploreParts: () => this.openInspector('cm'),
      onViewInterior: () => this.openCutaway('cm'),
      onViewScale: () => this.openScaleModal()
    });

    this.timelineUI = new TimelineUI(timelineContainer, MISSION_STAGES, (stageData, index) => {
      this.onTimelineStageChange(stageData, index);
    });

    this.inspectorUI = new InspectorUI(inspectorContainer, {
      onPartSelected: (partData) => {
        this.cameraChoreographer.focusOnPart(partData);
      },
      onCloseInspector: () => {
        this.isInspectorOpen = false;
        this.onTimelineStageChange(MISSION_STAGES[this.stageIndex], this.stageIndex);
      },
      onOpenCutaway: (partId) => {
        this.openCutaway(partId);
      }
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
    const halfFovX = Math.atan(Math.tan(halfFovY) * camera.aspect);
    // Una esfera envolvente conserva el cohete completo incluso con rotación pasiva.
    const distance = size.length() * 0.5 / Math.sin(Math.min(halfFovY, halfFovX)) * 1.12;
    this.sceneManager.controls.target.copy(center);
    camera.position.set(center.x + distance * 0.37, center.y + distance * 0.12, center.z + distance * 0.92);
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
    this.stageAnimator.transitionToStage(stageData);

    // Auto-Framing automático e inteligente según el tamaño de la nave activa
    this.cameraChoreographer.autoFrameStage(stageData, 1.8);

    // Actualizar datos de telemetría NASA
    this.telemetryUI.updateStage(stageData);
  }

  openInspector(partId) {
    this.isInspectorOpen = true;
    this.inspectorUI.show(partId);
  }

  openCutaway(partId = 'cm') {
    this.isCutawayOpen = true;
    this.sceneManager.isCutawayActive = true;

    // Ocultar modelo exterior para mostrar interior
    this.parts.cm.visible = false;
    this.parts.lm.visible = false;

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
    this.isCutawayOpen = false;
    this.sceneManager.isCutawayActive = false;

    this.cmCutaway.visible = false;
    this.lmCutaway.visible = false;

    // Restaurar visibilidad según la etapa actual
    this.stageAnimator.transitionToStage(MISSION_STAGES[this.stageIndex], 0.5);

    if (restoreCamera) {
      const stageData = MISSION_STAGES[this.stageIndex];
      if (stageData.camera) {
        this.cameraChoreographer.moveTo(
          stageData.camera.position,
          stageData.camera.target,
          1.5,
          stageData.camera.fov
        );
      }
    }
  }

  openScaleModal() {
    this.scaleUI.show();
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
