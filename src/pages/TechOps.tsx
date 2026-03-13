import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  HardDrive, FolderPlus, RefreshCw, ChevronRight, ChevronDown,
  Folder, FolderOpen, File, Trash2, Edit3, Check, X, Clock,
  AlertCircle, CheckCircle, Search, GripVertical,
  MessageSquare, FileText, DollarSign, Users, GitBranch,
  Layers, BarChart2, Mail, Calendar, Video, Database,
  Activity, Shield, Plus, Crown, Key, UserX, ExternalLink, Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchTierGrants, revokeTierGrant, DEFAULT_TIER_DEFINITIONS,
  type UserTierGrant, type TierId,
} from "@/lib/tierSystem";
import { cn } from "@/lib/utils";
import {
  useIntegrationBackups, useIntegrationSyncLogs,
  useTechOpsFolders, useTechOpsFolderItems,
  useUpsertTechOpsFolder, useDeleteTechOpsFolder,
  useUpsertTechOpsFolderItem, useDeleteTechOpsFolderItem,
  useRunIntegrationSync, useIntegrationConnections,
} from "@/hooks/useLiveData";
import type { TechOpsBackup, TechOpsFolder } from "@/hooks/useLiveData";
import { supabase } from "@/integrations/supabase/client";

const INTEGRATION_ICONS: Record<string, React.ElementType> = {
  slack: MessageSquare, gmail: Mail, gcalendar: Calendar,
  gdocs: FileText, gsheets: BarChart2, gdrive: HardDrive,
  gmeet: Video, asana: Layers, jira: GitBranch,
  notion: FileText, quickbooks: DollarSign, workday: Users,
  default: Database,
};

const INTEGRATION_COLORS: Record<string, string> = {
  slack: "#611f69", gmail: "#ea4335", gdrive: "#f4b400",
  asana: "#f06a6a", jira: "#2684ff", notion: "#000000",
  quickbooks: "#2ca01c", workday: "#0066cc",
};

function getIcon(integrationId: string) {
  return INTEGRATION_ICONS[integrationId] ?? INTEGRATION_ICONS.default;
}

function getColor(integrationId: string) {
  return INTEGRATION_COLORS[integrationId] ?? "#3b82f6";
}

type ViewTab = "files" | "sync-log" | "access";

