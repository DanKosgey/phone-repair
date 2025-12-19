import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

interface AdminDrawerContentProps {
  navigation: any;
  state: any;
  descriptors: any;
  [key: string]: any;
}

const AdminDrawerContent = (props: AdminDrawerContentProps) => {
  const { navigation, state } = props;
  const { signOut } = useAuth();
  const currentRouteName = state.routes[state.index]?.name;

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigate to PublicApp which will show Login screen
      navigation.navigate('PublicApp');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const NavigationSection = ({ title, items }: { title: string; items: Array<{ name: string; label: string; icon: string }> }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[
            styles.sectionItem,
            currentRouteName === item.name && styles.sectionItemActive,
          ]}
          onPress={() => navigation.navigate(item.name)}
        >
          <Text style={styles.itemIcon}>{item.icon}</Text>
          <Text
            style={[
              styles.itemLabel,
              currentRouteName === item.name && styles.itemLabelActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer} scrollEnabled={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Portal</Text> {/* Updated to match web app */}
        <Text style={styles.headerSubtitle}>Jay's Shop Manager</Text> {/* Updated to match web app */}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>Administrator</Text>
          <Text style={styles.userEmail}>admin@jaysphonerepair.com</Text>
        </View>
      </View>

      {/* Navigation Sections */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* Dashboard & Analytics */}
        <NavigationSection
          title="Overview"
          items={[
            { name: 'AdminDashboard', label: 'Dashboard', icon: '📊' },
            { name: 'Analytics', label: 'Analytics', icon: '📈' },
          ]}
        />

        {/* Core Management */}
        <NavigationSection
          title="Management"
          items={[
            { name: 'Tickets', label: 'Tickets', icon: '🎫' },
            { name: 'Customers', label: 'Customers', icon: '👥' },
            { name: 'Notifications', label: 'Notifications', icon: '🔔' },
          ]}
        />

        {/* Inventory */}
        <NavigationSection
          title="Inventory"
          items={[
            { name: 'AdminProducts', label: 'Products', icon: '📦' },
            { name: 'SecondHand', label: 'Second-Hand Products', icon: '📱' },
          ]}
        />

        {/* Account */}
        <NavigationSection
          title="Account"
          items={[
            { name: 'Profile', label: 'Profile', icon: '👤' },
            { name: 'Settings', label: 'Settings', icon: '⚙️' },
          ]}
        />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.primary,
    marginBottom: 0,
  },
  headerTitle: {
    ...Typography.headlineSmall,
    color: Colors.light.primaryContrast,
    fontWeight: '700' as const,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.light.primaryContrast,
    opacity: 0.9,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...Typography.bodyLarge,
    color: Colors.light.text,
    fontWeight: '600' as const,
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.light.textSecondary,
  },
  contentScroll: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  sectionItemActive: {
    backgroundColor: Colors.light.primaryLight + '20',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    width: 24,
    textAlign: 'center',
  },
  itemLabel: {
    ...Typography.bodyLarge,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  itemLabelActive: {
    color: Colors.light.primary,
    fontWeight: '700' as const,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.errorLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    marginHorizontal: Spacing.sm,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  signOutText: {
    ...Typography.bodyLarge,
    color: Colors.light.errorDark,
    fontWeight: '700' as const,
  },
});

export default AdminDrawerContent;