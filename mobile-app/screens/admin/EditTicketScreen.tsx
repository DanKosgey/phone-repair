import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';

interface Ticket {
    id: string;
    ticket_number: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    device_type: string;
    device_brand: string;
    device_model: string;
    device_imei: string;
    issue_description: string;
    priority: string;
    status: string;
    payment_status: string;
    estimated_cost: number;
    actual_cost: number;
    deposit_paid: number;
    notes: string;
    customer_notes: string;
    created_at: string;
    updated_at: string;
}

export default function EditTicketScreen({ route, navigation }: any) {
    const { ticketId } = route.params;
    const { user } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form fields
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [deviceType, setDeviceType] = useState("");
    const [deviceBrand, setDeviceBrand] = useState("");
    const [deviceModel, setDeviceModel] = useState("");
    const [deviceImei, setDeviceImei] = useState("");
    const [issueDescription, setIssueDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [customerNotes, setCustomerNotes] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [estimatedCost, setEstimatedCost] = useState("");
    const [actualCost, setActualCost] = useState("");
    const [depositPaid, setDepositPaid] = useState("");

    // Status options
    const statusOptions = [
        { value: 'received', label: 'Received' },
        { value: 'diagnosing', label: 'Diagnosing' },
        { value: 'awaiting_parts', label: 'Awaiting Parts' },
        { value: 'repairing', label: 'Repairing' },
        { value: 'quality_check', label: 'Quality Check' },
        { value: 'ready', label: 'Ready' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];
    
    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];
    
    const paymentStatusOptions = [
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'partial', label: 'Partial' },
        { value: 'paid', label: 'Paid' }
    ];

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('id', ticketId)
                .single();

            if (error) throw error;
            setTicket(data);
            
            // Populate form fields
            setCustomerName(data.customer_name || "");
            setCustomerEmail(data.customer_email || "");
            setCustomerPhone(data.customer_phone || "");
            setDeviceType(data.device_type || "");
            setDeviceBrand(data.device_brand || "");
            setDeviceModel(data.device_model || "");
            setDeviceImei(data.device_imei || "");
            setIssueDescription(data.issue_description || "");
            setNotes(data.notes || "");
            setCustomerNotes(data.customer_notes || "");
            setStatus(data.status || "");
            setPriority(data.priority || "");
            setPaymentStatus(data.payment_status || "");
            setEstimatedCost(data.estimated_cost?.toString() || "");
            setActualCost(data.actual_cost?.toString() || "");
            setDepositPaid(data.deposit_paid?.toString() || "");
        } catch (error) {
            console.error('Error fetching ticket:', error);
            Alert.alert('Error', 'Failed to fetch ticket details');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors: string[] = [];
        
        if (!customerName || customerName.trim().length < 2) {
            errors.push('Customer name must be at least 2 characters long');
        }
        
        if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
            errors.push('Please enter a valid email address');
        }
        
        if (customerPhone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(customerPhone)) {
            errors.push('Please enter a valid phone number');
        }
        
        if (!deviceType || deviceType.trim().length < 2) {
            errors.push('Device type must be at least 2 characters long');
        }
        
        if (!deviceBrand || deviceBrand.trim().length < 2) {
            errors.push('Device brand must be at least 2 characters long');
        }
        
        if (!deviceModel || deviceModel.trim().length < 1) {
            errors.push('Device model is required');
        }
        
        if (!issueDescription || issueDescription.trim().length < 10) {
            errors.push('Issue description must be at least 10 characters long');
        }
        
        // Validate numeric fields if provided
        if (estimatedCost && (isNaN(Number(estimatedCost)) || Number(estimatedCost) <= 0)) {
            errors.push('Estimated cost must be a positive number');
        }
        
        if (actualCost && (isNaN(Number(actualCost)) || Number(actualCost) < 0)) {
            errors.push('Actual cost must be a non-negative number');
        }
        
        if (depositPaid && (isNaN(Number(depositPaid)) || Number(depositPaid) < 0)) {
            errors.push('Deposit paid must be a non-negative number');
        }
        
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            Alert.alert('Validation Error', errors.join('\n'));
            return;
        }

        setSaving(true);
        try {
            // Prepare update data
            const updateData: any = {
                customer_name: customerName.trim(),
                customer_email: customerEmail.trim() || null,
                customer_phone: customerPhone.trim() || null,
                device_type: deviceType.trim(),
                device_brand: deviceBrand.trim(),
                device_model: deviceModel.trim(),
                device_imei: deviceImei.trim() || null,
                issue_description: issueDescription.trim(),
                notes: notes.trim() || null,
                customer_notes: customerNotes.trim() || null,
                status: status,
                priority: priority,
                payment_status: paymentStatus,
                updated_at: new Date().toISOString()
            };
            
            // Add numeric fields only if they have values
            if (estimatedCost) {
                updateData.estimated_cost = Number(estimatedCost);
            } else {
                updateData.estimated_cost = null;
            }
            
            if (actualCost) {
                updateData.actual_cost = Number(actualCost);
            } else {
                updateData.actual_cost = null;
            }
            
            if (depositPaid) {
                updateData.deposit_paid = Number(depositPaid);
            } else {
                updateData.deposit_paid = null;
            }

            // Update ticket
            const { error } = await supabase
                .from('tickets')
                .update(updateData)
                .eq('id', ticketId);

            if (error) throw error;

            Alert.alert(
                'Success',
                'Ticket updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'TicketDetail', params: { id: ticketId } } }),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error updating ticket:', error);
            Alert.alert('Error', 'Failed to update ticket: ' + (error.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (!ticket) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Ticket not found</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchTicket}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.title}>Edit Ticket</Text>
                        <Text style={styles.subtitle}>Update repair ticket information</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('AdminApp', { screen: 'AdminDrawer', params: { screen: 'AdminDashboard' } })}
                    >
                        <MaterialIcons name="home" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.form}>
                {/* Customer Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <Text style={styles.sectionDescription}>Enter the customer's contact details</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={customerName}
                            onChangeText={setCustomerName}
                            placeholder="Enter customer name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={customerEmail}
                            onChangeText={setCustomerEmail}
                            placeholder="Enter customer email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={customerPhone}
                            onChangeText={setCustomerPhone}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Device Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Device Information</Text>
                    <Text style={styles.sectionDescription}>Enter details about the device that needs repair</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Device Type *</Text>
                        <TextInput
                            style={styles.input}
                            value={deviceType}
                            onChangeText={setDeviceType}
                            placeholder="e.g., Smartphone, Tablet, Laptop"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.flexOne]}>
                            <Text style={styles.label}>Device Brand *</Text>
                            <TextInput
                                style={styles.input}
                                value={deviceBrand}
                                onChangeText={setDeviceBrand}
                                placeholder="e.g., Apple, Samsung, Huawei"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.flexOne]}>
                            <Text style={styles.label}>Device Model *</Text>
                            <TextInput
                                style={styles.input}
                                value={deviceModel}
                                onChangeText={setDeviceModel}
                                placeholder="e.g., iPhone 13 Pro, Samsung Galaxy S21"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Device IMEI</Text>
                        <TextInput
                            style={styles.input}
                            value={deviceImei}
                            onChangeText={setDeviceImei}
                            placeholder="e.g., 123456789012345"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Issue Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Issue Description</Text>
                    <Text style={styles.sectionDescription}>Describe the issue the device is experiencing</Text>
                    
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={issueDescription}
                            onChangeText={setIssueDescription}
                            placeholder="Describe the issue the device is experiencing..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.sectionDescription}>Add internal notes and customer-visible notes</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Internal Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Notes for repair technicians..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Customer Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={customerNotes}
                            onChangeText={setCustomerNotes}
                            placeholder="Notes visible to customer..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Status & Priority Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status & Priority</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.chipContainer}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        status === option.value && styles.chipSelected
                                    ]}
                                    onPress={() => setStatus(option.value)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        status === option.value && styles.chipTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.chipContainer}>
                            {priorityOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        priority === option.value && styles.chipSelected
                                    ]}
                                    onPress={() => setPriority(option.value)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        priority === option.value && styles.chipTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Payment Status</Text>
                        <View style={styles.chipContainer}>
                            {paymentStatusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.chip,
                                        paymentStatus === option.value && styles.chipSelected
                                    ]}
                                    onPress={() => setPaymentStatus(option.value)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        paymentStatus === option.value && styles.chipTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Cost Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cost Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estimated Cost (KSh)</Text>
                        <TextInput
                            style={styles.input}
                            value={estimatedCost}
                            onChangeText={setEstimatedCost}
                            placeholder="e.g., 5000"
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Actual Cost (KSh)</Text>
                        <TextInput
                            style={styles.input}
                            value={actualCost}
                            onChangeText={setActualCost}
                            placeholder="e.g., 4500"
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deposit Paid (KSh)</Text>
                        <TextInput
                            style={styles.input}
                            value={depositPaid}
                            onChangeText={setDepositPaid}
                            placeholder="e.g., 1000"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.cancelButton, saving && styles.buttonDisabled]}
                        onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tickets')}
                        disabled={saving}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.text,
        marginBottom: Spacing.lg,
    },
    retryButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.background,
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.light.primary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
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
    form: {
        padding: Spacing.lg,
    },
    section: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: Spacing.lg,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
        padding: Spacing.lg,
        paddingBottom: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    sectionDescription: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
        padding: Spacing.lg,
        paddingTop: Spacing.xs,
        paddingBottom: Spacing.md,
    },
    inputGroup: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: Spacing.sm,
    },
    input: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    flexOne: {
        flex: 1,
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
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.text,
    },
    chipTextSelected: {
        color: Colors.light.background,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    cancelButton: {
        flex: 1,
        padding: Spacing.md,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    saveButton: {
        flex: 1,
        padding: Spacing.md,
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.background,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});