import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

export default function ProfileScreen() {
    const { user, profile, signOut } = useAuth();

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await signOut();
                        if (error) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {profile?.role === 'admin' && (
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminText}>ADMIN</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{profile?.full_name || 'Not set'}</Text>
                    </View>

                    {profile?.phone && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{profile.phone}</Text>
                        </View>
                    )}

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Account Type</Text>
                        <Text style={styles.infoValue}>
                            {profile?.role === 'admin' ? 'Administrator' : 'Customer'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Build</Text>
                        <Text style={styles.infoValue}>Mobile App</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        ...Typography.h1,
        color: '#fff',
        fontWeight: '700',
    },
    name: {
        ...Typography.h2,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
    },
    email: {
        ...Typography.body,
        color: Colors.light.textSecondary,
    },
    adminBadge: {
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.light.primary,
        borderRadius: BorderRadius.full,
    },
    adminText: {
        ...Typography.caption,
        color: '#fff',
        fontWeight: '700',
    },
    section: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.light.text,
        marginBottom: Spacing.md,
    },
    infoCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    infoRow: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    infoLabel: {
        ...Typography.bodySmall,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
    },
    infoValue: {
        ...Typography.body,
        color: Colors.light.text,
        fontWeight: '500',
    },
    actions: {
        padding: Spacing.lg,
    },
    signOutButton: {
        backgroundColor: Colors.light.error,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
    },
    signOutText: {
        ...Typography.body,
        color: '#fff',
        fontWeight: '600',
    },
});
