import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface Stats {
    pending: number;
    in_progress: number;
    completed: number;
    total: number;
}

interface Ticket {
    id: string;
    ticket_number: string;
    device_type: string;
    status: string;
    created_at: string;
    customer_id: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ pending: 0, in_progress: 0, completed: 0, total: 0 });
    const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch all tickets
            const { data: tickets, error } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Calculate stats
            const pending = tickets?.filter(t => t.status === 'pending').length || 0;
            const in_progress = tickets?.filter(t => t.status === 'in_progress').length || 0;
            const completed = tickets?.filter(t => t.status === 'completed').length || 0;

            setStats({
                pending,
                in_progress,
                completed,
                total: tickets?.length || 0,
            });

            setRecentTickets(tickets?.slice(0, 10) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard Overview</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: Colors.light.warning + '20' }]}>
                    <Text style={styles.statNumber}>{stats.pending}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: Colors.light.info + '20' }]}>
                    <Text style={styles.statNumber}>{stats.in_progress}</Text>
                    <Text style={styles.statLabel}>In Progress</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: Colors.light.success + '20' }]}>
                    <Text style={styles.statNumber}>{stats.completed}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: Colors.light.primary + '20' }]}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Tickets</Text>
                {recentTickets.map((ticket) => (
                    <View key={ticket.id} style={styles.ticketCard}>
                        <View style={styles.ticketRow}>
                            <Text style={styles.ticketNumber}>#{ticket.ticket_number}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    {ticket.status.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.ticketDevice}>{ticket.device_type}</Text>
                        <Text style={styles.ticketDate}>
                            {new Date(ticket.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.light.primary,
    },
    title: {
        ...Typography.h2,
        color: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    statNumber: {
        ...Typography.h1,
        color: Colors.light.text,
        fontWeight: '700',
    },
    statLabel: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginTop: Spacing.xs,
    },
    section: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    ticketCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    ticketRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    ticketNumber: {
        ...Typography.body,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.light.primary + '20',
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    ticketDevice: {
        ...Typography.body,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    ticketDate: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
});
