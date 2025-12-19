// Design System Constants
// This file contains reusable design tokens to ensure consistency across the application

// Color Palette
export const COLORS = {
  // Primary Colors
  primary: "hsl(195, 100%, 50%)",
  primaryForeground: "hsl(0, 0%, 100%)",
  
  // Secondary Colors
  secondary: "hsl(210, 40%, 97%)",
  secondaryForeground: "hsl(222.2, 47.4%, 8%)",
  
  // Background & Surface Colors
  background: "hsl(0, 0%, 99%)",
  foreground: "hsl(222.2, 84%, 2%)",
  card: "hsl(0, 0%, 100%)",
  cardForeground: "hsl(222.2, 84%, 2%)",
  
  // Status Colors
  success: "hsl(142, 76%, 27%)",
  warning: "hsl(48, 96%, 43%)",
  error: "hsl(0, 84%, 50%)",
  info: "hsl(195, 100%, 50%)",
  
  // State Colors
  muted: "hsl(210, 40%, 97%)",
  mutedForeground: "hsl(215.4, 16.3%, 35%)",
  accent: "hsl(210, 40%, 97%)",
  accentForeground: "hsl(222.2, 47.4%, 8%)",
  destructive: "hsl(0, 84.2%, 45%)",
  destructiveForeground: "hsl(0, 0%, 100%)",
  
  // Border & Outline Colors
  border: "hsl(214.3, 31.8%, 92%)",
  input: "hsl(214.3, 31.8%, 92%)",
  ring: "hsl(195, 100%, 50%)",
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  
  sizes: {
    h1: "text-4xl md:text-5xl",
    h2: "text-3xl md:text-4xl",
    h3: "text-2xl md:text-3xl",
    h4: "text-xl md:text-2xl",
    h5: "text-lg md:text-xl",
    h6: "text-base md:text-lg",
    body: "text-base",
    small: "text-sm",
  },
  
  weights: {
    regular: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  },
  
  lineHeight: {
    tight: "leading-tight",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
  },
};

// Spacing Scale (based on 4px base unit)
export const SPACING = {
  xxs: "1",
  xs: "2",
  sm: "3",
  md: "4",
  lg: "6",
  xl: "8",
  xxl: "12",
  xxxl: "16",
  
  // Raw values in rem
  raw: {
    xxs: "0.25rem",
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
    xxxl: "4rem",
  }
};

// Border Radius
export const RADIUS = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  full: "rounded-full",
  
  // Raw values
  raw: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  }
};

// Shadows
export const SHADOWS = {
  sm: "shadow-sm",
  md: "shadow",
  lg: "shadow-lg",
  xl: "shadow-xl",
  xxl: "shadow-2xl",
  inner: "shadow-inner",
  
  // With color
  colored: {
    primary: "shadow-primary/20",
    secondary: "shadow-secondary/20",
    destructive: "shadow-destructive/20",
    black: "shadow-black/5",
  }
};

// Transitions
export const TRANSITIONS = {
  fast: "transition-all duration-150 ease-in-out",
  normal: "transition-all duration-300 ease-in-out",
  slow: "transition-all duration-500 ease-in-out",
};

// Breakpoints
export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
};

// Z-Index
export const Z_INDEX = {
  auto: "auto",
  dropdown: "10",
  sticky: "20",
  fixed: "30",
  modalBackdrop: "40",
  modal: "50",
  popover: "60",
  tooltip: "70",
};

// Utility function to generate class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Utility function to convert HSL to RGB (for special cases)
export const hslToRgb = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `${r} ${g} ${b}`;
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  TRANSITIONS,
  BREAKPOINTS,
  Z_INDEX,
  cn,
  hslToRgb,
};