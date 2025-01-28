"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DotPattern } from "./dot-pattern";

interface SplashScreenProps {
  className?: string;
  onComplete?: () => void;
}

export function SplashScreen({ className, onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm",
            className
          )}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <DotPattern />
          <motion.div
            className="flex flex-col items-center gap-6 relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Logo or Brand Icon */}
            <motion.div
              className="relative h-24 w-24"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
            >
              <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
              <div className="absolute inset-2 rounded-full bg-primary/40" />
              <div className="absolute inset-4 rounded-full bg-primary" />
            </motion.div>

            {/* Brand Name */}
            <motion.h1
              className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Likhni
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Your Digital Writing Companion
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
