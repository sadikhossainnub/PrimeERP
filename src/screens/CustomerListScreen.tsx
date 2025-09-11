import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  image?: string;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    address: '123 Business St, New York, NY',
    status: 'active',
    totalOrders: 15,
    totalSpent: 45750.00,
    lastOrderDate: '2025-01-28'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@globaltech.com',
    phone: '+1 (555) 234-5678',
    company: 'Global Tech Solutions',
    address: '456 Tech Ave, San Francisco, CA',
    status: 'active',
    totalOrders: 12,
    totalSpent: 32400.75,
    lastOrderDate: '2025-01-30'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@digitaldyn.com',
    phone: '+1 (555) 345-6789',
    company: 'Digital Dynamics',
    address: '789 Innovation Blvd, Austin, TX',
    status: 'active',
    totalOrders: 8,
    totalSpent: 18950.50,
    lastOrderDate: '2025-01-25'
  },
  {
    id: '4',
    name: 'Lisa Chen',
    email: 'lisa@innovatesys.com',
    phone: '+1 (555) 456-7890',
    company: 'Innovate Systems',
    address: '321 Startup Way, Seattle, WA',
    status: 'active',
    totalOrders: 6,
    totalSpent: 15200.25,
    lastOrderDate: '2025-01-27'
  },
  {
    id: '5',
    name: 'Robert Davis',
    email: 'robert@techcorp.com',
    phone: '+1 (555) 567-8901',
    company: 'TechCorp Industries',
    address: '654 Corporate Dr, Chicago, IL',
    status: 'inactive',
    totalOrders: 3,
    totalSpent: 8500.00,
    lastOrderDate: '2024-12-15'
  }
];

export default function CustomerListScreen({ navigation }: any) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#4CAF50' : '#9E9E9E';
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getCustomers();
      const customerData = response.data || [];
      
      const serverCustomers = customerData.map((customer: any) => ({
        id: customer.name,
        name: customer.customer_name || customer.name,
        email: customer.c_email || customer.email_id || 'N/A',
        phone: customer.c_mobile_number || customer.mobile_no || 'N/A',
        company: customer.customer_name || customer.name,
        address: customer.customer_primary_address || 'N/A',
        status: customer.disabled ? 'inactive' : 'active',
        totalOrders: Math.floor(Math.random() * 20),
        totalSpent: Math.floor(Math.random() * 50000),
        lastOrderDate: customer.creation || new Date().toISOString(),
        image: customer.image ? `https://paperware.jfmart.site${customer.image}` : null
      }));
      
      setCustomers(serverCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers(mockCustomers);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadCustomers();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };



  const handleMenuAction = (action: string, customer: Customer) => {
    setMenuVisible(null);
    switch (action) {
      case 'edit':
        navigation.navigate('CustomerForm', { customer });
        break;
      case 'email':
        Alert.alert('Email', `Send email to ${customer.email}`);
        break;
      case 'call':
        Alert.alert('Call', `Call ${customer.phone}`);
        break;
    }
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => navigation.navigate('CustomerForm', { customer: item })}
    >
      <View style={styles.customerHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                style={styles.avatarImage}
                defaultSource={require('../../assets/icon.png')}
              />
            ) : (
              <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            )}
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.name}</Text>
            <Text style={styles.customerCompany}>{item.company}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactRow}>
          <Ionicons name="mail-outline" size={14} color="#666" />
          <Text style={styles.contactText}>{item.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={14} color="#666" />
          <Text style={styles.contactText}>{item.phone}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="bag-outline" size={14} color="#666" />
          <View style={styles.statText}>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>{item.totalOrders}</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={14} color="#666" />
          <View style={styles.statText}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>{formatCurrency(item.totalSpent)}</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <View style={styles.statText}>
            <Text style={styles.statLabel}>Last Order</Text>
            <Text style={styles.statValue}>{formatDate(item.lastOrderDate)}</Text>
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#666" style={styles.chevron} />
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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

      {/* Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No customers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CustomerForm')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
    marginBottom: 12,
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
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  customerCompany: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  contactInfo: {
    marginBottom: 12,
    gap: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    marginLeft: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
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
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});