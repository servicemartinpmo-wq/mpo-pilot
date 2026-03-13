import { useState, useCallback } from "react";

const STARRED_KEY = "pmo_starred_nav_v1";

export interface StarredItem {
  to: string;
  label: string;
}

function load(): StarredItem[] {
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    return raw ? (JSON.parse(raw) as StarredItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: StarredItem[]) {
  try {
    localStorage.setItem(STARRED_KEY, JSON.stringify(items));
  } catch {}
}

export function useStarredNav() {
  const [starred, setStarred] = useState<StarredItem[]>(load);

  const isStarred = useCallback(
    (to: string) => starred.some(s => s.to === to),
    [starred]
  );

  const toggleStar = useCallback((to: string, label: string) => {
    setStarred(prev => {
      const exists = prev.some(s => s.to === to);
      const next = exists
        ? prev.filter(s => s.to !== to)
        : [...prev, { to, label }];
      save(next);
      return next;
    });
  }, []);

  const removeStar = useCallback((to: string) => {
    setStarred(prev => {
      const next = prev.filter(s => s.to !== to);
      save(next);
      return next;
    });
  }, []);

  return { starred, isStarred, toggleStar, removeStar };
}
