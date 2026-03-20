"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function WaveBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative overflow-hidden">
      {/* Animated wave gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-colors duration-500"
        style={{
          background: isDark
            ? `linear-gradient(180deg, #333333 0%, #1a1a1a 25%, #0a0a0a 50%, #1a1a1a 75%, #333333 100%)`
            : `linear-gradient(180deg, #f5f0e8 0%, #faf6f0 25%, #ffffff 50%, #faf6f0 75%, #f5f0e8 100%)`,
        }}
      />
      {/* SVG wave overlay */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-30"
        preserveAspectRatio="none"
        viewBox="0 0 1440 800"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? "#444444" : "#e8ddd0"} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isDark ? "#0a0a0a" : "#ffffff"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill="url(#waveGrad)">
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="
              M0,200 C360,100 720,300 1080,200 S1440,100 1440,200 L1440,800 L0,800 Z;
              M0,250 C360,350 720,150 1080,250 S1440,350 1440,250 L1440,800 L0,800 Z;
              M0,200 C360,100 720,300 1080,200 S1440,100 1440,200 L1440,800 L0,800 Z
            "
          />
        </path>
        <path fill="url(#waveGrad)" opacity="0.5">
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
              M0,400 C360,300 720,500 1080,400 S1440,300 1440,400 L1440,800 L0,800 Z;
              M0,350 C360,450 720,350 1080,450 S1440,350 1440,350 L1440,800 L0,800 Z;
              M0,400 C360,300 720,500 1080,400 S1440,300 1440,400 L1440,800 L0,800 Z
            "
          />
        </path>
      </svg>

      {children}
    </div>
  );
}
