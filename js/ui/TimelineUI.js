/**
 * TimelineUI.js
 * Línea de tiempo vertical interactiva y minimalista para navegar
 * las 24 etapas históricas de la misión Apollo 11.
 */

export class TimelineUI {
  constructor(containerElement, stages, onStageSelected) {
    this.container = containerElement;
    this.stages = stages;
    this.onStageSelected = onStageSelected;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playInterval = null;

    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="timeline-wrapper">
        <div class="timeline-header">
          <div class="timeline-title-row">
            <span class="timeline-badge">CRONOLOGÍA</span>
          </div>
          <div class="timeline-stage-time" aria-live="polite" aria-atomic="true">
            <span class="timeline-stage-date" id="tl-stage-date"></span>
            <span class="timeline-stage-clock" id="tl-stage-clock"></span>
            <div class="timeline-stage-elapsed">
              <span class="timeline-stage-met" id="tl-stage-met"></span>
              <span class="timeline-stage-time-label" id="tl-stage-time-label"></span>
            </div>
          </div>
          <div class="timeline-progress-bar">
            <div class="timeline-progress-fill" id="timeline-progress-fill"></div>
          </div>
        </div>

        <div class="timeline-track" id="timeline-track">
          <div class="timeline-line"></div>
          <div class="timeline-nodes-container" id="timeline-nodes">
            ${this.stages.map((stage, idx) => `
              <div class="timeline-node ${idx === 0 ? 'active' : ''}" data-index="${idx}" id="tl-node-${idx}">
                <div class="node-marker">
                  <div class="marker-dot"></div>
                  <div class="marker-ring"></div>
                </div>
                <div class="node-info">
                  <span class="node-met">${stage.met}</span>
                  <span class="node-name">${stage.name}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="timeline-controls">
          <button class="tl-btn" id="tl-prev-btn" title="Etapa anterior" aria-label="Anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button class="tl-btn tl-play-btn" id="tl-play-btn" title="Reproducir misión automática" aria-label="Auto-play">
            <svg class="icon-play" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <svg class="icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </button>
          <button class="tl-btn" id="tl-next-btn" title="Siguiente etapa" aria-label="Siguiente">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    `;

    this.progressFill = this.container.querySelector('#timeline-progress-fill');
    this.stageDate = this.container.querySelector('#tl-stage-date');
    this.stageClock = this.container.querySelector('#tl-stage-clock');
    this.stageMet = this.container.querySelector('#tl-stage-met');
    this.stageTimeLabel = this.container.querySelector('#tl-stage-time-label');
    this.nodesContainer = this.container.querySelector('#timeline-nodes');
    this.updateStageTime(this.stages[this.currentIndex]);
  }

  attachEvents() {
    // Click en nodos individuales
    this.nodesContainer.querySelectorAll('.timeline-node').forEach((nodeEl) => {
      nodeEl.addEventListener('click', () => {
        const index = parseInt(nodeEl.getAttribute('data-index'), 10);
        this.goToStage(index);
      });
    });

    // Botones de navegación
    const prevBtn = this.container.querySelector('#tl-prev-btn');
    const nextBtn = this.container.querySelector('#tl-next-btn');
    const playBtn = this.container.querySelector('#tl-play-btn');

    prevBtn.addEventListener('click', () => this.previousStage());
    nextBtn.addEventListener('click', () => this.nextStage());
    playBtn.addEventListener('click', () => this.toggleAutoPlay());


  }

  goToStage(index) {
    if (index < 0 || index >= this.stages.length) return;
    this.currentIndex = index;

    // Actualizar nodos activos en UI
    this.nodesContainer.querySelectorAll('.timeline-node').forEach((el, idx) => {
      if (idx === index) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        el.classList.remove('active');
      }
    });

    // Actualizar encabezado temporal y barra de progreso
    const pct = ((index) / (this.stages.length - 1)) * 100;
    if (this.progressFill) this.progressFill.style.width = `${pct}%`;
    this.updateStageTime(this.stages[index]);

    // Disparar callback
    if (this.onStageSelected) {
      this.onStageSelected(this.stages[index], index);
    }
  }

  updateStageTime(stage) {
    // Usar solo los datos disponibles; algunas etapas no incluyen hora UTC.
    const [date, clock = ''] = stage.date.split(' - ');
    const months = {
      enero: 'ENE', febrero: 'FEB', marzo: 'MAR', abril: 'ABR',
      mayo: 'MAY', junio: 'JUN', julio: 'JUL', agosto: 'AGO',
      septiembre: 'SEP', octubre: 'OCT', noviembre: 'NOV', diciembre: 'DIC'
    };
    this.stageDate.textContent = date.replace(
      /^(\d{1,2}) de (\w+) de (\d{4})$/i,
      (_, day, month, year) => `${day} ${months[month.toLowerCase()] || month.toUpperCase()} ${year}`
    );
    this.stageClock.textContent = clock;
    this.stageClock.hidden = !clock;
    this.stageMet.textContent = stage.met.replace(
      /^(T[+-])\s*(\d+):(\d{2}):(\d{2})$/,
      (_, sign, hours, minutes, seconds) =>
        `${sign} ${String(Number(hours)).padStart(2, '0')}:${minutes}:${seconds}`
    );
    this.stageTimeLabel.textContent = stage.met.startsWith('T-')
      ? 'PARA EL DESPEGUE'
      : 'DESDE EL DESPEGUE';
  }

  nextStage() {
    if (this.currentIndex < this.stages.length - 1) {
      this.goToStage(this.currentIndex + 1);
    } else if (this.isPlaying) {
      this.stopAutoPlay();
    }
  }

  previousStage() {
    if (this.currentIndex > 0) {
      this.goToStage(this.currentIndex - 1);
    }
  }

  toggleAutoPlay() {
    if (this.isPlaying) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isPlaying = true;
    const playBtn = this.container.querySelector('#tl-play-btn');
    if (playBtn) {
      playBtn.querySelector('.icon-play').style.display = 'none';
      playBtn.querySelector('.icon-pause').style.display = 'block';
      playBtn.classList.add('playing');
    }

    if (this.currentIndex === this.stages.length - 1) {
      this.goToStage(0);
    }

    this.playInterval = setInterval(() => {
      if (this.currentIndex < this.stages.length - 1) {
        this.nextStage();
      } else {
        this.stopAutoPlay();
      }
    }, 4500);
  }

  stopAutoPlay() {
    this.isPlaying = false;
    clearInterval(this.playInterval);
    const playBtn = this.container.querySelector('#tl-play-btn');
    if (playBtn) {
      playBtn.querySelector('.icon-play').style.display = 'block';
      playBtn.querySelector('.icon-pause').style.display = 'none';
      playBtn.classList.remove('playing');
    }
  }
}
