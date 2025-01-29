"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DotPattern } from "./dot-pattern";
import Image from "next/image";
import BlurText from "./blur-text";

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
    }, 4000);

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
            className="flex flex-col items-center gap-8 relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Logo */}
            <motion.div
              className="relative"
              initial={{ y: 20, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
            >
              <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse" />
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10">
                <Image
                  src="/logo.png"
                  alt="Likhni Logo"
                  fill
                  sizes="128px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-full border border-primary/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.div>

            {/* Brand Name */}
            <motion.div className="space-y-4 text-center">
              <motion.h1
                className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Likhni
              </motion.h1>

              {/* Tagline */}
              <motion.div
                className="text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <BlurText/>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
