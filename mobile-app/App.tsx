import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from './hooks/useAuth';
import { Colors } from './constants/theme';
import AdminDrawerContent from './components/AdminDrawerContent';
import CustomerDrawerContent from './components/CustomerDrawerContent';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import UpdatePasswordScreen from './screens/UpdatePasswordScreen';
import HomeScreen from './screens/HomeScreen';
import CustomerDashboard from './screens/CustomerDashboard';
import AdminDashboard from './screens/AdminDashboard';
import TrackRepairScreen from './screens/TrackRepairScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProfileScreen from './screens/ProfileScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';

// Administrator Screens
import TicketsScreen from './screens/admin/TicketsScreen';
import CreateTicketScreen from './screens/admin/CreateTicketScreen';
import TicketDetailScreen from './screens/admin/TicketDetailScreen';
import AnalyticsScreen from './screens/admin/AnalyticsScreen';
import ManageProductScreen from './screens/admin/ManageProductScreen';
import CustomersScreen from './screens/admin/CustomersScreen';
import AddCustomerScreen from './screens/admin/AddCustomerScreen';
import NotificationsScreen from './screens/admin/NotificationsScreen';
import SettingsScreen from './screens/admin/SettingsScreen';

// Second-Hand Product Screens
import SecondHandProductsScreen from './screens/admin/SecondHandProductsScreen';
import ManageSecondHandProductScreen from './screens/admin/ManageSecondHandProductScreen';
import SecondHandProductDetailScreen from './screens/admin/SecondHandProductDetailScreen';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Customer Drawer Navigator
function CustomerDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomerDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
        drawerStyle: {
          backgroundColor: Colors.light.surface,
        },
        drawerActiveTintColor: Colors.light.primary,
        drawerInactiveTintColor: Colors.light.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerLabel: 'Home',
          headerTitle: "Jay's Phone Repair",
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Drawer.Screen
        name="Track"
        component={TrackRepairScreen}
        options={{
          drawerLabel: 'Track Repair',
          headerTitle: 'Track Repair',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Drawer.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          drawerLabel: 'Shop',
          headerTitle: 'Products',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🛍️</Text>,
        }}
      />
      <Drawer.Screen
        name="Dashboard"
        component={CustomerDashboard}
        options={{
          drawerLabel: 'My Dashboard',
          headerTitle: 'My Dashboard',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Drawer.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          drawerLabel: 'Marketplace',
          headerTitle: 'Marketplace',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerLabel: 'Profile',
          headerTitle: 'My Profile',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'Settings',
          headerTitle: 'Settings',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Drawer.Navigator>
  );
}

// Admin Drawer Navigator
function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AdminDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
        drawerStyle: {
          backgroundColor: Colors.light.surface,
        },
        drawerActiveTintColor: Colors.light.primary,
        drawerInactiveTintColor: Colors.light.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerLabel: 'Home',
          headerTitle: "Jay's Phone Repair",
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Drawer.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          drawerLabel: 'Dashboard',
          headerTitle: 'Admin Dashboard',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
        }}
      />
      <Drawer.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          drawerLabel: 'Tickets',
          headerTitle: 'Repair Tickets',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🎫</Text>,
        }}
      />
      <Drawer.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          drawerLabel: 'Customers',
          headerTitle: 'Customers',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>👥</Text>,
        }}
      />
      <Drawer.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          drawerLabel: 'Products',
          headerTitle: 'Products',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>📦</Text>,
        }}
      />
      <Drawer.Screen
        name="SecondHand"
        component={SecondHandProductsScreen}
        options={{
          drawerLabel: 'Second-Hand',
          headerTitle: 'Second-Hand Products',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>📱</Text>,
        }}
      />
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          drawerLabel: 'Analytics',
          headerTitle: 'Analytics',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>📈</Text>,
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          drawerLabel: 'Notifications',
          headerTitle: 'Notifications',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🔔</Text>,
        }}
      />
      <Drawer.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          drawerLabel: 'Marketplace',
          headerTitle: 'Marketplace',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerLabel: 'Profile',
          headerTitle: 'My Profile',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'Settings',
          headerTitle: 'Settings',
          drawerIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Drawer.Navigator>
  );
}

// Customer Stack Navigator
function CustomerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="CustomerDrawer"
        component={CustomerDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ headerTitle: 'Ticket Details' }}
      />
      <Stack.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{ headerTitle: 'Marketplace' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerTitle: 'Product Details' }}
      />
      <Stack.Screen
        name="MarketplaceDetail"
        component={ProductDetailScreen}
        options={{ headerTitle: 'Item Details' }}
      />

    </Stack.Navigator>
  );
}

// Admin Stack Navigator
function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="AdminDrawer"
        component={AdminDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTicket"
        component={CreateTicketScreen}
        options={{ headerTitle: 'Create Ticket' }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ headerTitle: 'Ticket Details' }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ headerTitle: 'Analytics' }}
      />
      <Stack.Screen
        name="Track"
        component={TrackRepairScreen}
        options={{ headerTitle: 'Track Repair' }}
      />
      <Stack.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{ headerTitle: 'Marketplace' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerTitle: 'Product Details' }}
      />
      <Stack.Screen
        name="MarketplaceDetail"
        component={ProductDetailScreen}
        options={{ headerTitle: 'Item Details' }}
      />
      <Stack.Screen
        name="ManageProduct"
        component={ManageProductScreen}
        options={{ headerTitle: 'Manage Product' }}
      />
      <Stack.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ headerTitle: 'Customers' }}
      />
      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
        options={{ headerTitle: 'Customer Details' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerTitle: 'Notifications' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: 'Settings' }}
      />
      {/* Second-Hand Product Screens */}
      <Stack.Screen
        name="SecondHandProducts"
        component={SecondHandProductsScreen}
        options={{ headerTitle: 'Second-Hand Products' }}
      />
      <Stack.Screen
        name="ManageSecondHandProduct"
        component={ManageSecondHandProductScreen}
        options={{ headerTitle: 'Manage Second-Hand Product' }}
      />
      <Stack.Screen
        name="SecondHandProductDetail"
        component={SecondHandProductDetailScreen}
        options={{ headerTitle: 'Second-Hand Product Details' }}
      />
    </Stack.Navigator>
  );
}

// Public Stack Navigator (Guest Mode)
function PublicStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: "Jay's Phone Repair",
          title: "Home",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerTitle: 'Reset Password' }} />
      <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} options={{ headerTitle: 'Update Password' }} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ headerTitle: 'Marketplace' }} />
      <Stack.Screen name="Products" component={ProductsScreen} options={{ headerTitle: 'Products' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerTitle: 'Product Details' }} />
      <Stack.Screen name="MarketplaceDetail" component={ProductDetailScreen} options={{ headerTitle: 'Item Details' }} />
      <Stack.Screen name="Track" component={TrackRepairScreen} options={{ headerTitle: 'Track Repair' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="PublicApp" component={PublicStack} />
          ) : isAdmin ? (
            <Stack.Screen name="AdminApp" component={AdminStack} />
          ) : (
            <Stack.Screen name="CustomerApp" component={CustomerStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});