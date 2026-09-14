/**
 * RocketBuilder.js
 * Construcción procedural y jerárquica del Saturn V con proporciones precisas,
 * texturas PBR generadas dinámicamente en Canvas (patrones de balanceo NASA,
 * corrugated rings, foil dorado Kapton, placas térmicas) y ensamblaje modular.
 */

import * as THREE from 'three';

export class RocketBuilder {
  constructor() {
    this.parts = {};
    this.materials = {};
    this.textures = {};
    this.initTextures();
    this.initMaterials();
  }

  /* =========================================================================
   * 1. GENERACIÓN PROCEDURAL DE TEXTURAS DE ALTA RESOLUCIÓN
   * ========================================================================= */
  initTextures() {
    this.textures.s1cRollPattern = this.createS1CRollTexture();
    this.textures.s2Interstage = this.createCorrugatedTexture(0x222225, 0x111113);
    this.textures.s4bSkin = this.createS4BSkinTexture();
    this.textures.goldKapton = this.createGoldKaptonTexture();
    this.textures.smRadiators = this.createSMRadiatorTexture();
    this.textures.heatShield = this.createHeatShieldTexture();
    this.textures.metalBrushed = this.createBrushedMetalTexture();
  }

  createS1CRollTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Fondo blanco mate
    ctx.fillStyle = '#EDEDED';
    ctx.fillRect(0, 0, 2048, 2048);

    // Patrón de balanceo (Roll pattern característico blanco/negro de la NASA)
    ctx.fillStyle = '#111317';
    // Bandas verticales alternadas en cuadrantes
    ctx.fillRect(0, 0, 512, 1100);
    ctx.fillRect(1024, 0, 512, 1100);

    // Anillo negro inferior
    ctx.fillRect(0, 1850, 2048, 198);

    // Letras "USA" y "UNITED STATES"
    ctx.fillStyle = '#111317';
    ctx.font = 'bold 110px "Inter", sans-serif';
    ctx.textAlign = 'center';

    // Texto vertical USA en los paneles blancos
    this.drawVerticalText(ctx, 'UNITED STATES', 768, 600, 75);
    this.drawVerticalText(ctx, 'UNITED STATES', 1792, 600, 75);

