import { Platform } from 'react-native';

// Convert HSL values to RGB for React Native
const hslToRgb = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  return `rgb(${r}, ${g}, ${b})`;
};

// Web app HSL color values converted to RGB
const webColors = {
  // Primary colors
  primary: hslToRgb(195, 100, 60), // hsl(195, 100%, 60%)
  primaryForeground: 'rgb(255, 255, 255)', // #ffffff
  
  // Secondary colors
  secondary: hslToRgb(210, 40, 95), // hsl(210, 40%, 95%)
  secondaryForeground: hslToRgb(222.2, 47.4, 11.2), // Approximation
  
  // Status colors
  statusReceived: hslToRgb(195, 100, 55), // hsl(195, 100%, 55%)
  statusDiagnosing: hslToRgb(271, 91, 55), // hsl(271, 91%, 55%)
  statusAwaiting: hslToRgb(38, 92, 45), // hsl(38, 92%, 45%)
  statusRepairing: hslToRgb(48, 96, 48), // hsl(48, 96%, 48%)
  statusQuality: hslToRgb(239, 84, 60), // hsl(239, 84%, 60%)
  statusReady: hslToRgb(142, 76, 32), // hsl(142, 76%, 32%)
  statusCompleted: hslToRgb(215, 16, 42), // hsl(215, 16%, 42%)
  statusCancelled: hslToRgb(0, 84, 55), // hsl(0, 84%, 55%)
  
  // Priority colors
  priorityLow: hslToRgb(215, 16, 42), // hsl(215, 16%, 42%)
  priorityNormal: hslToRgb(195, 100, 55), // hsl(195, 100%, 55%)
  priorityHigh: hslToRgb(38, 92, 45), // hsl(38, 92%, 45%)
  priorityUrgent: hslToRgb(0, 84, 55), // hsl(0, 84%, 55%)
  
  // Success/Warning/Error
  success: hslToRgb(142, 76, 32), // hsl(142, 76%, 32%)
  warning: hslToRgb(48, 96, 48), // hsl(48, 96%, 48%)
  error: hslToRgb(0, 84, 55), // hsl(0, 84%, 55%)
  
  // Neutrals
  backgroundLight: hslToRgb(0, 0, 98), // hsl(0, 0%, 98%)
  foreground: hslToRgb(222.2, 84, 4.9), // Approximation
  card: hslToRgb(0, 0, 99), // hsl(0, 0%, 99%)
  border: hslToRgb(214.3, 31.8, 90), // hsl(214.3, 31.8%, 90%)
};

