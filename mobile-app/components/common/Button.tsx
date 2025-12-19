import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    fullWidth = false,
    accessibilityLabel,
    accessibilityHint,
}) => {
    const getPaddingStyle = () => {
        switch (size) {
            case 'small': return styles.smallButton;
            case 'medium': return styles.mediumButton;
            case 'large': return styles.largeButton;
            default: return styles.mediumButton;
        }
    };
    
    const getTextStyle = () => {
        switch (size) {
            case 'small': return styles.smallButtonText;
            case 'medium': return styles.mediumButtonText;
            case 'large': return styles.largeButtonText;
            default: return styles.mediumButtonText;
        }
    };
    
    const buttonStyle = [
        styles.baseButton,
        styles[`${variant}Button`],
        getPaddingStyle(),
        disabled && styles.disabledButton,
        fullWidth && styles.fullWidth
    ];
    
    const textStyle = [
        styles.baseText,
        styles[`${variant}ButtonText`],
        getTextStyle(),
        disabled && styles.disabledButtonText
    ];
    
    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading }}
        >
            {loading ? (
                <ActivityIndicator 
                    color={variant === 'primary' || variant === 'danger' ? Colors.light.primaryContrast : Colors.light.primary} 
                    size="small" 
                    accessibilityLabel="Loading"
                />
            ) : (
                <View style={styles.contentContainer}>
                    {icon && <View style={styles.icon}>{icon}</View>}
                    <Text style={textStyle}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    baseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: Spacing.xs,
    },
    baseText: {
        fontWeight: '600',
        textAlign: 'center',
    },
    
    // Variants
    primaryButton: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    secondaryButton: {
        backgroundColor: Colors.light.secondary,
        borderColor: Colors.light.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderColor: Colors.light.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    dangerButton: {
        backgroundColor: Colors.light.error,
        borderColor: Colors.light.error,
    },
    
    // Variant text colors
    primaryButtonText: {
        color: Colors.light.primaryContrast,
    },
    secondaryButtonText: {
        color: Colors.light.secondaryContrast,
    },
    outlineButtonText: {
        color: Colors.light.primary,
    },
    ghostButtonText: {
        color: Colors.light.primary,
    },
    dangerButtonText: {
        color: Colors.light.primaryContrast,
    },
    
    // Sizes
    smallButton: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        minHeight: 32,
    },
    mediumButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        minHeight: 40,
    },
    largeButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        minHeight: 48,
    },
    
    // Size text styles
    smallButtonText: {
        ...Typography.labelMedium,
    },
    mediumButtonText: {
        ...Typography.labelLarge,
    },
    largeButtonText: {
        ...Typography.titleMedium,
    },
    
    // States
    disabledButton: {
        opacity: 0.5,
    },
    disabledButtonText: {
        color: Colors.light.textTertiary,
    },
    
    // Layout
    fullWidth: {
        width: '100%',
    },
});