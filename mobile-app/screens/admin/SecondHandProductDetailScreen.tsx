import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';

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

export default function SecondHandProductDetailScreen({ route, navigation }: any) {
    const { isAdmin } = useAuth();
    const { id } = route.params;
    const [product, setProduct] = useState<SecondHandProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('second_hand_products')
                .select('*')
                .eq('id', id)
                .is('deleted_at', null)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching second-hand product:', error);
            Alert.alert('Error', 'Failed to fetch product details');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigation.navigate('ManageSecondHandProduct', { product });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this second-hand product?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: confirmDelete }
            ]
        );
    };

    const confirmDelete = async () => {
        if (!isAdmin) {
            Alert.alert('Error', 'Only admins can delete second-hand products');
            return;
        }

        setDeleting(true);

        try {
            const { error } = await supabase
                .from('second_hand_products')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            Alert.alert('Success', 'Second-hand product deleted successfully');
            navigation.goBack();
        } catch (error: any) {
            console.error('Error deleting second-hand product:', error);
            Alert.alert('Error', error.message || 'Failed to delete second-hand product');
        } finally {
            setDeleting(false);
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'KSh 0';
        return `KSh ${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'Like New': return Colors.light.success;
            case 'Good': return Colors.light.primary;
            case 'Fair': return Colors.light.warning;
            default: return Colors.light.textSecondary;
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
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <MaterialIcons name="error-outline" size={48} color={Colors.light.textSecondary} />
                    <Text style={styles.emptyText}>Product not found</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={fetchProduct}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Second-Hand Product Details</Text>
                </View>

                {/* Product Info */}
                <View style={styles.card}>
                    <View style={styles.productHeader}>
                        <View style={styles.statusBadge}>
                            <Text style={[
                                styles.statusText,
                                { color: product.is_available ? Colors.light.success : Colors.light.error }
                            ]}>
                                {product.is_available ? 'Available' : 'Sold'}
                            </Text>
                        </View>
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

                    <Text style={styles.description}>{product.description}</Text>

                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Price:</Text>
                        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Product ID:</Text>
                        <Text style={styles.detailValue}>{product.id}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Created:</Text>
                        <Text style={styles.detailValue}>{formatDate(product.created_at)}</Text>
                    </View>
                </View>

                {/* Seller Info */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Seller Information</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Name:</Text>
                        <Text style={styles.detailValue}>{product.seller_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Email:</Text>
                        <Text style={styles.detailValue}>{product.seller_email}</Text>
                    </View>
                </View>
            </ScrollView>

            {isAdmin && (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={handleEdit}
                    >
                        <MaterialIcons name="edit" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <MaterialIcons name="delete" size={20} color="#fff" />
                        )}
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
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
    },
    card: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        margin: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    statusBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    statusText: {
        ...Typography.body,
        fontWeight: '600',
    },
    conditionBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    conditionText: {
        ...Typography.body,
        fontWeight: '600',
    },
    description: {
        ...Typography.body,
        color: Colors.light.text,
        marginBottom: Spacing.lg,
        lineHeight: 24,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    priceLabel: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
    },
    price: {
        ...Typography.h2,
        color: Colors.light.primary,
        fontWeight: '700',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    detailLabel: {
        ...Typography.body,
        color: Colors.light.textSecondary,
    },
    detailValue: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: Spacing.md,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.light.text,
        marginBottom: Spacing.lg,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    retryButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: Spacing.lg,
        gap: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        backgroundColor: Colors.light.surface,
    },
    editButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        backgroundColor: Colors.light.error,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    buttonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
});