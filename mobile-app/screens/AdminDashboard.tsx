import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Animated,
    Platform,
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

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Responsive styles based on screen width
    const isSmallScreen = SCREEN_WIDTH < 350;
    const isLargeScreen = SCREEN_WIDTH > 768;

    useEffect(() => {
        fetchDashboardData();
        fetchUnreadNotifications();
        fetchRecentNotifications();
        
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
        
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
            
            // Status counts - using new 8-status schema
            const received = tickets?.filter(t => t.status?.toLowerCase() === 'received').length || 0;
            const diagnosing = tickets?.filter(t => t.status?.toLowerCase() === 'diagnosing').length || 0;
            const awaitingParts = tickets?.filter(t => t.status?.toLowerCase() === 'awaiting_parts').length || 0;
            const repairing = tickets?.filter(t => t.status?.toLowerCase() === 'repairing').length || 0;
            const qualityCheck = tickets?.filter(t => t.status?.toLowerCase() === 'quality_check').length || 0;
            const ready = tickets?.filter(t => t.status?.toLowerCase() === 'ready').length || 0;
            const completed = tickets?.filter(t => t.status?.toLowerCase() === 'completed').length || 0;
            const cancelled = tickets?.filter(t => t.status?.toLowerCase() === 'cancelled').length || 0;
            
            // Group statuses for stat cards
            const actionRequired = received + diagnosing;
            const inProgress = awaitingParts + repairing + qualityCheck;
            const nearCompletion = ready + completed;

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
                pending: received,
            });

            setRecentTickets(tickets?.slice(0, 5) || []);
            
            // Prepare ticket status data for chart - using all 8 statuses
            const statusData = [
                { status: 'Received', count: received, color: Colors.light.warning },
                { status: 'Diagnosing', count: diagnosing, color: '#FFA500' },
                { status: 'Awaiting Parts', count: awaitingParts, color: Colors.light.info },
                { status: 'Repairing', count: repairing, color: '#FF6B6B' },
                { status: 'Quality Check', count: qualityCheck, color: '#9B59B6' },
                { status: 'Ready', count: ready, color: Colors.light.success },
                { status: 'Completed', count: completed, color: '#27AE60' },
                { status: 'Cancelled', count: cancelled, color: Colors.light.textSecondary },
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

    const renderNotificationItem = (notification: Notification, index: number) => {
        const itemFadeAnim = useRef(new Animated.Value(0)).current;
        const itemSlideAnim = useRef(new Animated.Value(20)).current;

        useEffect(() => {
            Animated.parallel([
                Animated.timing(itemFadeAnim, {
                    toValue: 1,
                    duration: 400,
                    delay: index * 100,
                    useNativeDriver: true,
                }),
                Animated.timing(itemSlideAnim, {
                    toValue: 0,
                    duration: 400,
                    delay: index * 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }, []);

        return (
            <Animated.View
                key={notification.id}
                style={[
                    styles.notificationItem,
                    !notification.is_read && styles.unreadNotification,
                    {
                        opacity: itemFadeAnim,
                        transform: [{ translateY: itemSlideAnim }],
                    },
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
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <Animated.ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Enhanced Header with Gradient */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.headerGradient} />
                    <View style={styles.headerContent}>
                        <Text style={styles.welcomeText}>Welcome back! 👋</Text>
                        <Text style={styles.title}>Admin Dashboard</Text>
                        <Text style={styles.subtitle}>Monitor and manage your shop operations</Text>
                        
                        <View style={styles.headerControls}>
                            <View style={styles.headerTopRow}>
                                <View style={styles.lastUpdatedContainer}>
                                    <Text style={styles.lastUpdatedLabel}>Last updated</Text>
                                    <Text style={styles.lastUpdated}>
                                        {lastRefreshed?.toLocaleTimeString() || 'Never'}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.refreshButton}
                                    onPress={handleManualRefresh}
                                    disabled={refreshing}
                                    activeOpacity={0.8}
                                >
                                    {refreshing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.refreshIcon}>↻</Text>
                                            <Text style={styles.refreshButtonText}>Refresh</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.timeframeSelector}>
                                <Text style={styles.timeframeLabel}>Period:</Text>
                                <View style={styles.timeframeButtons}>
                                    {(['daily', 'weekly', 'monthly'] as Timeframe[]).map((tf) => (
                                        <TouchableOpacity
                                            key={tf}
                                            style={[
                                                styles.timeframeButton,
                                                timeframe === tf && styles.activeTimeframeButton
                                            ]}
                                            onPress={() => handleTimeframeChange(tf)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.timeframeButtonText,
                                                timeframe === tf && styles.activeTimeframeButtonText
                                            ]}>
                                                {tf.charAt(0).toUpperCase() + tf.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Key Metrics Overview Cards */}
                <Animated.View
                    style={[
                        styles.section,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <SectionHeader
                        title="Key Metrics"
                        icon="📊"
                        subtitle="Your business at a glance"
                    />
                    <View style={styles.metricsGrid}>
                        <View style={styles.metricCard}>
                            <View style={[styles.metricIconContainer, { backgroundColor: '#E3F2FD' }]}>
                                <Text style={styles.metricIcon}>🎫</Text>
                            </View>
                            <View style={styles.metricInfo}>
                                <Text style={styles.metricLabel}>Total Tickets</Text>
                                <Text style={styles.metricValue}>{stats.totalTickets}</Text>
                                <View style={styles.metricTrend}>
                                    <Text style={styles.metricTrendText}>+0% this month</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.metricCard}>
                            <View style={[styles.metricIconContainer, { backgroundColor: '#F3E5F5' }]}>
                                <Text style={styles.metricIcon}>👥</Text>
                            </View>
                            <View style={styles.metricInfo}>
                                <Text style={styles.metricLabel}>Customers</Text>
                                <Text style={styles.metricValue}>{stats.totalCustomers}</Text>
                                <View style={styles.metricTrend}>
                                    <Text style={styles.metricTrendText}>+0% this month</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.metricCard}>
                            <View style={[styles.metricIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                <Text style={styles.metricIcon}>📈</Text>
                            </View>
                            <View style={styles.metricInfo}>
                                <Text style={styles.metricLabel}>Avg per Customer</Text>
                                <Text style={styles.metricValue}>{stats.avgTicketsPerCustomer}</Text>
                                <View style={styles.metricTrend}>
                                    <Text style={styles.metricTrendText}>tickets/customer</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.metricCard}>
                            <View style={[styles.metricIconContainer, { backgroundColor: '#E8F5E9' }]}>
                                <Text style={styles.metricIcon}>✅</Text>
                            </View>
                            <View style={styles.metricInfo}>
                                <Text style={styles.metricLabel}>Completed</Text>
                                <Text style={styles.metricValue}>{stats.completed}</Text>
                                <View style={styles.metricTrend}>
                                    <Text style={[styles.metricTrendText, { color: Colors.light.success }]}>
                                        Success!
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Ticket Status Overview with Enhanced Design */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Ticket Status Overview"
                        icon="📊"
                        subtitle="Real-time workflow insights"
                    />
                    
                    <View style={styles.chartContainer}>
                        <TicketStatusChart 
                            data={ticketStatusData} 
                            title="" 
                        />
                    </View>
                    
                    {/* Enhanced Status Categories with Better Visual Hierarchy */}
                    <View style={styles.statusCategoriesContainer}>
                        <TouchableOpacity 
                            style={[styles.statusCategoryCard, styles.statusActionRequired]}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'Tickets' }})}
                            activeOpacity={0.8}
                        >
                            <View style={styles.statusCardHeader}>
                                <View style={[styles.statusCardIcon, { backgroundColor: '#FFF3E0' }]}>
                                    <Text style={styles.statusCardIconText}>⚠️</Text>
                                </View>
                                <View style={styles.statusCardBadge}>
                                    <Text style={styles.statusCardBadgeText}>
                                        {ticketStatusData.filter(t => ['Received', 'Diagnosing'].includes(t.status)).reduce((sum, t) => sum + t.count, 0)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.statusCardTitle}>Action Required</Text>
                            <Text style={styles.statusCardSubtext}>Received • Diagnosing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.statusCategoryCard, styles.statusInProgress]}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'Tickets' }})}
                            activeOpacity={0.8}
                        >
                            <View style={styles.statusCardHeader}>
                                <View style={[styles.statusCardIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Text style={styles.statusCardIconText}>🔧</Text>
                                </View>
                                <View style={styles.statusCardBadge}>
                                    <Text style={styles.statusCardBadgeText}>
                                        {ticketStatusData.filter(t => ['Awaiting Parts', 'Repairing', 'Quality Check'].includes(t.status)).reduce((sum, t) => sum + t.count, 0)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.statusCardTitle}>In Progress</Text>
                            <Text style={styles.statusCardSubtext}>Parts • Repair • QC</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.statusCategoryCard, styles.statusReady]}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'Tickets' }})}
                            activeOpacity={0.8}
                        >
                            <View style={styles.statusCardHeader}>
                                <View style={[styles.statusCardIcon, { backgroundColor: '#E8F5E9' }]}>
                                    <Text style={styles.statusCardIconText}>✅</Text>
                                </View>
                                <View style={styles.statusCardBadge}>
                                    <Text style={styles.statusCardBadgeText}>
                                        {ticketStatusData.filter(t => ['Ready', 'Completed'].includes(t.status)).reduce((sum, t) => sum + t.count, 0)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.statusCardTitle}>Ready</Text>
                            <Text style={styles.statusCardSubtext}>Ready • Completed</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions Grid with Enhanced Design */}
                <View style={styles.section}>
                    <SectionHeader 
                        title="Quick Actions" 
                        icon="⚡" 
                        subtitle="Common tasks and shortcuts" 
                    />
                    <View style={styles.quickActionsGrid}>
                        <QuickActionCard
                            title="New Ticket"
                            icon="🎫"
                            color={Colors.light.primary}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'CreateTicket' })}
                        />
                        <QuickActionCard
                            title="Add Customer"
                            icon="👤"
                            color={Colors.light.secondary}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'AddCustomer' })}
                        />
                        <QuickActionCard
                            title="Add Product"
                            icon="📦"
                            color={Colors.light.warning}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'ManageProduct' })}
                        />
                        <QuickActionCard
                            title="Notifications"
                            icon="🔔"
                            color={Colors.light.error}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'Notifications' })}
                            badgeCount={unreadNotifications}
                        />
                        <QuickActionCard
                            title="Analytics"
                            icon="📊"
                            color={Colors.light.info}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'Analytics' })}
                        />
                        <QuickActionCard
                            title="Settings"
                            icon="⚙️"
                            color={Colors.light.textSecondary}
                            onPress={() => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'Settings' }})}
                        />
                    </View>
                </View>

                {/* Recent Activity Section */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Recent Activity"
                        icon="🔔"
                        subtitle="Latest updates and notifications"
                        actionButton={{
                            label: 'View All',
                            onPress: () => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'Notifications' }}),
                        }}
                    />
                    {recentNotifications.length > 0 ? (
                        <View style={styles.notificationsContainer}>
                            {recentNotifications.map((notification, index) => renderNotificationItem(notification, index))}
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
                <View style={styles.section}>
                    <SectionHeader
                        title="Recent Tickets"
                        icon="🎫"
                        subtitle="Latest repair requests"
                        actionButton={{
                            label: 'View All',
                            onPress: () => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'Tickets' }}),
                        }}
                    />
                    {recentTickets.length > 0 ? (
                        <View style={styles.ticketsContainer}>
                            {recentTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                    onPress={() => navigation.navigate('AdminApp', { 
                                        screen: 'AdminDrawer', 
                                        params: { screen: 'TicketDetail', params: { id: ticket.id } }
                                    })}
                                />
                            ))}
                        </View>
                    ) : (
                        <EmptyState
                            icon="🎫"
                            title="No tickets found"
                            subtitle="Create your first repair ticket"
                            actionButton={{
                                label: 'Create Ticket',
                                onPress: () => navigation.navigate('AdminApp', { screen: 'CreateTicket' }),
                            }}
                        />
                    )}
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </Animated.ScrollView>

            {/* Enhanced Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AdminApp', { screen: 'CreateTicket' })}
                activeOpacity={0.85}
            >
                <View style={styles.fabGradient} />
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: Spacing.md,
        ...Typography.bodyMedium,
        color: Colors.light.textSecondary,
    },

    // Enhanced Header Styles
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.light.primary,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    headerContent: {
        position: 'relative',
        zIndex: 1,
    },
    welcomeText: {
        ...Typography.bodyMedium,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: Spacing.xs,
        fontWeight: '500',
    },
    title: {
        ...Typography.headlineMedium,
        color: '#fff',
        fontWeight: '800',
        fontSize: 32,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.bodyMedium,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: Spacing.lg,
        fontWeight: '400',
    },
    headerControls: {
        marginTop: Spacing.md,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    lastUpdatedContainer: {
        flex: 1,
    },
    lastUpdatedLabel: {
        ...Typography.caption,
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        marginBottom: 2,
    },
    lastUpdated: {
        ...Typography.bodyMedium,
        color: '#fff',
        fontWeight: '600',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
    },
    refreshIcon: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '700',
    },
    refreshButtonText: {
        ...Typography.bodyMedium,
        color: '#fff',
        fontWeight: '600',
    },
    timeframeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeframeLabel: {
        ...Typography.bodyMedium,
        color: 'rgba(255, 255, 255, 0.9)',
        marginRight: Spacing.sm,
        fontWeight: '600',
    },
    timeframeButtons: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    timeframeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeframeButtonText: {
        ...Typography.caption,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    activeTimeframeButton: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    activeTimeframeButtonText: {
        color: Colors.light.primary,
        fontWeight: '700',
    },

    // Section Styles
    section: {
        padding: Spacing.lg,
    },

    // Enhanced Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginTop: Spacing.md,
    },
    metricCard: {
        flex: 1,
        minWidth: 150,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    metricIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    metricIcon: {
        fontSize: 28,
    },
    metricInfo: {
        flex: 1,
    },
    metricLabel: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: 4,
        fontWeight: '600',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricValue: {
        ...Typography.headlineMedium,
        fontWeight: '800',
        fontSize: 28,
        color: Colors.light.text,
        marginBottom: 2,
    },
    metricTrend: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricTrendText: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        fontSize: 11,
    },

    // Chart Container
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginTop: Spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },

    // Enhanced Status Categories
    statusCategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginTop: Spacing.md,
    },
    statusCategoryCard: {
        flex: 1,
        minWidth: 150,
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderLeftWidth: 4,
    },
    statusActionRequired: {
        borderLeftColor: Colors.light.warning,
    },
    statusInProgress: {
        borderLeftColor: Colors.light.info,
    },
    statusReady: {
        borderLeftColor: Colors.light.success,
    },
    statusCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statusCardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusCardIconText: {
        fontSize: 20,
    },
    statusCardBadge: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.lg,
        minWidth: 32,
        alignItems: 'center',
    },
    statusCardBadgeText: {
        ...Typography.bodyMedium,
        color: '#fff',
        fontWeight: '700',
    },
    statusCardTitle: {
        ...Typography.bodyLarge,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    statusCardSubtext: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        fontSize: 11,
    },

    // Quick Actions Grid
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginTop: Spacing.md,
    },

    // Notifications Container
    notificationsContainer: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        marginTop: Spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    unreadNotification: {
        backgroundColor: '#F0F9FF',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...Typography.bodyMedium,
        fontWeight: '700',
        marginBottom: 4,
        color: Colors.light.text,
    },
    notificationMessage: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: 4,
        lineHeight: 18,
    },
    notificationTime: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        fontSize: 11,
    },
    notificationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.primary,
        marginLeft: Spacing.sm,
    },

    // Tickets Container
    ticketsContainer: {
        marginTop: Spacing.md,
        gap: Spacing.md,
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 100,
    },

    // Enhanced FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    fabGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    fabIcon: {
        fontSize: 36,
        color: '#fff',
        fontWeight: '300',
        marginTop: -4,
    },
});