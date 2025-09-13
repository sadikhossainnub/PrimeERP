import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import apiService from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { theme } from '../styles/theme';

type DeliveryNoteListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeliveryNoteList'>;

interface DeliveryNote {
  name: string;
  posting_date: string;
  customer: string;
  customer_name: string;
  grand_total: number;
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft': return theme.colors.muted;
    case 'submitted': return theme.colors.primary;
    case 'completed': return '#10B981';
    case 'cancelled': return theme.colors.destructive;
    default: return theme.colors.muted;
  }
};

const DeliveryNoteItem = ({ deliveryNote, onPress }: { deliveryNote: DeliveryNote; onPress: () => void }) => (
  <Card style={itemStyles.card}>
    <TouchableOpacity onPress={onPress} style={itemStyles.cardContent}>
      <View style={itemStyles.header}>
        <View style={itemStyles.titleContainer}>
          <Ionicons name="document-text" size={20} color={theme.colors.primary} />
          <Text style={itemStyles.title}>{deliveryNote.name}</Text>
        </View>
        <Badge style={[itemStyles.statusBadge, { backgroundColor: getStatusColor(deliveryNote.status) }]}>
          <Text style={itemStyles.statusText}>{deliveryNote.status}</Text>
        </Badge>
      </View>
      
      <View style={itemStyles.customerRow}>
        <Ionicons name="person" size={16} color={theme.colors.mutedForeground} />
        <Text style={itemStyles.customer}>{deliveryNote.customer_name || deliveryNote.customer}</Text>
      </View>
      
      <View style={itemStyles.details}>
        <View style={itemStyles.detailItem}>
          <Ionicons name="calendar" size={14} color={theme.colors.mutedForeground} />
          <Text style={itemStyles.detailText}>{new Date(deliveryNote.posting_date).toLocaleDateString()}</Text>
        </View>
        <View style={itemStyles.detailItem}>
          <Ionicons name="cash" size={14} color={theme.colors.mutedForeground} />
          <Text style={itemStyles.detailText}>৳{deliveryNote.grand_total?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  </Card>
);

const itemStyles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  cardContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as '600',
    color: theme.colors.foreground,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: 'white',
    textTransform: 'capitalize',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  customer: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium as '500',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
});

const PAGE_SIZE = 20;

export default function DeliveryNoteListScreen() {
  const navigation = useNavigation<DeliveryNoteListScreenNavigationProp>();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDeliveryNotes = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
      setOffset(0);
      setHasMore(true);
    } else if (!hasMore && offset !== 0) {
      return;
    }

    if (!isRefreshing) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await apiService.getDeliveryNotes(PAGE_SIZE, isRefreshing ? 0 : offset);
      const newNotes = isRefreshing ? response.data : [...deliveryNotes, ...response.data];
      setDeliveryNotes(newNotes);
      setFilteredNotes(newNotes);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('Failed to fetch delivery notes:', err);
      setError('Failed to load delivery notes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [offset, hasMore, deliveryNotes]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredNotes(deliveryNotes);
    } else {
      const filtered = deliveryNotes.filter(note => 
        note.name.toLowerCase().includes(query.toLowerCase()) ||
        note.customer_name?.toLowerCase().includes(query.toLowerCase()) ||
        note.customer?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [deliveryNotes]);

  useFocusEffect(
    useCallback(() => {
      fetchDeliveryNotes(true);
    }, [fetchDeliveryNotes])
  );

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setOffset((prevOffset) => prevOffset + PAGE_SIZE);
    }
  };

  useEffect(() => {
    if (offset !== 0) {
      fetchDeliveryNotes();
    }
  }, [offset, fetchDeliveryNotes]);

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007bff" />
      </View>
    );
  };

  if (loading && deliveryNotes.length === 0 && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Ionicons name="cube" size={24} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>Delivery Notes</Text>
          </View>
          <Text style={styles.headerSubtitle}>{filteredNotes.length} delivery notes</Text>
        </View>
      </View>
      
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search delivery notes..."
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('DeliveryNoteForm', {})}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <DeliveryNoteItem
            deliveryNote={item}
            onPress={() => {
              navigation.navigate('DeliveryNoteForm', { name: item.name });
            }}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={theme.colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No delivery notes found</Text>
            <Text style={styles.emptySubtitle}>Create your first delivery note to get started</Text>
          </View>
        }
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => fetchDeliveryNotes(true)}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
      

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.card,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    gap: theme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as 'bold',
    color: theme.colors.foreground,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
  },
  searchContainer: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as '600',
    color: theme.colors.foreground,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.fontSize.base,
  },
  footer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },

});