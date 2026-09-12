/**
 * InspectorUI.js
 * Panel interactivo para explorar los componentes del Saturn V.
 * Permite seleccionar piezas de un menú lateral o hacer click directamente
 * en el modelo 3D para enfocar la cámara y ver su ficha técnica detallada.
 */

import { ROCKET_PARTS } from '../data/partsData.js';

export class InspectorUI {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onPartSelected = options.onPartSelected || null;
    this.onCloseInspector = options.onCloseInspector || null;
    this.onOpenCutaway = options.onOpenCutaway || null;

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
          <button class="inspector-close-btn" id="inspector-close-btn" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Lista de selección de partes -->
        <div class="parts-selector-bar">
          ${Object.values(ROCKET_PARTS).map((p) => `
            <button class="part-pill-btn" data-part="${p.id}">${p.id.toUpperCase()}</button>
          `).join('')}
        </div>

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

            <!-- CTA de interior si aplica -->
            <div class="part-interior-cta" id="part-interior-cta" style="display:none">
              <button class="telem-btn telem-btn-interior full-width" id="btn-inspector-interior">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Ver Interior Presurizado (Cutaway)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#inspector-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
        if (this.onCloseInspector) this.onCloseInspector();
      });
    }

    const pills = this.container.querySelectorAll('.part-pill-btn');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const partId = pill.getAttribute('data-part');
        this.selectPart(partId);
      });
    });

    const btnInterior = this.container.querySelector('#btn-inspector-interior');
    if (btnInterior) {
      btnInterior.addEventListener('click', () => {
        if (this.onOpenCutaway && this.currentPartId) {
          this.onOpenCutaway(this.currentPartId);
        }
      });
    }
  }

  show(partId = 'cm') {
    this.container.classList.add('visible');
    this.selectPart(partId);
  }

  hide() {
    this.container.classList.remove('visible');
  }

  selectPart(partId) {
    const partData = ROCKET_PARTS[partId];
    if (!partData) return;

    this.currentPartId = partId;

    // Actualizar pills activas
    this.container.querySelectorAll('.part-pill-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-part') === partId);
    });

    // Actualizar campos
    this.setElementText('#part-role', partData.role);
    this.setElementText('#part-name', partData.name);
    this.setElementText('#part-desc', partData.description);
    this.setElementText('#part-height', partData.height);
    this.setElementText('#part-diameter', partData.diameter);
    this.setElementText('#part-mass', partData.mass);
    this.setElementText('#part-thrust', partData.thrust || 'N/A');
    this.setElementText('#part-propellant', partData.propellant || 'N/A');
    this.setElementText('#part-discard', partData.discardTime || 'N/A');

    // Stats complementarias
    const statsContainer = this.container.querySelector('#part-stats-container');
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
    const ctaInterior = this.container.querySelector('#part-interior-cta');
    if (ctaInterior) {
      ctaInterior.style.display = partData.hasCutaway ? 'block' : 'none';
    }

    // Notificar al orquestador para encuadrar cámara
    if (this.onPartSelected) {
      this.onPartSelected(partData);
    }
  }

  setElementText(selector, text) {
    const el = this.container.querySelector(selector);
    if (el) el.textContent = text;
  }
}
