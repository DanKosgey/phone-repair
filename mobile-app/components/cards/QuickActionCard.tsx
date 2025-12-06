import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface QuickActionCardProps {
    title: string;
    icon: string;
    onPress: () => void;
    color?: string;
    subtitle?: string;
    badgeCount?: number;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
    title,
    icon,
    onPress,
    color = Colors.light.primary,
    subtitle,
    badgeCount,
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Text style={styles.icon}>{icon}</Text>
                {badgeCount !== undefined && badgeCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {badgeCount > 99 ? '99+' : badgeCount.toString()}
                        </Text>
                    </View>
                )}
            </View>
            <Text style={styles.title} numberOfLines={2}>
                {title}
            </Text>
            {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    icon: {
        fontSize: 28,
    },
    title: {
        ...Typography.bodySmall,
        color: Colors.light.text,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: Colors.light.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});