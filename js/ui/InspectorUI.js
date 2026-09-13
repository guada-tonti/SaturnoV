/**
 * InspectorUI.js
 * Panel interactivo para explorar los componentes del Saturn V.
 * Permite seleccionar piezas de un menú lateral o hacer click directamente
 * en el modelo 3D para enfocar la cámara y ver su ficha técnica detallada.
 */

import { ROCKET_PARTS } from '../data/partsData.js';
import { formatMissionTime } from './formatMissionTime.js';

export class InspectorUI {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onPartSelected = options.onPartSelected || null;
    this.detailContainer = options.detailContainer;
    this.onOpenCutaway = options.onOpenCutaway || null;
    this.onViewScale = options.onViewScale || null;

    this.currentPartId = null;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="inspector-drawer" id="inspector-drawer">
        <!-- Cabecera del Inspector -->
        <div class="inspector-header">
          <div class="inspector-title-wrap">
            <span class="inspector-badge">EXPLORADOR DE COMPONENTES</span>
            <h2 class="inspector-title">ANATOMÍA DEL SATURN V</h2>
          </div>
        </div>

        <div class="rocket-selector">
          <svg class="rocket-selector-svg" viewBox="0 0 300 520" aria-label="Seleccionar un componente del Saturn V">
            <g class="rocket-section rocket-whole" role="button" tabindex="0" aria-label="Saturn V completo" aria-pressed="true">
              <title>Saturn V completo</title>
              <path transform="translate(-16 0) scale(.55 1)" d="M78 8 H82 L83 30 L88 35 V55 H85 V74 L98 98 V144 L110 198 V488 L124 503 H108 L102 495 H98 L104 510 H90 L92 495 H85 L88 510 H72 L75 495 H68 L70 510 H56 L58 495 L52 503 H36 L50 488 V198 L62 144 V98 L75 74 V55 H72 V35 L77 30 Z" />
            </g>
            ${this.renderRocketSections()}
          </svg>
          <div class="rocket-selection-label" aria-live="polite">
            <span class="rocket-selection-code"></span>
            <span class="rocket-selection-name"></span>
          </div>
        </div>

        <button class="telem-btn" id="btn-inspector-scale">Comparar Escala</button>

        <!-- Ficha técnica del componente activo -->
        <div class="inspector-content" id="inspector-content">
          <div class="inspector-card">
            <div class="part-header">
              <span class="part-role" id="part-role">Cabina de Tripulación</span>
              <h3 class="part-name" id="part-name">Command Module (CM) "Columbia"</h3>
            </div>

            <p class="part-description" id="part-desc">
              Estructura cónica de aleación de aluminio y nido de abeja de acero inoxidable, forrada con un escudo térmico ablativo de resina fenólica-epoxi.
            </p>

            <!-- CTA de interior si aplica -->
            <div class="part-interior-cta" id="part-interior-cta" style="display:none">
              <button class="telem-btn full-width" id="btn-inspector-interior">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Ver Interior Presurizado (Cutaway)
              </button>
            </div>

            <div class="part-specs-grid">
              <div class="part-spec-row">
                <span class="spec-label">ALTURA</span>
                <span class="spec-value" id="part-height">3.65 m</span>
              </div>
              <div class="part-spec-row">
                <span class="spec-label">DIÁMETRO</span>
                <span class="spec-value" id="part-diameter">3.91 m</span>
              </div>
              <div class="part-spec-row">
                <span class="spec-label">MASA</span>
                <span class="spec-value" id="part-mass">5,560 kg</span>
              </div>
              <div class="part-spec-row">
                <span class="spec-label">PROPULSIÓN / EMPUJE</span>
                <span class="spec-value" id="part-thrust">12x RCS (414 N)</span>
              </div>
              <div class="part-spec-row">
                <span class="spec-label">PROPELENTE</span>
                <span class="spec-value" id="part-propellant">MMH / N2O4</span>
              </div>
              <div class="part-spec-row">
                <span class="spec-label">DESTINO / DESCARTE</span>
                <span class="spec-value" id="part-discard">Regresa a la Tierra</span>
              </div>
            </div>

