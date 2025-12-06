import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface StatusSummary {
    status: string;
    count: number;
    percentage: number;
}

interface StatusSummaryCardsProps {
    data: StatusSummary[];
    onStatusSelect: (status: string) => void;
}

export const StatusSummaryCards: React.FC<StatusSummaryCardsProps> = ({ data, onStatusSelect }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return Colors.light.success;
            case 'ready': return Colors.light.primary;
            case 'repairing': return Colors.light.info;
            case 'diagnosing': return Colors.light.warning;
            case 'received': return Colors.light.textSecondary;
            case 'awaiting_parts': return Colors.light.error;
            case 'quality_check': return Colors.light.secondary;
            case 'cancelled': return Colors.light.text;
            default: return Colors.light.border;
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <View style={styles.container}>
            {data.map((item) => (
                <TouchableOpacity
                    key={item.status}
                    style={styles.card}
                    onPress={() => onStatusSelect(item.status)}
                >
                    <View style={styles.header}>
                        <Text style={styles.status}>{formatStatus(item.status)}</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.count}>{item.count}</Text>
                        <Text style={styles.percentage}>{item.percentage.toFixed(1)}%</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    card: {
        flex: 1,
        minWidth: 120,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: Spacing.sm,
    },
    header: {
        marginBottom: Spacing.xs,
    },
    status: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        fontWeight: '600',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    count: {
        ...Typography.h2,
        color: Colors.light.text,
        fontWeight: '700',
    },
    percentage: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
});