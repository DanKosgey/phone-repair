import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface EmptyStateProps {
    icon?: string;
    title: string;
    subtitle?: string;
    actionButton?: {
        label: string;
        onPress: () => void;
    };
    accessibilityLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    subtitle,
    actionButton,
    accessibilityLabel,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {actionButton && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={actionButton.onPress}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={accessibilityLabel || actionButton.label}
                    accessibilityHint="Double tap to perform action"
                >
                    <Text style={styles.actionButtonText}>{actionButton.label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderStyle: 'dashed',
    },
    icon: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.headlineSmall,
        color: Colors.light.text,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        maxWidth: 280,
    },
    actionButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
    },
    actionButtonText: {
        ...Typography.bodyLarge,
        color: '#fff',
        fontWeight: '600',
    },
});