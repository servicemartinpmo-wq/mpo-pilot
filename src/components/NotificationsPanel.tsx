import { useEffect, useState } from "react";
import { X, Bell, CheckCheck, AlertTriangle, Info, CheckCircle, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotifications, markAllNotificationsRead } from "@/lib/supabaseDataService";
import { playAlertSound, playSuccessSound, playPingSound, requestNotificationPermission, getNotificationPermission } from "@/lib/notificationSound";

interface DbNotification {
  id: string;
  user_id: string | null;
  type: string | null;
  title: string;
  message: string | null;
  read: boolean | null;
  link: string | null;
  created_at: string | null;
}

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

function NotifIcon({ type }: { type: string | null }) {
  const t = type ?? "info";
  if (t.includes("risk") || t.includes("alert") || t.includes("critical"))
    return <AlertTriangle className="w-4 h-4 text-rose" />;
  if (t.includes("success") || t.includes("complete"))
    return <CheckCircle className="w-4 h-4 text-signal-green" />;
  if (t.includes("action") || t.includes("task"))
    return <Zap className="w-4 h-4 text-amber" />;
  return <Info className="w-4 h-4 text-electric-blue" />;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationsPanel({ userId, open, onClose, onUnreadChange }: Props) {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [pushPerm, setPushPerm] = useState<NotificationPermission>(() => getNotificationPermission());

  async function handleEnablePush() {
    const granted = await requestNotificationPermission();
    setPushPerm(granted ? "granted" : "denied");
  }

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    const savedRingtone = (localStorage.getItem("apphia_ringtone") ?? "default") as Parameters<typeof playAlertSound>[0];
    getNotifications(userId, 30)
      .then((data) => {
        setNotifications(data as DbNotification[]);
        const unreadItems = data.filter((n: any) => !n.read);
        onUnreadChange?.(unreadItems.length);
        if (unreadItems.length === 0) return;
        const types = unreadItems.map((n: any) => (n.type ?? "").toLowerCase());
        const hasUrgent = types.some((t: string) =>
          t.includes("risk") || t.includes("alert") || t.includes("critical") || t.includes("urgent")
        );
        const hasWin = types.some((t: string) =>
          t.includes("success") || t.includes("complete") || t.includes("win")
        );
        if (hasUrgent) playAlertSound(savedRingtone);
        else if (hasWin) playSuccessSound(savedRingtone);
        else playPingSound(savedRingtone);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [open, userId]);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    onUnreadChange?.(unread);
  }, [notifications]);

  async function handleMarkAllRead() {
    if (!userId || markingRead) return;
    setMarkingRead(true);
    try {
      await markAllNotificationsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingRead(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col animate-slide-in-right"
        style={{
          background: "hsl(222 28% 10%)",
          borderLeft: "1px solid hsl(224 16% 18%)",
          boxShadow: "-8px 0 32px hsl(222 30% 5% / 0.6)"
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "hsl(224 16% 18%)" }}>
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-electric-blue" />
            <span className="font-bold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                style={{ background: "hsl(var(--amber))" }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingRead}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Push permission prompt — shown only when browser hasn't decided yet */}
        {pushPerm === "default" && (
          <div className="flex items-center gap-3 px-4 py-2.5 border-b"
            style={{ background: "hsl(var(--electric-blue) / 0.08)", borderColor: "hsl(var(--electric-blue) / 0.18)" }}>
            <Bell className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--electric-blue))" }} />
            <p className="flex-1 text-[11px] leading-snug" style={{ color: "hsl(var(--electric-blue) / 0.85)" }}>
              Enable desktop alerts to stay notified when the app is in the background.
            </p>
            <button
              onClick={handleEnablePush}
              className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
              style={{ background: "hsl(var(--electric-blue) / 0.18)", color: "hsl(var(--electric-blue))" }}>
              Enable
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl p-3.5 animate-pulse" style={{ background: "hsl(224 18% 14%)" }}>
                  <div className="h-3 rounded w-3/4 mb-2" style={{ background: "hsl(224 16% 22%)" }} />
                  <div className="h-2.5 rounded w-full mb-1" style={{ background: "hsl(224 16% 20%)" }} />
                  <div className="h-2.5 rounded w-1/2" style={{ background: "hsl(224 16% 20%)" }} />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "hsl(222 88% 65% / 0.1)", border: "1px solid hsl(222 88% 65% / 0.15)" }}>
                <Bell className="w-6 h-6 text-electric-blue opacity-60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">You're all caught up</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No new notifications right now. You'll be alerted when something needs your attention.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "rounded-xl p-3.5 border transition-all duration-200 cursor-pointer group",
                    n.read
                      ? "opacity-60 hover:opacity-80"
                      : "hover:border-white/10"
                  )}
                  style={{
                    background: n.read ? "hsl(224 18% 12%)" : "hsl(224 18% 14%)",
                    borderColor: n.read ? "hsl(224 16% 18%)" : "hsl(224 16% 22%)"
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "hsl(224 18% 18%)" }}>
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={cn("text-[13px] font-semibold leading-snug", n.read ? "text-muted-foreground" : "text-foreground")}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                            style={{ background: "hsl(var(--amber))" }} />
                        )}
                      </div>
                      {n.message && (
                        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground opacity-50" />
                        <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t" style={{ borderColor: "hsl(224 16% 18%)" }}>
          <p className="text-[10px] text-center" style={{ color: "hsl(224 12% 38%)" }}>
            PMO-Ops Command Center · live monitoring
          </p>
        </div>
      </div>
    </>
  );
}
