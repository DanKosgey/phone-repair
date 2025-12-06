import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { SectionHeader, EmptyState } from '../../components';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    ticket_count: number;
}

export default function CustomersScreen({ navigation }: any) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchCustomers();
        }, [])
    );

    const fetchCustomers = async () => {
        try {
            // Fetch customers with ticket counts
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    tickets(count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to include ticket count
            const customersWithCounts = data.map((customer: any) => ({
                ...customer,
                ticket_count: customer.tickets?.count || 0
            }));

            setCustomers(customersWithCounts);
            setFilteredCustomers(customersWithCounts);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (customer.phone && customer.phone.includes(searchQuery))
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers(customers);
        }
    }, [searchQuery, customers]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCustomers();
    };

    const handleCustomerPress = (customer: Customer) => {
        // For now, we'll navigate to a customer detail screen when it's created
        // navigation.navigate('CustomerDetail', { id: customer.id });
    };

    const handleAddCustomer = () => {
        navigation.navigate('AddCustomer');
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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <SectionHeader
                        title="Customers"
                        subtitle={`Showing ${filteredCustomers.length} of ${customers.length} customers`}
                    />
                </View>

                {filteredCustomers.length === 0 ? (
                    <EmptyState
                        icon="👥"
                        title="No customers found"
                        subtitle={searchQuery ? "Try adjusting your search criteria" : "Add your first customer to get started"}
                        actionButton={
                            !searchQuery ? {
                                label: "Add Customer",
                                onPress: handleAddCustomer
                            } : undefined
                        }
                    />
                ) : (
                    <View style={styles.customersList}>
                        {filteredCustomers.map((customer) => (
                            <TouchableOpacity
                                key={customer.id}
                                style={styles.customerCard}
                                onPress={() => handleCustomerPress(customer)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.customerInfo}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {customer.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.customerDetails}>
                                        <Text style={styles.customerName} numberOfLines={1}>
                                            {customer.name}
                                        </Text>
                                        <Text style={styles.customerEmail} numberOfLines={1}>
                                            {customer.email}
                                        </Text>
                                        {customer.phone ? (
                                            <Text style={styles.customerPhone}>
                                                {customer.phone}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                                <View style={styles.customerStats}>
                                    <Text style={styles.ticketCount}>
                                        {customer.ticket_count} {customer.ticket_count === 1 ? 'ticket' : 'tickets'}
                                    </Text>
                                    <Text style={styles.lastVisit}>
                                        Joined {new Date(customer.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleAddCustomer}>
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
    searchContainer: {
        padding: Spacing.lg,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    searchInput: {
        height: 48,
        backgroundColor: Colors.light.background,
        borderRadius: 24,
        paddingHorizontal: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        ...Typography.body,
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
    customersList: {
        padding: Spacing.md,
        gap: Spacing.md,
    },
    customerCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
        fontSize: 20,
    },
    customerDetails: {
        flex: 1,
    },
    customerName: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    customerEmail: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    customerPhone: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
    },
    customerStats: {
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        paddingTop: Spacing.md,
    },
    ticketCount: {
        ...Typography.bodySmall,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    lastVisit: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: -2,
    },
});