export default function TechOps() {
  const navigate = useNavigate();
  const { data: backups = [], isLoading: loadingBackups } = useIntegrationBackups();
  const { data: syncLogs = [], isLoading: loadingLogs } = useIntegrationSyncLogs();
  const { data: folders = [] } = useTechOpsFolders();
  const { data: folderItems = [] } = useTechOpsFolderItems();
  const { data: connections = [] } = useIntegrationConnections();

  const upsertFolder = useUpsertTechOpsFolder();
  const deleteFolder = useDeleteTechOpsFolder();
  const upsertFolderItem = useUpsertTechOpsFolderItem();
  const deleteFolderItem = useDeleteTechOpsFolderItem();
  const runSync = useRunIntegrationSync();

  const [activeTab, setActiveTab] = useState<ViewTab>("files");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newSubfolderParent, setNewSubfolderParent] = useState<string | null>(null);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [renameItemValue, setRenameItemValue] = useState("");
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<TechOpsBackup | null>(null);

  // Access & Tier grants
  const [grants, setGrants] = useState<UserTierGrant[]>([]);
  const [loadingGrants, setLoadingGrants] = useState(false);

  const loadGrants = useCallback(async () => {
    setLoadingGrants(true);
    const data = await fetchTierGrants();
    setGrants(data);
    setLoadingGrants(false);
  }, []);

  useEffect(() => {
    if (activeTab === "access") loadGrants();
  }, [activeTab, loadGrants]);

  const prevConnectionsRef = useRef<string[] | null>(null);

  const connectedIntegrations = useMemo(() => {
    const connected = connections.filter((c: { status: string }) => c.status === "connected");
    return connected.map((c: { integration_id: string }) => c.integration_id);
  }, [connections]);

  useEffect(() => {
    const prev = prevConnectionsRef.current;
    if (prev === null) {
      prevConnectionsRef.current = connectedIntegrations;
      return;
    }
    const newIds = connectedIntegrations.filter((id: string) => !prev.includes(id));
    if (newIds.length > 0) {
      newIds.forEach((id: string) => {
        const name = id.charAt(0).toUpperCase() + id.slice(1);
        handleSyncIntegration(id, name);
      });
    }
    prevConnectionsRef.current = connectedIntegrations;
  }, [connectedIntegrations]);

  const integrationSources = useMemo(() => {
    const sources = new Map<string, { id: string; name: string; recordCount: number; lastSynced: string | null; status: string }>();
    const latestLogs = new Map<string, { status: string; completed_at: string | null }>();
    syncLogs.forEach(log => {
      if (!latestLogs.has(log.integration_id)) {
        latestLogs.set(log.integration_id, { status: log.status, completed_at: log.completed_at });
      }
    });

    backups.forEach(b => {
      const existing = sources.get(b.integration_id);
      const logInfo = latestLogs.get(b.integration_id);
      if (!existing) {
        sources.set(b.integration_id, {
          id: b.integration_id,
          name: b.integration_name,
          recordCount: 1,
          lastSynced: b.synced_at,
          status: logInfo?.status ?? "synced",
        });
      } else {
        existing.recordCount++;
        if (b.synced_at > (existing.lastSynced ?? "")) existing.lastSynced = b.synced_at;
      }
    });
    connectedIntegrations.forEach((id: string) => {
      if (!sources.has(id)) {
        const logInfo = latestLogs.get(id);
        sources.set(id, { id, name: id.charAt(0).toUpperCase() + id.slice(1), recordCount: 0, lastSynced: null, status: logInfo?.status ?? "pending" });
      }
    });
    return Array.from(sources.values());
  }, [backups, connectedIntegrations, syncLogs]);

  const filteredBackups = useMemo(() => {
    let items = backups;
    if (selectedFolder) {
      const itemIds = folderItems.filter(fi => fi.folder_id === selectedFolder).map(fi => fi.backup_id);
      items = items.filter(b => itemIds.includes(b.id));
    } else if (selectedSource) {
      items = items.filter(b => b.integration_id === selectedSource);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(b =>
        b.record_name.toLowerCase().includes(q) ||
        b.record_type.toLowerCase().includes(q) ||
        b.integration_name.toLowerCase().includes(q)
      );
    }
    return items;
  }, [backups, selectedSource, selectedFolder, folderItems, searchQuery]);

  const rootFolders = useMemo(() => folders.filter(f => !f.parent_id), [folders]);
  const getSubfolders = (parentId: string) => folders.filter(f => f.parent_id === parentId);

  const getItemDisplayName = (item: TechOpsBackup): string => {
    if (selectedFolder) {
      const fi = folderItems.find(fi => fi.backup_id === item.id && fi.folder_id === selectedFolder);
      if (fi?.custom_name) return fi.custom_name;
    }
    return item.record_name;
  };

  async function getUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  }

  async function handleCreateFolder(parentId: string | null = null) {
    const name = parentId ? newSubfolderName.trim() : newFolderName.trim();
    if (!name) return;
    const uid = await getUserId();
    if (!uid) return;
    await upsertFolder.mutateAsync({
      profile_id: uid,
      name,
      parent_id: parentId,
      icon: "folder",
      color: "#3b82f6",
      sort_order: folders.length,
    });
    if (parentId) {
      setNewSubfolderName("");
      setNewSubfolderParent(null);
      setExpandedFolders(prev => new Set(prev).add(parentId));
    } else {
      setNewFolderName("");
      setShowNewFolder(false);
    }
  }

  async function handleRenameFolder(folderId: string) {
    if (!renameValue.trim()) return;
    const uid = await getUserId();
    if (!uid) return;
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    await upsertFolder.mutateAsync({
      ...folder,
      profile_id: uid,
      name: renameValue.trim(),
    });
    setRenamingFolder(null);
    setRenameValue("");
  }

  async function handleDeleteFolder(folderId: string) {
    await deleteFolder.mutateAsync(folderId);
    if (selectedFolder === folderId) setSelectedFolder(null);
  }

  async function handleDropOnFolder(folderId: string) {
    if (!draggedItem) return;
    const uid = await getUserId();
    if (!uid) return;
    await upsertFolderItem.mutateAsync({
      profile_id: uid,
      folder_id: folderId,
      backup_id: draggedItem.id,
      sort_order: 0,
    });
    setDraggedItem(null);
  }

  async function handleRemoveFromFolder(backupId: string) {
    const item = folderItems.find(fi => fi.backup_id === backupId && fi.folder_id === selectedFolder);
    if (item) await deleteFolderItem.mutateAsync(item.id);
  }

  async function handleRenameItem(backupId: string) {
    if (!renameItemValue.trim()) { setRenamingItem(null); return; }
    const uid = await getUserId();
    if (!uid || !selectedFolder) return;
    const existing = folderItems.find(fi => fi.backup_id === backupId && fi.folder_id === selectedFolder);
    if (existing) {
      await upsertFolderItem.mutateAsync({
        ...existing,
        profile_id: uid,
        folder_id: selectedFolder,
        backup_id: backupId,
        custom_name: renameItemValue.trim(),
      });
    } else {
      await upsertFolderItem.mutateAsync({
        profile_id: uid,
        folder_id: selectedFolder,
        backup_id: backupId,
        custom_name: renameItemValue.trim(),
        sort_order: 0,
      });
    }
    setRenamingItem(null);
    setRenameItemValue("");
  }

  async function handleSyncIntegration(integrationId: string, integrationName: string) {
    setSyncing(prev => new Set(prev).add(integrationId));
    try {
      await runSync.mutateAsync({ integrationId, integrationName });
    } finally {
      setSyncing(prev => {
        const next = new Set(prev);
        next.delete(integrationId);
        return next;
      });
    }
  }

  async function handleSyncAll() {
    for (const source of integrationSources) {
      await handleSyncIntegration(source.id, source.name);
    }
  }

  function toggleSource(id: string) {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleFolderExpand(id: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const totalRecords = backups.length;
  const totalSynced = integrationSources.filter(s => s.lastSynced).length;
  const totalSources = integrationSources.length;
  const lastSync = syncLogs.length > 0 ? syncLogs[0] : null;

  function renderFolderNode(folder: TechOpsFolder, depth: number = 0) {
    const itemCount = folderItems.filter(fi => fi.folder_id === folder.id).length;
    const subfolders = getSubfolders(folder.id);
    const isSelected = selectedFolder === folder.id;
    const isRenaming = renamingFolder === folder.id;
    const isExpanded = expandedFolders.has(folder.id);
    const isAddingSub = newSubfolderParent === folder.id;

    return (
      <div key={folder.id}>
        <div
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("bg-blue-500/20"); }}
          onDragLeave={e => e.currentTarget.classList.remove("bg-blue-500/20")}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("bg-blue-500/20"); handleDropOnFolder(folder.id); }}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          className={cn(
            "flex items-center gap-2 pr-2 py-1.5 rounded-md cursor-pointer group transition-colors",
            isSelected ? "bg-white/8 border border-blue-500/30" : "hover:bg-white/5"
          )}>
          {isRenaming ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleRenameFolder(folder.id);
                  if (e.key === "Escape") setRenamingFolder(null);
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button onClick={() => handleRenameFolder(folder.id)} className="p-0.5">
                <Check className="w-3 h-3 text-green-400" />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => toggleFolderExpand(folder.id)} className="p-0.5">
                {isExpanded ? <FolderOpen className="w-4 h-4 text-yellow-400/70" /> : <Folder className="w-4 h-4 text-yellow-400/70" />}
              </button>
              <span onClick={() => { setSelectedFolder(folder.id); setSelectedSource(null); }}
                className="flex-1 text-xs text-white/70 truncate">{folder.name}</span>
              <span className="text-[10px] text-white/25">{itemCount + subfolders.length}</span>
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button onClick={() => { setNewSubfolderParent(folder.id); setNewSubfolderName(""); }} className="p-0.5 hover:bg-white/10 rounded" title="Add subfolder">
                  <Plus className="w-3 h-3 text-white/30" />
                </button>
                <button onClick={() => { setRenamingFolder(folder.id); setRenameValue(folder.name); }} className="p-0.5 hover:bg-white/10 rounded" title="Rename">
                  <Edit3 className="w-3 h-3 text-white/30" />
                </button>
                <button onClick={() => handleDeleteFolder(folder.id)} className="p-0.5 hover:bg-white/10 rounded" title="Delete">
                  <Trash2 className="w-3 h-3 text-red-400/50" />
                </button>
              </div>
            </>
          )}
        </div>

        {isExpanded && (
          <>
            {isAddingSub && (
              <div className="flex items-center gap-1 pr-2 py-1" style={{ paddingLeft: `${24 + depth * 16}px` }}>
                <input
                  value={newSubfolderName}
                  onChange={e => setNewSubfolderName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleCreateFolder(folder.id);
                    if (e.key === "Escape") setNewSubfolderParent(null);
                  }}
                  placeholder="Subfolder name"
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <button onClick={() => handleCreateFolder(folder.id)} className="p-0.5">
                  <Check className="w-3 h-3 text-green-400" />
                </button>
                <button onClick={() => setNewSubfolderParent(null)} className="p-0.5">
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            )}
            {subfolders.map(sf => renderFolderNode(sf, depth + 1))}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Tech-Ops</h1>
            <p className="text-xs text-white/50">Backup, organize & manage your connected data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 text-xs text-white/50 mr-4">
            <span><strong className="text-white">{totalSources}</strong> sources</span>
            <span><strong className="text-white">{totalRecords}</strong> records</span>
            <span><strong className="text-white">{totalSynced}</strong> synced</span>
          </div>
          <button onClick={handleSyncAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            disabled={syncing.size > 0}>
            <RefreshCw className={cn("w-3.5 h-3.5", syncing.size > 0 && "animate-spin")} />
            Sync All
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/10 pb-0">
        {(["files", "sync-log", "access"] as ViewTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-[1px] flex items-center gap-1.5",
              activeTab === tab
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-white/50 hover:text-white/70"
            )}>
            {tab === "access" && <Crown className="w-3 h-3" />}
            {tab === "files" ? "File Manager" : tab === "sync-log" ? "Sync Log" : "Access"}
          </button>
        ))}
      </div>

      {activeTab === "files" ? (
        <div className="flex flex-1 min-h-0 rounded-xl border border-white/10 overflow-hidden bg-[#0d1117]">
          <div className="w-64 min-w-[240px] border-r border-white/10 flex flex-col overflow-y-auto bg-[#0c0f14]">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Sources</span>
              <button onClick={() => { setSelectedSource(null); setSelectedFolder(null); }}
                className={cn("text-[10px] px-2 py-0.5 rounded", !selectedSource && !selectedFolder ? "bg-blue-600/20 text-blue-400" : "text-white/40 hover:text-white/60")}>
                All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {integrationSources.map(source => {
                const Icon = getIcon(source.id);
                const color = getColor(source.id);
                const isExpanded = expandedSources.has(source.id);
                const sourceBackups = backups.filter(b => b.integration_id === source.id);
                const recordTypes = [...new Set(sourceBackups.map(b => b.record_type))];
                const statusColor = source.status === "success" ? "bg-green-400" : source.status === "failed" ? "bg-red-400" : source.status === "running" ? "bg-blue-400 animate-pulse" : "bg-white/20";

                return (
                  <div key={source.id}>
                    <button
                      onClick={() => { setSelectedSource(source.id); setSelectedFolder(null); toggleSource(source.id); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors",
                        selectedSource === source.id && !selectedFolder && "bg-white/8 border-l-2 border-blue-500"
                      )}>
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-white/30" /> : <ChevronRight className="w-3 h-3 text-white/30" />}
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                      <span className="text-white/80 truncate flex-1 text-left">{source.name}</span>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusColor)} title={`Status: ${source.status}`} />
                      <span className="text-white/30 text-[10px]">{source.recordCount}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleSyncIntegration(source.id, source.name); }}
                        className="p-0.5 hover:bg-white/10 rounded" title="Sync now">
                        <RefreshCw className={cn("w-3 h-3 text-white/30 hover:text-blue-400", syncing.has(source.id) && "animate-spin text-blue-400")} />
                      </button>
                    </button>
                    {isExpanded && (
                      <>
                        {source.lastSynced && (
                          <div className="pl-10 pr-3 py-1 text-[10px] text-white/25 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Last synced: {new Date(source.lastSynced).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                        {recordTypes.map(type => (
                          <button key={type}
                            onClick={() => { setSelectedSource(source.id); setSelectedFolder(null); }}
                            className="w-full flex items-center gap-2 pl-10 pr-3 py-1.5 text-[11px] text-white/50 hover:bg-white/5 hover:text-white/70">
                            <File className="w-3 h-3" />
                            <span className="truncate capitalize">{type}s</span>
                            <span className="text-white/25 text-[10px] ml-auto">{sourceBackups.filter(b => b.record_type === type).length}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}

              {integrationSources.length === 0 && !loadingBackups && (
                <div className="p-4 text-center text-xs text-white/30">
                  No connected integrations yet.
                  <br />Connect apps on the Integrations page to start backing up data.
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">My Folders</span>
                <button onClick={() => setShowNewFolder(true)} className="p-1 hover:bg-white/10 rounded" title="New folder">
                  <FolderPlus className="w-3.5 h-3.5 text-white/40 hover:text-blue-400" />
                </button>
              </div>

              {showNewFolder && (
                <div className="flex items-center gap-1 mb-2">
                  <input
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreateFolder(null)}
                    placeholder="Folder name"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button onClick={() => handleCreateFolder(null)} className="p-1 hover:bg-white/10 rounded">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </button>
                  <button onClick={() => { setShowNewFolder(false); setNewFolderName(""); }} className="p-1 hover:bg-white/10 rounded">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              )}

              {rootFolders.map(folder => renderFolderNode(folder, 0))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-1 text-xs text-white/40">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Tech-Ops</span>
                {selectedSource && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/60">{integrationSources.find(s => s.id === selectedSource)?.name ?? selectedSource}</span>
                  </>
                )}
                {selectedFolder && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/60">{folders.find(f => f.id === selectedFolder)?.name ?? "Folder"}</span>
                  </>
                )}
              </div>
              <div className="flex-1" />
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search records..."
                  className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 w-52 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingBackups ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw className="w-5 h-5 text-white/20 animate-spin" />
                </div>
              ) : filteredBackups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-white/30 text-xs gap-2">
                  <Database className="w-8 h-8 text-white/10" />
                  {backups.length === 0 ? (
                    <>
                      <p>No data backed up yet</p>
                      <p className="text-white/20">Connect an integration and click Sync to get started</p>
                    </>
                  ) : (
                    <p>No records match your filter</p>
                  )}
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px]">
                      <th className="text-left py-2.5 px-4 font-medium w-8"></th>
                      <th className="text-left py-2.5 px-2 font-medium">Name</th>
                      <th className="text-left py-2.5 px-2 font-medium">Type</th>
                      <th className="text-left py-2.5 px-2 font-medium">Source</th>
                      <th className="text-left py-2.5 px-2 font-medium">Last Synced</th>
                      <th className="text-left py-2.5 px-2 font-medium w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBackups.map(item => {
                      const Icon = getIcon(item.integration_id);
                      const color = getColor(item.integration_id);
                      const displayName = getItemDisplayName(item);
                      const isItemRenaming = renamingItem === item.id;
                      return (
                        <tr key={item.id}
                          draggable
                          onDragStart={() => setDraggedItem(item)}
                          onDragEnd={() => setDraggedItem(null)}
                          className="border-b border-white/5 hover:bg-white/[0.03] cursor-grab active:cursor-grabbing transition-colors group">
                          <td className="py-2.5 px-4">
                            <GripVertical className="w-3 h-3 text-white/15 group-hover:text-white/30" />
                          </td>
                          <td className="py-2.5 px-2">
                            {isItemRenaming ? (
                              <div className="flex items-center gap-1">
                                <input
                                  value={renameItemValue}
                                  onChange={e => setRenameItemValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") handleRenameItem(item.id);
                                    if (e.key === "Escape") setRenamingItem(null);
                                  }}
                                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                  autoFocus
                                />
                                <button onClick={() => handleRenameItem(item.id)} className="p-0.5">
                                  <Check className="w-3 h-3 text-green-400" />
                                </button>
                                <button onClick={() => setRenamingItem(null)} className="p-0.5">
                                  <X className="w-3 h-3 text-red-400" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <File className="w-3.5 h-3.5 text-white/30" />
                                <span className="text-white/80">{displayName}</span>
                                {displayName !== item.record_name && (
                                  <span className="text-[10px] text-white/20" title={`Original: ${item.record_name}`}>(renamed)</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="capitalize text-white/50 bg-white/5 rounded px-1.5 py-0.5">{item.record_type}</span>
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5" style={{ color }} />
                              <span className="text-white/50">{item.integration_name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-white/40">
                            {new Date(item.synced_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                              {selectedFolder && (
                                <>
                                  <button onClick={() => { setRenamingItem(item.id); setRenameItemValue(displayName); }}
                                    className="p-1 hover:bg-white/10 rounded" title="Rename in folder">
                                    <Edit3 className="w-3 h-3 text-white/30 hover:text-blue-400" />
                                  </button>
                                  <button onClick={() => handleRemoveFromFolder(item.id)}
                                    className="p-1 hover:bg-white/10 rounded" title="Remove from folder">
                                    <X className="w-3 h-3 text-white/30 hover:text-red-400" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between text-[10px] text-white/30">
              <span>{filteredBackups.length} record{filteredBackups.length !== 1 ? "s" : ""}</span>
              {lastSync && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last sync: {new Date(lastSync.started_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "sync-log" ? (
        <SyncLogView syncLogs={syncLogs} loading={loadingLogs} />
      ) : (
        /* Access & Tier Grants panel */
        <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-y-auto flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Access & Tier Management</span>
            </div>
            <button onClick={() => navigate("/creator-lab")}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 px-3 py-1.5 rounded-lg">
              <ExternalLink className="w-3 h-3" /> Full Editor in Creator Lab
            </button>
          </div>

          {/* Tier overview */}
          <div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">Tier Levels</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DEFAULT_TIER_DEFINITIONS.map(t => (
                <div key={t.id} className="rounded-lg border border-white/10 p-3 text-center" style={{ borderColor: `${t.color}30` }}>
                  <div className="text-xs font-black mb-0.5" style={{ color: t.color }}>{t.display_name}</div>
                  <div className="text-[10px] text-white/40">{t.price_label}</div>
                  <div className="text-[10px] text-white/30 mt-1">{t.features.length} features</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active grants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-white/40" />
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active Tier Grants</p>
              </div>
              <button onClick={loadGrants}
                className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-colors">
                <RefreshCw className={cn("w-3 h-3", loadingGrants && "animate-spin")} /> Refresh
              </button>
            </div>
            {loadingGrants ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <RefreshCw className="w-4 h-4 text-white/20 animate-spin" />
              </div>
            ) : grants.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#0c0f14] p-6 text-center">
                <p className="text-xs text-white/30">No manual grants yet.</p>
                <button onClick={() => navigate("/creator-lab")}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Grant access in Creator Lab →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {grants.map(g => {
                  const expired = g.is_temp && g.expires_at ? new Date(g.expires_at) < new Date() : false;
                  const tierDef = DEFAULT_TIER_DEFINITIONS.find(t => t.id === g.granted_tier);
                  return (
                    <div key={g.id} className={cn("rounded-lg border p-3 flex items-center gap-3 flex-wrap",
                      expired ? "border-red-500/20 bg-red-500/5" : "border-white/10 bg-[#0c0f14]")}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-white truncate">{g.user_email}</span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                            style={{ background: `${tierDef?.color ?? "#888"}22`, color: tierDef?.color ?? "#aaa" }}>
                            {tierDef?.display_name ?? g.granted_tier}
                          </span>
                          {g.is_temp && (
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
                              expired ? "text-red-400 bg-red-400/10" : "text-amber-400 bg-amber-400/10")}>
                              <Timer className="w-2.5 h-2.5" />
                              {expired ? "Expired" : `Until ${g.expires_at ? new Date(g.expires_at).toLocaleDateString() : "?"}`}
                            </span>
                          )}
                        </div>
                        {g.note && <p className="text-[10px] text-white/30 mt-0.5">{g.note}</p>}
                      </div>
                      <button
                        onClick={async () => {
                          await revokeTierGrant(g.id);
                          setGrants(prev => prev.filter(x => x.id !== g.id));
                        }}
                        className="flex items-center gap-1 text-[10px] text-red-400 hover:bg-red-500/10 px-2 py-1.5 rounded transition-colors border border-red-500/20 shrink-0">
                        <UserX className="w-3 h-3" /> Revoke
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SyncLogView({ syncLogs, loading }: { syncLogs: Array<{
  id: string; integration_id: string; integration_name: string; status: string;
  records_added: number; records_updated: number; records_removed: number;
  error_message: string | null; started_at: string; completed_at: string | null;
}>; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <RefreshCw className="w-5 h-5 text-white/20 animate-spin" />
      </div>
    );
  }

  if (syncLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/30 text-xs gap-2 rounded-xl border border-white/10 bg-[#0d1117]">
        <Activity className="w-8 h-8 text-white/10" />
        <p>No sync history yet</p>
        <p className="text-white/20">Trigger a sync to see logs here</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0d1117]">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px]">
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Integration</th>
            <th className="text-left py-3 px-4 font-medium">Started</th>
            <th className="text-left py-3 px-4 font-medium">Duration</th>
            <th className="text-left py-3 px-4 font-medium">Added</th>
            <th className="text-left py-3 px-4 font-medium">Updated</th>
            <th className="text-left py-3 px-4 font-medium">Errors</th>
          </tr>
        </thead>
        <tbody>
          {syncLogs.map(log => {
            const Icon = getIcon(log.integration_id);
            const color = getColor(log.integration_id);
            const duration = log.completed_at
              ? Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)
              : null;

            return (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="py-3 px-4">
                  {log.status === "success" ? (
                    <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Success</span>
                  ) : log.status === "running" ? (
                    <span className="flex items-center gap-1.5 text-blue-400"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running</span>
                  ) : log.status === "partial" ? (
                    <span className="flex items-center gap-1.5 text-yellow-400"><AlertCircle className="w-3.5 h-3.5" /> Partial</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-white/70">{log.integration_name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-white/50">
                  {new Date(log.started_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="py-3 px-4 text-white/50">
                  {duration !== null ? `${duration}s` : "—"}
                </td>
                <td className="py-3 px-4">
                  <span className="text-green-400/80">+{log.records_added}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-blue-400/80">{log.records_updated}</span>
                </td>
                <td className="py-3 px-4">
                  {log.error_message ? (
                    <span className="text-red-400/80 truncate max-w-[200px] block" title={log.error_message}>{log.error_message}</span>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
