/**
 * useTypewriter — streams text character by character.
 * Respects prefers-reduced-motion (shows full text immediately).
 */
import { useState, useEffect, useRef } from "react";

interface Options {
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function useTypewriter(text: string, options: Options = {}) {
  const { speed = 18, delay = 0, cursor = true } = options;
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setDisplayed(text); setDone(true); return; }

    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length) {
          clearInterval(intervalRef.current!);
          setDone(true);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timerRef.current!);
      clearInterval(intervalRef.current!);
    };
  }, [text, speed, delay]);

  const withCursor = cursor && !done ? displayed + "▍" : displayed;
  return { text: withCursor, done, raw: displayed };
}
