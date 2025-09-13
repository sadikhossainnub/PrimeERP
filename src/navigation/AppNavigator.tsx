import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Badge } from 'react-native-paper';
import { theme } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toggle } from '../components/ui/Toggle';
 
 import DashboardScreen from '../screens/DashboardScreen';
 import CustomerListScreen from '../screens/CustomerListScreen';
import CustomerFormScreen from '../screens/CustomerFormScreen';
import ItemListScreen from '../screens/ItemListScreen';
import ItemFormScreen from '../screens/ItemFormScreen';
import QuotationListScreen from '../screens/QuotationListScreen';
import QuotationFormScreen from '../screens/QuotationFormScreen';
import SalesOrderListScreen from '../screens/SalesOrderListScreen';
import SalesOrderFormScreen from '../screens/SalesOrderFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import { MoreScreen } from './MoreScreen';
import ApiService from '../services/api';
import DeliveryNoteListScreen from '../screens/DeliveryNoteListScreen';
import DeliveryNoteFormScreen from '../screens/DeliveryNoteFormScreen';
import ExpenseClaimListScreen from '../screens/ExpenseClaimListScreen';
import ExpenseClaimFormScreen from '../screens/ExpenseClaimFormScreen';
import LeaveRequestListScreen from '../screens/LeaveRequestListScreen';
import LeaveRequestFormScreen from '../screens/LeaveRequestFormScreen';
import PaymentEntryListScreen from '../screens/PaymentEntryListScreen';
import PaymentEntryFormScreen from '../screens/PaymentEntryFormScreen';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import TaskListScreen from '../screens/TaskListScreen';
import DocumentPreviewScreen from '../screens/DocumentPreviewScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  App: undefined;
  CustomerList: undefined;
  CustomerForm: { name?: string };
  ItemList: undefined;
  ItemForm: { name?: string };
  QuotationList: undefined;
  QuotationForm: { name?: string };
  SalesOrderList: undefined;
  SalesOrderForm: { name?: string };
  DeliveryNoteList: undefined;
  DeliveryNoteForm: { name?: string };
  ExpenseClaimList: undefined;
  ExpenseClaimForm: { name?: string };
  LeaveRequestList: undefined;
  LeaveRequestForm: { name?: string };
  PaymentEntryList: undefined;
  PaymentEntryForm: { name?: string };
  AttendanceList: undefined;
  TaskList: undefined;
  MoreMain: undefined;
  Settings: undefined;
  DocumentPreview: { document: any; docType: string };
  Attendance: undefined;
  Tasks: undefined;
  DeliveryNotes: undefined;
  ExpenseClaims: undefined;
  LeaveRequests: undefined;
  PaymentEntries: undefined;
};


const CustomerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
    <Stack.Screen name="CustomerForm" component={CustomerFormScreen} options={{ title: 'Customer Form' }} />
  </Stack.Navigator>
);

const ItemStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ItemList" component={ItemListScreen} options={{ title: 'Items' }} />
    <Stack.Screen name="ItemForm" component={ItemFormScreen} options={{ title: 'Item Form' }} />
  </Stack.Navigator>
);

const QuotationStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="QuotationList" component={QuotationListScreen} options={{ title: 'Quotations' }} />
    <Stack.Screen name="QuotationForm" component={QuotationFormScreen} options={{ title: 'Quotation Form' }} />
    <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const SalesOrderStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SalesOrderList" component={SalesOrderListScreen} options={{ title: 'Sales Orders' }} />
    <Stack.Screen name="SalesOrderForm" component={SalesOrderFormScreen} options={{ title: 'Sales Order Form' }} />
    <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const DeliveryNoteStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="DeliveryNoteList" component={DeliveryNoteListScreen} options={{ title: 'Delivery Notes' }} />
      <Stack.Screen name="DeliveryNoteForm" component={DeliveryNoteFormScreen} options={{ title: 'Delivery Note Form' }} />
      <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
  
  const ExpenseClaimStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="ExpenseClaimList" component={ExpenseClaimListScreen} options={{ title: 'Expense Claims' }} />
      <Stack.Screen name="ExpenseClaimForm" component={ExpenseClaimFormScreen} options={{ title: 'Expense Claim Form' }} />
      <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
  
  const LeaveRequestStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="LeaveRequestList" component={LeaveRequestListScreen} options={{ title: 'Leave Requests' }} />
      <Stack.Screen name="LeaveRequestForm" component={LeaveRequestFormScreen} options={{ title: 'Leave Request Form' }} />
      <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );

const PaymentEntryStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="PaymentEntryList" component={PaymentEntryListScreen} options={{ title: 'Payment Entries' }} />
        <Stack.Screen name="PaymentEntryForm" component={PaymentEntryFormScreen} options={{ title: 'Payment Entry Form' }} />
        <Stack.Screen name="DocumentPreview" component={DocumentPreviewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
    );

const AttendanceStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="AttendanceList" component={AttendanceListScreen} options={{ title: 'Attendance' }} />
  </Stack.Navigator>
);

const TaskStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tasks' }} />
  </Stack.Navigator>
);