    // Líneas de remaches y paneles sutiles
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 2;
    for (let y = 100; y < 2000; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  drawVerticalText(ctx, text, x, startY, spacing) {
    ctx.save();
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], x, startY + i * spacing);
    }
    ctx.restore();
  }

  createCorrugatedTexture(color1Hex, color2Hex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#26282D';
    ctx.fillRect(0, 0, 512, 512);

    // Líneas corrugadas verticales
    for (let x = 0; x < 512; x += 8) {
      ctx.fillStyle = (x / 8) % 2 === 0 ? '#18191D' : '#32353C';
      ctx.fillRect(x, 0, 4, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 2);
    return texture;
  }

  createS4BSkinTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#E8E9EC';
    ctx.fillRect(0, 0, 1024, 1024);

    // Cuadrantes negros de balanceo en la tercera etapa
    ctx.fillStyle = '#14161B';
    ctx.fillRect(0, 200, 256, 600);
    ctx.fillRect(512, 200, 256, 600);

    ctx.fillStyle = '#14161B';
    ctx.font = 'bold 70px "Inter", sans-serif';
    ctx.textAlign = 'center';
    this.drawVerticalText(ctx, 'USA', 384, 380, 70);
    this.drawVerticalText(ctx, 'USA', 896, 380, 70);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }

  createGoldKaptonTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Fondo dorado intenso
    ctx.fillStyle = '#C8932C';
    ctx.fillRect(0, 0, 1024, 1024);

    // Simulación de arrugas y láminas térmicas facetadas
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const w = 40 + Math.random() * 80;
      const h = 40 + Math.random() * 80;

      const brightness = Math.floor(180 + Math.random() * 75);
      ctx.fillStyle = `rgb(${brightness}, ${Math.floor(brightness * 0.75)}, ${Math.floor(brightness * 0.2)})`;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 230, 150, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  createSMRadiatorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(0, 0, 1024, 1024);

    // Paneles de radiadores plateados
    ctx.fillStyle = '#C4CAD3';
    ctx.fillRect(100, 100, 350, 800);
    ctx.fillRect(574, 100, 350, 800);

    // Franjas de disipación de calor
    ctx.strokeStyle = '#9AA2B0';
    ctx.lineWidth = 3;
    for (let y = 140; y < 880; y += 30) {
      ctx.beginPath();
      ctx.moveTo(120, y);
      ctx.lineTo(430, y);
      ctx.moveTo(594, y);
      ctx.lineTo(904, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }

  createHeatShieldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Escudo térmico Avcoat de resina epoxi color caramelo oscuro/carbón
    ctx.fillStyle = '#3A271D';
    ctx.fillRect(0, 0, 512, 512);

    // Panal de nido de abeja inyectado con resina
    ctx.strokeStyle = 'rgba(255, 170, 100, 0.15)';
    ctx.lineWidth = 1;
    const size = 16;
    for (let y = 0; y < 512; y += size) {
      for (let x = 0; x < 512; x += size) {
        ctx.strokeRect(x, y, size, size);
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  createBrushedMetalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#737780';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 2000; i++) {
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, y, 512, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /* =========================================================================
   * 2. MATERIALES PBR CINEMATOGRÁFICOS
   * ========================================================================= */
  initMaterials() {
    // Pintura blanca aeroespacial mate
    this.materials.rocketWhite = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.35,
      metalness: 0.1,
      bumpScale: 0.02
    });

    // Pintura negra antirreflejo
    this.materials.rocketBlack = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.6,
      metalness: 0.2
    });

    // Material primera etapa S-IC con Roll Pattern
    this.materials.s1cBody = new THREE.MeshStandardMaterial({
      map: this.textures.s1cRollPattern,
      roughness: 0.38,
      metalness: 0.15
    });

    // Anillo interetapa corrugado (S-IC / S-II)
    this.materials.interstageCorrugated = new THREE.MeshStandardMaterial({
      map: this.textures.s2Interstage,
      roughness: 0.7,
      metalness: 0.4
    });

    // Tercera etapa S-IVB
    this.materials.s4bBody = new THREE.MeshStandardMaterial({
      map: this.textures.s4bSkin,
      roughness: 0.4,
      metalness: 0.15
    });

    // Módulo de Servicio (SM) con radiadores
    this.materials.smBody = new THREE.MeshStandardMaterial({
      map: this.textures.smRadiators,
      roughness: 0.3,
      metalness: 0.6
    });

    // Command Module (CM Columbia) - Aleación metálica pulida con escudo
    this.materials.cmSkin = new THREE.MeshStandardMaterial({
      color: 0xd6d9df,
      roughness: 0.25,
      metalness: 0.8
    });

    this.materials.heatShield = new THREE.MeshStandardMaterial({
      map: this.textures.heatShield,
      roughness: 0.8,
      metalness: 0.1
    });

    // Foil dorado Módulo Lunar (Kapton)
    this.materials.goldFoil = new THREE.MeshStandardMaterial({
      map: this.textures.goldKapton,
      color: 0xffb732,
      roughness: 0.3,
      metalness: 0.85
    });

    // Etapa de ascenso Módulo Lunar (Aleación aluminio/titanio facetada)
    this.materials.lmAscentAlloy = new THREE.MeshStandardMaterial({
      color: 0x7c818c,
      roughness: 0.45,
      metalness: 0.7
    });

    // Toberas de motores (Inconel / Titanio expuesto a calor)
    this.materials.engineNozzle = new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.5,
      metalness: 0.85,
      bumpScale: 0.05
    });

    this.materials.titaniumGimbal = new THREE.MeshStandardMaterial({
      color: 0x8a909a,
      roughness: 0.25,
      metalness: 0.9
    });

    // Vidrio de ventanas
    this.materials.windowGlass = new THREE.MeshPhysicalMaterial({
      color: 0x05131f,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.9
    });

    // Aletas estabilizadoras
    this.materials.finMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.4,
      metalness: 0.2
    });
  }

  /* =========================================================================
   * 3. CONSTRUCCIÓN DE COMPONENTES MODULARES (ENSAMBLAJE FLUSH SIN ESPACIOS)
   * Altura real: 110.6m (48.3 unidades Three.js, centradas con precisión)
   * ========================================================================= */
  buildCompleteRocket(rootGroup) {
    // 1. Primera Etapa S-IC: Altura 16.8 (Cilindro de Y = -22.0 a Y = -5.2, Motores a Y = -24.2)
    const s1c = this.buildS1CStage();
    s1c.position.set(0, -13.6, 0);
    rootGroup.add(s1c);
    this.parts.s1c = s1c;

    // 2. Segunda Etapa S-II: Altura 9.9 (De Y = -5.2 a Y = +4.7)
    const s2 = this.buildS2Stage();
    s2.position.set(0, -0.25, 0);
    rootGroup.add(s2);
    this.parts.s2 = s2;

    // 3. Tercera Etapa S-IVB: Altura 7.1 (De Y = +4.7 a Y = +11.8)
    const s4b = this.buildS4BStage();
    s4b.position.set(0, 8.25, 0);
    rootGroup.add(s4b);
    this.parts.s4b = s4b;

    // 4. Instrument Unit (IU): Altura 0.36 (De Y = +11.8 a Y = +12.16)
    const iu = this.buildInstrumentUnit();
    iu.position.set(0, 11.98, 0);
    rootGroup.add(iu);
    this.parts.iu = iu;

    // 5. Spacecraft-Lunar Module Adapter (SLA): Altura 3.4 (De Y = +12.16 a Y = +15.56)
    const sla = this.buildSLAAdapter();
    sla.position.set(0, 13.86, 0);
    rootGroup.add(sla);
    this.parts.sla = sla;

    // 6. Lunar Module (Eagle): Alojado dentro de la bodega del SLA (Base en Y = 12.30)
    const lm = this.buildLunarModule();
    lm.position.set(0, 13.25, 0);
    rootGroup.add(lm);
    this.parts.lm = lm;

    // 7. Service Module (SM): Altura 3.0 (De Y = +15.56 a Y = +18.56)
    const sm = this.buildServiceModule();
    sm.position.set(0, 17.06, 0);
    rootGroup.add(sm);
    this.parts.sm = sm;

    // 8. Command Module (CM Columbia): Altura 1.46 (De Y = +18.56 a Y = +20.02)
    const cm = this.buildCommandModule();
    cm.position.set(0, 19.29, 0);
    rootGroup.add(cm);
    this.parts.cm = cm;

    // 9. Launch Escape System (LES): Altura 4.0 (Base en Y = +20.00, Cúspide en Y = +24.10)
    const les = this.buildLaunchEscapeSystem();
    les.position.set(0, 21.90, 0);
    rootGroup.add(les);
    this.parts.les = les;

    // 10. Paracaídas (Ocultos inicialmente)
    const parachutes = this.buildParachutes();
    parachutes.position.set(0, 23.5, 0);
    parachutes.visible = false;
    rootGroup.add(parachutes);
    this.parts.parachutes = parachutes;

    return this.parts;
  }

  /* -------------------------------------------------------------------------
   * S-IC: PRIMERA ETAPA (42.1m -> 16.8 unidades Three.js)
   * ------------------------------------------------------------------------- */
  buildS1CStage() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 's1c', name: 'S-IC (Primera Etapa)' };

    const radius = 2.0; // 10m de diámetro real (radio 5m = 2.0 unidades)
    const height = 16.8;

    // Cuerpo cilíndrico principal
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, 48, 8);
    const cylinder = new THREE.Mesh(cylinderGeo, this.materials.s1cBody);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    group.add(cylinder);

    // Falda de motores (Engine Fairings en la base)
    const skirtGeo = new THREE.CylinderGeometry(radius, radius * 1.06, 2.5, 48);
    const skirt = new THREE.Mesh(skirtGeo, this.materials.rocketBlack);
    skirt.position.y = -height / 2 + 1.25;
    group.add(skirt);

    // 5 Motores F-1 (1 central y 4 en cruz en el perímetro)
    const enginePositions = [
      { x: 0, z: 0, isCenter: true },
      { x: 1.35, z: 0, rotZ: 0.05 },
      { x: -1.35, z: 0, rotZ: -0.05 },
      { x: 0, z: 1.35, rotX: -0.05 },
      { x: 0, z: -1.35, rotX: 0.05 }
    ];

    group.userData.f1Engines = [];

    enginePositions.forEach((pos, idx) => {
      const f1 = this.buildF1Engine(pos.isCenter);
      f1.position.set(pos.x, -height / 2 - 0.2, pos.z);
      if (pos.rotZ) f1.rotation.z = pos.rotZ;
      if (pos.rotX) f1.rotation.x = pos.rotX;
      group.add(f1);
      group.userData.f1Engines.push(f1);
    });

    // 4 Aletas de titanio aerodinámicas estabilizadoras (Fins)
    const finAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    finAngles.forEach((angle) => {
      const fin = this.buildStabilizerFin();
      fin.position.y = -height / 2 + 1.5;
      fin.rotation.y = angle;
      group.add(fin);
    });

    // Túneles de conductos externos (LOX tunnel)
    const conduitGeo = new THREE.BoxGeometry(0.12, height - 3, 0.2);
    const conduit = new THREE.Mesh(conduitGeo, this.materials.rocketBlack);
    conduit.position.set(radius + 0.05, 0, 0);
    group.add(conduit);

    return group;
  }

  buildF1Engine(isCenter) {
    const engineGroup = new THREE.Group();

    // Campana de tobera masiva (Cónica/Campana)
    const bellGeo = new THREE.CylinderGeometry(0.35, 0.85, 2.2, 32, 6, true);
    const bell = new THREE.Mesh(bellGeo, this.materials.engineNozzle);
    bell.position.y = -1.1;
    bell.castShadow = true;
    engineGroup.add(bell);

    // Interior oscuro de la tobera
    const innerBellGeo = new THREE.CylinderGeometry(0.34, 0.84, 2.18, 32, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x08090a, side: THREE.BackSide });
    const innerBell = new THREE.Mesh(innerBellGeo, innerMat);
    innerBell.position.y = -1.1;
    engineGroup.add(innerBell);

    // Anillos de refuerzo térmico alrededor de la campana
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(0.42 + i * 0.11, 0.025, 8, 32);
      const ring = new THREE.Mesh(ringGeo, this.materials.titaniumGimbal);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.5 - i * 0.4;
      engineGroup.add(ring);
    }

    // Cámara de combustión e inyector superior
    const domeGeo = new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, this.materials.titaniumGimbal);
    dome.position.y = 0;
    engineGroup.add(dome);

    // Cardán y actuadores hidráulicos de orientación
    if (!isCenter) {
      const actuatorGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
      const actuator1 = new THREE.Mesh(actuatorGeo, this.materials.titaniumGimbal);
      actuator1.position.set(0.3, -0.2, 0.2);
      actuator1.rotation.z = -0.3;
      engineGroup.add(actuator1);
    }

    return engineGroup;
  }

  buildStabilizerFin() {
    const finGroup = new THREE.Group();

    // Forma trapezoidal estilizada de la aleta del Saturn V
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1.8, -0.8);
    shape.lineTo(1.8, -1.8);
    shape.lineTo(0.2, -1.5);
    shape.lineTo(0, 0);

    const extrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    };

    const finGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const finMesh = new THREE.Mesh(finGeo, this.materials.finMaterial);
    finMesh.position.set(1.9, 0, -0.03);
    finMesh.castShadow = true;
    finGroup.add(finMesh);

    // Carenado aerodinámico en la raíz de la aleta
    const fairingGeo = new THREE.ConeGeometry(0.45, 2.2, 16);
    const fairing = new THREE.Mesh(fairingGeo, this.materials.finMaterial);
    fairing.position.set(1.9, -0.7, 0);
    fairing.rotation.z = Math.PI;
    finGroup.add(fairing);

    return finGroup;
  }

  /* -------------------------------------------------------------------------
   * S-II: SEGUNDA ETAPA (24.8m -> 9.9 unidades Three.js)
   * ------------------------------------------------------------------------- */
  buildS2Stage() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 's2', name: 'S-II (Segunda Etapa)' };

    const radius = 2.0;
    const height = 9.9;

    // Anillo interetapa S-IC/S-II inferior corrugado
    const interstageGeo = new THREE.CylinderGeometry(radius, radius, 2.2, 48);
    const interstage = new THREE.Mesh(interstageGeo, this.materials.interstageCorrugated);
    interstage.position.y = -height / 2 + 1.1;
    group.add(interstage);

    // Retrocohetes de separación montados en el interstage
    for (let a = 0; a < 4; a++) {
      const angle = (a * Math.PI) / 2 + Math.PI / 4;
      const retroGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.6, 8);
      const retro = new THREE.Mesh(retroGeo, this.materials.engineNozzle);
      retro.position.set(Math.cos(angle) * (radius + 0.08), -height / 2 + 1.5, Math.sin(angle) * (radius + 0.08));
      retro.rotation.z = Math.PI;
      group.add(retro);
    }

    // Cuerpo blanco principal de la etapa S-II
    const mainBodyGeo = new THREE.CylinderGeometry(radius, radius, height - 2.2, 48);
    const mainBody = new THREE.Mesh(mainBodyGeo, this.materials.rocketWhite);
    mainBody.position.y = 1.1;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    // 5 Motores Rocketdyne J-2 de hidrógeno líquido
    const j2Positions = [
      { x: 0, z: 0 },
      { x: 0.9, z: 0 },
      { x: -0.9, z: 0 },
      { x: 0, z: 0.9 },
      { x: 0, z: -0.9 }
    ];

    group.userData.j2Engines = [];
    j2Positions.forEach((pos) => {
      const j2 = this.buildJ2Engine();
      j2.position.set(pos.x, -height / 2 - 0.2, pos.z);
      group.add(j2);
      group.userData.j2Engines.push(j2);
    });

    return group;
  }

  buildJ2Engine() {
    const engineGroup = new THREE.Group();

    // Tobera J-2 plateada/carbón para vacío
    const bellGeo = new THREE.CylinderGeometry(0.2, 0.55, 1.4, 24, 4, true);
    const bell = new THREE.Mesh(bellGeo, this.materials.engineNozzle);
    bell.position.y = -0.7;
    bell.castShadow = true;
    engineGroup.add(bell);

    // Turbobomba e inyector superior
    const domeGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const dome = new THREE.Mesh(domeGeo, this.materials.titaniumGimbal);
    dome.position.y = 0.05;
    engineGroup.add(dome);

    return engineGroup;
  }

  /* -------------------------------------------------------------------------
   * S-IVB: TERCERA ETAPA (17.8m -> 7.1 unidades Three.js)
   * ------------------------------------------------------------------------- */
  buildS4BStage() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 's4b', name: 'S-IVB (Tercera Etapa)' };

    const radius = 1.32; // Diámetro de 6.6m (radio 3.3m = 1.32 unidades)
    const height = 7.1;

    // Anillo adaptador cónico interetapa S-II/S-IVB (de 2.0 a 1.32)
    const adapterGeo = new THREE.CylinderGeometry(radius, 2.0, 1.6, 48);
    const adapter = new THREE.Mesh(adapterGeo, this.materials.interstageCorrugated);
    adapter.position.y = -height / 2 + 0.8;
    group.add(adapter);

    // Cuerpo principal de la etapa S-IVB con texturas NASA
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height - 1.6, 48);
    const body = new THREE.Mesh(bodyGeo, this.materials.s4bBody);
    body.position.y = 0.8;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 1 Motor central J-2 con capacidad de reinicio
    const j2 = this.buildJ2Engine();
    j2.position.set(0, -height / 2 + 0.1, 0);
    group.add(j2);
    group.userData.j2Engine = j2;

    // 2 Módulos auxiliares APS (Auxiliary Propulsion System) en los laterales
    [-1, 1].forEach((dir) => {
      const apsGeo = new THREE.BoxGeometry(0.2, 0.6, 0.35);
      const aps = new THREE.Mesh(apsGeo, this.materials.rocketWhite);
      aps.position.set(dir * (radius + 0.1), 0.5, 0);
      group.add(aps);
    });

    return group;
  }

  /* -------------------------------------------------------------------------
   * INSTRUMENT UNIT (IU) (0.91m -> 0.36 unidades Three.js)
   * ------------------------------------------------------------------------- */
  buildInstrumentUnit() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 'iu', name: 'Instrument Unit (IU)' };

    const radius = 1.32;
    const height = 0.36;

    const iuGeo = new THREE.CylinderGeometry(radius, radius, height, 48);
    const iuMesh = new THREE.Mesh(iuGeo, this.materials.rocketBlack);
    group.add(iuMesh);

    // Pequeñas antenas de telemetría perimetrales
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const antGeo = new THREE.BoxGeometry(0.04, 0.12, 0.08);
      const ant = new THREE.Mesh(antGeo, this.materials.titaniumGimbal);
      ant.position.set(Math.cos(angle) * (radius + 0.02), 0, Math.sin(angle) * (radius + 0.02));
      group.add(ant);
    }

    return group;
  }

  /* -------------------------------------------------------------------------
   * SLA: SPACECRAFT-LM ADAPTER CON 4 PÉTALOS ABRIBLES
   * ------------------------------------------------------------------------- */
  buildSLAAdapter() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 'sla', name: 'Spacecraft-LM Adapter (SLA)' };

    const rBottom = 1.32; // Diámetro S-IVB
    const rTop = 0.78;    // Diámetro Módulo de Servicio
    const height = 3.4;

    group.userData.petals = [];
    // Superficie continua del carenado cerrado, sin juntas entre cuadrantes.
    const closedCover = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop, rBottom, height, 64, 4, true),
      this.materials.rocketWhite
    );
    closedCover.castShadow = true;
    closedCover.receiveShadow = true;
    group.add(closedCover);
    group.userData.closedCover = closedCover;

    // Creamos 4 pétalos separados montados en bisagras en la base para la cinemática de apertura
    const petalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    petalAngles.forEach((angle, idx) => {
      // Punto de pivote en la base del SLA
      const hingeGroup = new THREE.Group();
      hingeGroup.rotation.y = angle;
      hingeGroup.position.y = -height / 2;

      // Geometría del cuadrante cónico
      const petalGeo = new THREE.CylinderGeometry(
        rTop,
        rBottom,
        height,
        16,
        4,
        true,
        -Math.PI / 4,
        Math.PI / 2
      );

      const petalMesh = new THREE.Mesh(petalGeo, this.materials.rocketWhite);
      petalMesh.position.y = height / 2;
      petalMesh.castShadow = true;
      petalMesh.receiveShadow = true;
      hingeGroup.add(petalMesh);

      group.add(hingeGroup);
      group.userData.petals.push(hingeGroup);
    });

    return group;
  }

  /* -------------------------------------------------------------------------
   * LUNAR MODULE (LM) "EAGLE" (Ascent Stage + Descent Stage con Foil Dorado)
   * ------------------------------------------------------------------------- */
  buildLunarModule() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 'lm', name: 'Lunar Module "Eagle"' };

    // --- A. ETAPA DE DESCENSO (Descent Stage) ---
    const descentGroup = new THREE.Group();
    descentGroup.userData = { partId: 'lm_descent', name: 'LM Etapa de Descenso' };

    // Cuerpo octogonal con foil Kapton
    const octGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.9, 8);
    const octBody = new THREE.Mesh(octGeo, this.materials.goldFoil);
    octBody.castShadow = true;
    descentGroup.add(octBody);

    // Tobera del motor de descenso (DPS)
    const dpsBellGeo = new THREE.CylinderGeometry(0.12, 0.35, 0.6, 16, 2, true);
    const dpsBell = new THREE.Mesh(dpsBellGeo, this.materials.engineNozzle);
    dpsBell.position.y = -0.7;
    descentGroup.add(dpsBell);

    // 4 Patas de aterrizaje extensibles
    descentGroup.userData.legs = [];
    const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

    legAngles.forEach((angle) => {
      const legGroup = new THREE.Group();
      legGroup.rotation.y = angle;

      // Brazo primario inclinado hacia abajo
      const strutGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8);
      const strut = new THREE.Mesh(strutGeo, this.materials.goldFoil);
      strut.position.set(0.9, -0.4, 0);
      strut.rotation.z = -0.65;
      legGroup.add(strut);

      // Plato de aterrizaje circular (Footpad)
      const padGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12);
      const pad = new THREE.Mesh(padGeo, this.materials.titaniumGimbal);
      pad.position.set(1.45, -0.95, 0);
      legGroup.add(pad);

      // Sonda de contacto lunar (Contact probe de 1.7m real)
      const probeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6);
      const probe = new THREE.Mesh(probeGeo, this.materials.titaniumGimbal);
      probe.position.set(1.45, -1.2, 0);
      legGroup.add(probe);

      descentGroup.add(legGroup);
      descentGroup.userData.legs.push(legGroup);
    });

    group.add(descentGroup);
    group.userData.descentStage = descentGroup;

    // --- B. ETAPA DE ASCENSO (Ascent Stage) ---
    const ascentGroup = new THREE.Group();
    ascentGroup.userData = { partId: 'lm_ascent', name: 'LM Etapa de Ascenso' };
    ascentGroup.position.y = 0.85;

    // Cabina presurizada facetada (Forma característica del Apollo LM)
    const cabinGeo = new THREE.DodecahedronGeometry(0.72, 0);
    const cabin = new THREE.Mesh(cabinGeo, this.materials.lmAscentAlloy);
    cabin.scale.set(1.0, 0.85, 0.9);
    cabin.castShadow = true;
    ascentGroup.add(cabin);

    // Frontal cuadrado con escotilla EVA de salida y ventanas triangulares
    const frontFaceGeo = new THREE.BoxGeometry(0.65, 0.65, 0.3);
    const frontFace = new THREE.Mesh(frontFaceGeo, this.materials.lmAscentAlloy);
    frontFace.position.set(0, 0, 0.55);
    ascentGroup.add(frontFace);

    // Ventana triangular izquierda y derecha
    const winGeo = new THREE.ConeGeometry(0.12, 0.22, 3);
    const winLeft = new THREE.Mesh(winGeo, this.materials.windowGlass);
    winLeft.position.set(-0.2, 0.12, 0.72);
    winLeft.rotation.x = Math.PI / 2;
    winLeft.rotation.z = 0.2;
    ascentGroup.add(winLeft);

    const winRight = winLeft.clone();
    winRight.position.x = 0.2;
    winRight.rotation.z = -0.2;
    ascentGroup.add(winRight);

    // Escotilla cuadrada de salida
    const hatchGeo = new THREE.BoxGeometry(0.24, 0.28, 0.04);
    const hatch = new THREE.Mesh(hatchGeo, this.materials.rocketBlack);
    hatch.position.set(0, -0.15, 0.71);
    ascentGroup.add(hatch);

    // Puerto de acoplamiento superior (Overhead docking hatch)
    const dockGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16);
    const dockPort = new THREE.Mesh(dockGeo, this.materials.titaniumGimbal);
    dockPort.position.y = 0.65;
    ascentGroup.add(dockPort);

    // 4 Bloques RCS cuádruples en cruz
    const rcsAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    rcsAngles.forEach((ang) => {
      const rcs = this.buildRCSCluster();
      rcs.position.set(Math.cos(ang) * 0.75, 0.1, Math.sin(ang) * 0.75);
      rcs.rotation.y = ang;
      ascentGroup.add(rcs);
    });

    // Antena parabólica orientable S-band
    const dishGeo = new THREE.SphereGeometry(0.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 3);
    const dish = new THREE.Mesh(dishGeo, this.materials.titaniumGimbal);
    dish.position.set(0.4, 0.75, -0.3);
    dish.rotation.x = -Math.PI / 3;
    ascentGroup.add(dish);

    group.add(ascentGroup);
    group.userData.ascentStage = ascentGroup;

    return group;
  }

  buildRCSCluster() {
    const cluster = new THREE.Group();
    const baseGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const base = new THREE.Mesh(baseGeo, this.materials.titaniumGimbal);
    cluster.add(base);

    // 4 pequeñas toberas en cruz
    const nozzleDirs = [
      { rotX: 0, rotY: 0, rotZ: Math.PI / 2, pos: [0.08, 0, 0] },
      { rotX: 0, rotY: 0, rotZ: -Math.PI / 2, pos: [-0.08, 0, 0] },
      { rotX: 0, rotY: 0, rotZ: 0, pos: [0, 0.08, 0] },
      { rotX: Math.PI, rotY: 0, rotZ: 0, pos: [0, -0.08, 0] }
    ];

    nozzleDirs.forEach((d) => {
      const nGeo = new THREE.ConeGeometry(0.025, 0.07, 8);
      const nMesh = new THREE.Mesh(nGeo, this.materials.engineNozzle);
      nMesh.position.set(...d.pos);
      nMesh.rotation.set(d.rotX, d.rotY, d.rotZ);
      cluster.add(nMesh);
    });

    return cluster;
  }

  /* -------------------------------------------------------------------------
   * SERVICE MODULE (SM) (7.56m -> 3.0 unidades Three.js)
   * ------------------------------------------------------------------------- */
  buildServiceModule() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 'sm', name: 'Service Module (SM)' };

    const radius = 0.78;
    const height = 3.0;

    // Cuerpo cilíndrico con paneles de radiadores
    const cylGeo = new THREE.CylinderGeometry(radius, radius, height, 48);
    const cyl = new THREE.Mesh(cylGeo, this.materials.smBody);
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    group.add(cyl);

    // Tobera del motor SPS (Service Propulsion System) de empuje principal
    const spsGeo = new THREE.CylinderGeometry(0.15, 0.45, 1.2, 24, 4, true);
    const sps = new THREE.Mesh(spsGeo, this.materials.engineNozzle);
    sps.position.y = -height / 2 - 0.55;
    sps.castShadow = true;
    group.add(sps);
    group.userData.spsEngine = sps;

    // 4 Bloques RCS de actitud cuádruples
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const rcs = this.buildRCSCluster();
      rcs.position.set(Math.cos(angle) * (radius + 0.05), 0.4, Math.sin(angle) * (radius + 0.05));
      rcs.rotation.y = angle;
      group.add(rcs);
    }

    // Antena High-Gain de 4 platos parabólicos orientables
    const hgGroup = new THREE.Group();
    hgGroup.position.set(0.65, -height / 2 + 0.2, 0);

    for (let p = 0; p < 4; p++) {
      const pX = (p % 2 === 0 ? -0.1 : 0.1);
      const pY = (p < 2 ? 0.1 : -0.1);
      const dishGeo = new THREE.SphereGeometry(0.1, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2.5);
      const dish = new THREE.Mesh(dishGeo, this.materials.titaniumGimbal);
      dish.position.set(pX, pY, 0.1);
      dish.rotation.x = Math.PI / 2;
      hgGroup.add(dish);
    }
    group.add(hgGroup);

    return group;
  }

  /* -------------------------------------------------------------------------
   * COMMAND MODULE (CM) "COLUMBIA" (3.65m -> 1.46 unidades Three.js)
   * ------------------------------------------------------------------------- */
  buildCommandModule() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 'cm', name: 'Command Module "Columbia"' };

    const rBase = 0.78;
    const rApex = 0.18;
    const height = 1.46;

    // Cuerpo cónico característico de la cápsula Apollo
    const coneGeo = new THREE.CylinderGeometry(rApex, rBase, height, 48);
    const coneMesh = new THREE.Mesh(coneGeo, this.materials.cmSkin);
    coneMesh.castShadow = true;
    coneMesh.receiveShadow = true;
    group.add(coneMesh);

    // Escudo térmico ablativo en la base convexa
    const shieldGeo = new THREE.SphereGeometry(rBase, 32, 16, 0, Math.PI * 2, Math.PI / 2 + 0.4, 0.45);
    const shield = new THREE.Mesh(shieldGeo, this.materials.heatShield);
    shield.position.y = -height / 2;
    shield.rotation.x = Math.PI;
    group.add(shield);
    group.userData.heatShield = shield;

    // Sonda de acoplamiento frontal (Docking Probe) en el vértice
    const probeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
    const probe = new THREE.Mesh(probeGeo, this.materials.titaniumGimbal);
    probe.position.y = height / 2 + 0.15;
    group.add(probe);

    const probeHeadGeo = new THREE.ConeGeometry(0.08, 0.12, 12);
    const probeHead = new THREE.Mesh(probeHeadGeo, this.materials.titaniumGimbal);
    probeHead.position.y = height / 2 + 0.32;
    group.add(probeHead);

    // Ventanas de la tripulación (2 frontales y 2 laterales)
    const winGeo = new THREE.PlaneGeometry(0.12, 0.12);

    const winLeft = new THREE.Mesh(winGeo, this.materials.windowGlass);
    winLeft.position.set(-0.24, 0.05, 0.58);
    winLeft.rotation.y = -0.3;
    winLeft.rotation.x = -0.35;
    group.add(winLeft);

    const winRight = new THREE.Mesh(winGeo, this.materials.windowGlass);
    winRight.position.set(0.24, 0.05, 0.58);
    winRight.rotation.y = 0.3;
    winRight.rotation.x = -0.35;
    group.add(winRight);

    // Escotilla lateral de entrada de la tripulación
    const hatchGeo = new THREE.PlaneGeometry(0.28, 0.32);
    const hatch = new THREE.Mesh(hatchGeo, this.materials.rocketBlack);
    hatch.position.set(0.62, -0.05, 0);
    hatch.rotation.y = Math.PI / 2;
    group.add(hatch);

    return group;
  }

  /* -------------------------------------------------------------------------
   * LAUNCH ESCAPE SYSTEM (LES) (10.0m -> 4.0 unidades Three.js)
   * ------------------------------------------------------------------------- */
  buildLaunchEscapeSystem() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 'les', name: 'Launch Escape System (LES)' };

    const height = 4.0;

    // Falda troncocónica del motor, encima de la torre reticular.
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.30, 0.22, 32),
      this.materials.rocketWhite
    );
    skirt.position.y = 0.19;
    group.add(skirt);

    // Cuatro patas convergentes y arriostramiento diagonal, sin anillos flotantes.
    const beam = (start, end, radius) => {
      const direction = end.clone().sub(start);
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, direction.length(), 8),
        this.materials.rocketWhite
      );
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      group.add(mesh);
    };
    const corner = (i, t) => {
      const angle = i * Math.PI / 2 + Math.PI / 4;
      const radius = 0.28 + (0.23 - 0.28) * t;
      return new THREE.Vector3(Math.cos(angle) * radius, -1.9 + 1.98 * t, Math.sin(angle) * radius);
    };
    for (let i = 0; i < 4; i++) {
      beam(corner(i, 0), corner(i, 1), 0.018);
      for (let bay = 0; bay < 3; bay++) {
        const low = bay / 3;
        const high = (bay + 1) / 3;
        beam(corner(i, low), corner((i + 1) % 4, high), 0.010);
        beam(corner((i + 1) % 4, low), corner(i, high), 0.010);
      }
    }

    // Cohete de escape sólido principal
    const motorGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.7, 24);
    const motor = new THREE.Mesh(motorGeo, this.materials.rocketWhite);
    motor.position.y = 1.15;
    group.add(motor);

    // 4 Toberas orientadas en ángulo hacia afuera
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const nozGeo = new THREE.ConeGeometry(0.05, 0.14, 8);
      const noz = new THREE.Mesh(nozGeo, this.materials.engineNozzle);
      noz.position.set(Math.cos(angle) * 0.18, height / 2 - 1.3, Math.sin(angle) * 0.18);
      noz.rotation.z = Math.cos(angle) * 0.6;
      noz.rotation.x = -Math.sin(angle) * 0.6;
      group.add(noz);
    }

    // Cono de morro con aletas canard aerodinámicas
    const noseGeo = new THREE.CylinderGeometry(0.055, 0.18, 0.35, 24);
    const nose = new THREE.Mesh(noseGeo, this.materials.rocketWhite);
    nose.position.y = 2.175;
    group.add(nose);

    return group;
  }

  /* -------------------------------------------------------------------------
   * PARACAÍDAS (3 Grandes campanas blanco/naranja para el amerizaje)
   * ------------------------------------------------------------------------- */
  buildParachutes() {
    const group = new THREE.Group();
    group.userData = { isRocketPart: true, partId: 'parachutes', name: 'Paracaídas de Amerizaje' };

    // Textura de gajos blanco y naranja
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#EA580C' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(256, 256);
      ctx.arc(256, 256, 256, (i * Math.PI * 2) / 16, ((i + 1) * Math.PI * 2) / 16);
      ctx.closePath();
      ctx.fill();
    }
    const chuteTex = new THREE.CanvasTexture(canvas);
    const chuteMat = new THREE.MeshStandardMaterial({
      map: chuteTex,
      side: THREE.DoubleSide,
      roughness: 0.8
    });

    const chuteOffsets = [
      { x: 0, z: 1.2, rotX: 0.15 },
      { x: -1.1, z: -0.6, rotX: -0.1, rotZ: -0.15 },
      { x: 1.1, z: -0.6, rotX: -0.1, rotZ: 0.15 }
    ];

    chuteOffsets.forEach((off) => {
      const chuteGroup = new THREE.Group();
      chuteGroup.position.set(off.x, 3.5, off.z);
      if (off.rotX) chuteGroup.rotation.x = off.rotX;
      if (off.rotZ) chuteGroup.rotation.z = off.rotZ;

      // Campana semiesférica
      const domeGeo = new THREE.SphereGeometry(1.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
      const dome = new THREE.Mesh(domeGeo, chuteMat);
      dome.castShadow = true;
      chuteGroup.add(dome);

      // Líneas de suspensión (Cables finos)
      const lineGeo = new THREE.BufferGeometry();
      const points = [];
      // Las tres suspensiones convergen en el vértice del CM, compensando
      // la posición y la inclinación propia de cada campana.
      const attachment = new THREE.Vector3(-off.x, -3.5, -off.z)
        .applyQuaternion(chuteGroup.quaternion.clone().invert());
      for (let l = 0; l < 8; l++) {
        const ang = (l * Math.PI * 2) / 8;
        points.push(Math.cos(ang) * 1.5, 0, Math.sin(ang) * 1.5);
        points.push(attachment.x, attachment.y, attachment.z);
      }
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      chuteGroup.add(lines);

      group.add(chuteGroup);
    });

    return group;
  }
}
