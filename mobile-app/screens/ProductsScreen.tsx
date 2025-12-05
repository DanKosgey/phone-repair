import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image_url?: string;
}

export default function ProductsScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

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
        >
            <View style={styles.header}>
                <Text style={styles.title}>Shop Products</Text>
                <Text style={styles.subtitle}>Quality phone accessories and parts</Text>
            </View>

            <View style={styles.productsGrid}>
                {products.map((product) => (
                    <View key={product.id} style={styles.productCard}>
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
                        </View>

                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {product.name}
                            </Text>
                            <Text style={styles.productDescription} numberOfLines={2}>
                                {product.description}
                            </Text>
                            <View style={styles.productFooter}>
                                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                                <Text style={styles.productStock}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {products.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No products available</Text>
                    <Text style={styles.emptySubtext}>Check back soon for new items!</Text>
                </View>
            )}
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
        width: '47%',
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    productImage: {
        width: '100%',
        height: 150,
        backgroundColor: Colors.light.background,
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
    },
    productDescription: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
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
        ...Typography.caption,
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
});
