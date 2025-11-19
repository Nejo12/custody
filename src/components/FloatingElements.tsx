"use client";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * FloatingElements Component
 *
 * Renders decorative floating elements (documents, hearts, stars, circles) that:
 * - Float and rotate with continuous gentle animations
 * - Respond to mouse movement with parallax effects
 * - Use randomized positions and timing for natural feel
 * - Support dark mode with adaptive colors
 * - Respect prefers-reduced-motion accessibility preference
 */

interface FloatingElement {
  id: string;
  type: "document" | "heart" | "star" | "circle";
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotationRange: number;
}

const elements: FloatingElement[] = [
  { id: "1", type: "document", x: 10, y: 15, size: 32, duration: 8, delay: 0, rotationRange: 15 },
  { id: "2", type: "heart", x: 85, y: 25, size: 24, duration: 10, delay: 1, rotationRange: 20 },
  { id: "3", type: "star", x: 75, y: 70, size: 28, duration: 9, delay: 0.5, rotationRange: 25 },
  { id: "4", type: "circle", x: 20, y: 80, size: 20, duration: 11, delay: 1.5, rotationRange: 10 },
  { id: "5", type: "document", x: 90, y: 50, size: 26, duration: 7, delay: 2, rotationRange: 18 },
  { id: "6", type: "heart", x: 15, y: 45, size: 22, duration: 9.5, delay: 0.8, rotationRange: 22 },
  { id: "7", type: "star", x: 50, y: 10, size: 18, duration: 10.5, delay: 1.2, rotationRange: 15 },
  { id: "8", type: "circle", x: 60, y: 85, size: 16, duration: 8.5, delay: 0.3, rotationRange: 12 },
];

function DocumentIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="text-zinc-400/40 dark:text-zinc-600/40"
    >
      <path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-rose-400/30 dark:text-rose-600/30"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function StarIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-amber-400/40 dark:text-amber-600/40"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function CircleIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="text-emerald-400/30 dark:text-emerald-600/30"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/**
 * Individual floating element component with parallax effect
 */
function FloatingElement({
  element,
  mouseX,
  mouseY,
  prefersReducedMotion,
}: {
  element: FloatingElement;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  prefersReducedMotion: boolean;
}) {
  const springConfig = { damping: 20, stiffness: 100 };

  // Parallax effect based on mouse position
  const parallaxX = useTransform(mouseX, [0, 1], [-10, 10]);
  const parallaxY = useTransform(mouseY, [0, 1], [-10, 10]);
  const x = useSpring(parallaxX, springConfig);
  const y = useSpring(parallaxY, springConfig);

  const Icon = {
    document: DocumentIcon,
    heart: HeartIcon,
    star: StarIcon,
    circle: CircleIcon,
  }[element.type];

  if (prefersReducedMotion) {
    // Static positioning for reduced motion
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
        }}
      >
        <Icon size={element.size} />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        x,
        y,
      }}
      animate={{
        y: [0, -15, 0],
        rotate: [-element.rotationRange, element.rotationRange, -element.rotationRange],
      }}
      transition={{
        duration: element.duration,
        delay: element.delay,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    >
      <Icon size={element.size} />
    </motion.div>
  );
}

export default function FloatingElements() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Initialize state with media query check to avoid setState in effect
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Listen for changes to prefers-reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX / innerWidth);
      mouseY.set(clientY / innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {elements.map((element) => (
        <FloatingElement
          key={element.id}
          element={element}
          mouseX={mouseX}
          mouseY={mouseY}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}
