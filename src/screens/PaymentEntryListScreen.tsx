import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import api from '../services/api';
import { PaymentEntry } from '../types';
import { Input } from '../components/ui/input';

export default function PaymentEntryListScreen({ navigation }: any) {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.getPaymentEntries(20, 0, search);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payment entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [search])
  );

  const renderPaymentItem = ({ item }: { item: PaymentEntry }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('PaymentEntryForm', { paymentId: item.name })}
    >
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.party}</Text>
        <Text style={styles.itemSubtitle}>Amount: ${item.paid_amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.itemDate}>{item.posting_date}</Text>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.mutedForeground} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by party name..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PaymentEntryForm')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  searchInput: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.foreground,
  },
  itemSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  itemDate: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});