"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Infinite horizontal scrolling text marquee powered by GSAP.
 * Adds a dynamic, premium feel to the page.
 */
export default function Marquee({
  text,
  className,
  speed = 40,
  separator = " \u2014 ",
}: {
  text: string;
  className?: string;
  /** Pixels per second. Default: 40 */
  speed?: number;
  /** Separator between repeated text. Default: " — " */
  separator?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const contentWidth = track.scrollWidth / 2;
    const duration = contentWidth / speed;

    gsap.to(track, {
      x: -contentWidth,
      duration,
      repeat: -1,
      ease: "none",
    });
  }, { scope: trackRef });

  const fullText = `${text}${separator}`;
  // Repeat enough times to fill the viewport
  const repeated = Array.from({ length: 8 }, () => fullText).join("");

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <div ref={trackRef} className="inline-block">
        <span>{repeated}</span>
        <span>{repeated}</span>
      </div>
    </div>
  );
}
