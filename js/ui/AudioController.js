/**
 * AudioController.js
 * Generador procedural de audio aeroespacial mediante Web Audio API.
 * Crea sonido ambiente de fondo ultra-sutil (propulsión subsónica),
 * beeps de telemetría tipo Quindar de la NASA y clics de desacople mecánico.
 */

export class AudioController {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Silenciado por defecto para respetar al usuario
    this.rumbleGain = null;
    this.rumbleOsc = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn('Web Audio API no soportada', e);
    }
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopRumble();
    } else {
      this.startRumble();
      this.playQuindarBeep(true);
    }
    return this.isMuted;
  }

  /**
   * Beep de telemetría Quindar (intro o outro de transmisión NASA)
   */
  playQuindarBeep(isIntro = true) {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Frecuencia Quindar histórica: 2525 Hz (intro) o 2475 Hz (outro)
      osc.frequency.setValueAtTime(isIntro ? 2525 : 2475, this.ctx.currentTime);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  /**
   * Efecto de desacople mecánico o disparo RCS
   */
  playStageSeparation() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);
      osc.type = 'triangle';

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {}
  }

  startRumble() {
    if (this.isMuted || !this.ctx || this.rumbleOsc) return;
    try {
      this.rumbleOsc = this.ctx.createOscillator();
      this.rumbleGain = this.ctx.createGain();

      this.rumbleOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
      this.rumbleOsc.type = 'sine';

      this.rumbleGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      this.rumbleOsc.connect(this.rumbleGain);
      this.rumbleGain.connect(this.ctx.destination);

      this.rumbleOsc.start();
    } catch (e) {}
  }

  stopRumble() {
    if (this.rumbleOsc) {
      try {
        this.rumbleOsc.stop();
        this.rumbleOsc.disconnect();
      } catch (e) {}
      this.rumbleOsc = null;
    }
  }
}
