import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

export default function TrackRepairScreen() {
    const [ticketNumber, setTicketNumber] = useState('');
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!ticketNumber.trim()) {
            Alert.alert('Error', 'Please enter a ticket number');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('ticket_number', ticketNumber.trim())
                .single();

            if (error) throw error;

            if (data) {
                setTicket(data);
            } else {
                Alert.alert('Not Found', 'No ticket found with this number');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to find ticket');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return Colors.light.warning;
            case 'in_progress':
                return Colors.light.info;
            case 'completed':
                return Colors.light.success;
            default:
                return Colors.light.textSecondary;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchSection}>
                <Text style={styles.label}>Ticket Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter ticket number (e.g., TKT-001)"
                    value={ticketNumber}
                    onChangeText={setTicketNumber}
                    autoCapitalize="characters"
                />
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSearch}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Track Repair</Text>
                    )}
                </TouchableOpacity>
            </View>

            {ticket && (
                <View style={styles.resultSection}>
                    <View style={styles.resultHeader}>
                        <Text style={styles.resultTitle}>Repair Details</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ticket Number:</Text>
                        <Text style={styles.detailValue}>#{ticket.ticket_number}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Device:</Text>
                        <Text style={styles.detailValue}>{ticket.device_type}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Issue:</Text>
                        <Text style={styles.detailValue}>{ticket.issue_description}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Created:</Text>
                        <Text style={styles.detailValue}>
                            {new Date(ticket.created_at).toLocaleDateString()}
                        </Text>
                    </View>

                    {ticket.estimated_completion && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Est. Completion:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(ticket.estimated_completion).toLocaleDateString()}
                            </Text>
                        </View>
                    )}

                    {ticket.notes && (
                        <View style={styles.notesSection}>
                            <Text style={styles.detailLabel}>Notes:</Text>
                            <Text style={styles.notesText}>{ticket.notes}</Text>
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    searchSection: {
        padding: Spacing.lg,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    label: {
        ...Typography.bodySmall,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
        fontWeight: '600',
    },
    input: {
        ...Typography.body,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    button: {
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...Typography.body,
        color: '#fff',
        fontWeight: '600',
    },
    resultSection: {
        margin: Spacing.lg,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    resultTitle: {
        ...Typography.h3,
        color: Colors.light.text,
    },
    statusBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    statusText: {
        ...Typography.bodySmall,
        fontWeight: '700',
    },
    detailRow: {
        marginBottom: Spacing.md,
    },
    detailLabel: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    detailValue: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '500',
    },
    notesSection: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    notesText: {
        ...Typography.body,
        color: Colors.light.text,
        lineHeight: 24,
    },
});
