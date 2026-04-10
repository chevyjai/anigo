// ============================================
// AniGO — Web Audio API sound effects
// ============================================

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function ensureResumed() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ── Stone placement: satisfying stone-on-slate click with resonance ──
export function stonePlace() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  // Impact click (the "clack")
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, t);
  filter.frequency.exponentialRampToValueAtTime(300, t + 0.08);

  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);

  // Slate resonance (low thud that gives weight)
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(120, t);
  thud.frequency.exponentialRampToValueAtTime(60, t + 0.15);
  thudGain.gain.setValueAtTime(0.1, t);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  thud.connect(thudGain);
  thudGain.connect(ctx.destination);
  thud.start(t);
  thud.stop(t + 0.2);

  // Tiny bright overtone (the "glass" of the stone)
  const bright = ctx.createOscillator();
  const brightGain = ctx.createGain();
  bright.type = 'sine';
  bright.frequency.setValueAtTime(2800, t + 0.01);
  bright.frequency.exponentialRampToValueAtTime(1800, t + 0.06);
  brightGain.gain.setValueAtTime(0.02, t + 0.01);
  brightGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  bright.connect(brightGain);
  brightGain.connect(ctx.destination);
  bright.start(t + 0.01);
  bright.stop(t + 0.1);
}

// ── Stone capture: crunch/crack sound ──
export function stoneCapture() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  // Noise burst
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, t);
  filter.Q.setValueAtTime(2, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(t);
  noise.stop(t + 0.25);
}

// ── Spell cast: mystical whoosh + shimmer + harmonic tail ──
export function spellCast() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  // Whoosh (filtered noise sweep)
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(4000, t + 0.2);
  filter.frequency.exponentialRampToValueAtTime(600, t + 0.5);
  filter.Q.setValueAtTime(4, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.linearRampToValueAtTime(0.14, t + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.55);

  // Shimmer — two detuned oscillators for chorus effect
  const freqs = [1200, 1207]; // Slight detuning for shimmer
  for (const freq of freqs) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 2, t + 0.35);
    oscGain.gain.setValueAtTime(0.035, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Mystical harmonic tail — fading fifth interval
  const tail = ctx.createOscillator();
  const tailGain = ctx.createGain();
  tail.type = 'sine';
  tail.frequency.setValueAtTime(660, t + 0.15);
  tail.frequency.exponentialRampToValueAtTime(440, t + 0.6);
  tailGain.gain.setValueAtTime(0, t);
  tailGain.gain.linearRampToValueAtTime(0.03, t + 0.2);
  tailGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  tail.connect(tailGain);
  tailGain.connect(ctx.destination);
  tail.start(t + 0.15);
  tail.stop(t + 0.65);
}

// ── Chi gain: soft chime ──
export function chiGain() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.setValueAtTime(1320, t + 0.08);
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.35);
}

// ── Turn start: subtle tone ──
export function turnStart() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, t);
  gain.gain.setValueAtTime(0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.3);
}

// ── Game end: dramatic resolution fanfare ──
export function gameEnd() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  // Rising sweep before the chord
  const sweep = ctx.createOscillator();
  const sweepGain = ctx.createGain();
  const sweepFilter = ctx.createBiquadFilter();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(100, t);
  sweep.frequency.exponentialRampToValueAtTime(500, t + 0.4);
  sweepFilter.type = 'lowpass';
  sweepFilter.frequency.setValueAtTime(600, t);
  sweepFilter.frequency.exponentialRampToValueAtTime(2000, t + 0.35);
  sweepGain.gain.setValueAtTime(0.03, t);
  sweepGain.gain.linearRampToValueAtTime(0.06, t + 0.3);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  sweep.connect(sweepFilter);
  sweepFilter.connect(sweepGain);
  sweepGain.connect(ctx.destination);
  sweep.start(t);
  sweep.stop(t + 0.5);

  // Main chord — staggered for arpeggio feel
  const chordFreqs = [261.6, 329.6, 392, 523.3, 659.3]; // C major + high E
  chordFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i < 3 ? 'sine' : 'triangle';
    const delay = 0.4 + i * 0.06;
    osc.frequency.setValueAtTime(freq, t + delay);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + delay + 0.05);
    gain.gain.linearRampToValueAtTime(0.05, t + delay + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + delay);
    osc.stop(t + 2.3);
  });

  // Cymbal shimmer
  const bufferSize = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
  }
  const cymbal = ctx.createBufferSource();
  cymbal.buffer = buffer;
  const cymbalFilter = ctx.createBiquadFilter();
  cymbalFilter.type = 'highpass';
  cymbalFilter.frequency.setValueAtTime(5000, t);
  const cymbalGain = ctx.createGain();
  cymbalGain.gain.setValueAtTime(0, t);
  cymbalGain.gain.linearRampToValueAtTime(0.04, t + 0.5);
  cymbalGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
  cymbal.connect(cymbalFilter);
  cymbalFilter.connect(cymbalGain);
  cymbalGain.connect(ctx.destination);
  cymbal.start(t + 0.35);
  cymbal.stop(t + 2.2);
}

// ── Card hover: soft flip ──
export function cardHover() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.06;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.03, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.08);
}

// ── Snare trigger: sharp snap ──
export function snareTrigger() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  // Sharp click
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1600, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);

  // Metallic ring
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(2200, t + 0.02);
  gain2.gain.setValueAtTime(0, t);
  gain2.gain.linearRampToValueAtTime(0.06, t + 0.03);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + 0.25);
}

// ── Chi change: ascending/descending pip ──
export function chiChange(gained) {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  if (gained) {
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.setValueAtTime(880, t + 0.06);
  } else {
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(660, t + 0.06);
  }
  gain.gain.setValueAtTime(0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);
}

// ── Card draw: soft slide ──
export function cardDraw() {
  const ctx = ensureResumed();
  const t = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2000, t);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.15);
}
