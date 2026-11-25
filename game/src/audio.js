// Warung Rush — sounds. One clear job: tiny WebAudio bleeps, no assets,
// no network. Everything is synthesized at run time.
let ctx = null;

function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(freq, ms, type = "sine", gain = 0.08) {
  const ac = audioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + ms / 1000);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + ms / 1000);
}

export const sfx = {
  chop() { beep(520, 70, "square", 0.05); },
  sizzle() { beep(180, 220, "sawtooth", 0.03); },
  plated() { beep(660, 90, "sine", 0.08); setTimeout(() => beep(880, 120, "sine", 0.08), 90); },
  served() { [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 120, "triangle", 0.09), i * 90)); },
  wrong() { beep(160, 200, "sawtooth", 0.07); },
  tick() { beep(980, 40, "square", 0.03); },
  gameOver() { [392, 330, 262].forEach((f, i) => setTimeout(() => beep(f, 200, "triangle", 0.09), i * 160)); },
};
