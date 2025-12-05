import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from './hooks/useAuth';
import { Colors } from './constants/theme';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CustomerDashboard from './screens/CustomerDashboard';
import AdminDashboard from './screens/AdminDashboard';
import TrackRepairScreen from './screens/TrackRepairScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
        },
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={CustomerDashboard}
        options={{
          tabBarLabel: 'Home',
          headerTitle: "Jay's Phone Repair",
        }}
      />
      <Tab.Screen
        name="Track"
        component={TrackRepairScreen}
        options={{
          tabBarLabel: 'Track',
          headerTitle: 'Track Repair',
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Shop',
          headerTitle: 'Products',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
        },
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Dashboard',
          headerTitle: 'Admin Dashboard',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tab.Navigator>
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
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : isAdmin ? (
            <Stack.Screen name="AdminApp" component={AdminTabs} />
          ) : (
            <Stack.Screen name="CustomerApp" component={CustomerTabs} />
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
