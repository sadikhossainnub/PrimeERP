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
  description: string;
  item_group: string;
  standard_rate: number;
  valuation_rate: number;
  stock_qty: number;
  stock_uom: string;
  status: 'active' | 'inactive';
  image?: string;
  creation: string;
  is_stock_item: boolean;
}

const mockItems: Item[] = [
  {
    name: 'Professional Software License',
    description: 'Annual subscription for professional software suite',
    category: 'Software',
    price: 299.99,
    cost: 180.00,
    stock: 50,
    lowStockThreshold: 10,
    status: 'active'
  },
  {
    name: 'Cloud Storage Subscription',
    description: 'Monthly cloud storage plan - 1TB',
    category: 'Cloud Services',
    price: 49.99,
    cost: 25.00,
    stock: 999,
    lowStockThreshold: 50,
    status: 'active'
  },
  {
    name: 'Technical Support Package',
    description: 'Premium technical support for 6 months',
    category: 'Services',
    price: 199.99,
    cost: 120.00,
    stock: 25,
    lowStockThreshold: 5,
    status: 'active'
  }
];

const categories = ['All', 'Software', 'Cloud Services', 'Services', 'Training', 'Security'];

export default function ItemListScreen({ navigation }: any) {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [loading, setLoading] = useState(false);
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
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getItems(50, 0, searchQuery);
      const serverItems = response.data?.map((item: any) => ({
        id: item.name,
        item_code: item.item_code || item.name,
        item_name: item.item_name || item.name,
        description: item.description || 'No description',
        item_group: item.item_group || 'General',
        standard_rate: item.standard_rate || 0,
        valuation_rate: item.valuation_rate || 0,
        stock_qty: item.stock_qty || 0,
        stock_uom: item.stock_uom || 'Nos',
        status: item.disabled ? 'inactive' : 'active',
        image: item.image ? `https://paperware.jfmart.site${item.image}` : null,
        creation: item.creation || new Date().toISOString(),
        is_stock_item: item.is_stock_item || false
      })) || [];
      setItems(serverItems);
    } catch (error) {
      console.error('Failed to load items:', error);
      setItems(mockItems);
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
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const formatDate = (dateString: string) => {
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
    if (!item.is_stock_item) {
      return { label: 'Service', color: '#2196F3' };
    }
    if (item.stock_qty <= 0) {
      return { label: 'Out of Stock', color: '#F44336' };
    } else if (item.stock_qty <= 10) {
      return { label: 'Low Stock', color: '#FF9800' };
    } else {
      return { label: 'In Stock', color: '#4CAF50' };
    }
  };

  const calculateMargin = (price: number, cost: number) => {
    if (price === 0) return '0';
    return ((price - cost) / price * 100).toFixed(1);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderItem = ({ item }: { item: Item }) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigation.navigate('ItemForm', { item })}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemIconContainer}>
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                style={styles.itemImage}
                defaultSource={require('../../assets/icon.png')}
              />
            ) : (
              <View style={styles.itemIcon}>
                <Text style={styles.itemIconText}>{getInitials(item.item_name)}</Text>
              </View>
            )}
          </View>
          <View style={styles.itemInfo}>
            <View style={styles.itemTitleRow}>
              <Text style={styles.itemCode}>{item.item_code}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.itemName}>{item.item_name}</Text>
            <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="folder-outline" size={12} color="#666" />
                <Text style={styles.badgeText}>{item.item_group}</Text>
              </View>
              <View style={[styles.stockBadge, { backgroundColor: `${stockStatus.color}20` }]}>
                <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>{stockStatus.label}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Standard Rate</Text>
            <Text style={styles.priceValue}>{formatCurrency(item.standard_rate)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Valuation Rate</Text>
            <Text style={styles.priceValue}>{formatCurrency(item.valuation_rate)}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {item.is_stock_item && (
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={14} color="#666" />
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Stock</Text>
                <Text style={styles.statValue}>{item.stock_qty} {item.stock_uom}</Text>
              </View>
            </View>
          )}
          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={14} color="#666" />
            <View style={styles.statText}>
              <Text style={styles.statLabel}>Margin</Text>
              <Text style={styles.statValue}>{calculateMargin(item.standard_rate, item.valuation_rate)}%</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <View style={styles.statText}>
              <Text style={styles.statLabel}>Created</Text>
              <Text style={styles.statValue}>{formatDate(item.creation)}</Text>
            </View>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#666" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Items</Text>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Ionicons name="refresh" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
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


      </View>

      {/* Item Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ItemForm')}
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
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
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    marginRight: 8,
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
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemIconContainer: {
    width: 56,
    height: 56,
    marginRight: 12,
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  lastSold: {
    fontSize: 10,
    color: '#666',
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
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
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