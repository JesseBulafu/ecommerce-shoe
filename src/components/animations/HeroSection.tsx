"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Animated hero heading — splits each character and reveals them
 * with a staggered slide-up + fade effect on page load.
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

    // Set initial state
    gsap.set(chars, { y: 120, opacity: 0, rotateX: -80 });

    // Animate in
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 1,
      stagger: 0.06,
      ease: "power4.out",
      delay: 0.2,
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className} style={{ perspective: 600 }}>
      <h1 className="text-heading-1 font-jost text-dark-900 overflow-hidden">
        {title.split("").map((char, i) => (
          <span
            key={i}
            className="hero-char inline-block"
            style={{ transformOrigin: "bottom center" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  );
}
