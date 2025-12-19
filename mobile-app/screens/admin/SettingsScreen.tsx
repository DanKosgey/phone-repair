import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    TextInput,
    Modal,
    Pressable,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { MaterialIcons } from '@expo/vector-icons';

interface BusinessSettings {
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    businessAddress: string;
    businessWebsite: string;
    businessDescription: string;
    copyrightText: string;
    primaryColor: string;
    secondaryColor: string;
}

interface FeatureSettings {
    enableSecondHandProducts: boolean;
    enableTracking: boolean;
    enableShop: boolean;
}

interface ContactInfo {
    phone: string;
    email: string;
    hours: string;
}

export default function SettingsScreen({ navigation }: any) {
    const { signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<'contact' | 'features' | 'appearance'>('contact');
    const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
        businessName: "Jay's Shop",
        businessEmail: "info@devicecaretaker.com",
        businessPhone: "+254700123456",
        businessAddress: "123 Tech Street, Nairobi, Kenya",
        businessWebsite: "https://devicecaretaker.com",
        businessDescription: "Professional phone repair services and quality products.",
        copyrightText: "2024 Jay's Shop. All rights reserved.",
        primaryColor: "#3b82f6",
        secondaryColor: "#8b5cf6"
    });
    const [featureSettings, setFeatureSettings] = useState<FeatureSettings>({
        enableSecondHandProducts: true,
        enableTracking: true,
        enableShop: true
    });
    const [contactInfo, setContactInfo] = useState<ContactInfo>({
        phone: "(555) 123-4567",
        email: "support@repairhub.com",
        hours: "Mon-Sat 9AM-6PM"
    });
    const [isSaving, setIsSaving] = useState(false);

    // Load settings from storage
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Load business settings from Supabase or use defaults
            const { data, error } = await supabase
                .from('business_settings')
                .select('*')
                .limit(1);

            if (data && data.length > 0) {
                setBusinessSettings(data[0]);
            }

            // Load feature settings from localStorage or use defaults
            const storedFeatureSettings = localStorage.getItem('featureSettings');
            if (storedFeatureSettings) {
                setFeatureSettings(JSON.parse(storedFeatureSettings));
            }

            // Load contact info from localStorage or use defaults
            const storedContactInfo = localStorage.getItem('homepageContactInfo');
            if (storedContactInfo) {
                setContactInfo(JSON.parse(storedContactInfo));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // Save business settings to Supabase
            const { error: businessError } = await supabase
                .from('business_settings')
                .upsert(businessSettings, { onConflict: 'id' });

            if (businessError) throw businessError;

            // Save feature settings to localStorage
            localStorage.setItem('featureSettings', JSON.stringify(featureSettings));

            // Save contact info to localStorage
            localStorage.setItem('homepageContactInfo', JSON.stringify(contactInfo));

            Alert.alert('Success', 'Settings updated successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBusinessSettingsChange = (field: keyof BusinessSettings, value: string) => {
        setBusinessSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFeatureSettingsChange = (field: keyof FeatureSettings, value: boolean) => {
        setFeatureSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
        setContactInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const renderSettingItem = (title: string, icon: any, type: 'link' | 'toggle', value?: boolean, onValueChange?: (val: boolean) => void) => (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={Colors.light.text} />
                </View>
                <Text style={styles.itemTitle}>{title}</Text>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#767577', true: Colors.light.primary }}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
            )}
        </View>
    );

    const renderContactTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="eye" size={20} color={Colors.light.text} />
                    <Text style={styles.cardTitle}>Preview</Text>
                </View>
                <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>Contact</Text>
                    <View style={styles.previewItem}>
                        <Ionicons name="call" size={16} color={Colors.light.textSecondary} />
                        <Text style={styles.previewText}>Phone: {contactInfo.phone}</Text>
                    </View>
                    <View style={styles.previewItem}>
                        <Ionicons name="mail" size={16} color={Colors.light.textSecondary} />
                        <Text style={styles.previewText}>Email: {contactInfo.email}</Text>
                    </View>
                    <View style={styles.previewItem}>
                        <Ionicons name="time" size={16} color={Colors.light.textSecondary} />
                        <Text style={styles.previewText}>Hours: {contactInfo.hours}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="information-circle" size={20} color={Colors.light.text} />
                    <Text style={styles.cardTitle}>Homepage Contact Information</Text>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.textInput}
                            value={contactInfo.phone}
                            onChangeText={(value) => handleContactInfoChange('phone', value)}
                            placeholder="(555) 123-4567"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.textInput}
                            value={contactInfo.email}
                            onChangeText={(value) => handleContactInfoChange('email', value)}
                            placeholder="support@repairhub.com"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Hours</Text>
                        <TextInput
                            style={styles.textInput}
                            value={contactInfo.hours}
                            onChangeText={(value) => handleContactInfoChange('hours', value)}
                            placeholder="Mon-Sat 9AM-6PM"
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderFeaturesTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="cube" size={20} color={Colors.light.text} />
                    <Text style={styles.cardTitle}>Feature Management</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.sectionSubtitle}>Enable or disable features in your application</Text>
                    
                    <View style={styles.featureItem}>
                        <View style={styles.featureInfo}>
                            <Ionicons name="cart" size={20} color={Colors.light.textSecondary} />
                            <View>
                                <Text style={styles.featureTitle}>Product Shop</Text>
                                <Text style={styles.featureDescription}>Enable the product shopping section</Text>
                            </View>
                        </View>
                        <Switch
                            value={featureSettings.enableShop}
                            onValueChange={(value) => handleFeatureSettingsChange('enableShop', value)}
                            trackColor={{ false: '#767577', true: Colors.light.primary }}
                        />
                    </View>
                    
                    <View style={styles.featureItem}>
                        <View style={styles.featureInfo}>
                            <Ionicons name="build" size={20} color={Colors.light.textSecondary} />
                            <View>
                                <Text style={styles.featureTitle}>Repair Tracking</Text>
                                <Text style={styles.featureDescription}>Enable the ticket tracking system</Text>
                            </View>
                        </View>
                        <Switch
                            value={featureSettings.enableTracking}
                            onValueChange={(value) => handleFeatureSettingsChange('enableTracking', value)}
                            trackColor={{ false: '#767577', true: Colors.light.primary }}
                        />
                    </View>
                    
                    <View style={styles.featureItem}>
                        <View style={styles.featureInfo}>
                            <Ionicons name="phone-portrait" size={20} color={Colors.light.textSecondary} />
                            <View>
                                <Text style={styles.featureTitle}>Second-Hand Products</Text>
                                <Text style={styles.featureDescription}>Enable the second-hand product marketplace</Text>
                            </View>
                        </View>
                        <Switch
                            value={featureSettings.enableSecondHandProducts}
                            onValueChange={(value) => handleFeatureSettingsChange('enableSecondHandProducts', value)}
                            trackColor={{ false: '#767577', true: Colors.light.primary }}
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderAppearanceTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="color-palette" size={20} color={Colors.light.text} />
                    <Text style={styles.cardTitle}>Theme Settings</Text>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Dark Mode</Text>
                        <Switch
                            value={false}
                            onValueChange={() => {}}
                            trackColor={{ false: '#767577', true: Colors.light.primary }}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="color-fill" size={20} color={Colors.light.text} />
                    <Text style={styles.cardTitle}>Colors</Text>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.colorSetting}>
                        <Text style={styles.settingLabel}>Primary Color</Text>
                        <View style={[styles.colorPreview, { backgroundColor: businessSettings.primaryColor }]} />
                        <Text style={styles.colorValue}>{businessSettings.primaryColor}</Text>
                    </View>
                    
                    <View style={styles.colorSetting}>
                        <Text style={styles.settingLabel}>Secondary Color</Text>
                        <View style={[styles.colorPreview, { backgroundColor: businessSettings.secondaryColor }]} />
                        <Text style={styles.colorValue}>{businessSettings.secondaryColor}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.title}>Settings</Text>
                        <Text style={styles.subtitle}>Manage your business settings and preferences</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('AdminDashboard')}
                    >
                        <MaterialIcons name="home" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabSelector}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'contact' && styles.activeTab]}
                    onPress={() => setActiveTab('contact')}
                >
                    <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
                        📞 Contact
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'features' && styles.activeTab]}
                    onPress={() => setActiveTab('features')}
                >
                    <Text style={[styles.tabText, activeTab === 'features' && styles.activeTabText]}>
                        ⚙️ Features
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'appearance' && styles.activeTab]}
                    onPress={() => setActiveTab('appearance')}
                >
                    <Text style={[styles.tabText, activeTab === 'appearance' && styles.activeTabText]}>
                        🎨 Appearance
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Render active tab content */}
                {activeTab === 'contact' && renderContactTab()}
                {activeTab === 'features' && renderFeaturesTab()}
                {activeTab === 'appearance' && renderAppearanceTab()}

                {/* Save Button */}
                <View style={styles.saveButtonContainer}>
                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={saveSettings}
                        disabled={isSaving}
                    >
                        <Ionicons name="save" size={20} color={Colors.light.background} />
                        <Text style={styles.saveButtonText}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Existing Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>General</Text>
                    {renderSettingItem('Business Profile', 'business', 'link')}
                    {renderSettingItem('Notifications', 'notifications', 'toggle', true, () => { })}
                    {renderSettingItem('Dark Mode', 'moon', 'toggle', false, () => { })}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>System</Text>
                    {renderSettingItem('Users & Permissions', 'people', 'link')}
                    {renderSettingItem('Backup Data', 'cloud-upload', 'link')}
                    <TouchableOpacity style={styles.item} onPress={() => Alert.alert('Check for Updates', 'App is up to date (v1.0.0)')}>
                        <View style={styles.itemLeft}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="git-branch" size={20} color={Colors.light.text} />
                            </View>
                            <Text style={styles.itemTitle}>App Version</Text>
                        </View>
                        <Text style={styles.versionText}>v1.0.0</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={[styles.item, styles.logoutItem]} onPress={signOut}>
                        <View style={styles.itemLeft}>
                            <View style={[styles.iconContainer, styles.logoutIcon]}>
                                <Ionicons name="log-out" size={20} color={Colors.light.error} />
                            </View>
                            <Text style={[styles.itemTitle, styles.logoutText]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        backgroundColor: Colors.light.primary,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
        letterSpacing: 0,
        color: '#fff',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.5,
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
    tabSelector: {
        flexDirection: 'row',
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        padding: Spacing.md,
    },
    tabButton: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.light.background,
        marginHorizontal: Spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: Colors.light.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
        marginLeft: Spacing.xs,
    },
    activeTabText: {
        color: Colors.light.background,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    tabContent: {
        marginBottom: Spacing.lg,
    },
    card: {
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
        marginLeft: Spacing.sm,
    },
    cardContent: {
        padding: Spacing.md,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.md,
    },
    previewCard: {
        backgroundColor: Colors.light.background,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        margin: Spacing.md,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
    },
    previewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    previewText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
        marginLeft: Spacing.sm,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
        marginBottom: Spacing.sm,
    },
    textInput: {
        height: 48,
        backgroundColor: Colors.light.background,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.5,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border + '40',
    },
    featureInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
        marginLeft: Spacing.sm,
    },
    featureDescription: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.4,
        color: Colors.light.textSecondary,
        marginLeft: Spacing.sm,
        marginTop: Spacing.xs,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
    },
    colorSetting: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border + '40',
    },
    colorPreview: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    colorValue: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
    },
    saveButtonContainer: {
        marginVertical: Spacing.lg,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.background,
        marginLeft: Spacing.sm,
    },
    section: {
        marginBottom: Spacing.xl,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: Spacing.md,
        marginLeft: Spacing.md,
        marginBottom: Spacing.sm,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        backgroundColor: Colors.light.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border + '40',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0.5,
        color: Colors.light.text,
    },
    versionText: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.25,
        color: Colors.light.textSecondary,
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutIcon: {
        backgroundColor: Colors.light.error + '10',
    },
    logoutText: {
        color: Colors.light.error,
        fontWeight: '600',
    },
});