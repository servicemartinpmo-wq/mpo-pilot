import { useState, useEffect, useCallback } from "react";

interface UseModuleDataOptions {
  seedEndpoint?: string;
}

export function useModuleData<T extends { id?: string }>(
  endpoint: string,
  options?: UseModuleDataOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      const rows = await res.json();
      if (rows.length === 0 && options?.seedEndpoint) {
        await fetch(options.seedEndpoint, { method: "POST" });
        const res2 = await fetch(endpoint);
        const rows2 = await res2.json();
        setData(rows2);
      } else {
        setData(rows);
      }
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options?.seedEndpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const create = useCallback(async (item: Partial<T>) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Create failed");
    const created = await res.json();
    setData(prev => [created, ...prev]);
    return created;
  }, [endpoint]);

  const update = useCallback(async (id: string, item: Partial<T>) => {
    const res = await fetch(`${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Update failed");
    const updated = await res.json();
    setData(prev => prev.map(d => (d as any).id === id ? updated : d));
    return updated;
  }, [endpoint]);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setData(prev => prev.filter(d => (d as any).id !== id));
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData, create, update, remove };
}
