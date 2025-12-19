import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useDebounce } from '../../utils/useDebounce';
import { searchCustomers, Customer } from '../../services/customers';

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer) => void;
  onAddNewCustomer: () => void;
  initialCustomer?: Customer | null;
}

export function CustomerSearch({ onCustomerSelect, onAddNewCustomer, initialCustomer }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer || null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchContainerRef = useRef<View>(null);

  // Handle customer search
  useEffect(() => {
    const search = async () => {
      if (debouncedSearchTerm.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchCustomers(debouncedSearchTerm);
          setCustomers(results);
          setIsOpen(true);
        } catch (error) {
          console.error('Error searching customers:', error);
          setCustomers([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCustomers([]);
        setIsOpen(false);
      }
    };

    search();
  }, [debouncedSearchTerm]);

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setIsOpen(false);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm.length >= 2 || customers.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }

    // Clear selection if input is cleared
    if (value === '') {
      setSelectedCustomer(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Customer</Text>
        <View style={styles.searchContainer}>
          <View style={styles.relativeContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChangeText={handleSearchChange}
              onFocus={handleInputFocus}
              style={styles.input}
            />
            {selectedCustomer && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSelection}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {isOpen && (
            <View style={styles.dropdown}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : customers.length > 0 ? (
                <FlatList
                  data={customers}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.customerItem}
                      onPress={() => handleCustomerSelect(item)}
                    >
                      <View style={styles.customerInfo}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.customerDetails}>
                          <Text style={styles.customerName}>{item.name}</Text>
                          <Text style={styles.customerContact}>
                            {item.email} • {item.phone}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  style={styles.customerList}
                />
              ) : searchTerm.length >= 2 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No customers found</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={onAddNewCustomer}
                  >
                    <Text style={styles.addButtonText}>+ Add New Customer</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </View>

      {selectedCustomer && (
        <View style={styles.selectedCustomerCard}>
          <View style={styles.selectedCustomerInfo}>
            <Text style={styles.selectedCustomerName}>{selectedCustomer.name}</Text>
            <Text style={styles.selectedCustomerContact}>
              {selectedCustomer.email} • {selectedCustomer.phone}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={clearSelection}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    color: Colors.light.text,
  },
  searchContainer: {
    position: 'relative',
  },
  relativeContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: Spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.xl,
    ...Typography.bodyMedium,
  },
  clearButton: {
    position: 'absolute',
    right: Spacing.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: Spacing.xs,
  },
  clearButtonText: {
    fontSize: 20,
    color: Colors.light.textSecondary,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: Spacing.xs,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    maxHeight: 240,
    zIndex: 100,
  },
  loadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  customerList: {
    maxHeight: 240,
  },
  customerItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.light.text,
  },
  customerContact: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  noResultsContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  noResultsText: {
    ...Typography.bodyMedium,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    ...Typography.bodySmall,
    color: Colors.light.background,
    fontWeight: '600',
  },
  selectedCustomerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
  },
  selectedCustomerInfo: {
    flex: 1,
  },
  selectedCustomerName: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  selectedCustomerContact: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  changeButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  changeButtonText: {
    ...Typography.bodySmall,
    color: Colors.light.text,
    fontWeight: '600',
  },
});