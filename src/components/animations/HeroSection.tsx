"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Animated hero — centered "ARSTRA" text with frosted-glass look
 * that continuously dances (floating + rotation loop).
 */
export default function HeroSection({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll(".hero-char");

    // Initial reveal: slide up + fade in
    gsap.set(chars, { y: 120, opacity: 0, rotateX: -80 });
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 1,
      stagger: 0.06,
      ease: "power4.out",
      delay: 0.2,
      onComplete: () => {
        // Non-stop dancing animation after reveal
        chars.forEach((char, i) => {
          gsap.to(char, {
            y: -12,
            rotation: gsap.utils.random(-6, 6),
            duration: gsap.utils.random(1.2, 2),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.1,
          });
        });
      },
    });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center py-6 sm:py-10 ${className ?? ""}`}
      style={{ perspective: 600 }}
    >
      <h1 className="text-[40px] leading-[48px] xs:text-[52px] xs:leading-[60px] sm:text-[72px] sm:leading-[78px] md:text-[96px] md:leading-[100px] font-bold font-jost overflow-hidden select-none">
        {title.split("").map((char, i) => (
          <span
            key={i}
            className="hero-char inline-block px-1.5 py-0.5 mx-[2px] sm:px-3 sm:py-1 sm:mx-1 rounded-lg sm:rounded-[10px]"
            style={{
              transformOrigin: "bottom center",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "var(--color-dark-900)",
              textShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  );
}
