import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { supabase } from '../services/supabase';
import {
    StatCard,
    QuickActionCard,
    TicketCard,
    SectionHeader,
    EmptyState,
} from '../components';
import { TicketStatusChart } from '../components/charts/TicketStatusChart';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface Stats {
    totalTickets: number;
    totalCustomers: number;
    avgTicketsPerCustomer: number;
    actionRequired: number;
    inProgress: number;
    nearCompletion: number;
    completed: number;
    pending: number;
}

interface Ticket {
    id: string;
    ticket_number: string;
    device_type: string;
    issue_description: string;
    status: string;
    created_at: string;
    customer_id: string;
    customer_name: string;
    device_brand: string;
    device_model: string;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    type: string;
    link?: string;
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AdminDashboard({ navigation }: any) {
    const [stats, setStats] = useState<Stats>({
        totalTickets: 0,
        totalCustomers: 0,
        avgTicketsPerCustomer: 0,
        actionRequired: 0,
        inProgress: 0,
        nearCompletion: 0,
        completed: 0,
        pending: 0,
    });
    const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
    const [ticketStatusData, setTicketStatusData] = useState<{status: string; count: number; color: string;}[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [timeframe, setTimeframe] = useState<Timeframe>('daily');

    // Responsive styles based on screen width
    const isSmallScreen = SCREEN_WIDTH < 350;
    const isLargeScreen = SCREEN_WIDTH > 768;

    useEffect(() => {
        fetchDashboardData();
        fetchUnreadNotifications();
        fetchRecentNotifications();
        
        // Set up interval to refresh notifications
        const interval = setInterval(() => {
            fetchUnreadNotifications();
            fetchRecentNotifications();
        }, 30000); // Every 30 seconds
        
        // Set up real-time subscription for tickets
        const ticketsChannel = supabase
            .channel('tickets-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'tickets',
                },
                (payload) => {
                    console.log('New ticket created:', payload.new);
                    // Refresh dashboard data when a new ticket is created
                    fetchDashboardData();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tickets',
                },
                (payload) => {
                    console.log('Ticket updated:', payload.new);
                    // Refresh dashboard data when a ticket is updated
                    fetchDashboardData();
                }
            )
            .subscribe();
            
        // Set up real-time subscription for notifications
        const notificationsChannel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    console.log('New notification created:', payload.new);
                    // Refresh notifications when a new one is created
                    fetchUnreadNotifications();
                    fetchRecentNotifications();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    console.log('Notification updated:', payload.new);
                    // Refresh notifications when one is updated
                    fetchUnreadNotifications();
                    fetchRecentNotifications();
                }
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(ticketsChannel);
            supabase.removeChannel(notificationsChannel);
        };
    }, [timeframe]);

    const fetchUnreadNotifications = async () => {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false);

            if (error) throw error;
            setUnreadNotifications(count || 0);
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    };

    const fetchRecentNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setRecentNotifications(data || []);
        } catch (error) {
            console.error('Error fetching recent notifications:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            // Fetch tickets
            const { data: tickets, error: ticketsError } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (ticketsError) throw ticketsError;

            // Fetch customers count
            const { count: customersCount, error: customersError } = await supabase
                .from('customers')
                .select('*', { count: 'exact', head: true });

            if (customersError) throw customersError;

            // Calculate detailed stats
            const totalTickets = tickets?.length || 0;
            const totalCustomers = customersCount || 0;
            
            // Status counts
            const actionRequired = tickets?.filter(t =>
                t.status === 'pending' || t.status === 'action_required' || t.status === 'received'
            ).length || 0;
            
            const inProgress = tickets?.filter(t => 
                t.status === 'in_progress' || t.status === 'repairing' || t.status === 'diagnosing'
            ).length || 0;
            
            const nearCompletion = tickets?.filter(t => 
                t.status === 'near_completion' || t.status === 'ready'
            ).length || 0;
            
            const completed = tickets?.filter(t => t.status === 'completed').length || 0;
            const pending = tickets?.filter(t => t.status === 'pending' || t.status === 'received').length || 0;

            setStats({
                totalTickets,
                totalCustomers,
                avgTicketsPerCustomer: totalCustomers > 0
                    ? parseFloat((totalTickets / totalCustomers).toFixed(1))
                    : 0,
                actionRequired,
                inProgress,
                nearCompletion,
                completed,
                pending,
            });

            setRecentTickets(tickets?.slice(0, 5) || []);
            
            // Prepare ticket status data for chart
            const statusData = [
                { status: 'Action Required', count: actionRequired, color: Colors.light.warning },
                { status: 'In Progress', count: inProgress, color: Colors.light.info },
                { status: 'Near Completion', count: nearCompletion, color: Colors.light.success },
                { status: 'Pending', count: pending, color: Colors.light.primary },
            ];
            setTicketStatusData(statusData);
            
            setLastRefreshed(new Date());
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
        fetchUnreadNotifications();
        fetchRecentNotifications();
    };

    const handleManualRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
        fetchUnreadNotifications();
        fetchRecentNotifications();
    };

    const handleTimeframeChange = (newTimeframe: Timeframe) => {
        setTimeframe(newTimeframe);
    };

    const renderNotificationItem = (notification: Notification) => (
        <View 
            key={notification.id} 
            style={[
                styles.notificationItem, 
                !notification.is_read && styles.unreadNotification
            ]}
        >
            <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                    {new Date(notification.created_at).toLocaleDateString()}
                </Text>
            </View>
            {!notification.is_read && <View style={styles.notificationDot} />}
        </View>
    );

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
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>Monitor and manage your shop operations</Text>
                <View style={styles.headerControls}>
                    <View style={styles.headerTopRow}>
                        <Text style={styles.lastUpdated}>
                            Last refreshed: {lastRefreshed?.toLocaleTimeString() || 'Never'}
                        </Text>
                        <TouchableOpacity 
                            style={styles.refreshButton}
                            onPress={handleManualRefresh}
                            disabled={refreshing}
                        >
                            {refreshing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.refreshButtonText}>Refresh Data</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.timeframeSelector}>
                        <Text style={styles.timeframeLabel}>Timeframe:</Text>
                        <View style={styles.timeframeButtons}>
                            {(['daily', 'weekly', 'monthly'] as Timeframe[]).map((tf) => (
                                <Text
                                    key={tf}
                                    style={[
                                        styles.timeframeButton,
                                        timeframe === tf && styles.activeTimeframeButton
                                    ]}
                                    onPress={() => handleTimeframeChange(tf)}
                                >
                                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            {/* Overview Metrics */}
            <View style={styles.section}>
                <SectionHeader title="Overview Metrics" icon="📊" />
                <View style={[styles.metricsGrid, isLargeScreen && styles.metricsGridLarge]}>
                    <View style={styles.metricItem}>
                        <StatCard
                            title="Tickets"
                            value={stats.totalTickets}
                            icon="🎫"
                            color={Colors.light.primary}
                            subtitle="+0% from last month"
                        />
                    </View>
                    <View style={styles.metricItem}>
                        <StatCard
                            title="Customers"
                            value={stats.totalCustomers}
                            icon="👥"
                            color={Colors.light.secondary}
                            subtitle="+0% from last month"
                        />
                    </View>
                    <View style={styles.metricItem}>
                        <StatCard
                            title="Avg Tickets/Customer"
                            value={stats.avgTicketsPerCustomer}
                            icon="📈"
                            color={Colors.light.info}
                        />
                    </View>
                    <View style={styles.metricItem}>
                        <StatCard
                            title="Completed"
                            value={stats.completed}
                            icon="✅"
                            color={Colors.light.success}
                        />
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <SectionHeader title="Quick Actions" icon="⚡" subtitle="Add new tickets, products, or customers quickly" />
                <View style={[styles.quickActionsGrid, isLargeScreen && styles.quickActionsGridLarge]}>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="New Ticket"
                            icon="🎫"
                            color={Colors.light.primary}
                            onPress={() => navigation.navigate('CreateTicket')}
                        />
                    </View>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="Add Product"
                            icon="📦"
                            color={Colors.light.secondary}
                            onPress={() => navigation.navigate('ManageProduct')}
                        />
                    </View>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="New Customer"
                            icon="👤"
                            color={Colors.light.warning}
                            onPress={() => navigation.navigate('AddCustomer')}
                        />
                    </View>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="View Analytics"
                            icon="📊"
                            color={Colors.light.info}
                            onPress={() => navigation.navigate('Analytics')}
                        />
                    </View>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="Notifications"
                            icon="🔔"
                            color={Colors.light.error}
                            onPress={() => navigation.navigate('Notifications')}
                            badgeCount={unreadNotifications}
                        />
                    </View>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="View All Tickets"
                            icon="📋"
                            color={Colors.light.primary}
                            onPress={() => navigation.navigate('Tickets')}
                        />
                    </View>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="All Products"
                            icon="🛍️"
                            color={Colors.light.secondary}
                            onPress={() => navigation.navigate('Products')}
                        />
                    </View>
                    <View style={[styles.actionItem, isSmallScreen && styles.actionItemSmall]}>
                        <QuickActionCard
                            title="Settings"
                            icon="⚙️"
                            color={Colors.light.textSecondary}
                            onPress={() => navigation.navigate('Settings')}
                        />
                    </View>
                </View>
            </View>

            {/* Notifications and Recent Tickets */}
            <View style={[styles.doubleSection, isLargeScreen && styles.doubleSectionLarge]}>
                {/* Recent Notifications */}
                <View style={[styles.sectionHalf, isLargeScreen && styles.sectionHalfLarge]}>
                    <SectionHeader
                        title="Recent Notifications"
                        icon="🔔"
                        subtitle="Customer messages and alerts"
                        actionButton={{
                            label: 'View All',
                            onPress: () => navigation.navigate('Notifications'),
                        }}
                    />
                    {recentNotifications.length > 0 ? (
                        <View style={styles.notificationsContainer}>
                            {recentNotifications.map(renderNotificationItem)}
                        </View>
                    ) : (
                        <EmptyState
                            icon="🔔"
                            title="No new notifications"
                            subtitle="You're all caught up!"
                        />
                    )}
                </View>

                {/* Recent Tickets */}
                <View style={[styles.sectionHalf, isLargeScreen && styles.sectionHalfLarge]}>
                    <SectionHeader
                        title="Recent Tickets"
                        icon="🎫"
                        subtitle="Latest repair tickets and their status"
                        actionButton={{
                            label: 'View All',
                            onPress: () => navigation.navigate('Tickets'),
                        }}
                    />
                    {recentTickets.length > 0 ? (
                        recentTickets.map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onPress={() => navigation.navigate('TicketDetail', { id: ticket.id })}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="🎫"
                            title="No tickets found"
                            subtitle="Create your first repair ticket to get started"
                            actionButton={{
                                label: 'Create Ticket',
                                onPress: () => navigation.navigate('CreateTicket'),
                            }}
                        />
                    )}
                </View>
            </View>

            {/* Ticket Status Overview */}
            <View style={styles.section}>
                <SectionHeader
                    title="Ticket Status Overview"
                    icon="📊"
                    subtitle="Real-time insights into your service operations"
                />
                <TicketStatusChart 
                    data={ticketStatusData} 
                    title="" 
                />
            </View>

            {/* Additional Management */}
            <View style={styles.section}>
                <SectionHeader
                    title="Additional Management"
                    icon="📋"
                    subtitle="Manage your customers and products"
                />
                <View style={[styles.managementGrid, isLargeScreen && styles.managementGridLarge]}>
                    <View style={[styles.managementItem, isSmallScreen && styles.managementItemSmall]}>
                        <QuickActionCard
                            title="Add New Customer"
                            icon="👤"
                            color={Colors.light.warning}
                            onPress={() => navigation.navigate('AddCustomer')}
                            subtitle="Create a new customer profile"
                        />
                    </View>
                    <View style={[styles.managementItem, isSmallScreen && styles.managementItemSmall]}>
                        <QuickActionCard
                            title="Add New Product"
                            icon="📦"
                            color={Colors.light.secondary}
                            onPress={() => navigation.navigate('ManageProduct')}
                            subtitle="Add a new product to inventory"
                        />
                    </View>
                    <View style={[styles.managementItem, isSmallScreen && styles.managementItemSmall]}>
                        <QuickActionCard
                            title="View All Customers"
                            icon="👥"
                            color={Colors.light.primary}
                            onPress={() => navigation.navigate('Customers')}
                            subtitle="Manage existing customer profiles"
                        />
                    </View>
                    <View style={[styles.managementItem, isSmallScreen && styles.managementItemSmall]}>
                        <QuickActionCard
                            title="View All Products"
                            icon="🛍️"
                            color={Colors.light.info}
                            onPress={() => navigation.navigate('Products')}
                            subtitle="Manage product inventory"
                        />
                    </View>
                    <View style={[styles.managementItem, isSmallScreen && styles.managementItemSmall]}>
                        <QuickActionCard
                            title="Second-Hand Products"
                            icon="📱"
                            color={Colors.light.success}
                            onPress={() => navigation.navigate('SecondHand')}
                            subtitle="Manage second-hand product listings"
                        />
                    </View>
                </View>
            </View>

            {/* Business Analytics */}
            <View style={styles.section}>
                <SectionHeader
                    title="Business Analytics"
                    icon="📈"
                    subtitle="View detailed insights and performance metrics"
                />
                <View style={[styles.analyticsGrid, isLargeScreen && styles.analyticsGridLarge]}>
                    <View style={[styles.analyticsItem, isSmallScreen && styles.analyticsItemSmall]}>
                        <QuickActionCard
                            title="View Analytics Dashboard"
                            icon="📊"
                            color={Colors.light.info}
                            onPress={() => navigation.navigate('Analytics')}
                            subtitle="Comprehensive business insights"
                        />
                    </View>
                    <View style={[styles.analyticsItem, isSmallScreen && styles.analyticsItemSmall]}>
                        <QuickActionCard
                            title="Ticket Trends"
                            icon="📈"
                            color={Colors.light.primary}
                            onPress={() => navigation.navigate('Analytics')}
                            subtitle="Track ticket volume over time"
                        />
                    </View>
                    <View style={[styles.analyticsItem, isSmallScreen && styles.analyticsItemSmall]}>
                        <QuickActionCard
                            title="Revenue Analysis"
                            icon="💰"
                            color={Colors.light.success}
                            onPress={() => navigation.navigate('Analytics')}
                            subtitle="Product performance and revenue"
                        />
                    </View>
                </View>
                <View style={styles.analyticsDescription}>
                    <Text style={styles.analyticsText}>
                        Get detailed insights into your business performance and trends
                    </Text>
                </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
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
    title: {
        ...Typography.h2,
        color: '#fff',
        fontWeight: '700',
    },
    subtitle: {
        ...Typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: Spacing.xs,
    },
    headerControls: {
        marginTop: Spacing.md,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        flexWrap: 'wrap',
    },
    lastUpdated: {
        ...Typography.caption,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: Spacing.xs,
    },
    refreshButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
    },
    refreshButtonText: {
        ...Typography.caption,
        color: '#fff',
        fontWeight: '600',
    },
    timeframeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    timeframeLabel: {
        ...Typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginRight: Spacing.sm,
        fontWeight: '600',
    },
    timeframeButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    timeframeButton: {
        ...Typography.caption,
        color: 'rgba(255, 255, 255, 0.7)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.md,
        marginRight: Spacing.xs,
        marginBottom: Spacing.xs,
        overflow: 'hidden',
    },
    activeTimeframeButton: {
        color: Colors.light.primary,
        backgroundColor: '#fff',
        fontWeight: '600',
    },
    section: {
        padding: Spacing.lg,
    },
    doubleSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    doubleSectionLarge: {
        flexDirection: 'row',
    },
    sectionHalf: {
        flex: 1,
        minWidth: 300,
    },
    sectionHalfLarge: {
        flex: 1,
    },
    metricsGrid: {
        gap: Spacing.md,
    },
    metricsGridLarge: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    metricItem: {
        marginBottom: Spacing.sm,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    quickActionsGridLarge: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    actionItem: {
        width: '47%',
    },
    actionItemSmall: {
        width: '100%',
    },
    managementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    managementGridLarge: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    managementItem: {
        width: '47%',
    },
    managementItemSmall: {
        width: '100%',
    },
    analyticsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    analyticsGridLarge: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    analyticsItem: {
        width: '30%',
        minWidth: 100,
    },
    analyticsItemSmall: {
        width: '100%',
    },
    analyticsDescription: {
        marginTop: Spacing.md,
        alignItems: 'center',
    },
    analyticsText: {
        ...Typography.body,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    notificationsContainer: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: Spacing.sm,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        alignItems: 'center',
    },
    unreadNotification: {
        backgroundColor: '#f0f9ff',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...Typography.body,
        fontWeight: '600',
        marginBottom: 2,
    },
    notificationMessage: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: 2,
    },
    notificationTime: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        fontSize: 10,
    },
    notificationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.primary,
        marginLeft: Spacing.sm,
    },
    bottomSpacing: {
        height: Spacing.xl,
    },
});