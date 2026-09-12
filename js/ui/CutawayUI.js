/**
 * CutawayUI.js
 * Interfaz para el modo de exploración del interior presurizado (Cutaway).
 * Revela la escala humana y las condiciones de la tripulación en el CM y LM.
 */

import { ROCKET_PARTS } from '../data/partsData.js';

export class CutawayUI {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onClose = options.onClose || null;
    this.onToggleModule = options.onToggleModule || null;
    this.currentPartId = 'cm';

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="cutaway-modal-backdrop" id="cutaway-backdrop">
        <div class="cutaway-panel">
          <div class="cutaway-header">
            <div class="cutaway-title-wrap">
              <span class="cutaway-badge">VISTA EN CORTE (CUTAWAY)</span>
              <h2 class="cutaway-title" id="cutaway-title">INTERIOR DEL COMMAND MODULE</h2>
            </div>
            <button class="inspector-close-btn" id="cutaway-close-btn" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Selector de nave tripulada -->
          <div class="cutaway-switch-bar">
            <button class="cutaway-tab-btn active" data-target="cm">COMMAND MODULE (COLUMBIA)</button>
            <button class="cutaway-tab-btn" data-target="lm">LUNAR MODULE (EAGLE)</button>
          </div>

          <!-- Información y contraste de escala humana -->
          <div class="cutaway-body">
            <div class="cutaway-human-metric">
              <div class="metric-card">
                <span class="metric-val" id="cutaway-vol">6.2 m³</span>
                <span class="metric-lbl">Volumen Habitable Total</span>
              </div>
              <div class="metric-card">
                <span class="metric-val" id="cutaway-crew">3 Astronautas</span>
                <span class="metric-lbl">Tripulación a Bordo</span>
              </div>
              <div class="metric-card">
                <span class="metric-val" id="cutaway-ratio">0.05%</span>
                <span class="metric-lbl">Volumen vs Saturn V</span>
              </div>
            </div>

            <p class="cutaway-narrative" id="cutaway-narrative">
              En este diminuto habitáculo de aleación ligera convivieron Neil Armstrong, Buzz Aldrin y Michael Collins durante los 8 días de viaje de ida y vuelta a la Luna. El espacio habitable total de 6.2 metros cúbicos equivale aproximadamente al interior de una camioneta SUV pequeña.
            </p>

            <div class="cutaway-features-list" id="cutaway-features">
              <!-- Features inyectadas dinámicamente -->
            </div>
          </div>

          <div class="cutaway-footer">
            <span class="cutaway-hint">💡 Puedes rotar y hacer zoom libremente en el modelo 3D con el ratón</span>
            <button class="telem-btn" id="cutaway-exit-btn">Volver a la Misión</button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const closeBtn = this.container.querySelector('#cutaway-close-btn');
    const exitBtn = this.container.querySelector('#cutaway-exit-btn');
    const backdrop = this.container.querySelector('#cutaway-backdrop');

    [closeBtn, exitBtn].forEach((b) => {
      if (b) {
        b.addEventListener('click', () => {
          this.hide();
          if (this.onClose) this.onClose();
        });
      }
    });

    const tabs = this.container.querySelectorAll('.cutaway-tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        this.setModule(target);
      });
    });
  }

  show(partId = 'cm') {
    this.container.classList.add('visible');
    this.setModule(partId);
  }

  hide() {
    this.container.classList.remove('visible');
  }

  setModule(partId) {
    this.currentPartId = partId;

    this.container.querySelectorAll('.cutaway-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-target') === partId);
    });

    if (partId === 'cm') {
      this.setElementText('#cutaway-title', 'INTERIOR DEL COMMAND MODULE "COLUMBIA"');
      this.setElementText('#cutaway-vol', '6.2 m³');
      this.setElementText('#cutaway-crew', '3 Astronautas (Acostados)');
      this.setElementText('#cutaway-ratio', '0.05%');
      this.setElementText(
        '#cutaway-narrative',
        'En este diminuto habitáculo de aleación ligera convivieron Neil Armstrong, Buzz Aldrin y Michael Collins durante los 8 días de viaje de ida y vuelta a la Luna. El espacio habitable total de 6.2 metros cúbicos equivale aproximadamente al interior de una camioneta SUV pequeña, rodeado de más de 500 interruptores mecánicos y disyuntores.'
      );

      const features = this.container.querySelector('#cutaway-features');
      if (features) {
        features.innerHTML = `
          <div class="cutaway-feat-item">
            <strong>Literas de Aleación:</strong> 3 literas reclinables que amortiguaban hasta 15G durante el lanzamiento y la reentrada.
          </div>
          <div class="cutaway-feat-item">
            <strong>Consola Principal (MDC):</strong> Panel superior con indicadores FDIs, display DSKY del ordenador AGC y controles de vuelo.
          </div>
          <div class="cutaway-feat-item">
            <strong>Sextante Óptico (AOT):</strong> Equipo óptico de precisión para alinear la plataforma inercial apuntando a estrellas de referencia.
          </div>
        `;
      }
    } else {
      this.setElementText('#cutaway-title', 'INTERIOR DEL LUNAR MODULE "EAGLE"');
      this.setElementText('#cutaway-vol', '4.5 m³');
      this.setElementText('#cutaway-crew', '2 Astronautas (De pie)');
      this.setElementText('#cutaway-ratio', '0.03%');
      this.setElementText(
        '#cutaway-narrative',
        'La cabina de ascenso del Eagle fue diseñada con una estricta optimización de masa: no tenía asientos. Neil Armstrong y Buzz Aldrin pilotaron el descenso y vivieron de pie durante 21.6 horas en la Luna, sujetos por cables de tensión y arneses.'
      );

      const features = this.container.querySelector('#cutaway-features');
      if (features) {
        features.innerHTML = `
          <div class="cutaway-feat-item">
            <strong>Puesto de Pilotaje de Pie:</strong> Los astronautas de pie cerca de las ventanas tenían mejor ángulo visual de aterrizaje y ahorraban peso.
          </div>
          <div class="cutaway-feat-item">
            <strong>Ventanas Triangulares:</strong> Inclinadas hacia abajo con retículas ópticas grabadas para estimar el punto de contacto.
          </div>
          <div class="cutaway-feat-item">
            <strong>Escotilla Cuadrada EVA:</strong> Escotilla inferior frontal por donde Neil Armstrong salió para dar su histórico primer paso.
          </div>
        `;
      }
    }

    if (this.onToggleModule) {
      this.onToggleModule(partId);
    }
  }

  setElementText(selector, text) {
    const el = this.container.querySelector(selector);
    if (el) el.textContent = text;
  }
}
