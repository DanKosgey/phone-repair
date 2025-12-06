import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface Ticket {
    id: string;
    ticket_number: string;
    device_type: string;
    issue_description: string;
    status: string;
    created_at: string;
    customer_name?: string;
}

interface TicketCardProps {
    ticket: Ticket;
    onPress: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
            case 'action_required':
                return Colors.light.warning;
            case 'in_progress':
                return Colors.light.info;
            case 'near_completion':
                return Colors.light.secondary;
            case 'completed':
                return Colors.light.success;
            default:
                return Colors.light.textSecondary;
        }
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').toUpperCase();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.ticketInfo}>
                    <Text style={styles.ticketNumber}>#{ticket.ticket_number}</Text>
                    {ticket.customer_name && (
                        <Text style={styles.customerName}>{ticket.customer_name}</Text>
                    )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {formatStatus(ticket.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.deviceType}>{ticket.device_type}</Text>
            <Text style={styles.issueDescription} numberOfLines={2}>
                {ticket.issue_description}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.date}>📅 {formatDate(ticket.created_at)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    ticketInfo: {
        flex: 1,
    },
    ticketNumber: {
        ...Typography.body,
        color: Colors.light.primary,
        fontWeight: '700',
        marginBottom: Spacing.xs / 2,
    },
    customerName: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
        fontSize: 10,
    },
    deviceType: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    issueDescription: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
});
