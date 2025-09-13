import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface Item {
  id: string;
  item_code: string;
  item_name: string;
  description?: string;
  item_group?: string;
  standard_rate?: number;
  valuation_rate?: number;
  stock_qty?: number;
  stock_uom?: string;
  status: 'active' | 'inactive';
  image?: string;
  creation?: string;
  is_stock_item?: boolean;
  brand?: string;
  item_type?: string;
  weight_per_unit?: number;
  weight_uom?: string;
  opening_stock?: number;
  shelf_life_in_days?: number;
  end_of_life?: string;
  default_material_request_type?: string;
  has_batch_no?: boolean;
  has_serial_no?: boolean;
  warranty_period?: number;
  country_of_origin?: string;
  customs_tariff_number?: string;
  sales_uom?: string;
  purchase_uom?: string;
  min_order_qty?: number;
  safety_stock?: number;
  lead_time_days?: number;
  last_purchase_rate?: number;
  is_purchase_item?: boolean;
  is_sales_item?: boolean;
  include_item_in_manufacturing?: boolean;
  is_sub_contracted_item?: boolean;
  customer_code?: string;
  published_in_website?: boolean;
  total_projected_qty?: number;
}

const mockItems: Item[] = [
  {
    id: '1',
    item_code: 'SW-001',
    item_name: 'Professional Software License',
    description: 'Annual subscription for professional software suite',
    item_group: 'Software',
    standard_rate: 299.99,
    valuation_rate: 180.00,
    stock_qty: 50,
    stock_uom: 'Nos',
    status: 'active',
    creation: '2025-01-01',
    is_stock_item: false
  },
  {
    id: '2',
    item_code: 'CS-001',
    item_name: 'Cloud Storage Subscription',
    description: 'Monthly cloud storage plan - 1TB',
    item_group: 'Cloud Services',
    standard_rate: 49.99,
    valuation_rate: 25.00,
    stock_qty: 999,
    stock_uom: 'Nos',
    status: 'active',
    creation: '2025-01-02',
    is_stock_item: false
  },
  {
    id: '3',
    item_code: 'TS-001',
    item_name: 'Technical Support Package',
    description: 'Premium technical support for 6 months',
    item_group: 'Services',
    standard_rate: 199.99,
    valuation_rate: 120.00,
    stock_qty: 25,
    stock_uom: 'Nos',
    status: 'active',
    creation: '2025-01-03',
    is_stock_item: true
  }
];

