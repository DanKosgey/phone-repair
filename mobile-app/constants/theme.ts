export const Colors = {
    light: {
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        secondary: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
    },
    dark: {
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        secondary: '#8b5cf6',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc',
        textSecondary: '#94a3b8',
        border: '#334155',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const Typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },
};
