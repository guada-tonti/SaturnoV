/**
 * InteriorModels.js
 * Modelos 3D de alta fidelidad para el modo "Ver Interior" (Cutaways).
 * Revela la cabina presurizada del Command Module y del Lunar Module,
 * ilustrando con gran impacto visual el reducido espacio humano frente al inmenso cohete.
 */

import * as THREE from 'three';

export class InteriorModels {
  constructor() {
    this.materials = this.initMaterials();
  }

  initMaterials() {
    // Panel de instrumentos con brillo técnico
    const consoleCanvas = document.createElement('canvas');
    consoleCanvas.width = 512;
    consoleCanvas.height = 512;
    const ctx = consoleCanvas.getContext('2d');

    ctx.fillStyle = '#1e2229';
    ctx.fillRect(0, 0, 512, 512);

    // Diales circulares iluminados y switches
    for (let y = 40; y < 480; y += 45) {
      for (let x = 40; x < 480; x += 45) {
        if (Math.random() > 0.4) {
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.stroke();

          // Aguja o indicador
          ctx.strokeStyle = Math.random() > 0.5 ? '#38bdf8' : '#e5a93c';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(Math.random() * 6) * 10, y + Math.sin(Math.random() * 6) * 10);
          ctx.stroke();
        } else {
          // Interruptores de palanca
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x - 4, y - 8, 8, 16);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x - 2, y - 2, 4, 4);
        }
      }
    }

    const consoleTex = new THREE.CanvasTexture(consoleCanvas);

    return {
      console: new THREE.MeshStandardMaterial({
        map: consoleTex,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0x0a192f,
        emissiveIntensity: 0.3
      }),
      couchFabric: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.7,
        metalness: 0.1
      }),
      astronautSuit: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.5,
        metalness: 0.2
      }),
      visorGold: new THREE.MeshPhysicalMaterial({
        color: 0xffb703,
        roughness: 0.1,
        metalness: 0.95,
        reflectivity: 0.9
      }),
      interiorWall: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.5,
        metalness: 0.4,
        side: THREE.BackSide
      }),
      cutawayGlass: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.8
      })
    };
  }

  /* =========================================================================
   * CUTAWAY COMMAND MODULE (COLUMBIA)
   * ========================================================================= */
  buildCommandModuleCutaway() {
    const group = new THREE.Group();
    group.name = 'CM_Cutaway_View';

    // 1. Caparazón transparente seccionado
    const shellGeo = new THREE.CylinderGeometry(0.18, 0.78, 1.46, 48, 1, false, 0, Math.PI * 1.3);
    const shellMesh = new THREE.Mesh(shellGeo, this.materials.cutawayGlass);
    group.add(shellMesh);

    const innerWallMesh = new THREE.Mesh(shellGeo, this.materials.interiorWall);
    group.add(innerWallMesh);

    // 2. Panel principal de control superior (Main Display Console)
    const consoleGeo = new THREE.BoxGeometry(0.7, 0.4, 0.08);
    const consoleMesh = new THREE.Mesh(consoleGeo, this.materials.console);
    consoleMesh.position.set(0, 0.25, 0.25);
    consoleMesh.rotation.x = -Math.PI / 4;
    group.add(consoleMesh);

    // 3. Tres literas de astronautas (Couches)
    const couchPositions = [
      { x: -0.28, name: 'Neil Armstrong (CDR)' },
      { x: 0, name: 'Michael Collins (CMP)' },
      { x: 0.28, name: 'Buzz Aldrin (LMP)' }
    ];

    couchPositions.forEach((pos) => {
      const couchGroup = new THREE.Group();
      couchGroup.position.set(pos.x, -0.15, -0.05);
      couchGroup.rotation.x = Math.PI / 6;

      // Respaldo
      const backGeo = new THREE.BoxGeometry(0.2, 0.45, 0.04);
      const back = new THREE.Mesh(backGeo, this.materials.couchFabric);
      couchGroup.add(back);

      // Asiento
      const seatGeo = new THREE.BoxGeometry(0.2, 0.04, 0.25);
      const seat = new THREE.Mesh(seatGeo, this.materials.couchFabric);
      seat.position.set(0, -0.22, 0.12);
      couchGroup.add(seat);

      // Reposacabezas
      const headGeo = new THREE.BoxGeometry(0.16, 0.12, 0.06);
      const head = new THREE.Mesh(headGeo, this.materials.couchFabric);
      head.position.set(0, 0.25, 0.02);
      couchGroup.add(head);

      // Figura del astronauta acostado
      const astro = this.buildAstronautFigure(true);
      astro.position.set(0, 0.02, 0.08);
      astro.rotation.x = -Math.PI / 6;
      couchGroup.add(astro);

      group.add(couchGroup);
    });

    // 4. Instrumento óptico de navegación (Sextante y Telescopio)
    const opticsGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
    const optics = new THREE.Mesh(opticsGeo, this.materials.console);
    optics.position.set(0, -0.4, 0.1);
    optics.rotation.x = Math.PI / 3;
    group.add(optics);

    return group;
  }

  /* =========================================================================
   * CUTAWAY LUNAR MODULE (EAGLE)
   * ========================================================================= */
  buildLunarModuleCutaway() {
    const group = new THREE.Group();
    group.name = 'LM_Cutaway_View';

    // 1. Caparazón transparente de la cabina de ascenso
    const cabinGeo = new THREE.DodecahedronGeometry(0.72, 0);
    const cabinGlass = new THREE.Mesh(cabinGeo, this.materials.cutawayGlass);
    cabinGlass.scale.set(1.0, 0.85, 0.9);
    group.add(cabinGlass);

    // 2. Consola de control frontal del Lunar Module
    const consoleGeo = new THREE.BoxGeometry(0.65, 0.35, 0.08);
    const consoleMesh = new THREE.Mesh(consoleGeo, this.materials.console);
    consoleMesh.position.set(0, 0.1, 0.35);
    group.add(consoleMesh);

    // 3. Dos astronautas DE PIE (Armstrong a la izquierda, Aldrin a la derecha)
    const astroPositions = [
      { x: -0.22, name: 'Neil Armstrong' },
      { x: 0.22, name: 'Buzz Aldrin' }
    ];

    astroPositions.forEach((pos) => {
      const astroGroup = new THREE.Group();
      astroGroup.position.set(pos.x, -0.25, 0.05);

      // Figura de astronauta de pie
      const astro = this.buildAstronautFigure(false);
      astroGroup.add(astro);

      // Cables de tensión/arnés de sujeción (no había asientos para ahorrar peso)
      const cableGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.6, 4);
      const cableMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
      const cable1 = new THREE.Mesh(cableGeo, cableMat);
      cable1.position.set(-0.12, 0.1, 0);
      cable1.rotation.z = 0.2;
      astroGroup.add(cable1);

      const cable2 = new THREE.Mesh(cableGeo, cableMat);
      cable2.position.set(0.12, 0.1, 0);
      cable2.rotation.z = -0.2;
      astroGroup.add(cable2);

      group.add(astroGroup);
    });

    // 4. Teclado DSKY del AGC y ordenador de navegación
    const dskyGeo = new THREE.BoxGeometry(0.12, 0.14, 0.04);
    const dsky = new THREE.Mesh(dskyGeo, this.materials.console);
    dsky.position.set(0, -0.05, 0.36);
    group.add(dsky);

    // 5. Escotilla de salida EVA en el suelo frontal
    const hatchGeo = new THREE.BoxGeometry(0.25, 0.04, 0.25);
    const hatch = new THREE.Mesh(hatchGeo, this.materials.interiorWall);
    hatch.position.set(0, -0.38, 0.3);
    group.add(hatch);

    return group;
  }

  /* =========================================================================
   * MODELO ESTILIZADO DE ASTRONAUTA PARA REFERENCIA DE ESCALA
   * ========================================================================= */
  buildAstronautFigure(isLyingDown = false) {
    const group = new THREE.Group();

    // Escala del astronauta (1.8m = 0.72 unidades Three.js)
    const scale = 0.4;
    group.scale.set(scale, scale, scale);

    // Torso con traje A7L
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.35);
    const torso = new THREE.Mesh(torsoGeo, this.materials.astronautSuit);
    torso.position.y = 0.35;
    group.add(torso);

    // Mochila de soporte vital PLSS (Portable Life Support System)
    const plssGeo = new THREE.BoxGeometry(0.4, 0.55, 0.2);
    const plss = new THREE.Mesh(plssGeo, this.materials.astronautSuit);
    plss.position.set(0, 0.38, -0.25);
    group.add(plss);

    // Casco esférico con visor dorado
    const helmetGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const helmet = new THREE.Mesh(helmetGeo, this.materials.astronautSuit);
    helmet.position.y = 0.85;
    group.add(helmet);

    const visorGeo = new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI, 0, Math.PI / 1.8);
    const visor = new THREE.Mesh(visorGeo, this.materials.visorGold);
    visor.position.set(0, 0.85, 0.05);
    visor.rotation.x = Math.PI / 2;
    group.add(visor);

    // Brazos
    [-1, 1].forEach((dir) => {
      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
      const arm = new THREE.Mesh(armGeo, this.materials.astronautSuit);
      arm.position.set(dir * 0.34, 0.35, 0.1);
      arm.rotation.x = isLyingDown ? 0.4 : -0.3;
      group.add(arm);
    });

    // Piernas
    [-1, 1].forEach((dir) => {
      const legGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.6, 8);
      const leg = new THREE.Mesh(legGeo, this.materials.astronautSuit);
      leg.position.set(dir * 0.16, -0.25, isLyingDown ? 0.1 : 0);
      if (isLyingDown) leg.rotation.x = -0.3;
      group.add(leg);
    });

    return group;
  }
}
