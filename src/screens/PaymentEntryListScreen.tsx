import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import api from '../services/api';
import { PaymentEntry } from '../types';
import { Input } from '../components/ui/input';

export default function PaymentEntryListScreen({ navigation }: any) {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPayments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.getPaymentEntries(20, 0, search);
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payment entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchPayments(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [search])
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return theme.colors.mutedForeground;
    }
  };

  const getPaymentIcon = (partyType: string) => {
    switch (partyType.toLowerCase()) {
      case 'customer': return 'account-circle';
      case 'supplier': return 'business';
      case 'employee': return 'person';
      default: return 'payment';
    }
  };

  const renderPaymentItem = ({ item }: { item: PaymentEntry }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => navigation.navigate('PaymentEntryForm', { paymentId: item.name })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + '80']}
            style={styles.iconContainer}
          >
            <MaterialIcons 
              name={getPaymentIcon(item.party_type)} 
              size={26} 
              color="white" 
            />
          </LinearGradient>
          <View style={styles.headerInfo}>
            <Text style={styles.partyName} numberOfLines={1}>{item.party}</Text>
            <View style={styles.partyTypeContainer}>
              <View style={styles.partyTypeDot} />
              <Text style={styles.partyType}>{item.party_type}</Text>
            </View>
          </View>
          <LinearGradient
            colors={[getStatusColor(item.status) + '20', getStatusColor(item.status) + '10']}
            style={styles.statusBadge}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </LinearGradient>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.amountSection}>
            <View style={styles.amountHeader}>
              <Ionicons name="cash" size={18} color="#10b981" />
              <Text style={styles.amountLabel}>Paid Amount</Text>
            </View>
            <Text style={styles.amountValue}>${item.paid_amount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar" size={16} color="#6366f1" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailText}>{new Date(item.posting_date).toLocaleDateString()}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="card" size={16} color="#8b5cf6" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Method</Text>
                <Text style={styles.detailText}>{item.mode_of_payment}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.entryId}>#{item.name}</Text>
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
          </View>
        </View>
      </LinearGradient>
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
    <LinearGradient
      colors={['#f0f9ff', '#f8fafc']}
      style={styles.container}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.searchContainer}
        >
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color={theme.colors.mutedForeground} style={styles.searchIcon} />
            <Input
              placeholder="Search payments..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>
      </View>
      
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PaymentEntryForm')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary + 'dd']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={26} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
  },
  searchContainer: {
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.sm,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  separator: {
    height: theme.spacing.md,
  },
  paymentCard: {
    borderRadius: 20,
    ...theme.shadows.lg,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  headerInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  partyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 6,
  },
  partyType: {
    fontSize: theme.typography.fontSize.sm,
    color: '#6b7280',
    textTransform: 'capitalize',
    fontWeight: '500' as const,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...theme.shadows.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    marginBottom: theme.spacing.lg,
  },
  amountSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500' as const,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#10b981',
    letterSpacing: -0.5,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    ...theme.shadows.sm,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: '#9ca3af',
    fontWeight: '500' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#374151',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  entryId: {
    fontSize: theme.typography.fontSize.sm,
    color: '#6b7280',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    borderRadius: 30,
    ...theme.shadows.lg,
    elevation: 12,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});