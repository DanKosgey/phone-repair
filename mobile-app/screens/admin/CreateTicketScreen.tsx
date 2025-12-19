import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, Image, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { CameraCapture } from '../../components/CameraCapture';
import { CustomerSearch } from '../../components/tickets/CustomerSearch';
import { CustomerModal } from '../../components/tickets/CustomerModal';
import { uploadPhoto, uploadMultiplePhotos } from '../../utils/photoUpload';
import { getCustomerById } from '../../services/customers';

const DEVICE_TYPES = ['Smartphone', 'Tablet', 'Laptop', 'Other'];
const PRIORITIES = [
    { label: 'Low', value: 'low', color: '#10B981' },
    { label: 'Normal', value: 'normal', color: '#3B82F6' },
    { label: 'Urgent', value: 'urgent', color: '#EF4444' }
];

export default function CreateTicketScreen({ navigation }: any) {
    const { user } = useAuth();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [devicePhotos, setDevicePhotos] = useState<string[]>([]);
    const [showCamera, setShowCamera] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    const [formData, setFormData] = useState({
        deviceType: '',
        deviceBrand: '',
        deviceModel: '',
        issueDescription: '',
        priority: 'normal',
        estimatedCost: '', // Add estimated cost field
    });

    // --- Validation Logic ---
    const isFormValid = !!(customer && formData.deviceType && formData.deviceBrand && formData.deviceModel && formData.issueDescription);

    const getButtonLabel = () => {
        if (loading) return "Processing...";
        if (!customer) return "Select Customer";
        if (!formData.deviceType) return "Select Device Type";
        if (!formData.deviceBrand || !formData.deviceModel) return "Enter Device Info";
        if (!formData.issueDescription) return "Describe the Issue";
        return "Create Ticket";
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!isFormValid) {
            Alert.alert("Incomplete Form", "Please fill in all required fields marked with *");
            return;
        }

        setLoading(true);
        try {
            console.log('[CREATE_TICKET] Starting ticket creation process');
            console.log('[CREATE_TICKET] Customer data:', customer); // Add this line to log customer data
            
            // Fetch complete customer data to ensure we have all fields
            console.log('[CREATE_TICKET] Fetching complete customer data');
            const completeCustomer = await getCustomerById(customer.id);
            console.log('[CREATE_TICKET] Complete customer data:', completeCustomer);
            
            if (!completeCustomer) {
                throw new Error('Customer not found');
            }
            
            // 1. Upload Photos using the improved utility
            let photoUrls: string[] = [];
            if (devicePhotos.length > 0) {
                console.log('[CREATE_TICKET] Uploading photos', { count: devicePhotos.length });
                try {
                    // Use sequential upload for better reliability on mobile networks
                    const uploadResults = await uploadMultiplePhotos(devicePhotos);
                    photoUrls = uploadResults.map(result => result.url);
                    console.log('[CREATE_TICKET] Photos uploaded successfully', { count: photoUrls.length });
                } catch (uploadError: any) {
                    console.error('[CREATE_TICKET] Photo upload failed', { 
                        error: uploadError.message || String(uploadError) 
                    });
                    throw new Error(`Photo upload failed: ${uploadError.message || String(uploadError)}`);
                }
            } else {
                console.log('[CREATE_TICKET] No photos to upload');
            }

            // 2. Insert Ticket Record
            console.log('[CREATE_TICKET] Creating ticket record');
            
            // Format date as YYYYMMDD
            const now = new Date();
            const dateString = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
            
            // Generate random 4-digit number
            const randomNumber = Math.floor(1000 + Math.random() * 9000);
            
            const ticketData = {
                ticket_number: `TKT-${dateString}-${randomNumber}`, // Format: TKT-YYYYMMDD-XXXX
                customer_id: completeCustomer.id,
                customer_name: completeCustomer.name, // Add customer name to satisfy not-null constraint
                customer_phone: completeCustomer.phone || '', // Add customer phone number
                device_type: formData.deviceType,
                device_brand: formData.deviceBrand,
                device_model: formData.deviceModel,
                issue_description: formData.issueDescription,
                priority: formData.priority,
                estimated_cost: formData.estimatedCost ? Number(formData.estimatedCost) : null, // Add estimated cost
                device_photos: photoUrls,
                status: 'received',
                user_id: user?.id
            };
            
            console.log('[CREATE_TICKET] Ticket data prepared', { ticketData });
            console.log('[CREATE_TICKET] Customer phone value:', completeCustomer.phone); // Add this line

            const { error: dbError } = await supabase.from('tickets').insert([ticketData]);

            if (dbError) {
                console.error('[CREATE_TICKET] Database insert failed', { error: dbError.message });
                throw dbError;
            }

            console.log('[CREATE_TICKET] Ticket created successfully');
            Alert.alert("Success", "Ticket created successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('[CREATE_TICKET] Critical error', error);
            Alert.alert("Error", error.message || "Failed to create ticket. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Repair Ticket</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Step 1: Customer */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="person-outline" size={22} color={Colors.light.primary} />
                        <Text style={styles.sectionTitle}>Customer Info *</Text>
                    </View>
                    <CustomerSearch 
                        onCustomerSelect={setCustomer}
                        onAddNewCustomer={() => setShowCustomerModal(true)}
                        initialCustomer={customer}
                    />
                </View>

                {/* Step 2: Device Details */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="devices" size={22} color={Colors.light.primary} />
                        <Text style={styles.sectionTitle}>Device Details *</Text>
                    </View>
                    
                    <View style={styles.chipRow}>
                        {DEVICE_TYPES.map(type => (
                            <TouchableOpacity 
                                key={type}
                                onPress={() => handleChange('deviceType', type)}
                                style={[styles.chip, formData.deviceType === type && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, formData.deviceType === type && styles.chipTextActive]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputGrid}>
                        <TextInput 
                            style={[styles.input, { flex: 1 }]} 
                            placeholder="Brand (e.g. Apple)" 
                            value={formData.deviceBrand}
                            onChangeText={(v) => handleChange('deviceBrand', v)}
                        />
                        <TextInput 
                            style={[styles.input, { flex: 1 }]} 
                            placeholder="Model (e.g. iPhone 13)" 
                            value={formData.deviceModel}
                            onChangeText={(v) => handleChange('deviceModel', v)}
                        />
                    </View>
                </View>

                {/* Step 3: Issue & Priority */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="build" size={22} color={Colors.light.primary} />
                        <Text style={styles.sectionTitle}>Repair Info *</Text>
                    </View>

                    <Text style={styles.label}>Priority Level</Text>
                    <View style={styles.priorityRow}>
                        {PRIORITIES.map(p => (
                            <TouchableOpacity 
                                key={p.value}
                                onPress={() => handleChange('priority', p.value)}
                                style={[
                                    styles.priorityBtn, 
                                    formData.priority === p.value && { backgroundColor: p.color, borderColor: p.color }
                                ]}
                            >
                                <Text style={[styles.priorityText, formData.priority === p.value && { color: '#fff' }]}>{p.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Estimated Cost (KSh)</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g., 5000"
                        value={formData.estimatedCost}
                        onChangeText={(v) => handleChange('estimatedCost', v)}
                        keyboardType="numeric"
                    />

                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        placeholder="Describe the problem in detail..." 
                        multiline
                        value={formData.issueDescription}
                        onChangeText={(v) => handleChange('issueDescription', v)}
                    />
                </View>

                {/* Step 4: Photos */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>Photos (Optional)</Text>
                        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCamera(true)}>
                            <MaterialIcons name="add-a-photo" size={20} color={Colors.light.primary} />
                            <Text style={styles.addBtnText}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                        {devicePhotos.map((uri, i) => (
                            <View key={i} style={styles.photoContainer}>
                                <Image source={{ uri }} style={styles.photo} />
                                <TouchableOpacity 
                                    style={styles.removePhoto}
                                    onPress={() => setDevicePhotos(prev => prev.filter((_, idx) => idx !== i))}
                                >
                                    <MaterialIcons name="close" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSubmit}
                    style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>{getButtonLabel()}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Modals */}
            <Modal visible={showCamera} animationType="slide">
                <CameraCapture 
                    onCapture={(uri) => { setDevicePhotos(p => [...p, uri]); setShowCamera(false); }} 
                    onCancel={() => setShowCamera(false)} 
                />
            </Modal>
            
            <CustomerModal 
                visible={showCustomerModal} 
                onClose={() => setShowCustomerModal(false)}
                onCustomerCreated={(c) => { setCustomer(c); setShowCustomerModal(false); }}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { 
        backgroundColor: Colors.light.primary, 
        height: 100, paddingTop: 40, paddingHorizontal: 15,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    backBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    scrollContent: { padding: 16, paddingBottom: 50 },
    card: { 
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: '#E2E8F0',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8, color: '#1E293B' },
    label: { fontSize: 13, color: '#64748B', marginBottom: 8, fontWeight: '600' },
    input: { 
        backgroundColor: '#F1F5F9', borderRadius: 10, padding: 14, fontSize: 16, color: '#334155', marginBottom: 12 
    },
    inputGrid: { flexDirection: 'row', gap: 10 },
    textArea: { height: 100, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
    chipActive: { backgroundColor: Colors.light.primary },
    chipText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
    chipTextActive: { color: '#fff' },
    priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
    priorityBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
    priorityText: { fontWeight: '600', color: '#64748B' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    addBtn: { flexDirection: 'row', alignItems: 'center' },
    addBtnText: { color: Colors.light.primary, fontWeight: '600', marginLeft: 5 },
    photoList: { flexDirection: 'row' },
    photoContainer: { position: 'relative', marginRight: 12 },
    photo: { width: 70, height: 70, borderRadius: 12 },
    removePhoto: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', borderRadius: 10, padding: 2 },
    submitButton: { 
        backgroundColor: Colors.light.primary, padding: 18, borderRadius: 14, 
        alignItems: 'center', marginTop: 10
    },
    submitButtonDisabled: { backgroundColor: '#94A3B8' },
    submitButtonText: { color: '#fff', fontWeight: '800', fontSize: 17 }
});