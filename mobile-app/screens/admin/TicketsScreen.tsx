import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { dashboardService } from '../../services/dashboard';
import { TicketCard, EmptyState, SectionHeader } from '../../components';
import { StatusSummaryCards } from '../../components/tickets/StatusSummaryCards';
import { TicketsTable } from '../../components/tickets/TicketsTable';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

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
    device_photos?: string[]; // Add device photos to the interface
}

export default function TicketsScreen({ navigation }: any) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{key: string, direction: string} | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [statusDistribution, setStatusDistribution] = useState<Array<{status: string, count: number, percentage: number}>>([]);

    const filters = [
        { id: 'all', label: 'All', count: 0 },
        { id: 'received', label: 'Received', count: 0 },
        { id: 'diagnosing', label: 'Diagnosing', count: 0 },
        { id: 'awaiting_parts', label: 'Awaiting Parts', count: 0 },
        { id: 'repairing', label: 'Repairing', count: 0 },
        { id: 'quality_check', label: 'Quality Check', count: 0 },
        { id: 'ready', label: 'Ready', count: 0 },
        { id: 'completed', label: 'Completed', count: 0 },
        { id: 'cancelled', label: 'Cancelled', count: 0 },
    ];

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        filterTickets();
        // keep local calc in case materialized view isn't available
        calculateStatusDistribution();
    }, [tickets, searchQuery, selectedFilter]);

    const fetchTickets = async () => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    *,
                    device_photos
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
            // Try fetching status distribution from materialized view for efficiency
            try {
                const res = await dashboardService.getTicketStatusDistribution();
                if (res.success && res.data) {
                    // transform to expected format
                    const transformed = (res.data as any[]).map(d => ({
                        status: d.status,
                        count: d.count,
                        percentage: d.percentage ?? (d.count / (data?.length || 1)) * 100
                    }));
                    setStatusDistribution(transformed);
                }
            } catch (err) {
                // ignore - fallback to client calc
                console.warn('Failed to fetch status distribution from materialized view, falling back to client calc', err);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const calculateStatusDistribution = () => {
        if (tickets.length === 0) {
            setStatusDistribution([]);
            return;
        }

        const statusCounts: Record<string, number> = {};
        tickets.forEach(ticket => {
            statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
        });

        const distribution = Object.keys(statusCounts).map(status => ({
            status,
            count: statusCounts[status],
            percentage: (statusCounts[status] / tickets.length) * 100
        }));

        setStatusDistribution(distribution);
    };

    const filterTickets = () => {
        let filtered = [...tickets];

        // Apply status filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === selectedFilter);
        }

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(ticket =>
                ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.device_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.device_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.issue_description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                // @ts-ignore
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                // @ts-ignore
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredTickets(filtered);
    };

    const requestSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getFilterCounts = () => {
        return filters.map(filter => ({
            ...filter,
            count: filter.id === 'all'
                ? tickets.length
                : tickets.filter(t => t.status === filter.id).length,
        }));
    };

    const handleStatusSelect = (status: string) => {
        setSelectedFilter(status);
    };

    const handleTicketPress = (ticketId: string) => {
        navigation.navigate('TicketDetail', { id: ticketId });
    };

    const handleEditTicket = (ticketId: string) => {
        // For now, navigate to ticket detail where edit functionality exists
        navigation.navigate('TicketDetail', { id: ticketId });
    };

    const handleDeleteTicket = async (ticketId: string) => {
        try {
            const { error } = await supabase
                .from('tickets')
                .delete()
                .eq('id', ticketId);

            if (error) throw error;

            // Refresh the tickets list
            fetchTickets();
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const renderFilterTab = (filter: typeof filters[0]) => {
        const isSelected = selectedFilter === filter.id;
        const filterWithCount = getFilterCounts().find(f => f.id === filter.id);

        return (
            <TouchableOpacity
                key={filter.id}
                style={[
                    styles.filterTab,
                    isSelected && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
            >
                <Text style={[
                    styles.filterTabText,
                    isSelected && styles.filterTabTextActive,
                ]}>
                    {filter.label}
                </Text>
                <View style={[
                    styles.filterBadge,
                    isSelected && styles.filterBadgeActive,
                ]}>
                    <Text style={[
                        styles.filterBadgeText,
                        isSelected && styles.filterBadgeTextActive,
                    ]}>
                        {filterWithCount?.count || 0}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Render header content for FlatList
    const renderHeader = () => (
        <View>
            {/* Header with enhanced styling */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Repair Tickets</Text>
                        <Text style={styles.subtitle}>{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'AdminDashboard' } })}
                    >
                        <MaterialIcons name="home" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerControls}>
                    <TouchableOpacity 
                        style={styles.newTicketButton}
                        onPress={() => navigation.navigate('AdminApp', { screen: 'CreateTicket' })}
                    >
                        <Text style={styles.newTicketButtonText}>+ New Ticket</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.viewModeButton}
                        onPress={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                    >
                        <Text style={styles.viewModeText}>
                            {viewMode === 'card' ? '📋 Table' : '🃏 Card'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Summary Cards */}
            {statusDistribution.length > 0 && (
                <View style={styles.statusSummaryContainer}>
                    <StatusSummaryCards 
                        data={statusDistribution} 
                        onStatusSelect={handleStatusSelect} 
                    />
                </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Colors.light.textSecondary}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearButton}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filtersList}>
                        {filters.map(filter => renderFilterTab(filter))}
                    </View>
                </ScrollView>
            </View>
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
        <View style={styles.container}>
            {viewMode === 'card' ? (
                <FlatList
                    data={filteredTickets}
                    renderItem={({ item }) => (
                        <TicketCard
                            ticket={item}
                            onPress={() => handleTicketPress(item.id)}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <EmptyState
                            icon="🎫"
                            title="No tickets found"
                            subtitle={
                                searchQuery
                                    ? 'Try adjusting your search'
                                    : selectedFilter !== 'all'
                                        ? `No ${selectedFilter.replace('_', ' ')} tickets`
                                        : 'Create your first repair ticket'
                            }
                            actionButton={
                                !searchQuery && selectedFilter === 'all'
                                    ? {
                                        label: 'Create Ticket',
                                        onPress: () => navigation.navigate('AdminApp', { screen: 'CreateTicket' }),
                                    }
                                    : undefined
                            }
                        />
                    }
                />
            ) : (
                <FlatList
                    data={filteredTickets.length > 0 ? [{}] : []}
                    renderItem={() => (
                        <TicketsTable
                            tickets={filteredTickets}
                            onTicketPress={handleTicketPress}
                            onSort={requestSort}
                            sortConfig={sortConfig}
                        />
                    )}
                    keyExtractor={() => 'table'}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <EmptyState
                            icon="🎫"
                            title="No tickets found"
                            subtitle={
                                searchQuery
                                    ? 'Try adjusting your search'
                                    : selectedFilter !== 'all'
                                        ? `No ${selectedFilter.replace('_', ' ')} tickets`
                                        : 'Create your first repair ticket'
                            }
                            actionButton={
                                !searchQuery && selectedFilter === 'all'
                                    ? {
                                        label: 'Create Ticket',
                                        onPress: () => navigation.navigate('AdminApp', { screen: 'CreateTicket' }),
                                    }
                                    : undefined
                            }
                        />
                    }
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AdminApp', { screen: 'CreateTicket' })}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
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
        backgroundColor: Colors.light.primary,
        padding: Spacing.lg,
        paddingTop: Spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        ...Typography.headlineSmall,
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.bodyMedium,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    homeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    headerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.md,
    },

    viewModeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
    },
    viewModeText: {
        ...Typography.caption,
        color: '#fff',
        fontWeight: '600',
    },
    newTicketButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
    },
    newTicketButtonText: {
        ...Typography.caption,
        color: '#fff',
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...Typography.bodyMedium,
        color: Colors.light.text,
        paddingVertical: Spacing.sm,
    },
    clearButton: {
        ...Typography.bodyMedium,
        color: Colors.light.textSecondary,
        padding: Spacing.xs,
    },
    statusSummaryContainer: {
        padding: Spacing.lg,
        paddingBottom: 0,
    },
    filtersContainer: {
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    filtersList: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    filterTabActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterTabText: {
        ...Typography.bodySmall,
        color: Colors.light.text,
        fontWeight: '600',
        marginRight: Spacing.xs,
    },
    filterTabTextActive: {
        color: '#fff',
    },
    filterBadge: {
        backgroundColor: Colors.light.border,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        minWidth: 24,
        alignItems: 'center',
    },
    filterBadgeActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    filterBadgeText: {
        ...Typography.caption,
        color: Colors.light.text,
        fontWeight: '700',
        fontSize: 11,
    },
    filterBadgeTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: Spacing.lg,
    },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
});