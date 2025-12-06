import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Colors } from '../constants/theme';

interface AdminDrawerContentProps {
  navigation: any;
  state: any;
  descriptors: any;
  [key: string]: any;
}

const AdminDrawerContent = (props: AdminDrawerContentProps) => {
  const { navigation } = props;

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Jay's Phone Repair</Text>
      </View>
      
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.footerItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    backgroundColor: Colors.light.surface,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.primary,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  drawerItems: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingVertical: 10,
  },
  footerItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 16,
    color: Colors.light.text,
  },
});

export default AdminDrawerContent;