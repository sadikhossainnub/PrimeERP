import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge } from 'react-native-paper';

interface Quotation {
  quotationNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  quotationDate: string;
  items: number;
  totalAmount: number;
  currency: string;
  validUntil: string;
}

interface QuotationItemProps {
  quotation: Quotation;
  onClick: () => void;
}

export function QuotationItem({ quotation, onClick }: QuotationItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#6b7280';
      case 'sent':
        return '#3b82f6';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'expired':
        return '#f59e0b';
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

  const isExpiringSoon = () => {
    const validUntil = new Date(quotation.validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0 && quotation.status === 'sent';
  };

  const isExpired = () => {
    const validUntil = new Date(quotation.validUntil);
    const today = new Date();
    return validUntil < today && quotation.status !== 'approved' && quotation.status !== 'rejected';
  };

  return (
    <TouchableOpacity onPress={onClick} style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.quotationNumber}>{quotation.quotationNumber}</Text>
              <Badge style={[styles.statusBadge, { backgroundColor: getStatusColor(quotation.status) }]}>
                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
              </Badge>
              {isExpiringSoon() && (
                <Badge style={styles.warningBadge}>Expiring Soon</Badge>
              )}
              {isExpired() && (
                <Badge style={styles.errorBadge}>Expired</Badge>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{quotation.customerName}</Text>
            <Text style={styles.customerEmail}>{quotation.customerEmail}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Quote Date</Text>
                  <Text style={styles.detailValue}>{formatDate(quotation.quotationDate)}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="cube-outline" size={14} color="#666" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Items</Text>
                  <Text style={styles.detailValue}>{quotation.items} items</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={14} color="#666" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(quotation.totalAmount, quotation.currency)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Valid Until</Text>
                  <Text style={[
                    styles.detailValue,
                    isExpiringSoon() && styles.warningText,
                    isExpired() && styles.errorText
                  ]}>
                    {formatDate(quotation.validUntil)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quotationNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    fontSize: 10,
    color: 'white',
  },
  warningBadge: {
    backgroundColor: '#f59e0b',
    fontSize: 10,
    color: 'white',
  },
  errorBadge: {
    backgroundColor: '#ef4444',
    fontSize: 10,
    color: 'white',
  },
  customerInfo: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },
  warningText: {
    color: '#f59e0b',
  },
  errorText: {
    color: '#ef4444',
  },
});