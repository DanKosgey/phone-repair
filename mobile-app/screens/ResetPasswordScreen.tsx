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

export default function ResetPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setIsSubmitted(true);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Check Your Email</Text>
                        <Text style={styles.subtitle}>We've sent a password reset link to:</Text>
                        <Text style={styles.emailDisplay}>{email}</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.successIcon}>
                            <Text style={styles.checkmark}>✓</Text>
                        </View>
                        
                        <Text style={styles.successText}>
                            Didn't receive the email? Check your spam folder or try again.
                        </Text>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={() => setIsSubmitted(false)}
                        >
                            <Text style={styles.secondaryButtonText}>Try Again</Text>
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter your email and we'll send you a link to reset your password</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
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
    emailDisplay: {
        ...Typography.body,
        color: Colors.light.primary,
        fontWeight: '600',
        marginTop: Spacing.md,
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
    secondaryButton: {
        backgroundColor: Colors.light.surface,
        borderColor: Colors.light.border,
        borderWidth: 1,
        marginTop: Spacing.lg,
    },
    secondaryButtonText: {
        ...Typography.body,
        color: Colors.light.primary,
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
    successText: {
        ...Typography.body,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
});