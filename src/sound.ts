// Kleine synthetische Brettgeräusche (kein Audio-Asset nötig)
let ctx: AudioContext | null = null;

export function playSound(kind: 'move' | 'capture' | 'check' | 'end') {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime;
    const tone = (freq: number, start: number, dur: number, vol: number, type: OscillatorType = 'triangle') => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t + start);
      o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + start + dur);
      g.gain.setValueAtTime(vol, t + start);
      g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      o.connect(g).connect(ctx!.destination);
      o.start(t + start);
      o.stop(t + start + dur);
    };
    if (kind === 'move') tone(420, 0, 0.07, 0.25);
    else if (kind === 'capture') (tone(300, 0, 0.06, 0.3), tone(520, 0.05, 0.08, 0.2));
    else if (kind === 'check') (tone(660, 0, 0.09, 0.2, 'square'), tone(880, 0.08, 0.1, 0.12, 'square'));
    else (tone(523, 0, 0.15, 0.2), tone(659, 0.12, 0.15, 0.2), tone(784, 0.24, 0.3, 0.2));
  } catch {}
}
