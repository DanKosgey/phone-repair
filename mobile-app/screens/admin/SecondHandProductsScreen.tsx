import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

interface SecondHandProduct {
    id: string;
    description: string;
    condition: 'Like New' | 'Good' | 'Fair';
    price: number;
    is_available: boolean;
    seller_id: string;
    seller_name: string;
    seller_email: string;
    product_id: string;
    image_url?: string;
    created_at: string;
    deleted_at: string | null;
}

export default function SecondHandProductsScreen({ navigation }: any) {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState<SecondHandProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<SecondHandProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [conditionFilter, setConditionFilter] = useState<string>('all');
    const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

    // Reload products when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('second_hand_products')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
            setFilteredProducts(data || []);
        } catch (error) {
            console.error('Error fetching second-hand products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let result = [...products];
        
        // Apply search filter
        if (searchQuery) {
            result = result.filter(product => 
                product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.seller_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply condition filter
        if (conditionFilter !== 'all') {
            result = result.filter(product => product.condition === conditionFilter);
        }
        
        // Apply availability filter
        if (availabilityFilter !== 'all') {
            result = result.filter(product => 
                availabilityFilter === 'available' ? product.is_available : !product.is_available
            );
        }
        
        // Apply sorting
        if (sortConfig !== null) {
            result.sort((a, b) => {
                // @ts-ignore
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                // @ts-ignore
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        setFilteredProducts(result);
    }, [searchQuery, conditionFilter, availabilityFilter, products, sortConfig]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleAddProduct = () => {
        navigation.navigate('ManageSecondHandProduct');
    };

    const handleProductPress = (product: SecondHandProduct) => {
        navigation.navigate('SecondHandProductDetail', { id: product.id });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'KSh 0';
        return `KSh ${amount.toLocaleString()}`;
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'Like New': return Colors.light.success;
            case 'Good': return Colors.light.primary;
            case 'Fair': return Colors.light.warning;
            default: return Colors.light.textSecondary;
        }
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Calculate summary statistics
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.is_available).length;
    const soldProducts = totalProducts - availableProducts;
    const avgPrice = products.length > 0 
        ? products.reduce((sum, product) => sum + (product.price || 0), 0) / products.length 
        : 0;

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
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Second-Hand Products</Text>
                    <Text style={styles.subtitle}>
                        Manage all second-hand product listings
                    </Text>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{totalProducts}</Text>
                        <Text style={styles.summaryLabel}>Total Products</Text>
                        <Text style={styles.summarySubtext}>All listings</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{availableProducts}</Text>
                        <Text style={styles.summaryLabel}>Available</Text>
                        <Text style={styles.summarySubtext}>Products for sale</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{soldProducts}</Text>
                        <Text style={styles.summaryLabel}>Sold</Text>
                        <Text style={styles.summarySubtext}>Completed sales</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryValue}>{formatCurrency(avgPrice)}</Text>
                        <Text style={styles.summaryLabel}>Avg. Price</Text>
                        <Text style={styles.summarySubtext}>Average listing price</Text>
                    </View>
                </View>

                {/* Search and Filters */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search second-hand products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    
                    <View style={styles.filterRow}>
                        <TouchableOpacity 
                            style={[
                                styles.filterButton, 
                                conditionFilter === 'all' && styles.activeFilter
                            ]}
                            onPress={() => setConditionFilter('all')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                conditionFilter === 'all' && styles.activeFilterText
                            ]}>All Conditions</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.filterButton, 
                                conditionFilter === 'Like New' && styles.activeFilter
                            ]}
                            onPress={() => setConditionFilter('Like New')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                conditionFilter === 'Like New' && styles.activeFilterText
                            ]}>Like New</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.filterButton, 
                                conditionFilter === 'Good' && styles.activeFilter
                            ]}
                            onPress={() => setConditionFilter('Good')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                conditionFilter === 'Good' && styles.activeFilterText
                            ]}>Good</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.filterButton, 
                                conditionFilter === 'Fair' && styles.activeFilter
                            ]}
                            onPress={() => setConditionFilter('Fair')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                conditionFilter === 'Fair' && styles.activeFilterText
                            ]}>Fair</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.filterRow}>
                        <TouchableOpacity 
                            style={[
                                styles.filterButton, 
                                availabilityFilter === 'all' && styles.activeFilter
                            ]}
                            onPress={() => setAvailabilityFilter('all')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                availabilityFilter === 'all' && styles.activeFilterText
                            ]}>All Availability</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.filterButton, 
                                availabilityFilter === 'available' && styles.activeFilter
                            ]}
                            onPress={() => setAvailabilityFilter('available')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                availabilityFilter === 'available' && styles.activeFilterText
                            ]}>Available</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.filterButton, 
                                availabilityFilter === 'sold' && styles.activeFilter
                            ]}
                            onPress={() => setAvailabilityFilter('sold')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                availabilityFilter === 'sold' && styles.activeFilterText
                            ]}>Sold</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Products List */}
                <View style={styles.productsContainer}>
                    {filteredProducts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No second-hand products found</Text>
                        </View>
                    ) : (
                        <>
                            {/* Sortable Headers */}
                            <View style={styles.tableHeader}>
                                <TouchableOpacity 
                                    style={styles.tableHeaderCell}
                                    onPress={() => requestSort('id')}
                                >
                                    <Text style={styles.tableHeaderText}>Product ID</Text>
                                    {sortConfig && sortConfig.key === 'id' && (
                                        <Text style={styles.sortArrow}>
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.tableHeaderCell}
                                    onPress={() => requestSort('seller_name')}
                                >
                                    <Text style={styles.tableHeaderText}>Seller</Text>
                                    {sortConfig && sortConfig.key === 'seller_name' && (
                                        <Text style={styles.sortArrow}>
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.tableHeaderCell}
                                    onPress={() => requestSort('price')}
                                >
                                    <Text style={styles.tableHeaderText}>Price</Text>
                                    {sortConfig && sortConfig.key === 'price' && (
                                        <Text style={styles.sortArrow}>
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.tableHeaderCell}
                                    onPress={() => requestSort('condition')}
                                >
                                    <Text style={styles.tableHeaderText}>Condition</Text>
                                    {sortConfig && sortConfig.key === 'condition' && (
                                        <Text style={styles.sortArrow}>
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                
                                <View style={styles.tableHeaderCell}>
                                    <Text style={styles.tableHeaderText}>Available</Text>
                                </View>
                            </View>
                            
                            {/* Product Rows */}
                            {filteredProducts.map((product) => (
                                <TouchableOpacity
                                    key={product.id}
                                    style={styles.productRow}
                                    onPress={() => handleProductPress(product)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.productCell}>
                                        <Text style={styles.productId} numberOfLines={1}>
                                            {product.id.substring(0, 8)}...
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.productCell}>
                                        <Text style={styles.sellerName} numberOfLines={1}>
                                            {product.seller_name}
                                        </Text>
                                        <Text style={styles.sellerEmail} numberOfLines={1}>
                                            {product.seller_email}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.productCell}>
                                        <Text style={styles.productPrice}>
                                            {formatCurrency(product.price)}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.productCell}>
                                        <View style={[
                                            styles.conditionBadge,
                                            { backgroundColor: getConditionColor(product.condition) + '20' }
                                        ]}>
                                            <Text style={[
                                                styles.conditionText,
                                                { color: getConditionColor(product.condition) }
                                            ]}>
                                                {product.condition}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.productCell}>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: product.is_available ? Colors.light.success + '20' : Colors.light.error + '20' }
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: product.is_available ? Colors.light.success : Colors.light.error }
                                            ]}>
                                                {product.is_available ? 'Available' : 'Sold'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>

            {isAdmin && (
                <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            )}
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
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    title: {
        ...Typography.h2,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.light.textSecondary,
    },
    summaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    summaryCard: {
        width: '48%',
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    summaryValue: {
        ...Typography.h3,
        color: Colors.light.text,
        fontWeight: 'bold',
        marginBottom: Spacing.xs,
    },
    summaryLabel: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    summarySubtext: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
    },
    searchContainer: {
        padding: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    searchInput: {
        height: 48,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        ...Typography.body,
        marginBottom: Spacing.md,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
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
    filterButtonText: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
    },
    activeFilterText: {
        color: Colors.light.background,
    },
    productsContainer: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        paddingVertical: Spacing.sm,
    },
    tableHeaderCell: {
        flex: 1,
        paddingHorizontal: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tableHeaderText: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
    },
    sortArrow: {
        ...Typography.body,
        color: Colors.light.primary,
        marginLeft: Spacing.xs,
    },
    productRow: {
        flexDirection: 'row',
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    productCell: {
        flex: 1,
        paddingHorizontal: Spacing.sm,
    },
    productId: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        fontWeight: '600',
    },
    sellerName: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
    },
    sellerEmail: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
    },
    productPrice: {
        ...Typography.body,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    conditionBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    conditionText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    emptyState: {
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
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
        color: Colors.light.background,
        fontWeight: 'bold',
        marginTop: -2,
    },
});