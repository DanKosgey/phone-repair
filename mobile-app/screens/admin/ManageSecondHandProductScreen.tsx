/* SECOND-HAND PRODUCT FORM COMPARISON SUMMARY
 *
 * WEB APP vs MOBILE APP SECOND-HAND PRODUCT FORM COMPARISON:
 * 
 * IMPLEMENTED FEATURES TO MATCH WEB APP:
 * 1. Condition selection dropdown added to match web form ✓
 * 2. Availability selection dropdown added to match web form ✓
 * 3. Image preview now shows actual image instead of placeholder ✓
 * 4. Helper text added for better UX guidance ✓
 * 5. Comprehensive form validation similar to web app ✓
 * 
 * FEATURES NOT IMPLEMENTED (MOBILE-SPECIFIC REASONS):
 * 1. CSRF protection - Not typically used in mobile apps
 * 2. Camera component - Using expo-image-picker instead
 * 3. Exact styling - Adapted for mobile touch interface
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal,
    Image,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

interface SecondHandProduct {
    id?: string;
    description: string;
    condition: 'Like New' | 'Good' | 'Fair';
    price: string;
    is_available: boolean;
}

export default function ManageSecondHandProductScreen({ route, navigation }: any) {
    const { isAdmin } = useAuth();
    const { product } = route.params || {};
    const [description, setDescription] = useState(product?.description || '');
    const [condition, setCondition] = useState<'Like New' | 'Good' | 'Fair'>(product?.condition || 'Good');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
    const [imageUri, setImageUri] = useState<string | null>(product?.image_url || null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [conditionModalVisible, setConditionModalVisible] = useState(false);
    const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);

    useEffect(() => {
        // Request camera roll permissions
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const removeImage = () => {
        setImageUri(null);
        setImageFile(null);
    };

    const uploadImageToSupabase = async (uri: string): Promise<string> => {
        try {
            setUploading(true);
            
            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();
            
            // Generate unique filename
            const fileName = `secondhand_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
            
            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from('secondhand')
                .upload(fileName, blob, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('secondhand')
                .getPublicUrl(fileName);
            
            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const findOrCreateSecondHandProductRecord = async () => {
        try {
            // Search for existing "Second-hand Item" product by exact name
            const { data: existingProducts, error: searchError } = await supabase
                .from('products')
                .select('*')
                .eq('name', 'Second-hand Item')
                .limit(1);
            
            if (searchError) {
                throw new Error(`Failed to search for existing product: ${searchError.message}`);
            }
            
            if (existingProducts && existingProducts.length > 0) {
                // Use the existing product
                return existingProducts[0];
            } else {
                // Create a generic "Second-hand Item" product if it doesn't exist
                const { data: newProduct, error: createError } = await supabase
                    .from('products')
                    .insert({
                        name: "Second-hand Item",
                        description: "Generic product for second-hand listings",
                        price: 1, // Use 1 instead of 0 to satisfy the positive price constraint
                        stock_quantity: 999, // Large stock quantity since this is a generic product
                        image_url: imageUri || "", // Use uploaded image if available
                        is_featured: false,
                        category: "Second-hand",
                        slug: "second-hand-item" // Use fixed slug for the first (and only) generic product
                    })
                    .select()
                    .single();
                
                if (createError) throw createError;
                return newProduct;
            }
        } catch (error) {
            console.error('Error finding or creating second-hand product record:', error);
            throw new Error('Failed to associate with product catalog. Please try again.');
        }
    };

    const validateForm = () => {
        const errors: string[] = [];

        // Validate description
        if (!description || description.trim().length < 5) {
            errors.push('Description must be at least 5 characters long');
        }

        // Validate price
        const priceNum = parseFloat(price);
        if (!price || isNaN(priceNum) || priceNum <= 0) {
            errors.push('Price must be a positive number');
        }

        return errors;
    };

    const handleSubmit = async () => {
        if (!isAdmin) {
            Alert.alert('Error', 'Only admins can manage second-hand products');
            return;
        }

        const errors = validateForm();
        if (errors.length > 0) {
            Alert.alert('Validation Error', errors.join('\n'));
            return;
        }

        setSaving(true);

        try {
            // Upload image if provided
            let imageUrl = product?.image_url || '';
            if (imageUri && imageUri.startsWith('file:///')) {
                imageUrl = await uploadImageToSupabase(imageUri);
            }

            // Find or create a generic "Second-hand Item" product to associate with this listing
            const secondHandProductRecord = await findOrCreateSecondHandProductRecord();

            // Prepare product data with valid product_id
            const productData = {
                description: description.trim(),
                condition,
                price: Number(price),
                is_available: isAvailable,
                seller_id: (await supabase.auth.getUser()).data.user?.id || '', // Use admin user ID as seller_id
                seller_name: "Jay's Shop", // Default seller name since you're the escrow
                seller_email: (await supabase.auth.getUser()).data.user?.email || '', // Use admin email
                product_id: secondHandProductRecord.id, // Use the valid product ID
                image_url: imageUrl || '' // Add image URL if available
            };

            let result;
            if (product) {
                // Update existing second-hand product
                const { data, error } = await supabase
                    .from('second_hand_products')
                    .update(productData)
                    .eq('id', product.id)
                    .select()
                    .single();
                
                if (error) throw error;
                result = data;
                
                Alert.alert('Success', 'Second-hand product updated successfully');
            } else {
                // Create new second-hand product
                const { data, error } = await supabase
                    .from('second_hand_products')
                    .insert(productData)
                    .select()
                    .single();
                
                if (error) throw error;
                result = data;
                
                Alert.alert('Success', 'Second-hand product created successfully');
            }

            // Navigate back to second-hand products list
            navigation.goBack();
        } catch (error: any) {
            console.error('Error saving second-hand product:', error);
            let errorMessage = "Failed to save second-hand product. Please try again.";
            
            if (error.message) {
                // Provide more specific guidance for the product_id constraint issue
                if (error.message.includes('foreign key constraint') || error.message.includes('product_id')) {
                    errorMessage = "Database constraint error: The second_hand_products table requires a valid product_id that exists in the products table. Please ensure you have created a product to associate with second-hand items, or contact a developer to modify the database schema.";
                } else if (error.message.length < 100) {
                    errorMessage = error.message;
                }
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.title}>{product ? 'Edit Second-Hand Product' : 'Add New Second-Hand Product'}</Text>
                            <Text style={styles.subtitle}>
                                {product ? 'Update second-hand product details' : 'Create a new second-hand product listing'}
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

                <View style={styles.formContainer}>
                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            placeholder="Enter product description..."
                        />
                    </View>

                    {/* Condition */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Condition *</Text>
                        <TouchableOpacity 
                            style={styles.selectInput}
                            onPress={() => setConditionModalVisible(true)}
                        >
                            <Text style={styles.selectText}>{condition}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={Colors.light.textSecondary} />
                        </TouchableOpacity>
                        
                        {/* Condition Selection Modal */}
                        <Modal
                            visible={conditionModalVisible}
                            transparent={true}
                            animationType="fade"
                        >
                            <TouchableOpacity 
                                style={styles.modalOverlay}
                                onPress={() => setConditionModalVisible(false)}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Condition</Text>
                                    {(['Like New', 'Good', 'Fair'] as const).map((cond) => (
                                        <TouchableOpacity
                                            key={cond}
                                            style={styles.modalOption}
                                            onPress={() => {
                                                setCondition(cond as 'Like New' | 'Good' | 'Fair');
                                                setConditionModalVisible(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.modalOptionText,
                                                condition === cond && styles.modalOptionTextSelected
                                            ]}>
                                                {cond}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>

                    {/* Price */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price (KSh) *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            placeholder="Enter price..."
                        />
                    </View>

                    {/* Availability */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Availability *</Text>
                        <TouchableOpacity 
                            style={styles.selectInput}
                            onPress={() => setAvailabilityModalVisible(true)}
                        >
                            <Text style={styles.selectText}>{isAvailable ? 'Available' : 'Sold'}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={Colors.light.textSecondary} />
                        </TouchableOpacity>
                        
                        {/* Availability Selection Modal */}
                        <Modal
                            visible={availabilityModalVisible}
                            transparent={true}
                            animationType="fade"
                        >
                            <TouchableOpacity 
                                style={styles.modalOverlay}
                                onPress={() => setAvailabilityModalVisible(false)}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Availability</Text>
                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setIsAvailable(true);
                                            setAvailabilityModalVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalOptionText,
                                            isAvailable && styles.modalOptionTextSelected
                                        ]}>
                                            Available
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setIsAvailable(false);
                                            setAvailabilityModalVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalOptionText,
                                            !isAvailable && styles.modalOptionTextSelected
                                        ]}>
                                            Sold
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>

                    {/* Image Upload */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Product Image</Text>
                        <Text style={styles.helperText}>Upload an image for this second-hand product (optional but recommended)</Text>
                        {imageUri ? (
                            <View style={styles.imagePreviewContainer}>
                                <View style={styles.imagePreview}>
                                    {/* Show actual image if available */}
                                    {imageUri ? (
                                        <Image 
                                            source={{ uri: imageUri }} 
                                            style={styles.actualImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.imageWrapper}>
                                            <MaterialIcons name="photo" size={48} color={Colors.light.textSecondary} />
                                        </View>
                                    )}
                                    <TouchableOpacity 
                                        style={styles.removeImageButton}
                                        onPress={removeImage}
                                    >
                                        <MaterialIcons name="close" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.imageButtons}>
                                    <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                                        <MaterialIcons name="photo-library" size={20} color="#fff" />
                                        <Text style={styles.imageButtonText}>Choose Photo</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                                        <MaterialIcons name="camera-alt" size={20} color="#fff" />
                                        <Text style={styles.imageButtonText}>Take Photo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.imageUploadContainer}>
                                <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                                    <MaterialIcons name="photo-library" size={24} color={Colors.light.primary} />
                                    <Text style={styles.imageUploadText}>Choose from Library</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.imageUploadButton} onPress={takePhoto}>
                                    <MaterialIcons name="camera-alt" size={24} color={Colors.light.primary} />
                                    <Text style={styles.imageUploadText}>Take Photo</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.cancelButton, (uploading || saving) && styles.disabledButton]}
                    onPress={() => navigation.goBack()}
                    disabled={uploading || saving}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.saveButton, (uploading || saving) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={uploading || saving}
                >
                    {(uploading || saving) ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {product ? 'Update Product' : 'Create Product'}
                        </Text>
                    )}
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
    scrollView: {
        flex: 1,
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        ...Typography.headlineSmall,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.bodyMedium,
        color: Colors.light.textSecondary,
    },
    homeButton: {
        backgroundColor: Colors.light.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    formContainer: {
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography.bodyMedium,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    textInput: {
        height: 48,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        ...Typography.bodyMedium,
    },
    textArea: {
        height: 100,
        paddingTop: Spacing.md,
        textAlignVertical: 'top',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    radioButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center',
    },
    radioButtonSelected: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    radioText: {
        ...Typography.bodyMedium,
        color: Colors.light.text,
        fontWeight: '600',
    },
    radioTextSelected: {
        color: Colors.light.background,
        fontWeight: '600',
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
        alignItems: 'center',
    },
    imagePreview: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    imageWrapper: {
        width: 120,
        height: 120,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.light.error,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
        width: '100%',
    },
    imageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    imageButtonText: {
        ...Typography.bodyMedium,
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
    cancelButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        ...Typography.bodyMedium,
        color: Colors.light.text,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    saveButtonText: {
        ...Typography.bodyMedium,
        color: Colors.light.background,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    selectInput: {
        height: 48,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectText: {
        ...Typography.bodyMedium,
        color: Colors.light.text,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        width: '80%',
        maxHeight: '50%',
    },
    modalTitle: {
        ...Typography.titleLarge,
        color: Colors.light.text,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    modalOptionText: {
        ...Typography.bodyMedium,
        color: Colors.light.text,
        textAlign: 'center',
        fontWeight: '600',
    },
    modalOptionTextSelected: {
        color: Colors.light.primary,
        fontWeight: '600',
    },
    helperText: {
        ...Typography.caption,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.sm,
    },
    
    actualImage: {
        width: 120,
        height: 120,
        borderRadius: BorderRadius.md,
    },
    
});