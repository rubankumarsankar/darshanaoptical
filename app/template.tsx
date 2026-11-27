"use client";

import { MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { EASE_STANDARD } from "./lib/motion";

// The same tree is rendered on server and client. Branching on
// useReducedMotion() here caused a hydration mismatch, because the server
// can't see the user's preference. MotionConfig "user" drops the slide for
// reduced-motion users and keeps only the opacity fade.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.36,
          ease: EASE_STANDARD,
        }}
        className="flex-1 flex flex-col w-full"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
