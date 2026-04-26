// ─── Framer Motion Animation Presets ─────────────────────────────

// Page transition (wrap every page)
export const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0, y: -16, scale: 0.98,
    transition: { duration: 0.25 }
  }
};

// Staggered list container
export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// Each staggered child
export const staggerItem = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

// Card hover state
export const cardHover = {
  whileHover: { y: -6, scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

// Bounce in (for badges/rewards reveal)
export const bounceIn = {
  initial: { scale: 0, rotate: -10 },
  animate: {
    scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 500, damping: 15, delay: 0.1 }
  }
};

// Slide in from left
export const slideInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

// Glow pulse for active badges
export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 10px rgba(16,185,129,0.3)",
      "0 0 30px rgba(16,185,129,0.7)",
      "0 0 10px rgba(16,185,129,0.3)"
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};
