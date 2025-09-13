import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../services/api';

interface MoreScreenProps {
  onLogout: () => Promise<void>;
  navigation?: any;
}

export function MoreScreen({ onLogout, navigation }: MoreScreenProps) {
  const [user, setUser] = React.useState<{ email: string; name: string; username: string; user_image?: string } | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchUser = async () => {
    try {
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUser();
    }, [])
  );
  const menuItems = [
    {
      title: 'Attendance',
      subtitle: 'Track your attendance records',
      icon: 'time',
      color: '#06b6d4',
      onPress: () => navigation?.navigate('Attendance'),
    },
    {
      title: 'Task',
      subtitle: 'Manage your tasks and assignments',
      icon: 'checkmark-circle',
      color: '#84cc16',
      onPress: () => navigation?.navigate('Tasks'),
    },
    {
      title: 'Payment Entries',
      subtitle: 'Manage payments and receipts',
      icon: 'card',
      color: '#3b82f6',
      onPress: () => navigation?.navigate('PaymentEntries'),
    },
    {
      title: 'Delivery Notes',
      subtitle: 'Track product deliveries',
      icon: 'car',
      color: '#10b981',
      onPress: () => navigation?.navigate('DeliveryNotes'),
    },
    {
      title: 'Expense Claims',
      subtitle: 'Submit and track expenses',
      icon: 'receipt',
      color: '#f59e0b',
      onPress: () => navigation?.navigate('ExpenseClaims'),
    },
    {
      title: 'Leave Requests',
      subtitle: 'Apply for time off',
      icon: 'calendar',
      color: '#8b5cf6',
      onPress: () => navigation?.navigate('LeaveRequests'),
    },
  ];

  const settingsItems = [
    {
      title: 'Profile Settings',
      subtitle: 'Update your profile information',
      icon: 'person-circle',
      color: '#6b7280',
      onPress: () => {
        navigation?.navigate('Settings');
      },
    },
    {
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications',
      color: '#6b7280',
      onPress: () => {
        Alert.alert('Coming Soon', 'Notification settings will be available in the next update');
      },
    },
    {
      title: 'Data Sync',
      subtitle: 'Sync data with server',
      icon: 'sync',
      color: '#6b7280',
      onPress: () => {
        Alert.alert('Data Sync', 'Data synchronization completed successfully');
      },
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle',
      color: '#6b7280',
      onPress: () => {
        Alert.alert('Help & Support', 'For support, please contact your system administrator');
      },
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#717182" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            {user?.user_image ? (
              <Image source={{ uri: user.user_image }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={32} color="#ffffff" />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{loading ? 'Loading...' : user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{loading ? '...' : user?.email || 'user@example.com'}</Text>
          </View>
        </View>
      </View>

      {/* Main Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Modules</Text>
        <View style={styles.menuList}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Settings Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Support</Text>
        <View style={styles.menuList}>
          {settingsItems.map(renderMenuItem)}
        </View>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Server</Text>
            <Text style={styles.infoValue}>Connected</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Sync</Text>
            <Text style={styles.infoValue}>
              {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Prime ERP Mobile</Text>
        <Text style={styles.footerSubtext}>Built for productivity on the go</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingBottom: 32,
  },
  profileSection: {
    backgroundColor: '#030213',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuList: {
    backgroundColor: '#ffffff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#030213',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#717182',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#717182',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#030213',
  },
  logoutSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#030213',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#717182',
    textAlign: 'center',
  },
});