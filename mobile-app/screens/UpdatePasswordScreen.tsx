import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { supabase } from '../services/supabase';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

export default function UpdatePasswordScreen({ navigation }: any) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setIsSuccess(true);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Password Updated</Text>
                        <Text style={styles.subtitle}>Your password has been successfully updated</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.successIcon}>
                            <Text style={styles.checkmark}>✓</Text>
                        </View>
                        
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.buttonText}>Go to Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Update Password</Text>
                    <Text style={styles.subtitle}>Please enter your new password</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password-new"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleUpdatePassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>
                            Back to <Text style={styles.linkTextBold}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    title: {
        ...Typography.h1,
        color: Colors.light.primary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography.bodySmall,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
        fontWeight: '600',
    },
    input: {
        ...Typography.body,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.light.text,
    },
    button: {
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...Typography.body,
        color: '#fff',
        fontWeight: '600',
    },
    linkButton: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    linkText: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
    },
    linkTextBold: {
        color: Colors.light.primary,
        fontWeight: '600',
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.light.success,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: Spacing.xl,
    },
    checkmark: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
});