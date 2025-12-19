import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock?: number;
    stock_quantity?: number;
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

// Memoized Product Item Component
const ProductItem = memo(({ item, onPress, isAdmin, onEdit, onDelete }: { 
    item: CombinedProduct; 
    onPress: (product: CombinedProduct) => void;
    isAdmin: boolean;
    onEdit: (product: CombinedProduct) => void;
    onDelete: (product: CombinedProduct) => void;
}) => {
    const getStatusInfo = (product: CombinedProduct) => {
        if (product.type === 'product') {
            const prod = product as Product;
            const stock = prod.stock_quantity ?? prod.stock ?? 0;
            if (stock === 0) return { text: 'Out of Stock', color: Colors.light.error };
            if (stock <= 5) return { text: 'Low Stock', color: Colors.light.warning };
            return { text: 'In Stock', color: Colors.light.success };
        } else {
            const shProd = product as SecondHandProduct;
            if (shProd.is_available) return { text: 'Available', color: Colors.light.success };
            return { text: 'Sold', color: Colors.light.error };
        }
    };

    const statusInfo = getStatusInfo(item);

    return (
        <Card 
            variant="elevated"
            padding="none"
            style={styles.productCard}
        >
            <View style={styles.imageContainer}>
                {item.image_url ? (
                    <Image 
                        source={{ uri: item.image_url }} 
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>📦</Text>
                    </View>
                )}
            </View>

            <View style={styles.productInfo}>
                {item.type === 'product' ? (
                    <>
                        <Text style={styles.productName} numberOfLines={2}>{(item as Product).name}</Text>
                        <Text style={styles.productDescription} numberOfLines={2}>{(item as Product).description}</Text>
                        <Text style={styles.productCategory}>{(item as Product).category}</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.productName} numberOfLines={2}>{(item as SecondHandProduct).description}</Text>
                        <Text style={styles.productDescription} numberOfLines={1}>{(item as SecondHandProduct).seller_name}</Text>
                        <Text style={styles.productCategory}>{(item as SecondHandProduct).condition}</Text>
                    </>
                )}

                <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>KES {(item.price || 0).toLocaleString()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.text}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardActions}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="View"
                        variant="outline"
                        size="small"
                        onPress={() => onPress(item)}
                    />
                </View>
                {isAdmin && (
                    <>
                        <View style={styles.buttonWrapper}>
                            <Button
                                title="Edit"
                                variant="ghost"
                                size="small"
                                onPress={() => onEdit(item)}
                            />
                        </View>
                        <View style={styles.buttonWrapper}>
                            <Button
                                title="Delete"
                                variant="danger"
                                size="small"
                                onPress={() => onDelete(item)}
                            />
                        </View>
                    </>
                )}
            </View>
        </Card>
    );
});

