"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * PhotoHero Component
 *
 * Displays an animated photo of a parent and child with orange background.
 * Features include:
 * - Real photo with subtle breathing and floating animations
 * - Orange gradient background with continuous motion
 * - Floating legal symbols around the photo
 * - Full dark mode support
 * - Respects prefers-reduced-motion accessibility preference
 * - Next.js Image optimization for performance
 *
 * To customize:
 * - Replace the image URL in the imageUrl variable
 * - Or save your photo to /public/images/hero/parent-child.jpg
 * - Adjust animation parameters in the animation objects
 */

interface FloatingItem {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  orbitRadius: number;
}

// Legal and text-related items for custody context
const floatingItems: FloatingItem[] = [
  { id: "1", content: "§", x: 5, y: 15, size: 40, duration: 12, delay: 0, orbitRadius: 25 },
  { id: "2", content: "BGB", x: 85, y: 10, size: 28, duration: 15, delay: 1, orbitRadius: 20 },
  { id: "3", content: "Art.", x: 90, y: 70, size: 24, duration: 13, delay: 2, orbitRadius: 18 },
  { id: "4", content: "¶", x: 8, y: 80, size: 36, duration: 14, delay: 0.5, orbitRadius: 22 },
  { id: "5", content: "§§", x: 50, y: 5, size: 30, duration: 16, delay: 1.5, orbitRadius: 20 },
  { id: "6", content: "1626", x: 10, y: 50, size: 22, duration: 11, delay: 2.5, orbitRadius: 16 },
];

function FloatingLegalItem({
  item,
  prefersReducedMotion,
}: {
  item: FloatingItem;
  prefersReducedMotion: boolean;
}) {
  if (prefersReducedMotion) {
    return (
      <div
        className="absolute font-bold text-white/30 dark:text-white/20 select-none pointer-events-none"
        style={{
          left: `${item.x}%`,
          top: `${item.y}%`,
          fontSize: `${item.size}px`,
        }}
      >
        {item.content}
      </div>
    );
  }

  return (
    <motion.div
      className="absolute font-bold text-white/30 dark:text-white/20 select-none pointer-events-none"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        fontSize: `${item.size}px`,
      }}
      animate={{
        x: [0, item.orbitRadius, 0, -item.orbitRadius, 0],
        y: [0, -item.orbitRadius, 0, item.orbitRadius, 0],
        rotate: [0, 360],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: item.duration,
        delay: item.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {item.content}
    </motion.div>
  );
}

export default function PhotoHero() {
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

  // Use a free Unsplash photo - you can replace this with your own image
  // To use your own image: save it to /public/images/hero/parent-child.jpg
  // and change imageUrl to "/images/hero/parent-child.jpg"
  const imageUrl =
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&auto=format&fit=crop&q=80";

  // Gentle floating animation for the photo
  const floatingAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          y: [0, -12, 0],
          scale: [1, 1.02, 1],
        },
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  // Subtle rotation for added depth
  const rotationAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          rotate: [0, 1, 0, -1, 0],
        },
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Orange gradient background with wave motion */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-800"
        {...(prefersReducedMotion
          ? {}
          : {
              animate: {
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              },
              transition: {
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              },
            })}
        style={{
          backgroundSize: "400% 400%",
        }}
      />

      {/* Overlapping wave patterns */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(0,0,0,0.2) 0%, transparent 50%)",
        }}
        {...(prefersReducedMotion
          ? {}
          : {
              animate: {
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              },
              transition: {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              },
            })}
      />

      {/* Floating legal items */}
      <div className="absolute inset-0">
        {floatingItems.map((item) => (
          <FloatingLegalItem
            key={item.id}
            item={item}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      {/* Main photo container with animations */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        {...floatingAnimation}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div {...rotationAnimation}>
          {/* Photo frame with shadow and border */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/90 bg-white dark:bg-zinc-900">
            {/* Dark mode overlay */}
            <div className="absolute inset-0 bg-zinc-900/5 dark:bg-zinc-950/20 z-10 pointer-events-none mix-blend-overlay" />

            {/* The actual photo */}
            <div className="relative aspect-[3/4]">
              <Image
                src={imageUrl}
                alt="Parent and child - representing family and custody clarity"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                className="object-cover"
                quality={90}
              />
            </div>
          </div>

          {/* Decorative corner accent - softer orange glow */}
          <motion.div
            className="absolute -top-3 -right-3 w-24 h-24 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full blur-2xl opacity-50 dark:opacity-30"
            {...(prefersReducedMotion
              ? {}
              : {
                  animate: {
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                  },
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                  },
                })}
          />

          {/* Bottom corner accent */}
          <motion.div
            className="absolute -bottom-3 -left-3 w-32 h-32 bg-gradient-to-tr from-amber-400 to-orange-400 rounded-full blur-2xl opacity-40 dark:opacity-25"
            {...(prefersReducedMotion
              ? {}
              : {
                  animate: {
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.5, 0.3],
                  },
                  transition: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                    delay: 1,
                  },
                })}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
