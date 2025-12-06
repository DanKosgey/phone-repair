import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock?: number;
    stock_quantity?: number;
    category: string;
    image_url?: string;
}

export default function ProductsScreen({ navigation }: any) {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Reload products when screen comes into focus (e.g. after edit)
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .is('deleted_at', null)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
            setFilteredProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleProductPress = (product: Product) => {
        if (isAdmin) {
            navigation.navigate('ManageProduct', { productId: product.id });
        } else {
            navigation.navigate('ProductDetail', { id: product.id });
        }
    };

    const handleAddProduct = () => {
        navigation.navigate('ManageProduct');
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
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={fetchProducts}
                />
            </View>
            
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Shop Products</Text>
                    <Text style={styles.subtitle}>
                        {isAdmin ? 'Manage inventory' : 'Quality phone accessories and parts'}
                    </Text>
                </View>

                <View style={styles.productsGrid}>
                    {filteredProducts.map((product) => {
                        const stockCount = product.stock_quantity ?? product.stock ?? 0;
                        return (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.productCard}
                                onPress={() => handleProductPress(product)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.productImage}>
                                    {product.image_url ? (
                                        <Image
                                            source={{ uri: product.image_url }}
                                            style={styles.image}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.placeholderImage}>
                                            <Text style={styles.placeholderText}>📱</Text>
                                        </View>
                                    )}
                                    {isAdmin && (
                                        <View style={styles.editBadge}>
                                            <Text style={styles.editBadgeText}>✎</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {product.name}
                                    </Text>
                                    <Text style={styles.productDescription} numberOfLines={2}>
                                        {product.description}
                                    </Text>
                                    <View style={styles.productFooter}>
                                        <Text style={styles.productPrice}>${product.price ? product.price.toFixed(2) : '0.00'}</Text>
                                        <Text style={styles.productStock}>
                                            {stockCount > 0 ? `${stockCount} in stock` : 'Out of stock'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {filteredProducts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No products found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
                    </View>
                )}
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
    productsGrid: {
        padding: Spacing.md,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    productCard: {
        width: '47%', // Slightly less than 50% to account for gap
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: Spacing.sm,
    },
    productImage: {
        width: '100%',
        height: 150,
        backgroundColor: Colors.light.background,
        position: 'relative',
    },
    image: {
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
    productInfo: {
        padding: Spacing.md,
    },
    productName: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        height: 40,
    },
    productDescription: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
        height: 32,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        ...Typography.body,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    productStock: {
        fontSize: 10,
        color: Colors.light.textSecondary,
    },
    emptyState: {
        padding: Spacing.xxl,
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
    editBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 4,
        borderRadius: 4,
    },
    editBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});