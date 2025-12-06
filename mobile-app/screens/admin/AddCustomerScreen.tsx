import React, { useState } from 'react';
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

export default function AddCustomerScreen({ navigation, route }: any) {
    const { customer } = route.params || {};
    const isEditing = !!customer;

    const [formData, setFormData] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Customer name is required');
            return false;
        }
        if (!formData.email.trim()) {
            Alert.alert('Error', 'Email is required');
            return false;
        }
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            let error;
            if (isEditing) {
                // Update existing customer
                const { error: updateError } = await supabase
                    .from('customers')
                    .update({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', customer.id);
                error = updateError;
            } else {
                // Create new customer
                const { error: insertError } = await supabase
                    .from('customers')
                    .insert([
                        {
                            name: formData.name,
                            email: formData.email,
                            phone: formData.phone || null,
                        }
                    ]);
                error = insertError;
            }

            if (error) throw error;

            Alert.alert(
                'Success',
                `Customer ${isEditing ? 'updated' : 'added'} successfully!`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    }
                ]
            );
        } catch (error: any) {
            console.error('Error saving customer:', error);
            Alert.alert('Error', 'Failed to save customer: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;

        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this customer? This will also delete all associated tickets.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // First delete associated tickets
                            await supabase
                                .from('tickets')
                                .delete()
                                .eq('customer_id', customer.id);

                            // Then delete the customer
                            const { error } = await supabase
                                .from('customers')
                                .delete()
                                .eq('id', customer.id);

                            if (error) throw error;

                            Alert.alert(
                                'Success',
                                'Customer deleted successfully!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.goBack(),
                                    }
                                ]
                            );
                        } catch (error: any) {
                            console.error('Error deleting customer:', error);
                            Alert.alert('Error', 'Failed to delete customer: ' + (error.message || 'Unknown error'));
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{isEditing ? 'Edit Customer' : 'Add New Customer'}</Text>
                <Text style={styles.subtitle}>
                    {isEditing ? 'Update customer information' : 'Enter customer details'}
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(value) => handleChange('name', value)}
                        placeholder="Enter customer name"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(value) => handleChange('email', value)}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(value) => handleChange('phone', value)}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isEditing ? 'Update Customer' : 'Add Customer'}
                        </Text>
                    )}
                </TouchableOpacity>

                {isEditing && (
                    <TouchableOpacity
                        style={[styles.deleteButton, loading && styles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Text style={styles.deleteButtonText}>Delete Customer</Text>
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
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    input: {
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Typography.body,
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
    deleteButton: {
        backgroundColor: Colors.light.error,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    deleteButtonText: {
        ...Typography.body,
        color: Colors.light.background,
        fontWeight: '600',
    },
});