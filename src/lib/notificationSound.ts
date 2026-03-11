/**
 * notificationSound — soft Web Audio API tones for in-app alerts.
 * No external files required. Respects browser autoplay policy by
 * only playing after a user interaction has occurred.
 */

type OscType = OscillatorType;

function makeCtx(): AudioContext | null {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume: number,
  type: OscType = "sine"
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

/** Soft two-note alert for urgent / risk notifications */
export function playAlertSound(): void {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 880, t,        0.18, 0.12, "sine");
  tone(ctx, 660, t + 0.22, 0.22, 0.09, "sine");
}

/** Ascending three-note chime for wins / completions */
export function playSuccessSound(): void {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 523, t,        0.18, 0.10, "sine");
  tone(ctx, 659, t + 0.14, 0.18, 0.10, "sine");
  tone(ctx, 784, t + 0.28, 0.28, 0.10, "sine");
}

/** Single soft ping for general new-notification badge */
export function playPingSound(): void {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 740, t, 0.25, 0.08, "sine");
}
