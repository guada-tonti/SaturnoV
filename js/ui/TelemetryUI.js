/**
 * TelemetryUI.js
 * Panel de telemetría e información técnica histórica de la NASA.
 * Diseño minimalista monocromático inspirado en SpaceX Vehicle Showcase.
 */

export class TelemetryUI {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.onExploreParts = options.onExploreParts || null;
    this.onViewInterior = options.onViewInterior || null;
    this.onViewScale = options.onViewScale || null;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="telemetry-panel">
        <!-- Título principal del hito -->
        <div class="telemetry-title-block">
          <p class="telemetry-stage-datetime" id="telem-stage-datetime"></p>
          <h1 class="telemetry-stage-title" id="telem-title">SATURN V</h1>
          <p class="telemetry-stage-subtitle" id="telem-subtitle">Complejo de Lanzamiento 39A (KSC, Florida)</p>
        </div>

        <!-- Descripción histórica -->
        <div class="telemetry-desc-block">
          <p class="telemetry-description" id="telem-desc">
            El Saturn V SA-506 se yergue imponente en el Complejo de Lanzamiento 39A. Con 110.6 metros de altura y cerca de 3,000 toneladas de propelente, es la máquina voladora más potente construida por la humanidad.
          </p>
          <div class="telemetry-note" id="telem-note">
            <span class="note-icon">ℹ</span>
            <span class="note-text" id="telem-note-text">Tripulación: Neil Armstrong, Buzz Aldrin, Michael Collins.</span>
          </div>
        </div>

        <!-- Grid de telemetría técnica de la NASA -->
        <div class="telemetry-specs-grid">
          <div class="spec-item">
            <span class="spec-label">ALTITUD</span>
            <span class="spec-value" id="telem-altitude">0 m</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">VELOCIDAD</span>
            <span class="spec-value" id="telem-velocity">0 km/h</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">DISTANCIA</span>
            <span class="spec-value" id="telem-distance">0 km</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">MASA ACTUAL</span>
            <span class="spec-value" id="telem-mass">2,970 t</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">ALTURA NAVE</span>
            <span class="spec-value" id="telem-height">110.6 m</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">FECHA UTC</span>
            <span class="spec-value spec-date" id="telem-date">16 Jul 1969</span>
          </div>
        </div>

        <!-- Acciones contextuales -->
        <div class="telemetry-actions">
          <button class="telem-btn" id="btn-inspect-parts">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Explorar Componentes
          </button>
          <button class="telem-btn telem-btn-interior" id="btn-view-interior" style="display:none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            Ver Interior (Cutaway)
          </button>
          <button class="telem-btn telem-btn-scale" id="btn-view-scale">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8M9 9 3 3m6 6V4.2M9 9H4.2"/></svg>
            Comparar Escala
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnInspect = this.container.querySelector('#btn-inspect-parts');
    const btnInterior = this.container.querySelector('#btn-view-interior');
    const btnScale = this.container.querySelector('#btn-view-scale');

    if (btnInspect && this.onExploreParts) {
      btnInspect.addEventListener('click', () => this.onExploreParts());
    }
    if (btnInterior && this.onViewInterior) {
      btnInterior.addEventListener('click', () => this.onViewInterior());
    }
    if (btnScale && this.onViewScale) {
      btnScale.addEventListener('click', () => this.onViewScale());
    }
  }

  updateStage(stageData) {
    if (!stageData) return;

    this.setElementText('#telem-title', stageData.name);
    this.setElementText('#telem-stage-datetime', stageData.date);
    this.setElementText('#telem-subtitle', stageData.subtitle);
    this.setElementText('#telem-desc', stageData.description);
    this.setElementText('#telem-note-text', stageData.historicalNote || '');
    this.setElementText('#telem-altitude', stageData.altitude);
    this.setElementText('#telem-velocity', stageData.velocity);
    this.setElementText('#telem-distance', stageData.distance);
    this.setElementText('#telem-mass', stageData.vehicleMass);
    this.setElementText('#telem-height', stageData.vehicleHeight);
    this.setElementText('#telem-date', stageData.date);

    // Botón de ver interior disponible cuando la etapa involucra Command Module o Lunar Module
    const btnInterior = this.container.querySelector('#btn-view-interior');
    if (btnInterior) {
      const showInterior = stageData.id >= 7 && stageData.id <= 24;
      btnInterior.style.display = showInterior ? 'inline-flex' : 'none';
      if (stageData.id >= 16 && stageData.id <= 18) {
        btnInterior.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          Ver Interior Lunar Module
        `;
      } else {
        btnInterior.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          Ver Interior Columbia
        `;
      }
    }
  }

  setElementText(selector, text) {
    const el = this.container.querySelector(selector);
    if (el) el.textContent = text;
  }
}
