import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import apiService from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

type DeliveryNoteListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeliveryNoteList'>;

interface DeliveryNote {
  name: string;
  posting_date: string;
  customer: string;
  customer_name: string;
  grand_total: number;
  status: string;
}

const DeliveryNoteItem = ({ deliveryNote, onPress }: { deliveryNote: DeliveryNote; onPress: () => void }) => (
  <TouchableOpacity style={itemStyles.card} onPress={onPress}>
    <View style={itemStyles.header}>
      <Text style={itemStyles.title}>{deliveryNote.name}</Text>
      <Text style={itemStyles.status}>{deliveryNote.status}</Text>
    </View>
    <Text style={itemStyles.customer}>{deliveryNote.customer_name || deliveryNote.customer}</Text>
    <View style={itemStyles.details}>
      <Text style={itemStyles.detailText}>Date: {deliveryNote.posting_date}</Text>
      <Text style={itemStyles.detailText}>Total: {deliveryNote.grand_total}</Text>
    </View>
  </TouchableOpacity>
);

const itemStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  customer: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: '#777',
  },
});

const PAGE_SIZE = 20;

export default function DeliveryNoteListScreen() {
  const navigation = useNavigation<DeliveryNoteListScreenNavigationProp>();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchDeliveryNotes = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
      setOffset(0);
      setHasMore(true);
    } else if (!hasMore && offset !== 0) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getDeliveryNotes(PAGE_SIZE, isRefreshing ? 0 : offset);
      if (isRefreshing) {
        setDeliveryNotes(response.data);
      } else {
        setDeliveryNotes((prevNotes) => [...prevNotes, ...response.data]);
      }
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('Failed to fetch delivery notes:', err);
      setError('Failed to load delivery notes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [offset, hasMore]);

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

  if (loading && offset === 0 && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
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
      <FlatList
        data={deliveryNotes}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <DeliveryNoteItem
            deliveryNote={item}
            onPress={() => {
              // Handle navigation to DeliveryNote details screen if available
              // navigation.navigate('DeliveryNoteDetail', { name: item.name });
            }}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No delivery notes found.</Text>
          </View>
        }
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchDeliveryNotes(true)} />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('DeliveryNoteForm', {})}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ced4da',
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    bottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});