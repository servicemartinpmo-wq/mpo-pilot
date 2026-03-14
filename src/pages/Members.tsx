import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserPlus, Trash2, Edit2, Check, X, Copy,
  Crown, ShieldCheck, Briefcase, Eye, User, Clock,
  AlertCircle, Zap, Mail, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTierAccess } from "@/lib/tierSystem";
import { isDemoMode } from "@/lib/companyStore";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type Role = "owner" | "admin" | "manager" | "member" | "viewer";
type Status = "pending" | "active" | "removed";

interface WorkspaceMember {
  id: string;
  owner_id: string;
  email: string;
  name: string | null;
  role: Role;
  status: Status;
  invited_at: string;
  joined_at: string | null;
  updated_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────

const TIER_LIMITS: Record<string, number> = {
  free: 1, solo: 5, growth: 15, command: 50, enterprise: 9999,
};

const ROLES: { value: Role; label: string; desc: string; icon: React.ComponentType<any>; color: string }[] = [
  { value: "owner",   label: "Owner",   desc: "Full control",              icon: Crown,       color: "text-amber-400" },
  { value: "admin",   label: "Admin",   desc: "Manage members & settings", icon: ShieldCheck, color: "text-electric-blue" },
  { value: "manager", label: "Manager", desc: "Manage projects & tasks",   icon: Briefcase,   color: "text-teal" },
  { value: "member",  label: "Member",  desc: "Standard access",           icon: User,        color: "text-signal-green" },
  { value: "viewer",  label: "Viewer",  desc: "Read-only access",          icon: Eye,         color: "text-muted-foreground" },
];

function roleInfo(role: Role) {
  return ROLES.find(r => r.value === role) ?? ROLES[3];
}

function initials(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name[0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function avatarHue(email: string) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) % 360;
  return h;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Avatar({ name, email, size = "md" }: { name: string | null; email: string; size?: "sm" | "md" }) {
  const hue = avatarHue(email);
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={cn("flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white", sz)}
      style={{ background: `hsl(${hue} 60% 45%)` }}
    >
      {initials(name, email)}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const r = roleInfo(role);
  const Icon = r.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary border border-border/50", r.color)}>
      <Icon className="w-3 h-3" />
      {r.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "active") return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-signal-yellow/15 text-signal-yellow border border-signal-yellow/20">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

// ── RoleSelector ───────────────────────────────────────────────────────────

function RoleSelector({
  value, onChange, disabled,
}: { value: Role; onChange: (r: Role) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ri = roleInfo(value);
  const Icon = ri.icon;

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(p => !p)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors",
          disabled
            ? "opacity-50 cursor-not-allowed border-border/30 bg-secondary text-muted-foreground"
            : "border-border hover:border-border/80 bg-secondary hover:bg-secondary/80 cursor-pointer",
          ri.color
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {ri.label}
        {!disabled && <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            {ROLES.filter(r => r.value !== "owner").map(r => {
              const RIcon = r.icon;
              return (
                <button
                  key={r.value}
                  onClick={() => { onChange(r.value); setOpen(false); }}
                  className={cn(
                    "w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-secondary/60 transition-colors",
                    value === r.value && "bg-secondary"
                  )}
                >
                  <RIcon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", r.color)} />
                  <div>
                    <div className={cn("text-xs font-bold", r.color)}>{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.desc}</div>
                  </div>
                  {value === r.value && <Check className="w-3.5 h-3.5 ml-auto mt-0.5 text-electric-blue" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Members() {
  const { user, profile } = useAuth();
  const { effectiveTier } = useTierAccess(profile?.email);
  const navigate = useNavigate();
  const demo = isDemoMode();

  const limit = TIER_LIMITS[effectiveTier] ?? 1;
  const isUnlimited = limit >= 9999;

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName]   = useState("");
  const [inviteRole, setInviteRole]   = useState<Role>("member");
  const [inviting, setInviting]       = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>("member");
  const [saving, setSaving] = useState(false);

  // Remove confirm
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const ownerId = user?.id ?? (demo ? "demo-owner" : null);

  const loadMembers = useCallback(async () => {
    if (!ownerId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      if (demo) {
        // Demo mode: show sample members
        setMembers([
          { id: "1", owner_id: ownerId, email: profile?.email ?? "you@company.com", name: profile?.userName ?? "You (Owner)", role: "owner", status: "active", invited_at: new Date().toISOString(), joined_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: "2", owner_id: ownerId, email: "sarah.ops@company.com", name: "Sarah Okafor", role: "admin", status: "active", invited_at: new Date().toISOString(), joined_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: "3", owner_id: ownerId, email: "dev.lead@company.com", name: "Marcus Chen", role: "manager", status: "active", invited_at: new Date().toISOString(), joined_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: "4", owner_id: ownerId, email: "new.hire@company.com", name: null, role: "member", status: "pending", invited_at: new Date().toISOString(), joined_at: null, updated_at: new Date().toISOString() },
        ]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/members?owner_id=${ownerId}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Ensure the owner themselves appears first
      const hasOwner = data.some((m: WorkspaceMember) => m.role === "owner");
      if (!hasOwner && profile) {
        setMembers([
          { id: "__owner__", owner_id: ownerId, email: profile.email ?? "", name: profile.userName, role: "owner", status: "active", invited_at: new Date().toISOString(), joined_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ...data,
        ]);
      } else {
        setMembers(data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ownerId, demo, profile]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const activeCount = members.filter(m => m.status !== "removed").length;
  const usagePercent = isUnlimited ? 0 : Math.min(100, Math.round((activeCount / limit) * 100));
  const atLimit = !isUnlimited && activeCount >= limit;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    if (demo) {
      setTimeout(() => {
        setMembers(prev => [
          ...prev,
          { id: Date.now().toString(), owner_id: ownerId!, email: inviteEmail.trim().toLowerCase(), name: inviteName.trim() || null, role: inviteRole, status: "pending", invited_at: new Date().toISOString(), joined_at: null, updated_at: new Date().toISOString() },
        ]);
        setInviteEmail(""); setInviteName(""); setInviteRole("member");
        setInviteSuccess(true);
        setInviting(false);
        setTimeout(() => setInviteSuccess(false), 3000);
      }, 600);
      return;
    }

    try {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: ownerId, email: inviteEmail.trim(), name: inviteName.trim() || undefined, role: inviteRole, tier: effectiveTier }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error ?? "Invite failed"); return; }
      setMembers(prev => {
        const idx = prev.findIndex(m => m.id === "__owner__");
        const updated = [...prev, data];
        return idx >= 0 ? [prev[idx], ...updated.filter(m => m.id !== "__owner__")] : updated;
      });
      setInviteEmail(""); setInviteName(""); setInviteRole("member");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (e: any) {
      setInviteError(e.message);
    } finally {
      setInviting(false);
    }
  };

  const handleEditSave = async (memberId: string) => {
    setSaving(true);
    if (demo) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: editRole } : m));
      setEditId(null); setSaving(false); return;
    }
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: ownerId, role: editRole }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
      setEditId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setRemoving(true);
    if (demo) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setRemoveId(null); setRemoving(false); return;
    }
    try {
      const res = await fetch(`/api/members/${memberId}?owner_id=${ownerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setRemoveId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRemoving(false);
    }
  };

  const inviteLink = `${window.location.origin}/login?invite=${btoa(ownerId ?? "demo")}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage who has access to your workspace.
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">
            {isUnlimited ? "Unlimited" : `${activeCount} / ${limit}`} seats
          </div>
          {!isUnlimited && (
            <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", atLimit ? "bg-destructive" : usagePercent > 75 ? "bg-signal-yellow" : "bg-electric-blue")}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Tier Limit Banner ── */}
      {atLimit && effectiveTier !== "enterprise" && (
        <div className="rounded-xl border border-signal-yellow/30 bg-signal-yellow/8 p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-signal-yellow flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-foreground/90">
            <span className="font-semibold text-signal-yellow">Seat limit reached</span> — your <span className="font-semibold capitalize">{effectiveTier}</span> plan allows up to {limit} member{limit === 1 ? "" : "s"}.
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-electric-blue hover:underline"
          >
            <Zap className="w-3.5 h-3.5" />
            Upgrade
          </button>
        </div>
      )}

      {/* ── Invite Form ── */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-electric-blue" />
          <h2 className="text-sm font-bold text-foreground">Invite a team member</h2>
        </div>

        {atLimit ? (
          <div className="text-sm text-muted-foreground py-2">
            Upgrade your plan to invite more members.{" "}
            <button onClick={() => navigate("/pricing")} className="text-electric-blue font-semibold hover:underline">
              View plans →
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email address *</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-blue/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Name (optional)</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-electric-blue/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Role</label>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.filter(r => r.value !== "owner").map(r => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setInviteRole(r.value)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                          inviteRole === r.value
                            ? "border-electric-blue/50 bg-electric-blue/10 text-electric-blue"
                            : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-border/80"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-electric-blue text-white hover:bg-electric-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {inviting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Add Member
              </button>
            </div>

            {inviteError && (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div className="flex items-center gap-2 text-xs text-signal-green">
                <Check className="w-3.5 h-3.5" />
                Member added successfully.
              </div>
            )}
          </form>
        )}

        {/* Copy invite link */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground flex-1">Share invite link</span>
            <button
              onClick={() => { navigator.clipboard.writeText(inviteLink); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-electric-blue hover:text-electric-blue/80 transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* ── Members List ── */}
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold text-foreground">
            Current Members
          </h2>
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {activeCount} {activeCount === 1 ? "person" : "people"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive px-5 py-8">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No members yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Invite your team above to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {members.map(member => {
              const isOwner = member.role === "owner";
              const isEditing = editId === member.id;
              const isRemoving = removeId === member.id;

              return (
                <div key={member.id} className="px-5 py-4">
                  {isRemoving ? (
                    /* Remove confirmation */
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} email={member.email} />
                      <div className="flex-1 text-sm">
                        <span className="font-semibold text-foreground">{member.name ?? member.email}</span>
                        <span className="text-muted-foreground"> will lose workspace access.</span>
                      </div>
                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={removing}
                        className="text-xs font-bold text-destructive hover:underline disabled:opacity-50"
                      >
                        {removing ? "Removing…" : "Confirm Remove"}
                      </button>
                      <button
                        onClick={() => setRemoveId(null)}
                        className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} email={member.email} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {member.name ?? member.email}
                          </span>
                          <StatusBadge status={member.status} />
                        </div>
                        {member.name && (
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        )}
                      </div>

                      {/* Role — editing or display */}
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <RoleSelector
                            value={editRole}
                            onChange={setEditRole}
                          />
                          <button
                            onClick={() => handleEditSave(member.id)}
                            disabled={saving}
                            className="p-1.5 rounded-lg bg-electric-blue/10 text-electric-blue hover:bg-electric-blue/20 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <RoleBadge role={member.role} />
                          {!isOwner && (
                            <>
                              <button
                                onClick={() => { setEditId(member.id); setEditRole(member.role); }}
                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit role"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setRemoveId(member.id)}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Role Legend ── */}
      <div className="rounded-2xl border border-border/50 bg-secondary/30 p-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROLES.map(r => {
            const Icon = r.icon;
            return (
              <div key={r.value} className="flex items-center gap-2.5">
                <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", r.color)} />
                <div>
                  <span className={cn("text-xs font-bold", r.color)}>{r.label}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{r.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
