import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

interface Product {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
    stock?: number;
    stock_quantity?: number;
    is_featured?: boolean;
}

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    showBadge?: boolean;
    accessibilityLabel?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onPress,
    showBadge = false,
    accessibilityLabel,
}) => {
    // Handle both stock (legacy) and stock_quantity (DB)
    const stockCount = product.stock_quantity ?? product.stock;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || `${product.name}, KES ${product.price}`}
            accessibilityHint="Double tap to view product details"
        >
            <View style={styles.imageContainer}>
                {product.image_url ? (
                    <Image
                        source={{ uri: product.image_url }}
                        style={styles.image}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>📱</Text>
                    </View>
                )}
                {showBadge && product.is_featured && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>⭐ Featured</Text>
                    </View>
                )}
                {stockCount !== undefined && stockCount === 0 && (
                    <View style={[styles.badge, styles.outOfStockBadge]}>
                        <Text style={styles.badgeText}>Out of Stock</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                {product.category && (
                    <Text style={styles.category}>{product.category}</Text>
                )}

                <View style={styles.footer}>
                    <Text style={styles.price}>
                        KES {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                    </Text>
                    {stockCount !== undefined && stockCount > 0 && (
                        <Text style={styles.stock}>
                            {stockCount} in stock
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 48,
    },
    badge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: Colors.light.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    outOfStockBadge: {
        backgroundColor: Colors.light.error,
    },
    badgeText: {
        ...Typography.caption,
        color: '#fff',
        fontWeight: '600',
        fontSize: 10,
    },
    content: {
        padding: Spacing.md,
    },
    name: {
        ...Typography.bodyLarge,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        minHeight: 40,
    },
    category: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        ...Typography.headlineSmall,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    stock: {
        ...Typography.caption,
        color: Colors.light.success,
    },
});