import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const isMarketplace = route.name === 'MarketplaceDetail';

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            const table = isMarketplace ? 'second_hand_products' : 'products';
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text>Product not found</Text>
            </View>
        );
    }

    const stock = isMarketplace ? 1 : (product.stock_quantity ?? product.stock ?? 0);
    const isAvailable = isMarketplace ? product.is_available : (stock > 0);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    {product.image_url ? (
                        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>

                {/* Details */}
                <View style={styles.detailsContainer}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{product.name}</Text>
                        <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
                    </View>

                    {/* Stock / Condition Badge */}
                    <View style={styles.badges}>
                        {isMarketplace ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Second Hand</Text>
                            </View>
                        ) : (
                            <View style={[styles.badge, !isAvailable && styles.outOfStockBadge]}>
                                <Text style={styles.badgeText}>
                                    {isAvailable ? 'In Stock' : 'Out of Stock'}
                                </Text>
                            </View>
                        )}
                        {isMarketplace && product.condition && (
                            <View style={[styles.badge, styles.conditionBadge]}>
                                <Text style={styles.badgeText}>{product.condition}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.descriptionLabel}>Description</Text>
                    <Text style={styles.description}>{product.description}</Text>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.actionButton, !isAvailable && styles.disabledButton]}
                    disabled={!isAvailable}
                    onPress={() => {
                        // TODO: Implement Cart or Contact logic
                        alert(isMarketplace ? 'Contact Seller feature coming soon!' : 'Add to Cart feature coming soon!');
                    }}
                >
                    <LinearGradient
                        colors={isAvailable ? [Colors.light.primary, '#4f46e5'] : ['#ccc', '#bbb']}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.actionButtonText}>
                            {isMarketplace ? 'Contact Seller' : 'Add to Cart'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        height: 300,
        backgroundColor: '#f1f5f9',
        width: '100%',
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
    },
    placeholderText: {
        fontSize: 20,
        color: '#94a3b8',
    },
    detailsContainer: {
        padding: Spacing.xl,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: Colors.light.background,
        marginTop: -30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    name: {
        ...Typography.h2,
        flex: 1,
        marginRight: Spacing.md,
        color: Colors.light.text,
    },
    price: {
        ...Typography.h2,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    badges: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    badge: {
        backgroundColor: Colors.light.success + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    outOfStockBadge: {
        backgroundColor: Colors.light.error + '20',
    },
    conditionBadge: {
        backgroundColor: Colors.light.info + '20',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.text,
    },
    descriptionLabel: {
        ...Typography.h3,
        marginBottom: Spacing.sm,
        color: Colors.light.text,
    },
    description: {
        ...Typography.body,
        color: Colors.light.textSecondary,
        lineHeight: 24,
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        backgroundColor: Colors.light.surface,
    },
    actionButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.7,
    },
    gradientButton: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        ...Typography.body,
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
