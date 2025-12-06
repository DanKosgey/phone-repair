import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { SectionHeader, EmptyState } from '../../components';

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    type: string;
    link?: string;
}

export default function NotificationsScreen({ navigation }: any) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
            setFilteredNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let result = [...notifications];
        if (filter === 'unread') {
            result = result.filter(notification => !notification.is_read);
        } else if (filter === 'read') {
            result = result.filter(notification => notification.is_read);
        }
        setFilteredNotifications(result);
    }, [filter, notifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            fetchNotifications(); // Refresh the list
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('is_read', false);

            if (error) throw error;
            fetchNotifications(); // Refresh the list
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ticket':
                return '🎫';
            case 'customer':
                return '👤';
            case 'system':
                return '⚙️';
            case 'alert':
                return '⚠️';
            default:
                return '🔔';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <SectionHeader
                        title="Notifications"
                        subtitle={`Showing ${filteredNotifications.length} of ${notifications.length} notifications`}
                        actionButton={
                            notifications.some(n => !n.is_read)
                                ? { label: 'Mark All Read', onPress: markAllAsRead }
                                : undefined
                        }
                    />
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === 'all' && styles.activeFilter
                        ]}
                        onPress={() => setFilter('all')}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === 'all' && styles.activeFilterText
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === 'unread' && styles.activeFilter
                        ]}
                        onPress={() => setFilter('unread')}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === 'unread' && styles.activeFilterText
                        ]}>
                            Unread
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filter === 'read' && styles.activeFilter
                        ]}
                        onPress={() => setFilter('read')}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === 'read' && styles.activeFilterText
                        ]}>
                            Read
                        </Text>
                    </TouchableOpacity>
                </View>

                {filteredNotifications.length === 0 ? (
                    <EmptyState
                        icon="🔔"
                        title="No notifications"
                        subtitle={
                            filter === 'unread'
                                ? "You're all caught up!"
                                : filter === 'read'
                                    ? "No read notifications yet"
                                    : "No notifications available"
                        }
                    />
                ) : (
                    <View style={styles.notificationsList}>
                        {filteredNotifications.map((notification) => (
                            <TouchableOpacity
                                key={notification.id}
                                style={[
                                    styles.notificationCard,
                                    !notification.is_read && styles.unreadNotification
                                ]}
                                onPress={() => markAsRead(notification.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.notificationHeader}>
                                    <Text style={styles.notificationIcon}>
                                        {getNotificationIcon(notification.type)}
                                    </Text>
                                    {!notification.is_read && (
                                        <View style={styles.unreadDot} />
                                    )}
                                </View>
                                <View style={styles.notificationContent}>
                                    <Text style={styles.notificationTitle}>
                                        {notification.title}
                                    </Text>
                                    <Text style={styles.notificationMessage} numberOfLines={2}>
                                        {notification.message}
                                    </Text>
                                    <Text style={styles.notificationTime}>
                                        {formatDate(notification.created_at)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: Spacing.lg,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    filterButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginRight: Spacing.sm,
    },
    activeFilter: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterText: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
    },
    activeFilterText: {
        color: Colors.light.background,
    },
    notificationsList: {
        padding: Spacing.md,
        gap: Spacing.md,
    },
    notificationCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        flexDirection: 'row',
    },
    unreadNotification: {
        backgroundColor: Colors.light.primary + '10',
        borderLeftWidth: 4,
        borderLeftColor: Colors.light.primary,
    },
    notificationHeader: {
        marginRight: Spacing.md,
        alignItems: 'center',
    },
    notificationIcon: {
        fontSize: 24,
        marginBottom: Spacing.sm,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.light.primary,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    notificationMessage: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
    },
    notificationTime: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
});