"use client";

import { useEffect, useMemo, useState } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  size: "sm" | "md" | "lg";
  color: "white" | "blue" | "gold" | "pink";
  delay: number;
  duration: number;
  opacity: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  const colorOptions: Star["color"][] = ["white", "white", "white", "white", "white", "blue", "gold", "pink"];
  const sizeOptions: Star["size"][] = ["sm", "sm", "sm", "md", "md", "lg"];

  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: sizeOptions[Math.floor(Math.random() * sizeOptions.length)],
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      delay: Math.random() * 8,
      duration: 3 + Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.7,
    });
  }
  return stars;
}

const sizeClassMap: Record<Star["size"], string> = {
  sm: "star--sm",
  md: "",
  lg: "star--lg",
};

const colorClassMap: Record<Star["color"], string> = {
  white: "",
  blue: "star--blue",
  gold: "star--gold",
  pink: "star--pink",
};

export default function Starfield() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => generateStars(120), []);

  // Larger, brighter accent stars
  const accentStars = useMemo(
    () => [
      { top: "12%", left: "8%", color: "blue" as const },
      { top: "25%", left: "72%", color: "gold" as const },
      { top: "58%", left: "15%", color: "pink" as const },
      { top: "78%", left: "85%", color: "blue" as const },
      { top: "42%", left: "92%", color: "gold" as const },
      { top: "8%", left: "45%", color: "pink" as const },
      { top: "90%", left: "35%", color: "blue" as const },
      { top: "65%", left: "55%", color: "gold" as const },
    ],
    []
  );

  if (!mounted) {
    return (
      <div className="starfield" aria-hidden="true">
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)",
          }}
        />
      </div>
    );
  }

  return (
    <div id="starfield-bg" className="starfield" aria-hidden="true">
      {/* Subtle radial gradient overlay (purple/blue) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 60%)",
        }}
      />

      {/* Regular stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${sizeClassMap[star.size]} ${colorClassMap[star.color]}`}
          style={{
            top: star.top,
            left: star.left,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Larger, brighter accent stars with glow */}
      {accentStars.map((accent, i) => (
        <div
          key={`accent-${i}`}
          className="absolute"
          style={{
            top: accent.top,
            left: accent.left,
          }}
        >
          <div
            className={`star star--lg ${colorClassMap[accent.color]}`}
            style={{
              position: "relative",
              animationDelay: `${i * 0.9}s`,
              animationDuration: `${4 + i * 0.5}s`,
              width: "4px",
              height: "4px",
              boxShadow:
                accent.color === "gold"
                  ? "0 0 8px rgba(253, 230, 138, 0.6), 0 0 20px rgba(253, 230, 138, 0.3), 0 0 40px rgba(253, 230, 138, 0.1)"
                  : accent.color === "pink"
                    ? "0 0 8px rgba(249, 168, 212, 0.6), 0 0 20px rgba(249, 168, 212, 0.3), 0 0 40px rgba(249, 168, 212, 0.1)"
                    : "0 0 8px rgba(165, 180, 252, 0.6), 0 0 20px rgba(165, 180, 252, 0.3), 0 0 40px rgba(165, 180, 252, 0.1)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
