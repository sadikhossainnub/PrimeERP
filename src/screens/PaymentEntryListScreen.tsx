import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const DUMMY_PAYMENTS = [
  { id: '1', customer: 'John Doe', amount: 100.0, date: '2023-10-27' },
  { id: '2', customer: 'Jane Smith', amount: 150.0, date: '2023-10-26' },
];

export default function PaymentEntryListScreen({ navigation }: any) {
  const renderPaymentItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('PaymentEntryForm', { paymentId: item.id })}
    >
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.customer}</Text>
        <Text style={styles.itemSubtitle}>Amount: ${item.amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.itemDate}>{item.date}</Text>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.mutedForeground} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DUMMY_PAYMENTS}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
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
  listContent: {
    padding: 16,
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