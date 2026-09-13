/**
 * TelemetryUI.js
 * Panel de telemetría e información técnica histórica de la NASA.
 * Diseño minimalista monocromático inspirado en SpaceX Vehicle Showcase.
 */

export class TelemetryUI {
  constructor(containerElement) {
    this.container = containerElement;
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

      </div>
    `;

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

  }

  setElementText(selector, text) {
    const el = this.container.querySelector(selector);
    if (el) el.textContent = text;
  }
}
