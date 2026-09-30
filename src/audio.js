let context;
let muted = false;
try { muted = localStorage.getItem('asyk-atu-muted-v1') === '1'; } catch { /* Storage can be disabled. */ }

export function isMuted() { return muted; }
export function setMuted(value) {
  muted = Boolean(value);
  try { localStorage.setItem('asyk-atu-muted-v1', muted ? '1' : '0'); } catch { /* Storage can be disabled. */ }
}

export function playSound(kind) {
  if (muted) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  context ||= new AudioContextClass();
  if (context.state === 'suspended') context.resume();
  const now = context.currentTime;
  const presets = {
    throw: [190, 105, 0.09, 'triangle'],
    hit: [125, 68, 0.12, 'sine'],
    score: [560, 880, 0.2, 'sine'],
    victory: [440, 880, 0.45, 'triangle'],
  };
  const [start, end, duration, type] = presets[kind] || presets.hit;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(start, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(35, end), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(kind === 'score' || kind === 'victory' ? 0.12 : 0.08, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain); gain.connect(context.destination);
  oscillator.start(now); oscillator.stop(now + duration + 0.02);
  if (kind === 'victory') {
    setTimeout(() => playSound('score'), 140);
    setTimeout(() => playSound('score'), 280);
  }
}
