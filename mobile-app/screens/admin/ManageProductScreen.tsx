/* FORM COMPARISON SUMMARY
 *
 * WEB APP vs MOBILE APP PRODUCT FORM COMPARISON:
 * 
 * IMPLEMENTED FEATURES TO MATCH WEB APP:
 * 1. Category field added to match web form ✓
 * 2. Featured product toggle added ✓
 * 3. Enhanced image handling with validation and progress indicator ✓
 * 4. Comprehensive form validation similar to web app ✓
 * 5. Improved UI styling to match web app aesthetics ✓
 * 
 * FEATURES NOT IMPLEMENTED (MOBILE-SPECIFIC REASONS):
 * 1. CSRF protection - Not typically used in mobile apps
 * 2. Camera component - Using expo-image-picker instead
 * 3. Exact styling - Adapted for mobile touch interface
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function ManageProductScreen({ route, navigation }: any) {
    const { productId } = route.params || {};
    const isEditing = !!productId;

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [imageUploading, setImageUploading] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);

    useEffect(() => {
        if (isEditing) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            if (data) {
                setName(data.name);
                setCategory(data.category || '');
                setDescription(data.description || '');
                setPrice(data.price?.toString() || '');
                setStock(data.stock_quantity?.toString() || '');
                setImageUrl(data.image_url || '');
                setIsFeatured(data.is_featured || false);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to fetch product details.');
            navigation.goBack();
        } finally {
            setFetching(false);
        }
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return false;
        }
        
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
            return false;
        }
        
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadImageToSupabase(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadImageToSupabase(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const uploadImageToSupabase = async (uri: string) => {
        try {
            setImageUploading(true);
            
            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();
            
            // Validate file size (max 5MB)
            if (blob.size > 5 * 1024 * 1024) {
                Alert.alert('Error', 'Image size must be less than 5MB');
                return;
            }
            
            // Generate unique filename with product name if available
            const fileName = `product_${name ? name.replace(/\s+/g, '_').toLowerCase() : Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
            
            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from('products')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);
            
            setImageUrl(publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setImageUploading(false);
        }
    };

    const removeImage = () => {
        setImageUrl('');
    };

    const validateForm = () => {
        const errors: string[] = [];

        // Validate product name
        if (!name || name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters long');
        }

        // Validate category
        if (!category || category.trim().length < 2) {
            errors.push('Category must be at least 2 characters long');
        }

        // Validate description
        if (!description || description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        }

        // Validate price
        const priceNum = parseFloat(price);
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            errors.push('Price must be a positive number');
        }

        // Validate stock quantity
        if (stock && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
            errors.push('Stock quantity must be a non-negative number');
        }

        // Validate image (only required for new products)
        if (!isEditing && !imageUrl) {
            errors.push('Product image is required');
        }

        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        
        if (errors.length > 0) {
            Alert.alert('Validation Error', errors.join('\n'));
            return;
        }

        setLoading(true);
        try {
            const productData = {
                name: name.trim(),
                category: category.trim(),
                description: description.trim(),
                price: parseFloat(price),
                stock_quantity: parseInt(stock) || 0,
                image_url: imageUrl || null,
                is_featured: isFeatured,
                slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            };

            let error;
            if (isEditing) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([productData]);
                error = insertError;
            }

            if (error) throw error;

            Alert.alert(
                'Success',
                `Product ${isEditing ? 'updated' : 'created'} successfully!`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Error', error.message || 'Failed to save product.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { error } = await supabase
                                .from('products')
                                .delete()
                                .eq('id', productId);
                            if (error) throw error;
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete product.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (fetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.title}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
                        <Text style={styles.subtitle}>
                            {isEditing ? 'Update product information' : 'Enter product details'}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('AdminDashboard')}
                    >
                        <MaterialIcons name="home" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.form}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Product Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. iPhone 13 Screen"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Category *</Text>
                    <TextInput
                        style={styles.input}
                        value={category}
                        onChangeText={setCategory}
                        placeholder="e.g. Screens, Batteries"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, styles.half]}>
                        <Text style={styles.label}>Price ($) *</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            placeholder="0.00"
                        />
                    </View>
                    <View style={[styles.formGroup, styles.half]}>
                        <Text style={styles.label}>Stock Qty</Text>
                        <TextInput
                            style={styles.input}
                            value={stock}
                            onChangeText={setStock}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <TouchableOpacity 
                        style={[styles.checkboxContainer, isFeatured && styles.checkboxContainerSelected]}
                        onPress={() => setIsFeatured(!isFeatured)}
                    >
                        <MaterialIcons 
                            name={isFeatured ? "check-box" : "check-box-outline-blank"} 
                            size={24} 
                            color={isFeatured ? Colors.light.primary : Colors.light.textSecondary} 
                        />
                        <Text style={styles.checkboxLabel}>Featured Product</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Product Image</Text>
                    <Text style={styles.helperText}>Upload an image for this product</Text>
                    {imageUrl ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="contain" />
                            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                                <MaterialIcons name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.imageUploadContainer}>
                            <TouchableOpacity 
                                style={[styles.imageUploadButton, imageUploading && styles.buttonDisabled]}
                                onPress={pickImage}
                                disabled={imageUploading}
                            >
                                <MaterialIcons name="photo-library" size={24} color={Colors.light.primary} />
                                <Text style={styles.imageUploadText}>Choose from Library</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.imageUploadButton, imageUploading && styles.buttonDisabled]}
                                onPress={takePhoto}
                                disabled={imageUploading}
                            >
                                <MaterialIcons name="camera-alt" size={24} color={Colors.light.primary} />
                                <Text style={styles.imageUploadText}>Take Photo</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {imageUploading && (
                        <View style={styles.uploadProgress}>
                            <ActivityIndicator size="small" color={Colors.light.primary} />
                            <Text style={styles.uploadProgressText}>Uploading image...</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading || imageUploading}
                >
                    {loading || imageUploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isEditing ? 'Update Product' : 'Create Product'}
                        </Text>
                    )}
                </TouchableOpacity>

                {isEditing && (
                    <TouchableOpacity
                        style={[styles.deleteButton, loading && styles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Text style={styles.deleteButtonText}>Delete Product</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        backgroundColor: Colors.light.primary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    homeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: {
        padding: Spacing.lg,
    },
    formGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography.bodySmall,
        color: Colors.light.text,
        fontWeight: 'bold',
        marginBottom: Spacing.xs,
    },
    helperText: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    half: {
        flex: 1,
    },
    imageUploadContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    imageUploadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        gap: Spacing.sm,
    },
    imageUploadText: {
        ...Typography.bodyMedium,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    imagePreviewContainer: {
        position: 'relative',
        height: 200,
        backgroundColor: '#f1f5f9',
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.light.error,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: Colors.light.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    checkboxContainerSelected: {
        borderColor: Colors.light.primary,
        backgroundColor: `${Colors.light.primary}10`,
    },
    checkboxLabel: {
        ...Typography.bodyMedium,
        color: Colors.light.text,
        marginLeft: Spacing.sm,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#fee2e2',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    deleteButtonText: {
        color: Colors.light.error,
        fontWeight: 'bold',
        fontSize: 16,
    },
    uploadProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    uploadProgressText: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginLeft: Spacing.sm,
    },
});