export default function ItemListScreen({ navigation }: any) {
  const [items, setItems] = useState<Item[]>([]);
  const [itemGroups, setItemGroups] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'discontinued', label: 'Discontinued' }
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.item_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || (item.item_group || '') === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a: Item, b: Item) => {
    const dateA = a.creation ? new Date(a.creation).getTime() : 0;
    const dateB = b.creation ? new Date(b.creation).getTime() : 0;
    return dateB - dateA;
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const [itemsResponse, groupsResponse, stockResponse] = await Promise.all([
        ApiService.getItems(0, 0, searchQuery),
        ApiService.getItemGroups(),
        ApiService.getItemStock()
      ]);
      
      // Create stock map for quick lookup
      const stockMap = new Map();
      stockResponse.data?.forEach((bin: any) => {
        const currentQty = stockMap.get(bin.item_code) || 0;
        stockMap.set(bin.item_code, currentQty + (bin.actual_qty || 0));
      });
      
      const serverItems = itemsResponse.data?.map((item: any) => ({
        id: item.name,
        item_code: item.item_code,
        item_name: item.item_name,
        description: item.description,
        item_group: item.item_group,
        standard_rate: item.standard_rate,
        valuation_rate: item.valuation_rate,
        stock_qty: stockMap.get(item.item_code) || 0,
        stock_uom: item.stock_uom,
        status: item.disabled ? 'inactive' : 'active',
        image: item.image ? `https://paperware.jfmart.site${item.image}` : null,
        creation: item.creation,
        is_stock_item: item.is_stock_item,
        brand: item.brand,
        item_type: item.item_type,
        weight_per_unit: item.weight_per_unit,
        weight_uom: item.weight_uom,
        country_of_origin: item.country_of_origin
      })) || [];
      
      const groups = ['All', ...groupsResponse.data?.map((group: any) => group.name) || []];
      setItemGroups(groups);
      setItems(serverItems);
    } catch (error) {
      console.error('Failed to load items:', error);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadItems();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return '৳0';
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF9800';
      case 'discontinued': return '#F44336';
      default: return '#666';
    }
  };

  const getStockStatus = (item: Item) => {
    if (item.status === 'inactive') {
      return { label: 'Disabled', color: '#EF4444', icon: 'close-circle' };
    }
    if (!item.is_stock_item) {
      return { label: 'Service', color: '#3B82F6', icon: 'checkmark-circle' };
    }
    if ((item.stock_qty || 0) <= 0) {
      return { label: 'Out of Stock', color: '#F59E0B', icon: 'alert-circle' };
    } else if ((item.stock_qty || 0) <= 10) {
      return { label: 'Low Stock', color: '#F59E0B', icon: 'alert-circle' };
    } else {
      return { label: 'In Stock', color: '#10B981', icon: 'checkmark-circle' };
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigation.navigate('ItemForm', { item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.itemImageContainer}>
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                style={styles.itemImage}
                defaultSource={require('../../assets/icon.png')}
              />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>
          
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleContainer}>
                <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
                <Text style={styles.itemCode}>{item.item_code}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: stockStatus.color + '20' }]}>
                <Ionicons name={stockStatus.icon as any} size={12} color={stockStatus.color} />
                <Text style={[styles.statusText, { color: stockStatus.color }]}>
                  {stockStatus.label}
                </Text>
              </View>
            </View>
            
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.itemFooter}>
              <View style={styles.itemStats}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#EBF8FF' }]}>
                    <Ionicons name="bar-chart" size={14} color="#3B82F6" />
                  </View>
                  <Text style={styles.statText}>{item.stock_qty || 0} {item.stock_uom || ''}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="cash" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.statText}>₹{(item.valuation_rate || 0).toLocaleString()}</Text>
                </View>
              </View>
              <View style={[styles.itemGroupBadge, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                <Text style={styles.itemGroupText}>{item.item_group || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Title Section */}
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="cube" size={20} color="white" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Inventory</Text>
              <View style={styles.statsRow}>
                <Ionicons name="trending-up" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.itemCount}>
                  {filteredItems.length} of {items.length} items
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ItemForm')}
          >
            <View style={styles.addButtonGradient}>
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchGradient}>
            <Ionicons name="search" size={20} color="#363738ff" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, code, or description..."
              placeholderTextColor="#343536ff"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('All')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.filterButton,
                { backgroundColor: selectedCategory === 'All' ? 'black' : 'rgba(255,255,255,0.7)' }
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                { color: selectedCategory === 'All' ? 'white' : '#374151' }
              ]}>
                All Categories
              </Text>
            </View>
          </TouchableOpacity>
          {itemGroups.filter(group => group !== 'All').map(group => (
            <TouchableOpacity
              key={group}
              onPress={() => setSelectedCategory(group)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.filterButton,
                  { backgroundColor: selectedCategory === group ? 'black' : 'rgba(255,255,255,0.7)' }
                ]}
              >
                <Text style={[
                  styles.filterButtonText,
                  { color: selectedCategory === group ? 'white' : '#374151' }
                ]}>
                  {group}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
            <View style={[styles.emptyIcon, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'all') && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedStatus('all');
                }}
              >
                <View style={[styles.clearButton, { backgroundColor: 'black' }]}>
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titleContainer: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'black',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemCount: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: 'black',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  clearSearchText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusFilterScroll: {
    marginBottom: 8,
  },
  statusFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  itemImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  itemImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  itemTitleContainer: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  itemGroupBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemGroupText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
});