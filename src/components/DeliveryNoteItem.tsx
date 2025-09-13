import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { theme } from '../styles/theme';

interface DeliveryNote {
  name: string;
  posting_date: string;
  customer: string;
  customer_name: string;
  grand_total: number;
  status: string;
}

interface DeliveryNoteItemProps {
  deliveryNote: DeliveryNote;
  onPress: () => void;
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

export function DeliveryNoteItem({ deliveryNote, onPress }: DeliveryNoteItemProps) {
  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            <Text style={styles.title}>{deliveryNote.name}</Text>
          </View>
          <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(deliveryNote.status) }]}>
            <Text style={styles.statusText}>{deliveryNote.status}</Text>
          </Badge>
        </View>
        
        <View style={styles.customerRow}>
          <Ionicons name="person" size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.customer}>{deliveryNote.customer_name || deliveryNote.customer}</Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.detailText}>{new Date(deliveryNote.posting_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={14} color={theme.colors.mutedForeground} />
            <Text style={styles.detailText}>৳{deliveryNote.grand_total?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
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