const MoreStack = ({ onLogout }: { onLogout: () => void }) => {
  const MoreMainComponent = (props: any) => <MoreTabScreen {...props} onLogout={onLogout} />;
  
  return (
    <Stack.Navigator>
      <Stack.Screen name="MoreMain" component={MoreMainComponent} options={{ title: 'More' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
};

function MoreTabScreen({ navigation, onLogout }: any) {
  const handleLogout = async () => {
    await ApiService.logout();
    onLogout();
  };

  return (
    <MoreScreen onLogout={handleLogout} navigation={navigation} />
  );
}

const MainTabs = ({ onLogout }: { onLogout: () => void }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    orders: 0,
    quotes: 0,
  });
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const fetchNotificationCounts = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      const [ordersResponse, quotesResponse] = await Promise.all([
        ApiService.getSalesOrders(50, 0, ''),
        ApiService.getQuotations(50, 0, '')
      ]);
      
      const draftOrders = ordersResponse.data?.filter((order: any) => 
        order.status === 'Draft' && order.owner === user.email
      ).length || 0;
      const draftQuotes = quotesResponse.data?.filter((quote: any) => 
        quote.status === 'Draft' && quote.owner === user.email
      ).length || 0;
      
      setNotificationCounts({
        orders: draftOrders,
        quotes: draftQuotes,
      });
      setNotificationError(null);
    } catch (error: any) {
      console.error('Failed to fetch notification counts:', error.message);
      setNotificationError(error.message || 'Failed to fetch notifications.');
      setNotificationCounts({ orders: 0, quotes: 0 });
    }
  };

  useEffect(() => {
    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleTabPress = (routeName: string) => {
    if (notificationError && (routeName === 'Orders' || routeName === 'Quotes')) {
      Alert.alert(
        'Notification Error',
        `Could not fetch notification counts. ${notificationError}`,
        [{ text: 'Retry', onPress: fetchNotificationCounts }, { text: 'OK' }]
      );
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;
        let badge: number | undefined;
        let hasError = false;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Orders':
            iconName = focused ? 'document-text' : 'document-text-outline';
            badge = notificationCounts.orders > 0 ? notificationCounts.orders : undefined;
            hasError = !!notificationError;
            break;
          case 'Quotes':
            iconName = focused ? 'receipt' : 'receipt-outline';
            badge = notificationCounts.quotes > 0 ? notificationCounts.quotes : undefined;
            hasError = !!notificationError;
            break;
          case 'Customers':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Items':
            iconName = focused ? 'cube' : 'cube-outline';
            break;
          case 'More':
            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
                break;
              default:
                iconName = 'ellipse-outline';
            }

            return (
          <View style={{ position: 'relative' }}>
            <Ionicons name={iconName} size={size} color={color} />
            {badge && !hasError && (
              <Badge
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: '#dc3545',
                  color: 'white',
                  fontSize: 10,
                  minWidth: 16,
                  height: 16,
                }}
              >
                <Text style={{ color: 'white', fontSize: 10 }}>{badge}</Text>
              </Badge>
            )}
            {hasError && (
              <Ionicons
                name="alert-circle"
                size={12}
                color={theme.colors.destructive}
                style={{ position: 'absolute', top: -4, right: -4 }}
              />
            )}
          </View>
        );
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.mutedForeground,
      tabBarStyle: {
        backgroundColor: theme.colors.card,
        borderTopColor: theme.colors.border,
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <Toggle
              pressed={isDarkMode}
              onPressedChange={setIsDarkMode}
              variant="outline"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </Toggle>
          </View>
        )
      }}
    />
    <Tab.Screen 
      name="Orders" 
      component={SalesOrderStack} 
      options={{ headerShown: false }} 
      listeners={{ tabPress: () => handleTabPress('Orders') }}
    />
    <Tab.Screen 
      name="Quotes" 
      component={QuotationStack} 
      options={{ headerShown: false }} 
      listeners={{ tabPress: () => handleTabPress('Quotes') }}
    />
    <Tab.Screen name="Customers" component={CustomerStack} options={{ headerShown: false }} />
    <Tab.Screen name="Items" component={ItemStack} options={{ headerShown: false }} />
    <Tab.Screen name="More" options={{ headerShown: false }}>
      {() => <MoreStack onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
  );
};

const AppStack = ({ onLogout }: { onLogout: () => void }) => (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => <MainTabs onLogout={onLogout} />}
      </Stack.Screen>
        <Stack.Screen name="Attendance" component={AttendanceStack} options={{ headerShown: false }} />
        <Stack.Screen name="Tasks" component={TaskStack} options={{ headerShown: false }} />
        <Stack.Screen name="DeliveryNotes" component={DeliveryNoteStack} options={{ headerShown: false }} />
        <Stack.Screen name="ExpenseClaims" component={ExpenseClaimStack} options={{ headerShown: false }} />
        <Stack.Screen name="LeaveRequests" component={LeaveRequestStack} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentEntries" component={PaymentEntryStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  );

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (user: any) => {
    if (user) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };


  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen name="App" options={{ headerShown: false }}>
            {() => <AppStack onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {() => <LoginScreen onLogin={handleLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
