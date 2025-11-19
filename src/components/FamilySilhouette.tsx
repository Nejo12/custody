"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * FamilySilhouette Component
 *
 * Displays an animated SVG illustration of a parent and child silhouette
 * with gentle, continuous motion animations. Features include:
 * - Parent figure with breathing and swaying animations
 * - Child figure with leg swing animation (inspired by Claude's landing page)
 * - Pulsing heart decoration between figures
 * - Animated gradient background orb
 * - Full dark mode support
 * - Respects prefers-reduced-motion accessibility preference
 */
export default function FamilySilhouette() {
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

  const breathingAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          y: [0, -4, 0],
        },
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const swayAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          rotate: [-1, 1, -1],
        },
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const legSwingAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          rotate: [0, 8, 0, -4, 0],
        },
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const armSwingAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          rotate: [0, -5, 0, 3, 0],
        },
        transition: {
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: 0.5,
        },
      };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 500"
        className="w-full h-full max-w-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient orb */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="rgb(251, 191, 36)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.circle
          cx="200"
          cy="250"
          r="150"
          fill="url(#bgGradient)"
          {...(prefersReducedMotion
            ? {}
            : {
                animate: {
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 0.8, 0.6],
                },
                transition: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                },
              })}
        />

        {/* Parent Figure (Adult) - Standing */}
        <motion.g {...swayAnimation}>
          <motion.g {...breathingAnimation}>
            {/* Parent Head */}
            <circle cx="150" cy="180" r="28" className="fill-zinc-700 dark:fill-zinc-400" />

            {/* Parent Body */}
            <ellipse
              cx="150"
              cy="260"
              rx="35"
              ry="55"
              className="fill-zinc-700 dark:fill-zinc-400"
            />

            {/* Parent Left Arm */}
            <motion.rect
              x="115"
              y="220"
              width="12"
              height="65"
              rx="6"
              className="fill-zinc-700 dark:fill-zinc-400"
              style={{ transformOrigin: "121px 220px" }}
              {...armSwingAnimation}
            />

            {/* Parent Right Arm - bent, reaching toward child */}
            <path
              d="M 185 230 Q 210 240 215 265"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className="text-zinc-700 dark:text-zinc-400"
            />

            {/* Parent Left Leg */}
            <rect
              x="135"
              y="310"
              width="13"
              height="70"
              rx="6"
              className="fill-zinc-700 dark:fill-zinc-400"
            />

            {/* Parent Right Leg */}
            <rect
              x="157"
              y="310"
              width="13"
              height="70"
              rx="6"
              className="fill-zinc-700 dark:fill-zinc-400"
            />
          </motion.g>
        </motion.g>

        {/* Child Figure - Sitting/Leaning */}
        <motion.g
          {...(prefersReducedMotion
            ? {}
            : {
                animate: { y: [0, -2, 0] },
                transition: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                  delay: 0.5,
                },
              })}
        >
          {/* Child Head */}
          <circle cx="250" cy="280" r="22" className="fill-amber-600 dark:fill-amber-500" />

          {/* Child Body */}
          <ellipse
            cx="250"
            cy="340"
            rx="28"
            ry="40"
            className="fill-amber-600 dark:fill-amber-500"
          />

          {/* Child Left Arm */}
          <rect
            x="222"
            y="315"
            width="10"
            height="45"
            rx="5"
            className="fill-amber-600 dark:fill-amber-500"
          />

          {/* Child Right Arm */}
          <rect
            x="268"
            y="315"
            width="10"
            height="45"
            rx="5"
            className="fill-amber-600 dark:fill-amber-500"
          />

          {/* Child Left Leg - Stationary */}
          <rect
            x="235"
            y="375"
            width="11"
            height="50"
            rx="5"
            className="fill-amber-600 dark:fill-amber-500"
          />

          {/* Child Right Leg - Swinging (like Claude's character) */}
          <motion.rect
            x="254"
            y="375"
            width="11"
            height="50"
            rx="5"
            className="fill-amber-600 dark:fill-amber-500"
            style={{ transformOrigin: "259px 375px" }}
            {...legSwingAnimation}
          />
        </motion.g>

        {/* Decorative heart between them */}
        <motion.g
          {...(prefersReducedMotion
            ? {}
            : {
                animate: {
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 0.9, 0.6],
                },
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                },
              })}
        >
          <path
            d="M 200 240 L 205 235 Q 210 230 215 235 Q 220 230 225 235 L 230 240 L 215 255 L 200 240 Z"
            className="fill-rose-400/60 dark:fill-rose-500/60"
          />
        </motion.g>

        {/* Ground line/shadow */}
        <ellipse
          cx="200"
          cy="430"
          rx="120"
          ry="8"
          className="fill-zinc-300/50 dark:fill-zinc-700/50"
        />
      </svg>
    </div>
  );
}
