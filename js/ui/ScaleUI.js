/**
 * ScaleUI.js
 * Modal interactivo para la comparativa visual de escalas.
 * Hace evidente el colosal contraste entre el Saturn V de 110.6m y el Command Module de 3.65m.
 */

import { SCALE_COMPARISONS } from '../data/scaleData.js';

export class ScaleUI {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onClose = options.onClose || null;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="scale-modal-backdrop" id="scale-backdrop">
        <div class="scale-panel">
          <div class="scale-header">
            <div class="scale-title-wrap">
              <span class="scale-badge">ESTUDIO DE ESCALA & MASA</span>
              <h2 class="scale-title">EL GIGANTE QUE SE VOLVIÓ DIMINUTO</h2>
            </div>
            <button class="inspector-close-btn" id="scale-close-btn" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="scale-hero-stat">
            <div class="scale-stat-box highlight">
              <span class="stat-big">110.6 m</span>
              <span class="stat-sub">Altura Inicial Saturn V</span>
            </div>
            <div class="scale-stat-arrow">➔</div>
            <div class="scale-stat-box highlight-capsule">
              <span class="stat-big">3.65 m</span>
              <span class="stat-sub">Cápsula Columbia (Retorno)</span>
            </div>
            <div class="scale-stat-divider"></div>
            <div class="scale-stat-box">
              <span class="stat-big">99.81%</span>
              <span class="stat-sub">Masa Descartada en el Viaje</span>
            </div>
          </div>

          <p class="scale-intro-text">
            Uno de los hechos más asombrosos del Programa Apollo es que toda la colosal estructura de 110.6 metros y casi 3,000 toneladas fue necesaria únicamente para acelerar e impulsar la pequeña cápsula <em>Columbia</em> (5.5 toneladas) y el módulo lunar hasta la superficie de la Luna y traer de vuelta a los tres astronautas con vida.
          </p>

          <!-- Gráfico visual de barras de escala real -->
          <div class="scale-bars-container">
            ${SCALE_COMPARISONS.map((item) => {
              const heightPct = (item.height / 110.6) * 100;
              const isHighlight = item.isHighlight;
              const isRef = item.isReference;

              return `
                <div class="scale-bar-row ${isHighlight ? 'is-highlight' : ''} ${isRef ? 'is-reference' : ''}">
                  <div class="scale-bar-label">
                    <span class="bar-name">${item.name}</span>
                    <span class="bar-height-tag">${item.height} m</span>
                  </div>
                  <div class="scale-bar-track">
                    <div class="scale-bar-fill" style="width: ${heightPct}%; background-color: var(--accent-cyan);"></div>
                  </div>
                  <div class="scale-bar-mass">
                    ${item.mass >= 1 ? `${item.mass} t` : `${item.mass * 1000} kg`}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="scale-footer">
            <button class="telem-btn" id="scale-exit-btn">Entendido, Volver a Componentes</button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#scale-close-btn');
    const exitBtn = this.container.querySelector('#scale-exit-btn');

    [closeBtn, exitBtn].forEach((b) => {
      if (b) {
        b.addEventListener('click', () => {
          this.hide();
          if (this.onClose) this.onClose();
        });
      }
    });
  }

  show() {
    this.container.classList.add('visible');
  }

  hide() {
    this.container.classList.remove('visible');
  }
}
