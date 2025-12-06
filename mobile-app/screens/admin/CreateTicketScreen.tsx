import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { CameraCapture } from '../../components/CameraCapture';

export default function CreateTicketScreen({ navigation }: any) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deviceType: '',
        deviceBrand: '',
        deviceModel: '',
        issueDescription: '',
        priority: 'normal',
        estimatedCompletion: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [devicePhotos, setDevicePhotos] = useState<string[]>([]);
    const [showCamera, setShowCamera] = useState(false);

    const deviceTypes = ['Smartphone', 'Tablet', 'Laptop', 'Smartwatch', 'Other'];
    const priorities = [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
    ];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.customerName.trim()) {
            Alert.alert('Error', 'Customer name is required');
            return false;
        }
        if (!formData.deviceType) {
            Alert.alert('Error', 'Device type is required');
            return false;
        }
        if (!formData.deviceBrand.trim()) {
            Alert.alert('Error', 'Device brand is required');
            return false;
        }
        if (!formData.deviceModel.trim()) {
            Alert.alert('Error', 'Device model is required');
            return false;
        }
        if (!formData.issueDescription.trim()) {
            Alert.alert('Error', 'Issue description is required');
            return false;
        }
        if (formData.issueDescription.trim().length < 10) {
            Alert.alert('Error', 'Issue description must be at least 10 characters');
            return false;
        }
        return true;
    };

    const generateTicketNumber = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TKT-${timestamp}${random}`;
    };

    const handleCameraCapture = (uri: string) => {
        // Limit to 5 photos
        if (devicePhotos.length >= 5) {
            Alert.alert('Error', 'You can only upload up to 5 photos');
            return;
        }
        
        setDevicePhotos(prev => [...prev, uri]);
        setShowCamera(false);
    };

    const removePhoto = (index: number) => {
        setDevicePhotos(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPhotosToSupabase = async (photoUris: string[]): Promise<string[]> => {
        try {
            const photoUrls: string[] = [];
            
            for (const uri of photoUris) {
                // Convert URI to blob
                const response = await fetch(uri);
                const blob = await response.blob();
                
                // Generate unique filename
                const fileName = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
                
                // Upload to Supabase storage
                const { data, error } = await supabase.storage
                    .from('ticket-photos')
                    .upload(fileName, blob, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (error) throw error;
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('ticket-photos')
                    .getPublicUrl(fileName);
                
                photoUrls.push(publicUrl);
            }
            
            return photoUrls;
        } catch (error) {
            console.error('Error uploading photos:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // First, create or find the customer
            let customerId = null;
            let { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('id')
                .eq('email', formData.customerEmail)
                .single();

            if (customerError || !customer) {
                // Create new customer
                const { data: newCustomer, error: createError } = await supabase
                    .from('customers')
                    .insert([
                        {
                            name: formData.customerName,
                            email: formData.customerEmail,
                            phone: formData.customerPhone || null,
                        }
                    ])
                    .select()
                    .single();

                if (createError) throw createError;
                customerId = newCustomer.id;
            } else {
                customerId = customer.id;
                // Update existing customer info if needed
                await supabase
                    .from('customers')
                    .update({
                        name: formData.customerName,
                        phone: formData.customerPhone || null,
                    })
                    .eq('id', customerId);
            }

            // Upload device photos if any
            let photoUrls: string[] = [];
            if (devicePhotos.length > 0) {
                photoUrls = await uploadPhotosToSupabase(devicePhotos);
            }

            // Create the ticket
            const ticketData = {
                ticket_number: generateTicketNumber(),
                customer_id: customerId,
                customer_name: formData.customerName,
                customer_email: formData.customerEmail,
                customer_phone: formData.customerPhone || '',
                device_type: formData.deviceType,
                device_brand: formData.deviceBrand,
                device_model: formData.deviceModel,
                issue_description: formData.issueDescription,
                priority: formData.priority,
                notes: formData.notes || null,
                status: 'received',
                estimated_completion_date: formData.estimatedCompletion || null,
                created_at: new Date().toISOString(),
                user_id: user?.id,
                device_photos: photoUrls.length > 0 ? photoUrls : null,
            };

            const { data, error } = await supabase
                .from('tickets')
                .insert([ticketData])
                .select()
                .single();

            if (error) throw error;

            Alert.alert(
                'Success',
                `Ticket #${data.ticket_number} created successfully!`,
                [
                    {
                        text: 'View Ticket',
                        onPress: () => navigation.replace('TicketDetail', { id: data.id }),
                    },
                    {
                        text: 'Create Another',
                        onPress: () => {
                            // Reset form
                            setFormData({
                                customerName: '',
                                customerEmail: '',
                                customerPhone: '',
                                deviceType: '',
                                deviceBrand: '',
                                deviceModel: '',
                                issueDescription: '',
                                priority: 'normal',
                                estimatedCompletion: '',
                                notes: '',
                            });
                            setDevicePhotos([]);
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error creating ticket:', error);
            Alert.alert('Error', 'Failed to create ticket: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create New Ticket</Text>
                <Text style={styles.subtitle}>Fill in the details to create a new repair ticket</Text>
            </View>

            <View style={styles.form}>
                {/* Customer Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.customerName}
                            onChangeText={(value) => handleChange('customerName', value)}
                            placeholder="Enter customer name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.customerEmail}
                            onChangeText={(value) => handleChange('customerEmail', value)}
                            placeholder="Enter customer email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.customerPhone}
                            onChangeText={(value) => handleChange('customerPhone', value)}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Device Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Device Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Device Type *</Text>
                        <View style={styles.pickerContainer}>
                            <TextInput
                                style={styles.picker}
                                value={formData.deviceType}
                                onChangeText={(value) => handleChange('deviceType', value)}
                                placeholder="Select device type"
                            />
                        </View>
                        <View style={styles.chipContainer}>
                            {deviceTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.chip,
                                        formData.deviceType === type && styles.chipSelected
                                    ]}
                                    onPress={() => handleChange('deviceType', type)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        formData.deviceType === type && styles.chipTextSelected
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.flexOne]}>
                            <Text style={styles.label}>Brand *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.deviceBrand}
                                onChangeText={(value) => handleChange('deviceBrand', value)}
                                placeholder="e.g., Apple, Samsung"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.flexOne]}>
                            <Text style={styles.label}>Model *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.deviceModel}
                                onChangeText={(value) => handleChange('deviceModel', value)}
                                placeholder="e.g., iPhone 13, Galaxy S21"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Issue Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.issueDescription}
                            onChangeText={(value) => handleChange('issueDescription', value)}
                            placeholder="Describe the issue in detail..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Additional Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.pickerContainer}>
                            <TextInput
                                style={styles.picker}
                                value={formData.priority}
                                onChangeText={(value) => handleChange('priority', value)}
                                placeholder="Select priority"
                            />
                        </View>
                        <View style={styles.chipContainer}>
                            {priorities.map((priority) => (
                                <TouchableOpacity
                                    key={priority.value}
                                    style={[
                                        styles.chip,
                                        formData.priority === priority.value && styles.chipSelected
                                    ]}
                                    onPress={() => handleChange('priority', priority.value)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        formData.priority === priority.value && styles.chipTextSelected
                                    ]}>
                                        {priority.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estimated Completion Date</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.estimatedCompletion}
                            onChangeText={(value) => handleChange('estimatedCompletion', value)}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.notes}
                            onChangeText={(value) => handleChange('notes', value)}
                            placeholder="Any additional notes..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Device Photos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Device Photos</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Take photos of the device</Text>
                        <Text style={styles.helperText}>You can take up to 5 photos of the device</Text>
                        
                        <TouchableOpacity 
                            style={styles.photoButton}
                            onPress={() => setShowCamera(true)}
                            disabled={devicePhotos.length >= 5}
                        >
                            <Text style={styles.photoButtonText}>📷 Take Photo</Text>
                        </TouchableOpacity>
                        
                        {devicePhotos.length > 0 && (
                            <View style={styles.photoPreviewContainer}>
                                {devicePhotos.map((uri, index) => (
                                    <View key={index} style={styles.photoPreviewWrapper}>
                                        <Image source={{ uri }} style={styles.photoPreview} />
                                        <TouchableOpacity 
                                            style={styles.removePhotoButton}
                                            onPress={() => removePhoto(index)}
                                        >
                                            <Text style={styles.removePhotoText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                        
                        <Text style={styles.photoCounter}>
                            {devicePhotos.length}/5 photos
                        </Text>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Ticket</Text>
                    )}
                </TouchableOpacity>
            </View>
            
            {/* Camera Modal */}
            <Modal
                visible={showCamera}
                animationType="slide"
                onRequestClose={() => setShowCamera(false)}
            >
                <CameraCapture 
                    onCapture={handleCameraCapture} 
                    onCancel={() => setShowCamera(false)} 
                />
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
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
    form: {
        padding: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.xl,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        overflow: 'hidden',
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.light.text,
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    inputGroup: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
    },
    label: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Typography.body,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },
    picker: {
        ...Typography.body,
        padding: Spacing.md,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    chipSelected: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    chipText: {
        ...Typography.bodySmall,
        color: Colors.light.text,
    },
    chipTextSelected: {
        color: Colors.light.background,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    flexOne: {
        flex: 1,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButton: {
        backgroundColor: Colors.light.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    submitButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
    helperText: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginTop: Spacing.xs,
        fontStyle: 'italic',
    },
    photoButton: {
        backgroundColor: Colors.light.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.md,
    },
    photoButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
    photoPreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    photoPreviewWrapper: {
        position: 'relative',
    },
    photoPreview: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.md,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: Colors.light.error,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removePhotoText: {
        color: Colors.light.background,
        fontSize: 12,
        fontWeight: 'bold',
    },
    photoCounter: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
});