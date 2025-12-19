import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Elevation } from '../../constants/theme';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    onPress?: () => void;
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: 'none' | 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    style?: object;
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    subtitle,
    onPress,
    variant = 'elevated',
    padding = 'medium',
    fullWidth = false,
    style = {},
    accessibilityLabel,
    accessibilityHint,
}) => {
    const WrapperComponent = onPress ? TouchableOpacity : View;
    const wrapperProps = onPress ? { 
        onPress, 
        activeOpacity: 0.7
    } : {};
    
    const getPaddingStyle = () => {
        switch (padding) {
            case 'none': return styles.noPadding;
            case 'small': return styles.smallPadding;
            case 'medium': return styles.mediumPadding;
            case 'large': return styles.largePadding;
            default: return styles.mediumPadding;
        }
    };
    
    const cardStyle = [
        styles.baseCard,
        variant === 'elevated' && styles.elevatedCard,
        variant === 'outlined' && styles.outlinedCard,
        variant === 'filled' && styles.filledCard,
        getPaddingStyle(),
        fullWidth && styles.fullWidth,
        style
    ];
    
    return (
        <WrapperComponent 
            style={cardStyle} 
            {...wrapperProps}
            accessibilityRole={onPress ? "button" : undefined}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint}
        >
            {(title || subtitle) && (
                <View style={styles.header}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
            {children}
        </WrapperComponent>
    );
};

const styles = StyleSheet.create({
    baseCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    elevatedCard: {
        ...Elevation.level2,
    },
    outlinedCard: {
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    filledCard: {
        backgroundColor: Colors.light.surface,
    },
    header: {
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.headlineSmall,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.bodyMedium,
        color: Colors.light.textSecondary,
    },
    noPadding: {
        padding: 0,
    },
    smallPadding: {
        padding: Spacing.sm,
    },
    mediumPadding: {
        padding: Spacing.md,
    },
    largePadding: {
        padding: Spacing.lg,
    },
    fullWidth: {
        width: '100%',
    },
});