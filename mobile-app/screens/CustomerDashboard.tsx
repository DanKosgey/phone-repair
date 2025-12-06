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
import { useAuth } from '../hooks/useAuth';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface Ticket {
    id: string;
    ticket_number: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    issue_description: string;
    status: string;
    created_at: string;
    estimated_completion?: string;
}

export default function CustomerDashboard({ navigation }: any) {
    const { user, profile } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalTickets: 0,
        completedTickets: 0,
        inProgressTickets: 0,
    });

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        if (!user?.id) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            // Fetch tickets
            const { data: ticketsData, error: ticketsError } = await supabase
                .from('tickets')
                .select('*')
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false });

            if (ticketsError) throw ticketsError;

            // Calculate stats
            const totalTickets = ticketsData?.length || 0;
            const completedTickets = ticketsData?.filter(t => t.status === 'completed').length || 0;
            const inProgressTickets = ticketsData?.filter(t => 
                t.status === 'in_progress' || 
                t.status === 'repairing' || 
                t.status === 'diagnosing'
            ).length || 0;

            setStats({
                totalTickets,
                completedTickets,
                inProgressTickets,
            });

            // Set recent tickets (limit to 5)
            setTickets(ticketsData?.slice(0, 5) || []);
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
            case 'received':
                return Colors.light.warning;
            case 'in_progress':
            case 'repairing':
            case 'diagnosing':
                return Colors.light.info;
            case 'completed':
                return Colors.light.success;
            case 'cancelled':
                return Colors.light.error;
            case 'ready':
                return '#8b5cf6'; // violet
            default:
                return Colors.light.textSecondary;
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
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
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.name}>{profile?.full_name || 'User'}!</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsSection}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalTickets}</Text>
                    <Text style={styles.statLabel}>Total Tickets</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.inProgressTickets}</Text>
                    <Text style={styles.statLabel}>In Progress</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.completedTickets}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Track')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: Colors.light.primary + '20' }]}>
                            <Text style={styles.actionEmoji}>🔍</Text>
                        </View>
                        <Text style={styles.actionText}>Track Repair</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Products')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: Colors.light.secondary + '20' }]}>
                            <Text style={styles.actionEmoji}>🛍️</Text>
                        </View>
                        <Text style={styles.actionText}>Shop Products</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Marketplace')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: Colors.light.info + '20' }]}>
                            <Text style={styles.actionEmoji}>♻️</Text>
                        </View>
                        <Text style={styles.actionText}>Marketplace</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: Colors.light.warning + '20' }]}>
                            <Text style={styles.actionEmoji}>👤</Text>
                        </View>
                        <Text style={styles.actionText}>My Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Repairs</Text>
                    {tickets.length > 0 && (
                        <TouchableOpacity onPress={() => navigation.navigate('Track')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>
                
                {tickets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No repair tickets yet</Text>
                        <Text style={styles.emptySubtext}>
                            Visit our shop to create your first repair ticket
                        </Text>
                    </View>
                ) : (
                    tickets.map((ticket) => (
                        <View key={ticket.id} style={styles.ticketCard}>
                            <View style={styles.ticketHeader}>
                                <Text style={styles.ticketNumber}>#{ticket.ticket_number}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                                        {formatStatus(ticket.status)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.ticketDevice}>
                                {ticket.device_brand} {ticket.device_model}
                            </Text>
                            <Text style={styles.ticketIssue} numberOfLines={2}>
                                {ticket.issue_description}
                            </Text>
                            <Text style={styles.ticketDate}>
                                Created: {new Date(ticket.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    ))
                )}
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
        backgroundColor: Colors.light.background,
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.light.primary,
    },
    greeting: {
        ...Typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    name: {
        ...Typography.h1,
        color: '#fff',
    },
    statsSection: {
        flexDirection: 'row',
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    statValue: {
        ...Typography.h2,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    quickActions: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    actionCard: {
        width: '47%',
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    actionIcon: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    actionEmoji: {
        fontSize: 30,
    },
    actionText: {
        ...Typography.bodySmall,
        color: Colors.light.text,
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        padding: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    viewAllText: {
        ...Typography.bodySmall,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    emptyState: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    emptySubtext: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    ticketCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    ticketHeader: {
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
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    ticketDevice: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    ticketIssue: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
    },
    ticketDate: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
});