export const Colors = {
    light: {
        // Primary color palette - aligned with web app
        primary: webColors.primary,
        primaryLight: hslToRgb(195, 100, 65), // Slightly lighter
        primaryDark: hslToRgb(195, 100, 50), // Slightly darker
        primaryContrast: webColors.primaryForeground,
        
        // Secondary color palette
        secondary: webColors.secondary,
        secondaryLight: hslToRgb(210, 40, 98), // Lighter secondary
        secondaryDark: hslToRgb(210, 40, 90), // Darker secondary
        secondaryContrast: webColors.secondaryForeground,
        
        // Neutral colors
        background: webColors.backgroundLight,
        surface: webColors.card,
        surfaceHover: hslToRgb(0, 0, 95), // Slightly darker on hover
        elevatedSurface: webColors.card,
        
        // Text colors
        text: webColors.foreground,
        textSecondary: hslToRgb(215.4, 16.3, 45), // hsl(215.4, 16.3%, 45%)
        textTertiary: hslToRgb(215, 20.2, 65), // Approximation
        textInverse: '#ffffff',
        
        // Border and divider colors
        border: webColors.border,
        borderLight: hslToRgb(214.3, 31.8, 95), // Lighter border
        divider: webColors.border,
        
        // Status colors - aligned with web app
        success: webColors.success,
        successLight: hslToRgb(142, 76, 40), // Lighter success
        successDark: hslToRgb(142, 76, 25), // Darker success
        warning: webColors.warning,
        warningLight: hslToRgb(48, 96, 60), // Lighter warning
        warningDark: hslToRgb(48, 96, 35), // Darker warning
        error: webColors.error,
        errorLight: hslToRgb(0, 84, 65), // Lighter error
        errorDark: hslToRgb(0, 84, 45), // Darker error
        info: hslToRgb(195, 100, 60), // hsl(195, 100%, 60%)
        infoLight: hslToRgb(195, 100, 70), // Lighter info
        infoDark: hslToRgb(195, 100, 50), // Darker info
        
        // Status-specific colors - new additions
        status: {
          received: webColors.statusReceived,
          diagnosing: webColors.statusDiagnosing,
          awaiting: webColors.statusAwaiting,
          repairing: webColors.statusRepairing,
          quality: webColors.statusQuality,
          ready: webColors.statusReady,
          completed: webColors.statusCompleted,
          cancelled: webColors.statusCancelled,
        },
        
        // Priority-specific colors - new additions
        priority: {
          low: webColors.priorityLow,
          normal: webColors.priorityNormal,
          high: webColors.priorityHigh,
          urgent: webColors.priorityUrgent,
        },
        
        // Shadow colors
        shadow: 'rgba(0, 0, 0, 0.08)',
        shadowStrong: 'rgba(0, 0, 0, 0.15)',
        
        // Gradient colors
        gradientStart: webColors.primary,
        gradientEnd: hslToRgb(195, 100, 65), // Slightly lighter
    },
    dark: {
        // Primary color palette
        primary: hslToRgb(195, 100, 65), // Brighter for dark mode
        primaryLight: hslToRgb(195, 100, 70),
        primaryDark: hslToRgb(195, 100, 55),
        primaryContrast: '#ffffff',
        
        // Secondary color palette
        secondary: hslToRgb(217.2, 32.6, 20), // hsl(217.2, 32.6%, 20%)
        secondaryLight: hslToRgb(217.2, 32.6, 25),
        secondaryDark: hslToRgb(217.2, 32.6, 15),
        secondaryContrast: '#ffffff',
        
        // Neutral colors
        background: hslToRgb(222.2, 84, 6), // hsl(222.2, 84%, 6%)
        surface: hslToRgb(222.2, 84, 6),
        surfaceHover: hslToRgb(217.2, 32.6, 15),
        elevatedSurface: hslToRgb(217.2, 32.6, 12),
        
        // Text colors
        text: hslToRgb(210, 40, 98), // hsl(210, 40%, 98%)
        textSecondary: hslToRgb(215, 20.2, 65), // hsl(215, 20.2%, 65%)
        textTertiary: hslToRgb(215, 20.2, 50), // Darker for contrast
        textInverse: hslToRgb(222.2, 84, 6),
        
        // Border and divider colors
        border: hslToRgb(217.2, 32.6, 20), // hsl(217.2, 32.6%, 20%)
        borderLight: hslToRgb(217.2, 32.6, 25),
        divider: hslToRgb(217.2, 32.6, 20),
        
        // Status colors
        success: webColors.success,
        successLight: hslToRgb(142, 76, 40),
        successDark: hslToRgb(142, 76, 25),
        warning: webColors.warning,
        warningLight: hslToRgb(48, 96, 60),
        warningDark: hslToRgb(48, 96, 35),
        error: webColors.error,
        errorLight: hslToRgb(0, 84, 65),
        errorDark: hslToRgb(0, 84, 45),
        info: hslToRgb(195, 100, 65),
        infoLight: hslToRgb(195, 100, 75),
        infoDark: hslToRgb(195, 100, 55),
        
        // Status-specific colors - new additions
        status: {
          received: webColors.statusReceived,
          diagnosing: webColors.statusDiagnosing,
          awaiting: webColors.statusAwaiting,
          repairing: webColors.statusRepairing,
          quality: webColors.statusQuality,
          ready: webColors.statusReady,
          completed: webColors.statusCompleted,
          cancelled: webColors.statusCancelled,
        },
        
        // Priority-specific colors - new additions
        priority: {
          low: webColors.priorityLow,
          normal: webColors.priorityNormal,
          high: webColors.priorityHigh,
          urgent: webColors.priorityUrgent,
        },
        
        // Shadow colors
        shadow: 'rgba(0, 0, 0, 0.3)',
        shadowStrong: 'rgba(0, 0, 0, 0.5)',
        
        // Gradient colors
        gradientStart: hslToRgb(195, 100, 65),
        gradientEnd: hslToRgb(195, 100, 70),
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

// Align border radius with web app (Tailwind values)
export const BorderRadius = {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    xxl: 16,
    xxxl: 24,
    full: 9999,
};

// Align typography with web app
export const Typography = {
    // Display headings
    displayLarge: {
        fontSize: 57,
        fontWeight: '700' as const,
        lineHeight: 64,
        letterSpacing: -0.25,
    },
    displayMedium: {
        fontSize: 45,
        fontWeight: '700' as const,
        lineHeight: 52,
        letterSpacing: 0,
    },
    displaySmall: {
        fontSize: 36,
        fontWeight: '700' as const,
        lineHeight: 44,
        letterSpacing: 0,
    },
    
    // Headlines
    headlineLarge: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
        letterSpacing: 0,
    },
    headlineMedium: {
        fontSize: 28,
        fontWeight: '600' as const,
        lineHeight: 36,
        letterSpacing: 0,
    },
    headlineSmall: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
        letterSpacing: 0,
    },
    
    // Titles
    titleLarge: {
        fontSize: 22,
        fontWeight: '600' as const,
        lineHeight: 28,
        letterSpacing: 0,
    },
    titleMedium: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
        letterSpacing: 0.15,
    },
    titleSmall: {
        fontSize: 14,
        fontWeight: '600' as const,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    
    // Body text
    bodyLarge: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
        letterSpacing: 0.5,
    },
    bodyMedium: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
        letterSpacing: 0.25,
    },
    bodySmall: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
        letterSpacing: 0.4,
    },
    
    // Labels
    labelLarge: {
        fontSize: 14,
        fontWeight: '600' as const,
        lineHeight: 20,
        letterSpacing: 0.1,
    },
    labelMedium: {
        fontSize: 12,
        fontWeight: '600' as const,
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    labelSmall: {
        fontSize: 11,
        fontWeight: '600' as const,
        lineHeight: 16,
        letterSpacing: 0.5,
    },
    
    // Captions
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
        letterSpacing: 0.4,
    },
};

// Elevation levels for shadows
export const Elevation = {
    level0: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    level1: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 1,
    },
    level2: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    level3: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    level4: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    level5: {
        shadowColor: Colors.light.shadowStrong,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 5,
    },
};