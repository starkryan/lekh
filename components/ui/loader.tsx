"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const dots = {
  initial: {
    scale: 0.8,
    opacity: 0.4,
  },
  animate: {
    scale: 1,
    opacity: 1,
  },
};

const container = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export function Loader({ className, size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "h-1.5 w-1.5 gap-1",
    md: "h-2 w-2 gap-1.5",
    lg: "h-2.5 w-2.5 gap-2",
  };

  return (
    <motion.div
      variants={container}
      initial="initial"
      animate="animate"
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      <motion.div className="flex items-center">
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            variants={dots}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.4,
              delay: i * 0.15,
            }}
            className={cn(
              "rounded-full bg-current",
              sizeClasses[size]
            )}
          />
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="ml-3 text-sm font-medium"
      >
        AI is thinking...
      </motion.div>
    </motion.div>
  );
}
