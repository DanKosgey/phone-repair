import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
    subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon = '📊',
    trend,
    color = Colors.light.primary,
    subtitle,
}) => {
    return (
        <View style={[styles.container, { borderLeftColor: color }]}>
            <View style={styles.header}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>

            <Text style={styles.value}>{value}</Text>

            {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
            )}

            {trend && (
                <View style={styles.trendContainer}>
                    <Text style={[
                        styles.trendText,
                        { color: trend.isPositive ? Colors.light.success : Colors.light.error }
                    ]}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </Text>
                    <Text style={styles.trendLabel}>from last month</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: Colors.light.border,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    icon: {
        fontSize: 20,
        marginRight: Spacing.xs,
    },
    title: {
        ...Typography.labelMedium,
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        ...Typography.displayLarge,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    trendText: {
        ...Typography.labelMedium,
        marginRight: Spacing.xs,
    },
    trendLabel: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
});
