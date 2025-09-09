import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  quotationDate: string;
  validUntil: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  items: number;
}

const mockQuotations: Quotation[] = [
  {
    id: '1',
    quotationNumber: 'QT-2025-001',
    customerName: 'Acme Corporation',
    customerEmail: 'orders@acme.com',
    quotationDate: '2025-01-15',
    validUntil: '2025-02-15',
    totalAmount: 18500.00,
    currency: 'USD',
    status: 'sent',
    items: 6
  },
  {
    id: '2',
    quotationNumber: 'QT-2025-002',
    customerName: 'Global Tech Solutions',
    customerEmail: 'procurement@globaltech.com',
    quotationDate: '2025-01-14',
    validUntil: '2025-02-14',
    totalAmount: 12300.75,
    currency: 'USD',
    status: 'approved',
    items: 4
  },
  {
    id: '3',
    quotationNumber: 'QT-2025-003',
    customerName: 'Digital Dynamics',
    customerEmail: 'orders@digitaldyn.com',
    quotationDate: '2025-01-13',
    validUntil: '2025-02-13',
    totalAmount: 29750.50,
    currency: 'USD',
    status: 'draft',
    items: 10
  },
  {
    id: '4',
    quotationNumber: 'QT-2025-004',
    customerName: 'Innovate Systems',
    customerEmail: 'purchasing@innovatesys.com',
    quotationDate: '2025-01-12',
    validUntil: '2025-02-12',
    totalAmount: 7850.00,
    currency: 'USD',
    status: 'rejected',
    items: 3
  },
  {
    id: '5',
    quotationNumber: 'QT-2025-005',
    customerName: 'Smart Solutions Ltd',
    customerEmail: 'orders@smartsolutions.com',
    quotationDate: '2025-01-10',
    validUntil: '2025-02-10',
    totalAmount: 15600.25,
    currency: 'USD',
    status: 'sent',
    items: 7
  },
  {
    id: '6',
    quotationNumber: 'QT-2025-006',
    customerName: 'Future Enterprises',
    customerEmail: 'procurement@future.com',
    quotationDate: '2025-01-05',
    validUntil: '2025-01-20',
    totalAmount: 4200.00,
    currency: 'USD',
    status: 'expired',
    items: 2
  }
];

export default function QuotationListScreen({ navigation }: any) {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation => {
      const matchesSearch = 
        quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, selectedStatus]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      // Use mock data for now
      setQuotations(mockQuotations);
    } catch (error) {
      console.error('Failed to load quotations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadQuotations();
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#FF9800';
      case 'sent': return '#2196F3';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const isExpiringSoon = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const renderQuotation = ({ item }: { item: Quotation }) => (
    <TouchableOpacity
      style={styles.quotationCard}
      onPress={() => navigation.navigate('QuotationForm', { quotation: item })}
    >
      <View style={styles.quotationHeader}>
        <Text style={styles.quotationNumber}>{item.quotationNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.customerName}>{item.customerName}</Text>
      
      <View style={styles.quotationDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Quote Date</Text>
              <Text style={styles.detailValue}>{formatDate(item.quotationDate)}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={styles.detailValue}>{formatCurrency(item.totalAmount, item.currency)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.validityRow}>
          <Ionicons name="time-outline" size={14} color={isExpiringSoon(item.validUntil) ? '#FF9800' : '#666'} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Valid Until</Text>
            <Text style={[styles.detailValue, isExpiringSoon(item.validUntil) && styles.expiringText]}>
              {formatDate(item.validUntil)}
            </Text>
          </View>
          {isExpiringSoon(item.validUntil) && (
            <Text style={styles.expiringBadge}>Expiring Soon</Text>
          )}
        </View>
        
        <View style={styles.itemsRow}>
          <Ionicons name="list-outline" size={14} color="#666" />
          <Text style={styles.itemsText}>{item.items} item{item.items !== 1 ? 's' : ''}</Text>
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
          placeholder="Search quotations, customers..."
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
          {filteredQuotations.length} quotation{filteredQuotations.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredQuotations}
        renderItem={renderQuotation}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotations found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('QuotationForm')}
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
  quotationCard: {
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
  quotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quotationNumber: {
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
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  quotationDetails: {
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
  },
  detailText: {
    marginLeft: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiringText: {
    color: '#FF9800',
  },
  expiringBadge: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '500',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
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