

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    category: string;
    image_url?: string;
    created_at: string;
    type: 'product';
}

interface SecondHandProduct {
    id: string;
    description: string;
    condition: 'Like New' | 'Good' | 'Fair';
    price: number;
    is_available: boolean;
    seller_name: string;
    image_url?: string;
    created_at: string;
    type: 'secondhand';
}

type CombinedProduct = Product | SecondHandProduct;

export default function AdminProductsScreen({ navigation }: any) {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState<CombinedProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<CombinedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'product' | 'secondhand'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showFilters, setShowFilters] = useState(false);

    // Reload products when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Fetch regular products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .is('deleted_at', null)
                .order('name');

            if (productsError) throw productsError;
            
            // Fetch second-hand products
            const { data: secondHandData, error: secondHandError } = await supabase
                .from('second_hand_products')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (secondHandError) throw secondHandError;
            
            // Combine products with type identifiers
            const regularProducts: CombinedProduct[] = (productsData || []).map(product => ({
                ...product,
                type: 'product'
            }));
            
            const secondHandProducts: CombinedProduct[] = (secondHandData || []).map(product => ({
                ...product,
                type: 'secondhand'
            }));
            
            // Combine both arrays
            const allProducts = [...regularProducts, ...secondHandProducts];
            
            setProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            Alert.alert('Error', 'Failed to fetch products');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Apply filters and sorting
    useEffect(() => {
        let result = [...products];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(product => {
                if (product.type === 'product') {
                    const prod = product as Product;
                    return prod.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prod.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prod.category?.toLowerCase().includes(searchQuery.toLowerCase());
                } else {
                    const shProd = product as SecondHandProduct;
                    return shProd.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shProd.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shProd.seller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           shProd.condition?.toLowerCase().includes(searchQuery.toLowerCase());
                }
            });
        }

        // Apply product type filter
        if (productTypeFilter !== 'all') {
            result = result.filter(product => product.type === productTypeFilter);
        }

        // Apply sorting
        result.sort((a, b) => {
            let aValue: any, bValue: any;
            switch (sortBy) {
                case 'name':
                    if (a.type === 'product') {
                        aValue = (a as Product).name?.toLowerCase() || '';
                    } else {
                        aValue = (a as SecondHandProduct).description?.toLowerCase() || '';
                    }
                    
                    if (b.type === 'product') {
                        bValue = (b as Product).name?.toLowerCase() || '';
                    } else {
                        bValue = (b as SecondHandProduct).description?.toLowerCase() || '';
                    }
                    break;
                case 'price':
                    aValue = a.price || 0;
                    bValue = b.price || 0;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                default:
                    if (a.type === 'product') {
                        aValue = (a as Product).name?.toLowerCase() || '';
                    } else {
                        aValue = (a as SecondHandProduct).description?.toLowerCase() || '';
                    }
                    
                    if (b.type === 'product') {
                        bValue = (b as Product).name?.toLowerCase() || '';
                    } else {
                        bValue = (b as SecondHandProduct).description?.toLowerCase() || '';
                    }
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredProducts(result);
    }, [searchQuery, productTypeFilter, sortBy, products]);

    const getStatusInfo = (product: CombinedProduct) => {
        if (product.type === 'product') {
            const prod = product as Product;
            const stock = prod.stock_quantity ?? 0;
            if (stock === 0) return { text: 'Out of Stock', color: '#ef4444' };
            if (stock <= 5) return { text: 'Low Stock', color: '#f59e0b' };
            return { text: 'In Stock', color: '#10b981' };
        } else {
            const shProd = product as SecondHandProduct;
            if (shProd.is_available) return { text: 'Available', color: '#10b981' };
            return { text: 'Sold', color: '#ef4444' };
        }
    };

    const handleDelete = (product: CombinedProduct) => {
        if (product.type === 'product') {
            Alert.alert(
                'Delete Product',
                'Are you sure you want to delete this product?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const { error } = await supabase
                                    .from('products')
                                    .update({ deleted_at: new Date().toISOString() })
                                    .eq('id', product.id);

                                if (error) throw error;
                                Alert.alert('Success', 'Product deleted successfully');
                                fetchProducts();
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete product');
                            }
                        },
                    },
                ]
            );
        } else {
            Alert.alert(
                'Delete Second-Hand Product',
                'Are you sure you want to delete this second-hand product?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const { error } = await supabase
                                    .from('second_hand_products')
                                    .update({ deleted_at: new Date().toISOString() })
                                    .eq('id', product.id);

                                if (error) throw error;
                                Alert.alert('Success', 'Second-hand product deleted successfully');
                                fetchProducts();
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete second-hand product');
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleAddProduct = () => {
        // Show action sheet to choose product type
        Alert.alert(
            'Add Product',
            'What type of product would you like to add?',
            [
                {
                    text: 'Regular Product',
                    onPress: () => navigation.navigate('AdminApp', { screen: 'ManageProduct' })
                },
                {
                    text: 'Second-Hand Product',
                    onPress: () => navigation.navigate('AdminApp', { screen: 'ManageSecondHandProduct' })
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const renderProductCard = ({ item }: { item: CombinedProduct }) => {
        const statusInfo = getStatusInfo(item);

        return (
            <View style={styles.productCard}>
                <View style={styles.productInfoTable}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellHeader}>Product ID</Text>
                        <Text style={styles.tableCellValue} numberOfLines={1}>{item.id}</Text>
                    </View>
                    
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellHeader}>Name</Text>
                        <Text style={styles.tableCellValue} numberOfLines={1}>
                            {item.type === 'product' ? (item as Product).name : (item as SecondHandProduct).description}
                        </Text>
                    </View>
                    
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellHeader}>Description</Text>
                        <Text style={styles.tableCellValue} numberOfLines={2}>
                            {item.type === 'product' ? (item as Product).description : (item as SecondHandProduct).seller_name}
                        </Text>
                    </View>
                    
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellHeader}>Price</Text>
                        <Text style={styles.tableCellValue}>KES {item.price?.toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellHeader}>Stock</Text>
                        <Text style={styles.tableCellValue}>
                            {item.type === 'product' 
                                ? (item as Product).stock_quantity 
                                : (item as SecondHandProduct).is_available ? 'Available' : 'Sold'}
                        </Text>
                    </View>
                    
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCellHeader}>Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.text}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            if (item.type === 'product') {
                                navigation.navigate('AdminApp', { screen: 'ManageProduct', params: { productId: item.id } });
                            } else {
                                navigation.navigate('AdminApp', { screen: 'SecondHandProductDetail', params: { id: item.id } });
                            }
                        }}
                    >
                        <MaterialIcons name="edit" size={20} color={Colors.light.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(item)}
                    >
                        <MaterialIcons name="delete" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Render header content for FlatList
    const renderHeader = () => (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Products</Text>
                        <Text style={styles.headerSubtitle}>
                            Manage inventory and second-hand items
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('ManageProduct')}
                    >
                        <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Colors.light.textSecondary}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <MaterialIcons name="close" size={20} color={Colors.light.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <View style={styles.filterBar}>
                <TouchableOpacity
                    style={styles.filterButtonStyle}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <MaterialIcons name="filter-list" size={20} color={Colors.light.primary} />
                    <Text style={styles.filterButtonTextStyle}>Filters</Text>
                </TouchableOpacity>

                <View style={styles.sortButtonsContainer}>
                    <TouchableOpacity 
                        style={styles.sortButton}
                        onPress={() => handleSort('name')}
                    >
                        <Text style={styles.sortButtonText}>Name</Text>
                        {renderSortIndicator('name')}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.sortButton}
                        onPress={() => handleSort('price')}
                    >
                        <Text style={styles.sortButtonText}>Price</Text>
                        {renderSortIndicator('price')}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.sortButton}
                        onPress={() => handleSort('created_at')}
                    >
                        <Text style={styles.sortButtonText}>Date</Text>
                        {renderSortIndicator('created_at')}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Options */}
            {showFilters && (
                <View style={styles.filterOptions}>
                    <View style={styles.filterOption}>
                        <Text style={styles.filterLabel}>Product Type</Text>
                        <View style={styles.filterButtonsContainer}>
                            {(['all', 'product', 'secondhand'] as const).map((filter) => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[
                                        styles.filterChip,
                                        productTypeFilter === filter && styles.filterChipActive,
                                    ]}
                                    onPress={() => setProductTypeFilter(filter)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            productTypeFilter === filter && styles.filterChipTextActive,
                                        ]}
                                    >
                                        {filter === 'all' ? 'All' : filter === 'product' ? 'Regular' : 'Second-Hand'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterOption}>
                        <Text style={styles.filterLabel}>Sort By</Text>
                        <View style={styles.filterButtonsContainer}>
                            {(['name', 'price', 'created_at'] as const).map((sort) => (
                                <TouchableOpacity
                                    key={sort}
                                    style={[
                                        styles.filterChip,
                                        sortBy === sort && styles.filterChipActive,
                                    ]}
                                    onPress={() => setSortBy(sort)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            sortBy === sort && styles.filterChipTextActive,
                                        ]}
                                    >
                                        {sort === 'created_at' ? 'Date' : sort.charAt(0).toUpperCase() + sort.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {/* Summary Stats */}
            <View style={styles.summaryStatsContainer}>
                <View style={styles.summaryStatCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${Colors.light.primary}20` }]}>
                        <MaterialIcons name="inventory-2" size={24} color={Colors.light.primary} />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statValue}>{products.length}</Text>
                        <Text style={styles.statLabel}>Total Products</Text>
                    </View>
                </View>
                
                <View style={styles.summaryStatCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${Colors.light.success}20` }]}>
                        <MaterialIcons name="check-circle" size={24} color={Colors.light.success} />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statValue}>
                            {products.filter(p => 
                                (p.type === 'product' && (p as Product).stock_quantity !== null && (p as Product).stock_quantity! > 5) ||
                                (p.type === 'secondhand' && (p as SecondHandProduct).is_available)
                            ).length}
                        </Text>
                        <Text style={styles.statLabel}>In Stock</Text>
                    </View>
                </View>
                
                <View style={styles.summaryStatCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${Colors.light.warning}20` }]}>
                        <MaterialIcons name="warning" size={24} color={Colors.light.warning} />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statValue}>
                            {products.filter(p => 
                                p.type === 'product' && (p as Product).stock_quantity !== null && (p as Product).stock_quantity! > 0 && (p as Product).stock_quantity! <= 5
                            ).length}
                        </Text>
                        <Text style={styles.statLabel}>Low Stock</Text>
                    </View>
                </View>
                
                <View style={styles.summaryStatCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${Colors.light.error}20` }]}>
                        <MaterialIcons name="cancel" size={24} color={Colors.light.error} />
                    </View>
                    <View style={styles.statInfo}>
                        <Text style={styles.statValue}>
                            {products.filter(p => 
                                (p.type === 'product' && ((p as Product).stock_quantity === null || (p as Product).stock_quantity === 0)) ||
                                (p.type === 'secondhand' && !(p as SecondHandProduct).is_available)
                            ).length}
                        </Text>
                        <Text style={styles.statLabel}>Out of Stock</Text>
                    </View>
                </View>
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
            {filteredProducts.length === 0 ? (
                <View style={styles.container}>
                    {renderHeader()}
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inventory-2" size={64} color={Colors.light.border} />
                        <Text style={styles.emptyStateText}>No products found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {searchQuery ? 'Try adjusting your search' : 'Add your first product'}
                        </Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchProducts();
                            }}
                            colors={[Colors.light.primary]}
                        />
                    }
                    ListHeaderComponent={renderHeader}
                    scrollEnabled
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: '#fff',
        opacity: 0.9,
        marginTop: Spacing.xs,
    },
    homeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
        paddingVertical: Spacing.xs,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    sortButtonsContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    sortButtonText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
    },
    sortIndicator: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.primary,
        marginLeft: Spacing.xs,
    },
    filterOptions: {
        backgroundColor: Colors.light.surface,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    filterOption: {
        marginBottom: Spacing.md,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
        marginBottom: Spacing.sm,
    },
    filterButtonStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    filterButtonTextStyle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
        marginLeft: Spacing.xs,
    },
    filterChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    filterChipActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
    },
    filterChipTextActive: {
        color: Colors.light.background,
        fontWeight: '600',
    },
    listContent: {
        padding: Spacing.md,
        gap: Spacing.md,
    },
    productCard: {
        flexDirection: 'column',
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    productInfoTable: {
        padding: Spacing.md,
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: Spacing.xs,
        alignItems: 'center',
    },
    tableCellHeader: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
        width: 90,
        marginRight: Spacing.sm,
    },
    tableCellValue: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
        letterSpacing: 0.4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        backgroundColor: Colors.light.background,
    },
    actionButton: {
        padding: Spacing.sm,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginLeft: Spacing.sm,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyStateText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    emptyStateSubtext: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.textSecondary,
    },
    summaryStatsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    summaryStatCard: {
        flex: 1,
        minWidth: 140,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    statInfo: {
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
});
