import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface SalesOrder {
  name: string;
  customer: string;
  customer_name?: string;
  transaction_date: string;
  delivery_date?: string;
  grand_total: number;
  currency?: string;
  status: string;
}

export default function SalesOrderListScreen({ navigation }: any) {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadOrders = async () => {
    try {
      const response = await apiService.getSalesOrders(50, 0, searchQuery);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load sales orders:', error);
      // Demo data fallback
      setOrders([
        {
          name: 'SAL-ORD-2024-00001',
          customer: 'ABC Corp',
          customer_name: 'ABC Corporation',
          transaction_date: '2024-01-15',
          delivery_date: '2024-01-25',
          grand_total: 15000,
          currency: 'BDT',
          status: 'To Deliver and Bill'
        },
        {
          name: 'SAL-ORD-2024-00002',
          customer: 'XYZ Ltd',
          customer_name: 'XYZ Limited',
          transaction_date: '2024-01-16',
          delivery_date: '2024-01-26',
          grand_total: 8500,
          currency: 'BDT',
          status: 'Draft'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadOrders();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return '#FF9800';
      case 'Approved': return '#4CAF50';
      case 'To Deliver and Bill': return '#2196F3';
      case 'To Bill': return '#9C27B0';
      case 'Completed': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'To Deliver and Bill': return 'Confirmed';
      case 'To Bill': return 'Shipped';
      default: return status;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer_name || order.customer).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Approved', label: 'Approved' },
    { value: 'To Deliver and Bill', label: 'Confirmed' },
    { value: 'To Bill', label: 'Shipped' },
    { value: 'Completed', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'BDT') => {
    if (!amount || isNaN(amount)) return '৳0';
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const handleCreateDeliveryNote = async (order: SalesOrder) => {
    Alert.alert(
      'Create Delivery Note',
      `Create delivery note for order ${order.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await apiService.convertSalesOrderToDeliveryNote(order.name);
              Alert.alert('Success', 'Delivery Note created successfully!', [
                {
                  text: 'View Delivery Note',
                  onPress: () => navigation.navigate('DeliveryNoteForm', { salesOrder: order })
                },
                { text: 'OK' }
              ]);
              loadOrders();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create delivery note');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderOrder = ({ item }: { item: SalesOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('SalesOrderForm', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.customerName}>{item.customer_name || item.customer}</Text>
      
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Order Date</Text>
              <Text style={styles.detailValue}>{formatDate(item.transaction_date)}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={styles.detailValue}>{formatCurrency(item.grand_total, item.currency)}</Text>
            </View>
          </View>
        </View>
        
        {item.delivery_date && (
          <View style={styles.deliveryRow}>
            <Ionicons name="car-outline" size={14} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Delivery</Text>
              <Text style={styles.detailValue}>{formatDate(item.delivery_date)}</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        {(item.status === 'To Deliver and Bill' || item.status === 'To Bill') && (
          <TouchableOpacity
            style={styles.deliveryButton}
            onPress={() => handleCreateDeliveryNote(item)}
          >
            <Ionicons name="car-outline" size={16} color="#2196F3" />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('SalesOrderForm')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {statusOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              selectedStatus === option.value && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(option.value)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === option.value && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  countText: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
  },

});