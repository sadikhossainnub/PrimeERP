import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { theme } from '../styles/theme';

interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'John Smith', email: 'john@acme.com', company: 'Acme Corporation' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@globaltech.com', company: 'Global Tech Solutions' },
  { id: '3', name: 'Mike Wilson', email: 'mike@digitaldyn.com', company: 'Digital Dynamics' },
  { id: '4', name: 'Lisa Chen', email: 'lisa@innovatesys.com', company: 'Innovate Systems' },
];

const mockProducts = [
  { id: '1', name: 'Professional Software License', price: 299.99 },
  { id: '2', name: 'Cloud Storage Subscription', price: 49.99 },
  { id: '3', name: 'Technical Support Package', price: 199.99 },
  { id: '4', name: 'Custom Development Hours', price: 125.00 },
  { id: '5', name: 'Training Workshop', price: 799.99 },
];

export default function SalesOrderFormScreen({ route, navigation }: any) {
  const order = route?.params?.order;
  const isEdit = !!order;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.company.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItem = (product: typeof mockProducts[0]) => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: product.name,
      description: '',
      quantity: 1,
      unitPrice: product.price,
      total: product.price
    };
    setItems([...items, newItem]);
    setShowProductModal(false);
    setProductSearch('');
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSave = () => {
    if (!selectedCustomer || items.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item');
      return;
    }

    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `SO-2025-${String(Date.now()).slice(-3)}`,
      customerName: selectedCustomer.company,
      customerEmail: selectedCustomer.email,
      orderDate,
      deliveryDate,
      totalAmount,
      currency: 'USD',
      status: 'pending',
      items: items.length,
      notes,
      orderItems: items
    };

    Alert.alert('Success', 'Sales order created successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

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
                <Text style={styles.customerCompany}>{selectedCustomer.company}</Text>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerEmail}>{selectedCustomer.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                <Ionicons name="close" size={20} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              variant="outline"
              onPress={() => setShowCustomerModal(true)}
              style={styles.selectButton}
            >
              <Ionicons name="search" size={16} color={theme.colors.primary} />
              <Text style={styles.selectButtonText}>Select Customer</Text>
            </Button>
          )}
        </Card>

        {/* Order Details */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Order Details</Label>
          </View>
          
          <View style={styles.dateGrid}>
            <View style={styles.dateField}>
              <Label style={styles.fieldLabel}>Order Date</Label>
              <Input
                value={orderDate}
                onChangeText={setOrderDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateField}>
              <Label style={styles.fieldLabel}>Delivery Date</Label>
              <Input
                value={deliveryDate}
                onChangeText={setDeliveryDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        </Card>

        {/* Items */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Items</Label>
            <TouchableOpacity onPress={() => setShowProductModal(true)}>
              <Ionicons name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <Text style={styles.emptyText}>No items added yet</Text>
          ) : (
            <View style={styles.itemsList}>
              {items.map(item => (
                <Card key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Ionicons name="close" size={16} color={theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                  
                  <Input
                    placeholder="Description (optional)"
                    value={item.description}
                    onChangeText={(text) => updateItem(item.id, 'description', text)}
                    style={styles.descriptionInput}
                  />
                  
                  <View style={styles.itemGrid}>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Qty</Label>
                      <Input
                        value={item.quantity.toString()}
                        onChangeText={(text) => updateItem(item.id, 'quantity', parseInt(text) || 1)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Unit Price</Label>
                      <Input
                        value={item.unitPrice.toString()}
                        onChangeText={(text) => updateItem(item.id, 'unitPrice', parseFloat(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Total</Label>
                      <View style={styles.totalField}>
                        <Text style={styles.totalText}>${item.total.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
              
              <Separator style={styles.separator} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Notes */}
        <Card style={styles.card}>
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="Additional notes or special instructions..."
            value={notes}
            onChangeText={setNotes}
            rows={3}
            style={styles.notesInput}
          />
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.actionGrid}>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            Cancel
          </Button>
          <Button onPress={handleSave}>
            Create Order
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
            
            <ScrollView style={styles.customerList}>
              {filteredCustomers.map(customer => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.customerItem}
                  onPress={() => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                    setCustomerSearch('');
                  }}
                >
                  <Text style={styles.customerCompany}>{customer.company}</Text>
                  <Text style={styles.customerName}>{customer.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal visible={showProductModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChangeText={setProductSearch}
              style={styles.searchInput}
            />
            
            <ScrollView style={styles.productList}>
              {filteredProducts.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => addItem(product)}
                >
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${product.price}</Text>
                  </View>
                  <Ionicons name="add" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  customerCompany: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  customerName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  customerEmail: {
    fontSize: theme.typography.fontSize.xs,
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
  dateGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  dateField: {
    flex: 1,
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
  itemName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
    flex: 1,
  },
  descriptionInput: {
    marginBottom: theme.spacing.sm,
  },
  itemGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  notesInput: {
    marginTop: theme.spacing.sm,
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
    fontWeight: theme.typography.fontWeight.bold,
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
  productList: {
    maxHeight: 300,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  productPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
});