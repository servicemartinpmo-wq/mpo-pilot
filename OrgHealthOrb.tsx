/**
 * OrgHealthOrb — a living 3D-style orb that evolves from greyscale to full color
 * based on the organization's overall structural health score (0–100).
 */
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface OrgHealthOrbProps {
  score: number; // 0–100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

function getTierLabel(score: number) {
  if (score < 20) return "Unstructured";
  if (score < 40) return "Foundational";
  if (score < 55) return "Developing";
  if (score < 70) return "Structured";
  if (score < 85) return "Managed";
  return "Optimized";
}

export default function OrgHealthOrb({ score, size = "md", showLabel = true, animated = true }: OrgHealthOrbProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Animate counter up to score
  useEffect(() => {
    if (!animated) { setDisplayed(score); return; }
    let current = 0;
    const step = () => {
      current = Math.min(current + 1.2, score);
      setDisplayed(Math.round(current));
      if (current < score) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score, animated]);

  // Saturation increases with score: 0% → 100%
  const sat = Math.round((displayed / 100) * 100);
  // Hue: start at 220 (blue-grey), shift toward teal/blue at high scores
  const hue = 210;
  // Lightness: slightly brighter at high scores
  const light = 38 + Math.round((displayed / 100) * 14);
  // Greyscale blend: fully grey at 0, fully colored at 100
  const greyBlend = Math.max(0, 1 - displayed / 100);

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-44 h-44",
  };

  const textClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative flex items-center justify-center rounded-full", sizeClasses[size])}>
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, hsl(${hue} ${sat}% ${light + 10}% / ${0.15 + (displayed / 100) * 0.25}), transparent 70%)`,
            filter: `blur(${4 + displayed / 10}px)`,
            transform: "scale(1.3)",
          }}
        />
        {/* Orb body */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-300"
          style={{
            background: `radial-gradient(circle at 35% 32%,
              hsl(${hue} ${Math.round(sat * 0.6)}% ${light + 28}% / 0.9) 0%,
              hsl(${hue} ${sat}% ${light + 8}%) 45%,
              hsl(${hue + 10} ${Math.round(sat * 0.8)}% ${light - 8}%) 100%
            )`,
            filter: `grayscale(${Math.round(greyBlend * 100)}%)`,
            boxShadow: `
              inset 0 -4px 12px hsl(${hue} ${sat}% 10% / 0.4),
              inset 0 4px 8px hsl(${hue} ${sat}% 90% / 0.3),
              0 8px 32px hsl(${hue} ${sat}% ${light}% / ${0.1 + (displayed / 100) * 0.35})
            `,
          }}
        />
        {/* Specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: "38%",
            height: "28%",
            top: "14%",
            left: "20%",
            background: `radial-gradient(ellipse, hsl(${hue} 40% 95% / 0.55) 0%, transparent 100%)`,
            filter: "blur(2px)",
          }}
        />
        {/* Score text */}
        <span
          className={cn("relative z-10 font-bold font-mono leading-none", textClasses[size])}
          style={{
            color: displayed < 30 ? "hsl(220 15% 60%)" : "hsl(0 0% 98%)",
            textShadow: "0 1px 4px hsl(0 0% 0% / 0.4)",
          }}
        >
          {displayed}
        </span>
      </div>
      {showLabel && (
        <div className="text-center">
          <div className="text-xs font-semibold" style={{ color: `hsl(${hue} ${sat}% ${light}%)`, filter: `grayscale(${Math.round(greyBlend * 100)}%)` }}>
            {getTierLabel(displayed)}
          </div>
          <div className="text-xs text-muted-foreground">Structural Health</div>
        </div>
      )}
    </div>
  );
}