export default function ProductsScreen({ navigation }: any) {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState<CombinedProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<CombinedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'available' | 'sold'>('all');
    const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'product' | 'secondhand'>('all');

    // Reload products when screen comes into focus (e.g. after edit)
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
            setFilteredProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
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

        // Apply stock filter
        if (stockFilter !== 'all') {
            result = result.filter(product => {
                if (product.type === 'product') {
                    const prod = product as Product;
                    const stock = prod.stock_quantity ?? prod.stock ?? 0;
                    switch (stockFilter) {
                        case 'in_stock': return stock > 5;
                        case 'low_stock': return stock > 0 && stock <= 5;
                        case 'out_of_stock': return stock === 0;
                        default: return true;
                    }
                } else {
                    const shProd = product as SecondHandProduct;
                    switch (stockFilter) {
                        case 'available': return shProd.is_available;
                        case 'sold': return !shProd.is_available;
                        default: return true;
                    }
                }
            });
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
    }, [searchQuery, productTypeFilter, stockFilter, sortBy, sortOrder, products]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleProductPress = (product: CombinedProduct) => {
        if (product.type === 'product') {
            if (isAdmin) {
                navigation.navigate('AdminApp', { screen: 'ManageProduct', params: { productId: product.id } });
            } else {
                navigation.navigate('ProductDetail', { id: product.id });
            }
        } else {
            if (isAdmin) {
                navigation.navigate('AdminApp', { screen: 'SecondHandProductDetail', params: { id: product.id } });
            } else {
                navigation.navigate('MarketplaceDetail', { id: product.id });
            }
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

    const handleEditProduct = (product: CombinedProduct) => {
        if (product.type === 'product') {
            navigation.navigate('AdminApp', { screen: 'ManageProduct', params: { productId: product.id } });
        } else {
            navigation.navigate('AdminApp', { screen: 'SecondHandProductDetail', params: { id: product.id } });
        }
    };

    const handleDeleteProduct = (product: CombinedProduct) => {
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

    // Render product item for FlatList
    const renderProductItem = ({ item }: { item: CombinedProduct }) => (
        <ProductItem 
            item={item} 
            onPress={handleProductPress}
            isAdmin={isAdmin}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
        />
    );

    // Calculate statistics
    const totalProducts = products.filter(p => p.type === 'product').length;
    const totalSecondHand = products.filter(p => p.type === 'secondhand').length;
    const availableProducts = products.filter(p => {
        if (p.type === 'product') {
            const prod = p as Product;
            const stock = prod.stock_quantity ?? prod.stock ?? 0;
            return stock > 0;
        }
        return false;
    }).length;
    const availableSecondHand = products.filter(p => {
        if (p.type === 'secondhand') {
            const shProd = p as SecondHandProduct;
            return shProd.is_available;
        }
        return false;
    }).length;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Products</Text>
                    <Text style={styles.headerSubtitle}>
                        Manage inventory ({filteredProducts.length})
                    </Text>
                </View>
                {isAdmin && (
                    <Button
                        title="Add Product"
                        variant="primary"
                        size="medium"
                        onPress={handleAddProduct}
                        icon={<MaterialIcons name="add" size={20} color="#fff" />}
                    />
                )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <MaterialIcons name="search" size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={Colors.light.textSecondary}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialIcons name="close" size={20} color={Colors.light.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filters */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Type:</Text>
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
                                {filter === 'all' ? 'All Products' : 
                                 filter === 'product' ? 'New' : 'Second-Hand'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Stock:</Text>
                    {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                stockFilter === filter && styles.filterChipActive,
                            ]}
                            onPress={() => setStockFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    stockFilter === filter && styles.filterChipTextActive,
                                ]}
                            >
                                {filter === 'all' ? 'All Stock' : 
                                 filter === 'in_stock' ? 'In Stock' :
                                 filter === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Sort:</Text>
                    <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => {
                            setSortBy('name');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                    >
                        <Text style={styles.sortButtonText}>Name</Text>
                        <MaterialIcons 
                            name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                            size={16} 
                            color={Colors.light.primary} 
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => {
                            setSortBy('price');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                    >
                        <Text style={styles.sortButtonText}>Price</Text>
                        <MaterialIcons 
                            name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                            size={16} 
                            color={Colors.light.primary} 
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Statistics Cards */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.statsContainer}
                contentContainerStyle={styles.statsContent}
            >
                <Card style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <View style={[styles.statIconBackground, { backgroundColor: '#dbeafe' }]}>
                            <MaterialIcons name="inventory" size={20} color="#3b82f6" />
                        </View>
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>New Products</Text>
                        <Text style={styles.statValue}>{totalProducts}</Text>
                    </View>
                </Card>
                
                <Card style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <View style={[styles.statIconBackground, { backgroundColor: '#ddd6fe' }]}>
                            <MaterialIcons name="smartphone" size={20} color="#7c3aed" />
                        </View>
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Second-Hand</Text>
                        <Text style={styles.statValue}>{totalSecondHand}</Text>
                    </View>
                </Card>
                
                <Card style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <View style={[styles.statIconBackground, { backgroundColor: '#dcfce7' }]}>
                            <MaterialIcons name="check-circle" size={20} color="#16a34a" />
                        </View>
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Available New</Text>
                        <Text style={styles.statValue}>{availableProducts}</Text>
                    </View>
                </Card>
                
                <Card style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <View style={[styles.statIconBackground, { backgroundColor: '#fef3c7' }]}>
                            <MaterialIcons name="shopping-cart" size={20} color="#d97706" />
                        </View>
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statLabel}>Available Used</Text>
                        <Text style={styles.statValue}>{availableSecondHand}</Text>
                    </View>
                </Card>
            </ScrollView>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialIcons name="inventory-2" size={64} color={Colors.light.border} />
                    <Text style={styles.emptyStateText}>No products found</Text>
                    <Text style={styles.emptyStateSubtext}>
                        {searchQuery ? 'Try adjusting your search' : 'No products available at the moment'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={4}
                    windowSize={3}
                    initialNumToRender={6}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    headerTitle: {
        ...Typography.headlineMedium,
        color: Colors.light.primaryContrast,
        fontWeight: '700',
    },
    headerSubtitle: {
        ...Typography.bodySmall,
        color: Colors.light.primaryContrast,
        opacity: 0.9,
        marginTop: Spacing.xs,
    },
    searchContainer: {
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...Typography.bodyLarge,
        color: Colors.light.text,
        paddingVertical: Spacing.xs,
    },
    filtersContainer: {
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    filtersContent: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    filterGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },
    filterLabel: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        fontWeight: '600',
        marginRight: Spacing.sm,
    },
    filterChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginRight: Spacing.sm,
    },
    filterChipActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterChipText: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
    },
    filterChipTextActive: {
        color: Colors.light.primaryContrast,
        fontWeight: '600',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginRight: Spacing.sm,
    },
    sortButtonText: {
        ...Typography.caption,
        color: Colors.light.text,
        fontWeight: '600',
        marginRight: Spacing.xs,
    },
    statsContainer: {
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    statsContent: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    statCard: {
        width: 150,
        marginRight: Spacing.md,
        padding: Spacing.md,
    },
    statIconContainer: {
        marginBottom: Spacing.sm,
    },
    statIconBackground: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        alignItems: 'flex-start',
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    statValue: {
        ...Typography.headlineSmall,
        color: Colors.light.text,
        fontWeight: '700',
    },
    gridContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    productCard: {
        flex: 1,
        margin: Spacing.sm,
        maxWidth: '48%',
    },
    imageContainer: {
        width: '100%',
        height: 120,
    },
    productImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
    },
    placeholderText: {
        fontSize: 32,
    },
    productInfo: {
        padding: Spacing.md,
    },
    productName: {
        ...Typography.bodyLarge,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        minHeight: 40,
    },
    productDescription: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
        minHeight: 32,
    },
    productCategory: {
        ...Typography.caption,
        color: Colors.light.primary,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    productPrice: {
        ...Typography.bodyLarge,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Spacing.md,
        paddingTop: 0,
        gap: Spacing.sm,
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: Spacing.xs,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyStateText: {
        ...Typography.bodyLarge,
        color: Colors.light.text,
        fontWeight: '600',
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    emptyStateSubtext: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
});