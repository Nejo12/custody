"use client";
import { motion } from "framer-motion";
import PhotoHero from "./PhotoHero";
import FloatingElements from "./FloatingElements";

interface AnimatedHeroProps {
  children: React.ReactNode;
}

export default function AnimatedHero({ children }: AnimatedHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            className="relative z-10 order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>

          {/* Right side - Animated illustration */}
          <motion.div
            className="relative order-1 lg:order-2 h-[400px] sm:h-[500px] lg:h-[600px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-emerald-500/5 dark:from-amber-500/10 dark:via-rose-500/10 dark:to-emerald-500/10 rounded-3xl" />

            {/* Animated illustration container */}
            <div className="relative h-full rounded-3xl overflow-hidden">
              {/* Floating decorative elements */}
              <FloatingElements />

              {/* Main photo hero */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <PhotoHero />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
