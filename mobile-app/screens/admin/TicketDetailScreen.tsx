import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

interface Ticket {
    id: string;
    ticket_number: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    issue_description: string;
    priority: string;
    status: string;
    notes: string;
    estimated_completion_date: string;
    created_at: string;
    updated_at: string;
}

export default function TicketDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { user } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');

    const statusOptions = [
        'received',
        'in_progress',
        'near_completion',
        'completed',
        'cancelled'
    ];

    const priorityLabels: Record<string, string> = {
        low: 'Low',
        normal: 'Normal',
        high: 'High',
        urgent: 'Urgent'
    };

    const statusLabels: Record<string, string> = {
        received: 'Received',
        in_progress: 'In Progress',
        near_completion: 'Near Completion',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setTicket(data);
            setNewStatus(data.status);
        } catch (error) {
            console.error('Error fetching ticket:', error);
            Alert.alert('Error', 'Failed to fetch ticket details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'received': return Colors.light.info;
            case 'in_progress': return Colors.light.warning;
            case 'near_completion': return Colors.light.primary;
            case 'completed': return Colors.light.success;
            case 'cancelled': return Colors.light.error;
            default: return Colors.light.textSecondary;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return Colors.light.success;
            case 'normal': return Colors.light.info;
            case 'high': return Colors.light.warning;
            case 'urgent': return Colors.light.error;
            default: return Colors.light.textSecondary;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return dateString;
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus || newStatus === ticket?.status) {
            Alert.alert('No Changes', 'Please select a different status');
            return;
        }

        setUpdating(true);
        try {
            const updateData: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (statusNote.trim()) {
                updateData.notes = ticket?.notes 
                    ? `${ticket.notes}\n\n[${format(new Date(), 'MMM dd, yyyy HH:mm')}] Status updated to ${statusLabels[newStatus]}: ${statusNote}`
                    : `[${format(new Date(), 'MMM dd, yyyy HH:mm')}] Status updated to ${statusLabels[newStatus]}: ${statusNote}`;
            }

            const { error } = await supabase
                .from('tickets')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            Alert.alert('Success', 'Ticket status updated successfully');
            fetchTicket(); // Refresh ticket data
        } catch (error: any) {
            console.error('Error updating ticket:', error);
            Alert.alert('Error', 'Failed to update ticket: ' + (error.message || 'Unknown error'));
        } finally {
            setUpdating(false);
        }
    };

    const handleEdit = () => {
        navigation.navigate('CreateTicket', { ticket });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (!ticket) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Ticket not found</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchTicket}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.ticketNumber}>#{ticket.ticket_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                            {statusLabels[ticket.status]}
                        </Text>
                    </View>
                </View>
                <Text style={styles.deviceTitle}>
                    {ticket.device_brand} {ticket.device_model}
                </Text>
                <Text style={styles.issueDescription} numberOfLines={2}>
                    {ticket.issue_description}
                </Text>
            </View>

            <View style={styles.content}>
                {/* Customer Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{ticket.customer_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{ticket.customer_email}</Text>
                    </View>
                    {ticket.customer_phone && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{ticket.customer_phone}</Text>
                        </View>
                    )}
                </View>

                {/* Device Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Device Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Type</Text>
                        <Text style={styles.infoValue}>{ticket.device_type}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Brand</Text>
                        <Text style={styles.infoValue}>{ticket.device_brand}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Model</Text>
                        <Text style={styles.infoValue}>{ticket.device_model}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Priority</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) + '20' }]}>
                            <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                                {priorityLabels[ticket.priority]}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Timeline Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Created</Text>
                        <Text style={styles.infoValue}>{formatDate(ticket.created_at)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Updated</Text>
                        <Text style={styles.infoValue}>{formatDate(ticket.updated_at)}</Text>
                    </View>
                    {ticket.estimated_completion_date && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Est. Completion</Text>
                            <Text style={styles.infoValue}>{formatDate(ticket.estimated_completion_date)}</Text>
                        </View>
                    )}
                </View>

                {/* Issue Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Issue Description</Text>
                    <Text style={styles.descriptionText}>{ticket.issue_description}</Text>
                </View>

                {/* Notes */}
                {ticket.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <Text style={styles.descriptionText}>{ticket.notes}</Text>
                    </View>
                )}

                {/* Status Update (Admin Only) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Status</Text>
                        <View style={styles.chipContainer}>
                            {statusOptions.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.chip,
                                        newStatus === status && styles.chipSelected,
                                        { borderColor: getStatusColor(status) }
                                    ]}
                                    onPress={() => setNewStatus(status)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        newStatus === status && styles.chipTextSelected,
                                        { color: newStatus === status ? Colors.light.background : getStatusColor(status) }
                                    ]}>
                                        {statusLabels[status]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status Note (Optional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={statusNote}
                            onChangeText={setStatusNote}
                            placeholder="Add a note about this status change..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.updateButton, updating && styles.buttonDisabled]}
                        onPress={handleUpdateStatus}
                        disabled={updating}
                    >
                        {updating ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.updateButtonText}>Update Status</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={handleEdit}
                    >
                        <Text style={styles.actionButtonText}>Edit Ticket</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    errorText: {
        ...Typography.body,
        color: Colors.light.text,
        marginBottom: Spacing.lg,
    },
    retryButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    ticketNumber: {
        ...Typography.h2,
        color: Colors.light.text,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    statusText: {
        ...Typography.bodySmall,
        fontWeight: '600',
    },
    deviceTitle: {
        ...Typography.h3,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    issueDescription: {
        ...Typography.body,
        color: Colors.light.textSecondary,
    },
    content: {
        padding: Spacing.lg,
    },
    section: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.light.text,
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    infoLabel: {
        ...Typography.body,
        color: Colors.light.textSecondary,
        flex: 1,
    },
    infoValue: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    priorityBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        alignSelf: 'flex-end',
    },
    priorityText: {
        ...Typography.bodySmall,
        fontWeight: '600',
    },
    descriptionText: {
        ...Typography.body,
        color: Colors.light.text,
        padding: Spacing.lg,
        lineHeight: 24,
    },
    inputGroup: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
    },
    label: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: Colors.light.primary,
    },
    chipText: {
        ...Typography.bodySmall,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: Colors.light.background,
    },
    textInput: {
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Typography.body,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    updateButton: {
        backgroundColor: Colors.light.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        margin: Spacing.lg,
        marginTop: Spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    updateButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    actionButton: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: Colors.light.primary,
    },
    actionButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
});