/**
 * notificationSound — Web Audio API tones + Web Push Notifications.
 * All sounds require a prior user interaction to comply with autoplay policy.
 * Push notifications request permission and fall back gracefully.
 */

type OscType = OscillatorType;

export type RingtoneStyle = "default" | "chime" | "pulse" | "deep" | "minimal";

let _hasInteracted = false;
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", () => { _hasInteracted = true; }, { once: true });
  window.addEventListener("keydown", () => { _hasInteracted = true; }, { once: true });
}

function makeCtx(): AudioContext | null {
  if (!_hasInteracted) return null;
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

/* ────────────────── RINGTONE STYLES ────────────────── */

/** Soft two-note alert for urgent / risk notifications */
export function playAlertSound(style: RingtoneStyle = "default"): void {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  if (style === "chime") {
    tone(ctx, 1046, t,        0.14, 0.09, "sine");
    tone(ctx, 880,  t + 0.16, 0.18, 0.08, "sine");
    tone(ctx, 698,  t + 0.34, 0.20, 0.07, "sine");
  } else if (style === "pulse") {
    [0, 0.18, 0.36].forEach(offset => tone(ctx, 660, t + offset, 0.12, 0.10, "square"));
  } else if (style === "deep") {
    tone(ctx, 220, t,        0.30, 0.12, "sine");
    tone(ctx, 165, t + 0.32, 0.30, 0.09, "sine");
  } else if (style === "minimal") {
    tone(ctx, 880, t, 0.12, 0.07, "sine");
  } else {
    tone(ctx, 880, t,        0.18, 0.12, "sine");
    tone(ctx, 660, t + 0.22, 0.22, 0.09, "sine");
  }
}

/** Ascending three-note chime for wins / completions */
export function playSuccessSound(style: RingtoneStyle = "default"): void {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  if (style === "chime") {
    tone(ctx, 523, t,        0.18, 0.09, "sine");
    tone(ctx, 659, t + 0.14, 0.18, 0.09, "sine");
    tone(ctx, 784, t + 0.28, 0.18, 0.09, "sine");
    tone(ctx, 1046,t + 0.42, 0.28, 0.09, "sine");
  } else if (style === "pulse") {
    tone(ctx, 784, t,        0.10, 0.09, "sine");
    tone(ctx, 880, t + 0.12, 0.10, 0.09, "sine");
    tone(ctx, 988, t + 0.24, 0.20, 0.09, "sine");
  } else if (style === "deep") {
    tone(ctx, 330, t,        0.22, 0.10, "sine");
    tone(ctx, 440, t + 0.24, 0.28, 0.10, "sine");
  } else if (style === "minimal") {
    tone(ctx, 880, t, 0.20, 0.07, "sine");
  } else {
    tone(ctx, 523, t,        0.18, 0.10, "sine");
    tone(ctx, 659, t + 0.14, 0.18, 0.10, "sine");
    tone(ctx, 784, t + 0.28, 0.28, 0.10, "sine");
  }
}

/** Single soft ping for general new-notification badge */
export function playPingSound(style: RingtoneStyle = "default"): void {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  if (style === "chime") {
    tone(ctx, 1046, t, 0.20, 0.08, "sine");
  } else if (style === "pulse") {
    tone(ctx, 740, t,        0.08, 0.08, "square");
    tone(ctx, 740, t + 0.12, 0.08, 0.06, "square");
  } else if (style === "deep") {
    tone(ctx, 330, t, 0.30, 0.10, "sine");
  } else if (style === "minimal") {
    tone(ctx, 660, t, 0.10, 0.05, "sine");
  } else {
    tone(ctx, 740, t, 0.25, 0.08, "sine");
  }
}

/** Celebratory fanfare for milestones and streaks */
export function playCelebrationSound(): void {
  const ctx = makeCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const notes = [523, 659, 784, 659, 784, 1046];
  notes.forEach((freq, i) => tone(ctx, freq, t + i * 0.10, 0.18, 0.08, "sine"));
}

/* ────────────────── WEB PUSH NOTIFICATIONS ────────────────── */

let _permissionState: NotificationPermission | null = null;

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") {
    _permissionState = "granted";
    return true;
  }
  if (Notification.permission === "denied") {
    _permissionState = "denied";
    return false;
  }
  const result = await Notification.requestPermission();
  _permissionState = result;
  return result === "granted";
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof Notification === "undefined") return "denied";
  return _permissionState ?? Notification.permission;
}

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  badge?: string;
  sound?: RingtoneStyle;
  playSound?: boolean;
}

/**
 * Send a desktop push notification (if permission granted) and
 * optionally play a ringtone via Web Audio API.
 */
export function sendNotification(options: PushNotificationOptions): Notification | null {
  const { title, body, icon, tag, playSound = true, sound = "default" } = options;

  if (playSound) playPingSound(sound);

  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return null;
  }

  const n = new Notification(title, {
    body,
    icon: icon ?? "/pmo-logo-dark.png",
    tag,
    badge: "/pmo-logo-dark.png",
  });

  n.onclick = () => { window.focus(); n.close(); };
  return n;
}

/**
 * Send an urgent alert notification (loud ringtone + push).
 */
export function sendAlertNotification(title: string, body: string, sound: RingtoneStyle = "default"): void {
  playAlertSound(sound);
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    const n = new Notification(title, { body, icon: "/pmo-logo-dark.png", tag: "alert" });
    n.onclick = () => { window.focus(); n.close(); };
  }
}

/* ────────────────── RINGTONE PREVIEW ────────────────── */

export const RINGTONE_STYLES: { value: RingtoneStyle; label: string; desc: string }[] = [
  { value: "default", label: "Default",  desc: "Soft two-tone alert" },
  { value: "chime",   label: "Chime",    desc: "Three-note descending bell" },
  { value: "pulse",   label: "Pulse",    desc: "Short repeating pulse" },
  { value: "deep",    label: "Deep",     desc: "Low resonant bass note" },
  { value: "minimal", label: "Minimal",  desc: "Single soft ping" },
];

export function previewRingtone(style: RingtoneStyle): void {
  _hasInteracted = true;
  playPingSound(style);
}
