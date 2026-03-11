/**
 * useCountUp — animates a number from 0 (or a start value) to the target.
 * Uses requestAnimationFrame. Respects prefers-reduced-motion.
 */
import { useEffect, useRef, useState } from "react";

interface Options {
  duration?: number;
  delay?: number;
  decimals?: number;
  easing?: (t: number) => number;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCountUp(target: number, options: Options = {}) {
  const { duration = 1000, delay = 0, decimals = 0, easing = easeOut } = options;
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setValue(target); return; }

    const timer = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setValue(parseFloat((easing(progress) * target).toFixed(decimals)));
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        else setValue(target);
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay, decimals]);

  return value;
}

export function useCountUpString(target: number, suffix = "", options: Options = {}): string {
  const val = useCountUp(target, options);
  return `${val}${suffix}`;
}
