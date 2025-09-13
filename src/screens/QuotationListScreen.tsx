import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import WorkflowIndicator from '../components/WorkflowIndicator';
import { showQuotationExpiredAlert } from '../utils/alerts';

interface Quotation {
  id: string;
  quotationNumber: string;
  customer_name: string;
  email: string;
  transaction_date: string;
  valid_till: string;
  grand_total: number;
  currency: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  total_qty: number;
}

const mockQuotations: Quotation[] = [
  {
    id: '1',
    quotationNumber: 'QT-2025-001',
    customer_name: 'Acme Corporation',
    email: 'orders@acme.com',
    transaction_date: '2025-01-15',
    valid_till: '2025-02-15',
    grand_total: 18500.00,
    currency: 'USD',
    status: 'sent',
    total_qty: 6
  },
  {
    id: '2',
    quotationNumber: 'QT-2025-002',
    customer_name: 'Global Tech Solutions',
    email: 'procurement@globaltech.com',
    transaction_date: '2025-01-14',
    valid_till: '2025-02-14',
    grand_total: 12300.75,
    currency: 'USD',
    status: 'approved',
    total_qty: 4
  },
  {
    id: '3',
    quotationNumber: 'QT-2025-003',
    customer_name: 'Digital Dynamics',
    email: 'orders@digitaldyn.com',
    transaction_date: '2025-01-13',
    valid_till: '2025-02-13',
    grand_total: 29750.50,
    currency: 'USD',
    status: 'draft',
    total_qty: 10
  },
  {
    id: '4',
    quotationNumber: 'QT-2025-004',
    customer_name: 'Innovate Systems',
    email: 'purchasing@innovatesys.com',
    transaction_date: '2025-01-12',
    valid_till: '2025-02-12',
    grand_total: 7850.00,
    currency: 'USD',
    status: 'rejected',
    total_qty: 3
  },
  {
    id: '5',
    quotationNumber: 'QT-2025-005',
    customer_name: 'Smart Solutions Ltd',
    email: 'orders@smartsolutions.com',
    transaction_date: '2025-01-10',
    valid_till: '2025-02-10',
    grand_total: 15600.25,
    currency: 'USD',
    status: 'sent',
    total_qty: 7
  },
  {
    id: '6',
    quotationNumber: 'QT-2025-006',
    customer_name: 'Future Enterprises',
    email: 'procurement@future.com',
    transaction_date: '2025-01-05',
    valid_till: '2025-01-20',
    grand_total: 4200.00,
    currency: 'USD',
    status: 'expired',
    total_qty: 2
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
        (quotation.quotationNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quotation.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quotation.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, selectedStatus]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getQuotations(50, 0, searchQuery);
      const serverQuotations = response.data?.map((quotation: any) => ({
        id: quotation.name,
        quotationNumber: quotation.name,
        customer_name: quotation.customer_name,
        email: quotation.email,
        transaction_date: quotation.transaction_date,
        valid_till: quotation.valid_till,
        grand_total: quotation.grand_total,
        currency: 'BDT',
        status: quotation.status?.toLowerCase() || 'draft',
        total_qty: quotation.total_qty
      })) || [];
      setQuotations(serverQuotations);
    } catch (error) {
      console.error('Failed to load quotations:', error);
      setQuotations(mockQuotations);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadQuotations();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  const formatCurrency = (amount: number, currency: string = 'BDT') => {
    if (!amount || isNaN(amount)) return '৳0';
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const isExpiringSoon = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const handleConvertToSalesOrder = async (quotation: Quotation) => {
    Alert.alert(
      'Convert to Sales Order',
      `Convert quotation ${quotation.quotationNumber} to Sales Order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: async () => {
            try {
              setLoading(true);
              const fullQuotation = await ApiService.getDocument('Quotation', quotation.quotationNumber);
              Alert.alert('Success', 'Ready to create Sales Order!', [
                {
                  text: 'Create Sales Order',
                  onPress: () => navigation.navigate('SalesOrderForm', { quotation: fullQuotation.data })
                },
                { text: 'OK' }
              ]);
              loadQuotations();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to fetch quotation details');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const isQuotationExpired = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    return expiryDate < today;
  };

  const handleQuotationPress = (item: Quotation) => {
    if (isQuotationExpired(item.valid_till)) {
      showQuotationExpiredAlert(item.quotationNumber);
      return;
    }
    navigation.navigate('QuotationForm', { quotation: item });
  };

  const renderQuotation = ({ item }: { item: Quotation }) => (
    <TouchableOpacity onPress={() => handleQuotationPress(item)}>
      <View style={styles.quotationCard}>
      <View style={styles.quotationHeader}>
        <Text style={styles.quotationNumber}>{item.quotationNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.customerName}>{item.customer_name}</Text>
      
      <View style={styles.quotationDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Quote Date</Text>
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
        
        <View style={styles.validityRow}>
          <Ionicons name="time-outline" size={14} color={isExpiringSoon(item.valid_till) ? '#FF9800' : '#666'} />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Valid Until</Text>
            <Text style={[styles.detailValue, isExpiringSoon(item.valid_till) && styles.expiringText]}>
              {formatDate(item.valid_till)}
            </Text>
          </View>
          {isExpiringSoon(item.valid_till) && (
            <Text style={styles.expiringBadge}>Expiring Soon</Text>
          )}
        </View>
        
        <View style={styles.itemsRow}>
          <Ionicons name="list-outline" size={14} color="#666" />
          <Text style={styles.itemsText}>{item.total_qty} item{item.total_qty !== 1 ? 's' : ''}</Text>
        </View>
      </View>
      
      {item.status === 'approved' && (
        <View style={styles.workflowContainer}>
          <WorkflowIndicator 
            currentStep="quotation" 
            completedSteps={item.sales_order ? ['quotation'] : []} 
            showLabels={false}
          />
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => navigation.navigate('DocumentPreview', { document: item, docType: 'quotation' })}
        >
          <Ionicons name="eye-outline" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('QuotationForm', { quotation: item })}
        >
          <Ionicons name="create-outline" size={16} color="#666" />
        </TouchableOpacity>
        {item.status === 'approved' && (
          <TouchableOpacity
            style={styles.convertButton}
            onPress={() => handleConvertToSalesOrder(item)}
          >
            <Ionicons name="arrow-forward-outline" size={16} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>
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
            placeholder="Search quotations, customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('QuotationForm')}
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
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
    borderColor: '#000000',
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
  actionButtons: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -16,
    flexDirection: 'row',
    gap: 8,
  },
  previewButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  editButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  convertButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#e8f5e8',
  },
  workflowContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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

});