            <!-- Stats específicas -->
            <div class="part-stats-container" id="part-stats-container"></div>


          </div>
        </div>
      </div>
    `;

    const detailPanel = document.createElement('div');
    detailPanel.className = 'telemetry-panel';
    detailPanel.innerHTML = `
      <div class="inspector-card" id="rocket-overview">
        <div class="part-header">
          <span class="part-role">EL VEHÍCULO DE APOLLO 11</span>
          <h3 class="part-name">Saturn V</h3>
        </div>
        <p class="part-description">El Saturn V llevó a Neil Armstrong, Buzz Aldrin y Michael Collins hacia la Luna en julio de 1969. Sus tres etapas propulsoras se separaban a medida que cumplían su función, reduciendo la masa del vehículo durante el viaje.</p>
        <p class="part-description">En la parte superior viajaban la nave Apollo y el módulo lunar Eagle. De todo el conjunto, solamente la cápsula Columbia regresó a la Tierra con los tres astronautas.</p>
        <div class="part-specs-grid">
          <div class="part-spec-row"><span class="spec-label">ALTURA TOTAL</span><span class="spec-value">110.6 m</span></div>
          <div class="part-spec-row"><span class="spec-label">MASA AL DESPEGUE</span><span class="spec-value">2,970 t</span></div>
          <div class="part-spec-row"><span class="spec-label">EMPUJE S-IC</span><span class="spec-value">34.5 MN</span></div>
          <div class="part-spec-row"><span class="spec-label">ETAPAS PROPULSORAS</span><span class="spec-value">3</span></div>
          <div class="part-spec-row"><span class="spec-label">TRIPULACIÓN</span><span class="spec-value">3 astronautas</span></div>
        </div>
      </div>`;
    detailPanel.append(this.container.querySelector('#inspector-content'));
    this.detailContainer.replaceChildren(detailPanel);
    this.detailContainer.hidden = true;
    this.attachEvents();
  }

  renderRocketSections() {
    // Esquema simplificado: el LM se muestra dentro del adaptador SLA.
    const sections = [
      ['les', 36, 'M78 8 L82 8 L83 30 L88 35 L88 55 L85 55 L85 70 L75 70 L75 55 L72 55 L72 35 L77 30 Z'],
      ['cm', 84, 'M75 74 L85 74 L98 98 L62 98 Z'],
      ['sm', 122, 'M62 102 H98 V140 H62 Z'],
      ['sla', 168, 'M62 144 H98 L110 198 H50 Z M66 160 V187 H94 V160 Z'],
      ['lm', 175, 'M74 158 H86 L93 170 V183 H67 V170 Z M67 185 H93 L99 192 H61 Z'],
      ['iu', 208, 'M50 202 H110 V214 H50 Z'],
      ['s4b', 254, 'M50 218 H110 V290 H50 Z'],
      ['s2', 342, 'M50 294 H110 V390 H50 Z'],
      ['s1c', 449, 'M50 394 H110 V488 L124 503 H108 L102 495 H58 L52 503 H36 L50 488 Z M58 497 H68 L70 510 H56 Z M75 497 H85 L88 510 H72 Z M92 497 H102 L104 510 H90 Z']
    ];
    return sections.map(([id, y, path]) => `
      <g class="rocket-section" data-part="${id}" data-label-y="${y}" role="button" tabindex="0" aria-label="${id.toUpperCase()}: ${ROCKET_PARTS[id].name.replaceAll('"', '&quot;')}" aria-pressed="false">
        <title>${ROCKET_PARTS[id].name}</title>
        <path d="${path}" fill-rule="evenodd" />
      </g>
    `).join('');
  }

  attachEvents() {
    this.container.querySelector('#btn-inspector-scale').addEventListener('click', () => this.onViewScale?.());
    this.container.querySelectorAll('.rocket-section').forEach(section => {
      const toggleSelection = () => this.selectPart(section.dataset.part || null);
      section.addEventListener('click', toggleSelection);
      section.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleSelection();
        }
      });
    });

    const btnInterior = this.detailContainer.querySelector('#btn-inspector-interior');
    if (btnInterior) {
      btnInterior.addEventListener('click', () => {
        if (this.onOpenCutaway && this.currentPartId) {
          this.onOpenCutaway(this.currentPartId);
        }
      });
    }
  }

  show(partId = null) {
    this.container.classList.add('visible');
    this.detailContainer.hidden = false;
    this.selectPart(partId);
  }

  hide() {
    this.container.classList.remove('visible');
    this.detailContainer.hidden = true;
  }

  selectPart(partId) {
    if (partId === null) {
      this.currentPartId = null;
      this.container.querySelectorAll('.rocket-section').forEach(section => {
        const active = section.classList.contains('rocket-whole');
        section.classList.toggle('active', active);
        section.setAttribute('aria-pressed', String(active));
      });
      this.container.querySelector('.rocket-selection-label').hidden = true;
      this.detailContainer.hidden = false;
      this.detailContainer.querySelector('#rocket-overview').hidden = false;
      this.detailContainer.querySelector('#inspector-content').hidden = true;
      this.onPartSelected?.(null);
      return;
    }
    const partData = ROCKET_PARTS[partId];
    if (!partData) return;

    this.currentPartId = partId;
    this.detailContainer.querySelector('#rocket-overview').hidden = true;
    this.detailContainer.querySelector('#inspector-content').hidden = false;
    this.container.querySelector('.rocket-selection-label').hidden = false;
    this.detailContainer.hidden = false;

    this.container.querySelectorAll('.rocket-section').forEach(section => {
      const active = section.dataset.part === partId;
      section.classList.toggle('active', active);
      section.setAttribute('aria-pressed', String(active));
      if (active) {
        this.container.querySelector('.rocket-selection-label').style.top = `${Number(section.dataset.labelY) / 520 * 100}%`;
      }
    });
    this.container.querySelector('.rocket-selection-code').textContent = partId.toUpperCase();
    this.container.querySelector('.rocket-selection-name').textContent = partData.name;

    // Actualizar campos
    this.setElementText('#part-role', partData.role);
    this.setElementText('#part-name', partData.name);
    this.setElementText('#part-desc', partData.description);
    this.setElementText('#part-height', partData.height);
    this.setElementText('#part-diameter', partData.diameter);
    this.setElementText('#part-mass', partData.mass);
    this.setElementText('#part-thrust', partData.thrust || 'N/A');
    this.setElementText('#part-propellant', partData.propellant || 'N/A');
    this.setElementText('#part-discard', formatMissionTime(partData.discardTime || 'N/A'));

    // Stats complementarias
    const statsContainer = this.detailContainer.querySelector('#part-stats-container');
    if (statsContainer) {
      if (partData.stats && partData.stats.length > 0) {
        statsContainer.innerHTML = `
          <div class="stats-mini-grid">
            ${partData.stats.map((st) => `
              <div class="mini-stat">
                <span class="mini-stat-label">${st.label}</span>
                <span class="mini-stat-value">${st.value}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        statsContainer.innerHTML = '';
      }
    }

    // Botón de interior
    const ctaInterior = this.detailContainer.querySelector('#part-interior-cta');
    if (ctaInterior) {
      ctaInterior.style.display = partData.hasCutaway ? 'block' : 'none';
    }

    // Notificar al orquestador para encuadrar cámara
    if (this.onPartSelected) {
      this.onPartSelected(partData);
    }
  }

  setElementText(selector, text) {
    const el = this.detailContainer.querySelector(selector);
    if (el) el.textContent = text;
  }
}
