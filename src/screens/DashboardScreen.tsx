import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { DashboardData } from '../types';
import { theme } from '../styles/theme';

export default function DashboardScreen({ navigation }: any) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string>('');
  const [userName, setUserName] = useState('');

  const loadDashboardData = async () => {
    try {
      setConnectionStatus('connecting');
      setError('');
      const [dashboardData, userInfo] = await Promise.all([
        ApiService.getDashboardData(),
        ApiService.getCurrentUser()
      ]);
      setData(dashboardData);
      if (userInfo?.fullname) {
        setUserName(userInfo.fullname);
      }
      setConnectionStatus('connected');
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error.message);
      setConnectionStatus('error');
      setError('Failed to load dashboard data');
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to ERPNext';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Failed';
      default: return 'Unknown Status';
    }
  };

  if (loading && !data) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Welcome {userName}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('SalesOrderForm')}
          >
            <Text style={styles.actionButtonText}>Sales Order</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButtonOutline} 
            onPress={() => navigation.navigate('QuotationForm')}
          >
            <Text style={styles.actionButtonOutlineText}>Qoutation</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButtonOutline} 
            onPress={() => navigation.navigate('CustomerList')}
          >
            <Ionicons name="people" size={16} color="#2196F3" />
            <Text style={styles.actionButtonOutlineText}>Customers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButtonOutline} 
            onPress={() => navigation.navigate('ItemList')}
          >
            <Ionicons name="cube" size={16} color="#2196F3" />
            <Text style={styles.actionButtonOutlineText}>Items</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Revenue Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Revenue Overview</Text>
        <View style={styles.revenueItem}>
          <View style={styles.revenueLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
              <Ionicons name="cash" size={16} color="#4CAF50" />
            </View>
            <View>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>{formatCurrency(data?.todaysSales || 0)}</Text>
            </View>
          </View>
          <View style={styles.trendContainer}>
            <Ionicons name="trending-up" size={14} color="#4CAF50" />
            <Text style={styles.trendText}>+12.5%</Text>
          </View>
        </View>
        
        <View style={styles.revenueItem}>
          <View style={styles.revenueLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="calendar" size={16} color="#2196F3" />
            </View>
            <View>
              <Text style={styles.revenueLabel}>This Month</Text>
              <Text style={styles.revenueValue}>{formatCurrency((data?.todaysSales || 0) * 0.8)}</Text>
            </View>
          </View>
          <View style={styles.trendContainer}>
            <Ionicons name="trending-up" size={14} color="#2196F3" />
            <Text style={[styles.trendText, { color: '#2196F3' }]}>+8.2%</Text>
          </View>
        </View>
      </View>

      {/* Sales Summary */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryLeft}>
              <Ionicons name="document-text" size={16} color="#2196F3" />
              <Text style={styles.summaryTitle}>Orders</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('SalesOrderList')}>
              <Ionicons name="arrow-forward" size={12} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryMain}>
              <Text style={styles.summaryNumber}>{data?.orderCount || 0}</Text>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>{data?.pendingDeliveries || 0} pending</Text>
              </View>
            </View>
            <View style={styles.summaryDetail}>
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <Text style={styles.summaryDetailText}>
                {(data?.orderCount || 0) - (data?.pendingDeliveries || 0)} completed
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryLeft}>
              <Ionicons name="receipt" size={16} color="#9C27B0" />
              <Text style={styles.summaryTitle}>Quotes</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('QuotationList')}>
              <Ionicons name="arrow-forward" size={12} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryMain}>
              <Text style={styles.summaryNumber}>12</Text>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>3 drafts</Text>
              </View>
            </View>
            <View style={styles.summaryDetail}>
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
              <Text style={styles.summaryDetailText}>9 approved</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Alerts */}
      <View style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <Ionicons name="alert-circle" size={16} color="#FF9800" />
          <Text style={styles.alertTitle}>Attention Needed</Text>
        </View>
        <View style={styles.alertItem}>
          <Text style={styles.alertText}>3 quotations expiring soon</Text>
          <TouchableOpacity 
            style={styles.alertButton} 
            onPress={() => navigation.navigate('QuotationList')}
          >
            <Text style={styles.alertButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.alertItem}>
          <Text style={styles.alertText}>5 orders awaiting confirmation</Text>
          <TouchableOpacity 
            style={styles.alertButton} 
            onPress={() => navigation.navigate('SalesOrderList')}
          >
            <Text style={styles.alertButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.foreground,
  },
  card: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as '600',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonOutline: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonOutlineText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  revenueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  revenueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueLabel: {
    fontSize: 12,
    color: '#666',
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#666',
  },
  summaryContent: {
    gap: 8,
  },
  summaryMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  summaryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  summaryBadgeText: {
    fontSize: 10,
    color: '#666',
  },
  summaryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryDetailText: {
    fontSize: 10,
    color: '#666',
  },
  alertCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  alertButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  alertButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
});