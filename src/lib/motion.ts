import type { Variants, Transition, Easing } from "framer-motion";

// Duration tokens
export const duration = {
  instant: 0.1,
  micro: 0.12,
  fast: 0.15,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.5,
  dramatic: 0.75,
} as const;

// Easing tokens
export const easingDefault: Easing = [0.4, 0, 0.2, 1];
export const easingIn: Easing = [0.4, 0, 1, 1];
export const easingOut: Easing = [0, 0, 0.2, 1];
export const easingPremium: Easing = [0.22, 0.61, 0.36, 1];
export const easingSpringOut: Easing = [0.16, 1, 0.3, 1];

// Shared transitions for premium feel
export const transition = {
  quick: { duration: duration.micro, ease: easingPremium } satisfies Transition,
  smooth: { duration: duration.normal, ease: easingPremium } satisfies Transition,
  panel: { duration: duration.moderate, ease: easingSpringOut } satisfies Transition,
  screen: { duration: duration.slow, ease: easingPremium } satisfies Transition,
} as const;

// Framer Motion Presets
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInTransition: Transition = {
  duration: duration.normal,
  ease: easingPremium,
};

export const slideInRight: Variants = {
  initial: { x: "100%", opacity: 0.8 },
  animate: { x: 0 },
  exit: { x: "100%", opacity: 0.8 },
};

export const slideInRightTransition: Transition = {
  duration: duration.slow,
  ease: easingSpringOut,
};

export const slideInBottom: Variants = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 24, opacity: 0 },
};

export const slideInBottomTransition: Transition = {
  duration: duration.moderate,
  ease: easingSpringOut,
};

export const scaleIn: Variants = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 },
};

export const scaleInTransition: Transition = {
  duration: duration.moderate,
  ease: easingSpringOut,
};

export const collapseToggle: Variants = {
  initial: { height: 0, opacity: 0, y: -4 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0, y: -4 },
};

export const collapseToggleTransition: Transition = {
  duration: duration.moderate,
  ease: easingPremium,
};

export const exitFade: Variants = {
  exit: { opacity: 0 },
};

export const exitFadeTransition: Transition = {
  duration: duration.fast,
};

// Reorder item preset (for Kanban drag-and-drop)
export const reorderItemTransition: Transition = {
  type: "spring",
  stiffness: 360,
  damping: 28,
};

// Stagger children preset
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const screenContainer: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easingPremium,
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
};

export const cardStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

export const listItemReveal: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.985, filter: "blur(3px)" },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: duration.moderate,
      ease: easingSpringOut,
      delay: index * 0.045,
    },
  }),
};

export const pageSlideFade: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: duration.slow,
      ease: easingPremium,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: duration.moderate,
      ease: easingIn,
    },
  },
};

export const sectionEnter: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: duration.moderate,
      ease: easingSpringOut,
    },
  },
};

export const drawerEnter: Variants = {
  hidden: { opacity: 0, x: 32, scale: 0.995 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: duration.slow,
      ease: easingSpringOut,
    },
  },
  exit: {
    opacity: 0,
    x: 24,
    scale: 0.995,
    transition: {
      duration: duration.moderate,
      ease: easingPremium,
    },
  },
};

export const modalEnter: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: duration.moderate,
      ease: easingSpringOut,
    },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.985,
    transition: {
      duration: duration.fast,
      ease: easingPremium,
    },
  },
};

export const hoverLiftMotion = {
  whileHover: { y: -2, scale: 1.003 },
  whileTap: { y: 0, scale: 0.997 },
};

export const premiumPressMotion = {
  whileHover: { y: -2, scale: 1.005 },
  whileTap: { y: 0, scale: 0.992 },
};

// Reduced motion support
export function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  return mql.matches;
}

export const reducedMotionVariants: Variants = {
  initial: {},
  animate: {},
  exit: {},
};
