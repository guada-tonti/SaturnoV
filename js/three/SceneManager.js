/**
 * SceneManager.js
 * Orquestador principal de la escena 3D Three.js.
 * Configuración de cámara, luces cinematográficas de estudio (SpaceX style),
 * renderizador PBR de alta fidelidad, sombras y ciclo de animación.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.width = containerElement.clientWidth || window.innerWidth;
    this.height = containerElement.clientHeight || window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Luces
    this.lights = {};

    // Callbacks
    this.onPartClicked = null;
    this.onPartHovered = null;

    // Estado
    this.isUserInteracting = false;
    this.idleRotationSpeed = 0.0012;
    this.isCutawayActive = false;
    this.componentPickingEnabled = false;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // 1. Escena
    this.scene = new THREE.Scene();
    // Fondo carbón oscuro cinematográfico con sutil gradiente atmosférico
    this.scene.background = new THREE.Color(0x06070a);
    this.scene.fog = new THREE.FogExp2(0x06070a, 0.0035);

    // 2. Cámara
    this.camera = new THREE.PerspectiveCamera(
      38,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(22, 16, 45);

    // 3. Renderizador WebGL
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controles orbitales y Zoom Progresivo Inteligente (MacBook Trackpad & Mouse)
    this.targetZoomDistance = null;
    this.idleTimeout = null;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.rotateSpeed = 0.6;
    this.controls.enableZoom = false; // Manejado por nuestro motor de zoom progresivo para trackpad
    this.controls.panSpeed = 0.6;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 140;
    this.controls.maxPolarAngle = Math.PI * 0.95;
    this.controls.target.set(0, 10, 0);

    this.controls.addEventListener('start', () => {
      this.isUserInteracting = true;
      this.isDragging = true;
      this.renderer.domElement.style.cursor = 'grabbing';
    });

    this.controls.addEventListener('end', () => {
      this.isDragging = false;
      this.renderer.domElement.style.cursor = 'grab';
      clearTimeout(this.idleTimeout);
      this.idleTimeout = setTimeout(() => {
        this.isUserInteracting = false;
      }, 2500);
    });

    // 5. Iluminación de estudio aeroespacial (Inspirada en SpaceX Vehicle Showcase)
    this.setupLighting();

    // 6. Eventos
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.domElement.addEventListener('pointerdown', event => {
      this.pointerStart = { x: event.clientX, y: event.clientY };
    });
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.renderer.domElement.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    // 7. Grupo raíz del cohete
    this.rocketRoot = new THREE.Group();
    this.rocketRoot.name = 'SaturnV_Root';
    this.scene.add(this.rocketRoot);

    // 8. Campo de estrellas lejanas sutiles
    this.createStarfield();
  }

  setupLighting() {
    // Luz ambiental suave para no empastar negros
    const ambientLight = new THREE.AmbientLight(0x1a202c, 0.6);
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    // Luz principal direccional (Key light - Simula luz solar / estudio de alta gama)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(30, 45, 30);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 150;
    keyLight.shadow.camera.left = -40;
    keyLight.shadow.camera.right = 40;
    keyLight.shadow.camera.top = 70;
    keyLight.shadow.camera.bottom = -40;
    keyLight.shadow.bias = -0.0003;
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    // Luz de relleno fría (Fill light)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(-30, 15, -20);
    this.scene.add(fillLight);
    this.lights.fill = fillLight;

    // Luz de contorno 1 (Rim Light izquierda - Recorta la silueta del cohete)
    const rimLight1 = new THREE.DirectionalLight(0x00e5ff, 1.8);
    rimLight1.position.set(-25, 20, 25);
    this.scene.add(rimLight1);
    this.lights.rim1 = rimLight1;

    // Luz de contorno 2 (Rim Light trasera/derecha - Blanco cálido)
    const rimLight2 = new THREE.DirectionalLight(0xffecd2, 1.5);
    rimLight2.position.set(20, -10, -25);
    this.scene.add(rimLight2);
    this.lights.rim2 = rimLight2;

    // Luz cenital suave
    const topLight = new THREE.PointLight(0xffffff, 0.9, 100);
    topLight.position.set(0, 70, 0);
    this.scene.add(topLight);
    this.lights.top = topLight;
  }

  createStarfield() {
    const starCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const radius = 250 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 1.2,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  onWindowResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onPointerMove(event) {
    if (!this.componentPickingEnabled || this.isCutawayActive || this.isDragging) {
      this.renderer.domElement.style.cursor = this.isDragging ? 'grabbing' : 'grab';
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.rocketRoot.children, true)
      .filter(hit => this.isObjectVisible(hit.object));

    if (intersects.length > 0) {
      let hitPart = this.findPartParent(intersects[0].object);
      if (hitPart && this.onPartHovered) {
        this.onPartHovered(hitPart.userData.partId || null, event);
      }
      this.renderer.domElement.style.cursor = hitPart ? 'pointer' : 'grab';
    } else {
      if (this.onPartHovered) this.onPartHovered(null, event);
      this.renderer.domElement.style.cursor = 'grab';
    }
  }

  onPointerUp(event) {
    if (!this.componentPickingEnabled || this.isCutawayActive || !this.pointerStart ||
      Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 5) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.rocketRoot.children, true)
      .filter(hit => this.isObjectVisible(hit.object));

    if (intersects.length > 0) {
      const hitPart = this.findPartParent(intersects[0].object);
      if (hitPart && hitPart.userData.partId && this.onPartClicked) {
        this.onPartClicked(hitPart.userData.partId);
      }
    }
  }

  findPartParent(object) {
    let curr = object;
    while (curr && curr !== this.rocketRoot) {
      if (curr.userData && curr.userData.isRocketPart) {
        return curr;
      }
      curr = curr.parent;
    }
    return null;
  }

  isObjectVisible(object) {
    for (let parent = object; parent; parent = parent.parent) {
      if (!parent.visible) return false;
    }
    return true;
  }

  setComponentPicking(enabled) {
    this.componentPickingEnabled = enabled;
    this.pointerStart = null;
    this.renderer.domElement.style.cursor = 'grab';
    if (!enabled && this.onPartHovered) this.onPartHovered(null);
  }

  onWheel(event) {
    event.preventDefault();
    this.isUserInteracting = true;

    // Resetear timer de inactividad
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      this.isUserInteracting = false;
    }, 2500);

    let delta = event.deltaY;
    // Normalización de modos de scroll
    if (event.deltaMode === 1) delta *= 20; // Modo líneas (Firefox / mouse con scroll discreto)
    if (event.deltaMode === 2) delta *= 60; // Modo páginas

    // Gesto de pellizco (Pinch to zoom) en macOS emite evento wheel con ctrlKey = true
    if (event.ctrlKey) {
      delta *= 2.2;
    }

    const absDelta = Math.abs(delta);
    if (absDelta < 0.001) return;

    // Curva progresiva no-lineal:
    // - Para movimientos muy pequeños (delta < 3): respuesta suave y de máxima precisión.
    // - Para movimientos medianos y grandes: aceleración progresiva proporcional (pow 1.15)
    // que permite pasar de vista completa a vista de detalle en 1-2 gestos naturales sin saltos.
    const sign = Math.sign(delta);
    const progressiveDelta = Math.pow(absDelta, 1.15);

    // Sensibilidad calibrada (~1.9x del estándar para MacBook trackpad)
    const zoomSensitivity = 0.0034;
    const zoomFactor = Math.min(progressiveDelta * zoomSensitivity, 0.40);

    const currentDist = this.targetZoomDistance !== null
      ? this.targetZoomDistance
      : this.camera.position.distanceTo(this.controls.target);

    let newDist;
    if (sign > 0) {
      // Zoom out (alejarse)
      newDist = currentDist * (1.0 + zoomFactor);
    } else {
      // Zoom in (acercarse)
      newDist = currentDist * (1.0 / (1.0 + zoomFactor));
    }

    // Respetar estrictamente los límites mínimo y máximo configurados
    this.targetZoomDistance = THREE.MathUtils.clamp(
      newDist,
      this.controls.minDistance,
      this.controls.maxDistance
    );
  }

  render(deltaTime, elapsed) {
    // Suavizado e interpolación fluida de zoom (responsive + smooth + precise)
    if (this.targetZoomDistance !== null) {
      const currentDist = this.camera.position.distanceTo(this.controls.target);
      const lerpSpeed = Math.min(deltaTime * 16, 0.28);
      const newDist = THREE.MathUtils.lerp(currentDist, this.targetZoomDistance, lerpSpeed);

      const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
      this.camera.position.copy(this.controls.target).addScaledVector(dir, newDist);

      if (Math.abs(newDist - this.targetZoomDistance) < 0.015) {
        this.targetZoomDistance = null;
      }
    }

    // Rotación de reposo muy lenta y sutil cuando el usuario no interactúa
    if (!this.isUserInteracting && !this.isCutawayActive && !this.isVehicleTransitioning && this.rocketRoot) {
      const pivotBefore = this.idleRotationPivot
        ? this.rocketRoot.localToWorld(this.idleRotationPivot.clone())
        : null;
      this.rocketRoot.rotation.y += this.idleRotationSpeed * (deltaTime * 60);
      if (pivotBefore) {
        const pivotAfter = this.rocketRoot.localToWorld(this.idleRotationPivot.clone());
        this.rocketRoot.position.add(pivotBefore.sub(pivotAfter));
      }
    }

    // Rotación del campo de estrellas imperceptible
    if (this.starfield) {
      this.starfield.rotation.y += 0.00015;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
