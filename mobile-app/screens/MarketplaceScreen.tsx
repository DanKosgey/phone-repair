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
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { SectionHeader, EmptyState } from '../components';

interface MarketplaceItem {
    id: string;
    description: string;
    condition: 'Like New' | 'Good' | 'Fair';
    price: number;
    is_available: boolean;
    seller_name: string;
    seller_email: string;
    image_url?: string;
    created_at: string;
}

export default function MarketplaceScreen({ navigation }: any) {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [conditionFilter, setConditionFilter] = useState<'all' | 'Like New' | 'Good' | 'Fair'>('all');

    useFocusEffect(
        useCallback(() => {
            fetchMarketplaceItems();
        }, [])
    );

    const fetchMarketplaceItems = async () => {
        try {
            const { data, error } = await supabase
                .from('second_hand_products')
                .select('*')
                .eq('is_available', true)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
            setFilteredItems(data || []);
        } catch (error) {
            console.error('Error fetching marketplace items:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let result = [...items];
        
        // Apply search filter
        if (searchQuery) {
            result = result.filter(item =>
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.seller_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply condition filter
        if (conditionFilter !== 'all') {
            result = result.filter(item => item.condition === conditionFilter);
        }
        
        setFilteredItems(result);
    }, [searchQuery, conditionFilter, items]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMarketplaceItems();
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'Like New': return Colors.light.success;
            case 'Good': return Colors.light.primary;
            case 'Fair': return Colors.light.warning;
            default: return Colors.light.textSecondary;
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'KSh 0';
        return `KSh ${amount.toLocaleString()}`;
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
                    placeholder="Search marketplace items..."
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
                        title="Second-Hand Marketplace"
                        subtitle={`Showing ${filteredItems.length} of ${items.length} items`}
                    />
                </View>

                {/* Condition Filters */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            conditionFilter === 'all' && styles.activeFilter
                        ]}
                        onPress={() => setConditionFilter('all')}
                    >
                        <Text style={[
                            styles.filterText,
                            conditionFilter === 'all' && styles.activeFilterText
                        ]}>
                            All Conditions
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            conditionFilter === 'Like New' && styles.activeFilter
                        ]}
                        onPress={() => setConditionFilter('Like New')}
                    >
                        <Text style={[
                            styles.filterText,
                            conditionFilter === 'Like New' && styles.activeFilterText
                        ]}>
                            Like New
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            conditionFilter === 'Good' && styles.activeFilter
                        ]}
                        onPress={() => setConditionFilter('Good')}
                    >
                        <Text style={[
                            styles.filterText,
                            conditionFilter === 'Good' && styles.activeFilterText
                        ]}>
                            Good
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            conditionFilter === 'Fair' && styles.activeFilter
                        ]}
                        onPress={() => setConditionFilter('Fair')}
                    >
                        <Text style={[
                            styles.filterText,
                            conditionFilter === 'Fair' && styles.activeFilterText
                        ]}>
                            Fair
                        </Text>
                    </TouchableOpacity>
                </View>

                {filteredItems.length === 0 ? (
                    <EmptyState
                        icon="📱"
                        title="No marketplace items"
                        subtitle={
                            searchQuery || conditionFilter !== 'all'
                                ? "Try adjusting your search or filter criteria"
                                : "No second-hand items available at the moment"
                        }
                    />
                ) : (
                    <View style={styles.itemsGrid}>
                        {filteredItems.map((item) => (
                            <View key={item.id} style={styles.itemCard}>
                                <View style={styles.itemImageContainer}>
                                    {item.image_url ? (
                                        <Image
                                            source={{ uri: item.image_url }}
                                            style={styles.itemImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.placeholderImage}>
                                            <Text style={styles.placeholderText}>📱</Text>
                                        </View>
                                    )}
                                </View>
                                
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemDescription} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                    
                                    <View style={styles.itemMeta}>
                                        <View style={[
                                            styles.conditionBadge,
                                            { backgroundColor: getConditionColor(item.condition) + '20' }
                                        ]}>
                                            <Text style={[
                                                styles.conditionText,
                                                { color: getConditionColor(item.condition) }
                                            ]}>
                                                {item.condition}
                                            </Text>
                                        </View>
                                        
                                        <Text style={styles.itemPrice}>
                                            {formatCurrency(item.price)}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.sellerInfo}>
                                        <Text style={styles.sellerName}>
                                            {item.seller_name}
                                        </Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    style={styles.contactButton}
                                    onPress={() => {
                                        // In a real app, this would open a contact form or chat
                                        alert(`Contact ${item.seller_name} at ${item.seller_email}`);
                                    }}
                                >
                                    <Text style={styles.contactButtonText}>Contact Seller</Text>
                                </TouchableOpacity>
                            </View>
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    filterButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
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
    itemsGrid: {
        padding: Spacing.md,
        gap: Spacing.md,
    },
    itemCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        overflow: 'hidden',
    },
    itemImageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: Colors.light.background,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.primary + '10',
    },
    placeholderText: {
        fontSize: 48,
    },
    itemInfo: {
        padding: Spacing.md,
    },
    itemDescription: {
        ...Typography.body,
        color: Colors.light.text,
        marginBottom: Spacing.sm,
        height: 40,
    },
    itemMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    conditionBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    conditionText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    itemPrice: {
        ...Typography.body,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    sellerInfo: {
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        paddingTop: Spacing.sm,
    },
    sellerName: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
    },
    contactButton: {
        backgroundColor: Colors.light.primary,
        padding: Spacing.md,
        alignItems: 'center',
    },
    contactButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
});