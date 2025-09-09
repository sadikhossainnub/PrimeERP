import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { theme } from '../styles/theme';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  items: number;
}

interface SalesOrderItemProps {
  order: SalesOrder;
  onClick: () => void;
}

export function SalesOrderItem({ order, onClick }: SalesOrderItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <TouchableOpacity onPress={onClick} style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.customerEmail}>{order.customerEmail}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.mutedForeground} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Order Date</Text>
                  <Text style={styles.detailValue}>{formatDate(order.orderDate)}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="cube-outline" size={14} color={theme.colors.mutedForeground} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Items</Text>
                  <Text style={styles.detailValue}>{order.items} items</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={14} color={theme.colors.mutedForeground} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(order.totalAmount, order.currency)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.mutedForeground} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Delivery</Text>
                  <Text style={styles.detailValue}>{formatDate(order.deliveryDate)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  card: {
    ...theme.shadows.md,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  orderNumber: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  statusBadge: {
    fontSize: 10,
    color: 'white',
  },
  customerInfo: {
    marginBottom: theme.spacing.md,
  },
  customerName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.mutedForeground,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.foreground,
    fontWeight: theme.typography.fontWeight.medium,
  },
});