import type { Variants, Transition, Easing } from "framer-motion";

// Duration tokens
export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.5,
} as const;

// Easing tokens
export const easingDefault: Easing = [0.4, 0, 0.2, 1];
export const easingIn: Easing = [0.4, 0, 1, 1];
export const easingOut: Easing = [0, 0, 0.2, 1];

// Framer Motion Presets
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInTransition: Transition = {
  duration: duration.normal,
  ease: easingDefault,
};

export const slideInRight: Variants = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
};

export const slideInRightTransition: Transition = {
  duration: duration.moderate,
  ease: easingOut,
};

export const slideInBottom: Variants = {
  initial: { y: 16, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 16, opacity: 0 },
};

export const slideInBottomTransition: Transition = {
  duration: duration.normal,
  ease: easingOut,
};

export const scaleIn: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
};

export const scaleInTransition: Transition = {
  duration: duration.normal,
  ease: easingOut,
};

export const collapseToggle: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

export const collapseToggleTransition: Transition = {
  duration: duration.normal,
  ease: easingDefault,
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
  stiffness: 300,
  damping: 24,
};

// Stagger children preset
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
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
