"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";

/**
 * Wraps a card/child with a subtle GSAP hover float effect:
 * lifts up, scales slightly, and adds a shadow on hover.
 */
export default function CardHover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      duration: 0.35,
      ease: "power2.out",
    });
  }, []);

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      y: 0,
      scale: 1,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      duration: 0.35,
      ease: "power2.out",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
