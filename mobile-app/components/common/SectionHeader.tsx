import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    actionButton?: {
        label: string;
        onPress: () => void;
    };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    icon,
    actionButton,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            </View>

            {actionButton && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={actionButton.onPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionButtonText}>{actionButton.label}</Text>
                    <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        fontSize: 24,
        marginRight: Spacing.sm,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        ...Typography.h3,
        color: Colors.light.text,
        fontWeight: '700',
    },
    subtitle: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginTop: Spacing.xs / 2,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    actionButtonText: {
        ...Typography.bodySmall,
        color: Colors.light.primary,
        fontWeight: '600',
        marginRight: Spacing.xs / 2,
    },
    arrow: {
        ...Typography.body,
        color: Colors.light.primary,
    },
});
