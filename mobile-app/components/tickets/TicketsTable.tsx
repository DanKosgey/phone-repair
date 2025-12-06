import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Ticket {
    id: string;
    ticket_number: string;
    customer_name: string;
    device_brand: string;
    device_model: string;
    issue_description: string;
    status: string;
    created_at: string;
}

interface TicketsTableProps {
    tickets: Ticket[];
    onTicketPress: (ticketId: string) => void;
    onSort: (column: string) => void;
    sortConfig: { key: string; direction: string } | null;
}

export const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, onTicketPress, onSort, sortConfig }) => {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getSortIcon = (columnName: string) => {
        if (!sortConfig || sortConfig.key !== columnName) {
            return <Ionicons name="swap-vertical" size={16} color={Colors.light.textSecondary} />;
        }
        if (sortConfig.direction === 'ascending') {
            return <Ionicons name="swap-vertical" size={16} color={Colors.light.primary} />;
        }
        return <Ionicons name="swap-vertical" size={16} color={Colors.light.primary} />;
    };

    return (
        <View style={styles.container}>
            <View style={styles.tableHeader}>
                <TouchableOpacity style={styles.headerCell} onPress={() => onSort('ticket_number')}>
                    <Text style={styles.headerText}>Ticket ID</Text>
                    {getSortIcon('ticket_number')}
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => onSort('customer_name')}>
                    <Text style={styles.headerText}>Customer</Text>
                    {getSortIcon('customer_name')}
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => onSort('device')}>
                    <Text style={styles.headerText}>Device</Text>
                    {getSortIcon('device')}
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => onSort('status')}>
                    <Text style={styles.headerText}>Status</Text>
                    {getSortIcon('status')}
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerCell} onPress={() => onSort('created_at')}>
                    <Text style={styles.headerText}>Date</Text>
                    {getSortIcon('created_at')}
                </TouchableOpacity>
            </View>
            
            {tickets.map((ticket) => (
                <TouchableOpacity
                    key={ticket.id}
                    style={styles.tableRow}
                    onPress={() => onTicketPress(ticket.id)}
                >
                    <View style={styles.cell}>
                        <Text style={styles.cellText} numberOfLines={1}>{ticket.ticket_number}</Text>
                    </View>
                    <View style={styles.cell}>
                        <Text style={styles.cellText} numberOfLines={1}>{ticket.customer_name}</Text>
                    </View>
                    <View style={styles.cell}>
                        <Text style={styles.cellText} numberOfLines={1}>
                            {ticket.device_brand} {ticket.device_model}
                        </Text>
                    </View>
                    <View style={styles.cell}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                                {formatStatus(ticket.status)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cell}>
                        <Text style={styles.cellText} numberOfLines={1}>{formatDate(ticket.created_at)}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerCell: {
        flex: 1,
        padding: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        ...Typography.caption,
        color: Colors.light.text,
        fontWeight: '700',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        paddingVertical: Spacing.sm,
    },
    cell: {
        flex: 1,
        paddingHorizontal: Spacing.sm,
        justifyContent: 'center',
    },
    cellText: {
        ...Typography.caption,
        color: Colors.light.text,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
    },
});