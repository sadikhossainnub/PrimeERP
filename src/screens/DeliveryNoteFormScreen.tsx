import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiService from '../services/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface Customer {
  name: string;
  customer_name: string;
  email_id?: string;
}

interface Item {
  name: string;
  item_name: string;
  standard_rate?: number;
}

interface DeliveryNoteItem {
  item_code: string;
  qty: number;
  rate?: number;
  amount?: number;
}

type DeliveryNoteFormScreenRouteProp = RouteProp<RootStackParamList, 'DeliveryNoteForm'>;
type DeliveryNoteFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeliveryNoteForm'>;

export default function DeliveryNoteFormScreen() {
  const navigation = useNavigation<DeliveryNoteFormScreenNavigationProp>();
  const route = useRoute<DeliveryNoteFormScreenRouteProp>();
  const { name: deliveryNoteName, salesOrder } = route.params || {};
  const isFromSalesOrder = !!salesOrder;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    isFromSalesOrder ? {
      name: salesOrder?.customer || '',
      customer_name: salesOrder?.customer_name || salesOrder?.customer || '',
      email_id: salesOrder?.email || ''
    } : null
  );
  const [postingDate, setPostingDate] = useState(new Date().toISOString().split('T')[0]);
  const [postingTime, setPostingTime] = useState(new Date().toTimeString().slice(0, 5));
  const [currency, setCurrency] = useState(salesOrder?.currency || 'BDT');
  const [items, setItems] = useState<DeliveryNoteItem[]>(
    isFromSalesOrder && salesOrder?.items ? salesOrder.items.map((item: any) => ({
      item_code: item.item_code || item.name,
      qty: item.qty || 1,
      rate: item.rate || 0,
      amount: (item.qty || 1) * (item.rate || 0)
    })) : []
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [itemCatalog, setItemCatalog] = useState<Item[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (deliveryNoteName) {
      setIsEditing(true);
      fetchDeliveryNote(deliveryNoteName);
    }
  }, [deliveryNoteName]);

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await apiService.getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      const response = await apiService.getItems();
      setItemCatalog(response.data || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchDeliveryNote = async (name: string) => {
    try {
      setLoading(true);
      // For now, just show info that editing is not implemented
      Alert.alert('Info', 'Editing existing delivery notes is not yet implemented.');
    } catch (error) {
      console.error('Failed to fetch delivery note:', error);
      Alert.alert('Error', 'Failed to load delivery note.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.customer_name && customer.customer_name.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (customer.email_id && customer.email_id.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const filteredItems = itemCatalog.filter(item =>
    (item.item_name && item.item_name.toLowerCase().includes(itemSearch.toLowerCase())) ||
    (item.name && item.name.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const addItem = () => {
    setItems([...items, { item_code: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const updateItem = (index: number, field: keyof DeliveryNoteItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = (newItems[index].qty || 0) * (newItems[index].rate || 0);
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSave = async () => {
    if (!selectedCustomer || items.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item');
      return;
    }

    try {
      setLoading(true);
      const deliveryNoteData = {
        customer: selectedCustomer.name,
        posting_date: postingDate,
        posting_time: postingTime,
        currency,
        items: items.map(item => ({
          item_code: item.item_code,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount
        })),
        grand_total: totalAmount
      };

      await apiService.createDoc('Delivery Note', deliveryNoteData);
      Alert.alert('Success', 'Delivery Note created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create delivery note');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Customer Selection */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Customer</Label>
          </View>
          
          {selectedCustomer ? (
            <View style={styles.selectedCustomer}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{selectedCustomer.customer_name}</Text>
                <Text style={styles.customerCode}>{selectedCustomer.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                <Ionicons name="close" size={20} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              variant="outline"
              onPress={() => {
                setShowCustomerModal(true);
                fetchCustomers();
              }}
              style={styles.selectButton}
            >
              <Ionicons name="search" size={16} color={theme.colors.primary} />
              <Text style={styles.selectButtonText}>Select Customer</Text>
            </Button>
          )}
        </Card>

        {/* Delivery Details */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Delivery Details</Label>
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.dateField}>
              <Label style={styles.fieldLabel}>Posting Date</Label>
              <Input
                value={postingDate}
                onChangeText={setPostingDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateField}>
              <Label style={styles.fieldLabel}>Posting Time</Label>
              <Input
                value={postingTime}
                onChangeText={setPostingTime}
                placeholder="HH:MM"
              />
            </View>
            <View style={styles.dateField}>
              <Label style={styles.fieldLabel}>Currency</Label>
              <Input
                value={currency}
                onChangeText={setCurrency}
                placeholder="Currency"
              />
            </View>
          </View>
        </Card>

        {/* Items */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Items</Label>
            <TouchableOpacity onPress={addItem}>
              <Ionicons name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <Text style={styles.emptyText}>No items added yet</Text>
          ) : (
            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <Card key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>Item {index + 1}</Text>
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Ionicons name="close" size={16} color={theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemGrid}>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Item Code</Label>
                      {item.item_code ? (
                        <View style={styles.selectedItem}>
                          <Text style={styles.selectedItemText}>{item.item_code}</Text>
                          <TouchableOpacity onPress={() => updateItem(index, 'item_code', '')}>
                            <Ionicons name="close" size={16} color={theme.colors.mutedForeground} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Button
                          variant="outline"
                          onPress={() => {
                            setSelectedItemIndex(index);
                            setShowItemModal(true);
                            fetchItems();
                          }}
                          style={styles.selectItemButton}
                        >
                          <Ionicons name="search" size={14} color={theme.colors.primary} />
                          <Text style={styles.selectItemText}>Select Item</Text>
                        </Button>
                      )}
                    </View>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Qty</Label>
                      <Input
                        value={item.qty.toString()}
                        onChangeText={(text) => updateItem(index, 'qty', parseInt(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.itemGrid}>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Rate</Label>
                      <Input
                        value={item.rate?.toString() || '0'}
                        onChangeText={(text) => updateItem(index, 'rate', parseFloat(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Amount</Label>
                      <View style={styles.totalField}>
                        <Text style={styles.totalText}>৳{item.amount?.toFixed(2) || '0.00'}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
              
              <Separator style={styles.separator} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total:</Text>
                <Text style={styles.totalAmount}>৳{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.actionGrid}>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
            ) : (
              'Create Delivery Note'
            )}
          </Button>
        </View>
      </View>

      {/* Customer Modal */}
      <Modal visible={showCustomerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChangeText={setCustomerSearch}
              style={styles.searchInput}
            />
            
            {customersLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.customerList}>
                {filteredCustomers.map(customer => (
                  <TouchableOpacity
                    key={customer.name}
                    style={styles.customerItem}
                    onPress={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerModal(false);
                      setCustomerSearch('');
                    }}
                  >
                    <Text style={styles.customerName}>{customer.customer_name}</Text>
                    <Text style={styles.customerCode}>{customer.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Item Modal */}
      <Modal visible={showItemModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Item</Text>
              <TouchableOpacity onPress={() => setShowItemModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <Input
              placeholder="Search items..."
              value={itemSearch}
              onChangeText={setItemSearch}
              style={styles.searchInput}
            />
            
            {itemsLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.customerList}>
                {filteredItems.map(item => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.customerItem}
                    onPress={() => {
                      updateItem(selectedItemIndex, 'item_code', item.name);
                      updateItem(selectedItemIndex, 'rate', item.standard_rate || 0);
                      setShowItemModal(false);
                      setItemSearch('');
                    }}
                  >
                    <Text style={styles.customerName}>{item.item_name}</Text>
                    <Text style={styles.customerCode}>{item.name}</Text>
                    {item.standard_rate && (
                      <Text style={styles.itemRate}>৳{item.standard_rate.toFixed(2)}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  selectedCustomer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.foreground,
  },
  customerCode: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectButtonText: {
    color: theme.colors.primary,
  },
  detailsGrid: {
    gap: theme.spacing.md,
  },
  dateField: {
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    paddingVertical: theme.spacing.xl,
  },
  itemsList: {
    gap: theme.spacing.md,
  },
  itemCard: {
    padding: theme.spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  itemTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.foreground,
  },
  itemGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  itemField: {
    flex: 1,
  },
  totalField: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.md,
  },
  totalText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  separator: {
    marginVertical: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.foreground,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as 'bold',
    color: theme.colors.foreground,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as 'bold',
    color: theme.colors.foreground,
  },
  searchInput: {
    margin: theme.spacing.lg,
  },
  customerList: {
    maxHeight: 300,
  },
  customerItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
  },
  selectedItemText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  selectItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  selectItemText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  itemRate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
});