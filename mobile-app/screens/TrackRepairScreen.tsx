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
    FlatList,
} from 'react-native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Helper to format date
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function TrackRepairScreen() {
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!customerName.trim() || !phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter both your name and phone number');
            return;
        }

        // Basic validation for phone number format
        const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
        if (!phoneRegex.test(phoneNumber)) {
            Alert.alert('Error', 'Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567)');
            return;
        }

        // Basic validation for customer name (at least 2 characters)
        if (customerName.trim().length < 2) {
            Alert.alert('Error', 'Please enter a valid name (at least 2 characters)');
            return;
        }

        setLoading(true);
        setSearched(true);
        setTickets([]);

        try {
            // Search by phone number only (name is for display only)
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('customer_phone', phoneNumber.trim())
                .order('created_at', { ascending: false });

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.length > 0) {
                setTickets(data);
            } else {
                Alert.alert('No Results', 'No repair tickets found for the provided phone number.');
            }
        } catch (error: any) {
            console.error('Track error:', error);
            Alert.alert('Error', 'Failed to fetch tickets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return Colors.light.success;
            case 'in_progress':
            case 'repairing':
            case 'diagnosing': return Colors.light.info;
            case 'pending':
            case 'received': return Colors.light.warning;
            case 'cancelled': return Colors.light.error;
            case 'ready': return '#8b5cf6'; // Violet
            default: return Colors.light.textSecondary;
        }
    };

    const renderTicketCard = ({ item, index }: { item: any, index: number }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <LinearGradient
                    colors={[Colors.light.surface, '#f8fafc']}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.ticketNumber}>#{item.ticket_number}</Text>
                            <Text style={styles.deviceInfo}>{item.device_brand} {item.device_model}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {item.status?.replace('_', ' ').toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardBody}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Issue:</Text>
                            <Text style={styles.value} numberOfLines={2}>{item.issue_description}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Customer:</Text>
                            <Text style={styles.value}>{item.customer_name || 'N/A'}</Text>
                        </View>

                        <View style={styles.datesRow}>
                            <View>
                                <Text style={styles.label}>Received</Text>
                                <Text style={styles.dateValue}>{formatDate(item.created_at)}</Text>
                            </View>
                            {item.estimated_completion && (
                                <View>
                                    <Text style={[styles.label, { textAlign: 'right' }]}>Est. Completion</Text>
                                    <Text style={[styles.dateValue, { textAlign: 'right' }]}>
                                        {formatDate(item.estimated_completion)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {item.notes && (
                            <View style={styles.notesContainer}>
                                <Text style={styles.label}>Technician Notes:</Text>
                                <Text style={styles.notes}>{item.notes}</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.light.primary, '#4f46e5']}
                style={styles.headerBackground}
            >
                <Text style={styles.headerTitle}>Track Repair</Text>
                <Text style={styles.headerSubtitle}>Enter your information to track your device repair status</Text>
            </LinearGradient>

            <View style={styles.searchSection}>
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., John Smith"
                                value={customerName}
                                onChangeText={setCustomerName}
                                placeholderTextColor="#94a3b8"
                                onSubmitEditing={handleSearch}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., (555) 123-4567"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholderTextColor="#94a3b8"
                                keyboardType="phone-pad"
                                onSubmitEditing={handleSearch}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.searchButtonText}>Track Repairs</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {tickets.length > 0 ? (
                    <FlatList
                        data={tickets}
                        renderItem={renderTicketCard}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : searched && !loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🎫</Text>
                        <Text style={styles.emptyTitle}>No Tickets Found</Text>
                        <Text style={styles.emptyText}>
                            We couldn't find any repair tickets matching your phone number.
                        </Text>
                    </View>
                ) : !searched ? (
                    <View style={styles.placeholderState}>
                        <Text style={styles.placeholderIcon}>📱</Text>
                        <Text style={styles.placeholderText}>
                            Track the real-time status of your device repair
                        </Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    headerBackground: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: Spacing.lg,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    searchSection: {
        marginTop: -25,
        paddingHorizontal: Spacing.lg,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        color: Colors.light.text,
    },
    searchButton: {
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.sm,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    ticketNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.primary,
        marginBottom: 2,
    },
    deviceInfo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.light.border,
        marginVertical: Spacing.md,
    },
    cardBody: {
        gap: Spacing.sm,
    },
    row: {
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: Colors.light.text,
        lineHeight: 22,
    },
    dateValue: {
        fontSize: 15,
        color: Colors.light.text,
        fontWeight: '500',
    },
    datesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
    },
    notesContainer: {
        marginTop: Spacing.sm,
        backgroundColor: '#f1f5f9',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    notes: {
        fontSize: 14,
        color: Colors.light.text,
        fontStyle: 'italic',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        marginTop: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.light.textSecondary,
        lineHeight: 22,
    },
    placeholderState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        opacity: 0.5,
        marginTop: 40,
    },
    placeholderIcon: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    placeholderText: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.light.textSecondary,
    },
});