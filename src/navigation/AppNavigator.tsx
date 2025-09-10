import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Badge } from 'react-native-paper';
import { theme } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
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


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


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
  </Stack.Navigator>
);

const SalesOrderStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SalesOrderList" component={SalesOrderListScreen} options={{ title: 'Sales Orders' }} />
    <Stack.Screen name="SalesOrderForm" component={SalesOrderFormScreen} options={{ title: 'Sales Order Form' }} />
  </Stack.Navigator>
);

const DeliveryNoteStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="DeliveryNoteList" component={DeliveryNoteListScreen} options={{ title: 'Delivery Notes' }} />
      <Stack.Screen name="DeliveryNoteForm" component={DeliveryNoteFormScreen} options={{ title: 'Delivery Note Form' }} />
    </Stack.Navigator>
  );
  
  const ExpenseClaimStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="ExpenseClaimList" component={ExpenseClaimListScreen} options={{ title: 'Expense Claims' }} />
      <Stack.Screen name="ExpenseClaimForm" component={ExpenseClaimFormScreen} options={{ title: 'Expense Claim Form' }} />
    </Stack.Navigator>
  );
  
  const LeaveRequestStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="LeaveRequestList" component={LeaveRequestListScreen} options={{ title: 'Leave Requests' }} />
      <Stack.Screen name="LeaveRequestForm" component={LeaveRequestFormScreen} options={{ title: 'Leave Request Form' }} />
    </Stack.Navigator>
  );

const PaymentEntryStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="PaymentEntryList" component={PaymentEntryListScreen} options={{ title: 'Payment Entries' }} />
        <Stack.Screen name="PaymentEntryForm" component={PaymentEntryFormScreen} options={{ title: 'Payment Entry Form' }} />
    </Stack.Navigator>
    );

const MoreStack = ({ onLogout }: { onLogout: () => void }) => (
    <Stack.Navigator>
      <Stack.Screen name="MoreMain" options={{ title: 'More' }}>
        {(props) => <MoreTabScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );

function MoreTabScreen({ navigation, onLogout }: any) {
  const handleLogout = async () => {
    await ApiService.logout();
    onLogout();
  };

  return (
    <MoreScreen onLogout={handleLogout} navigation={navigation} />
  );
}

const MainTabs = ({ onLogout }: { onLogout: () => void }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;
        let badge: number | undefined;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Orders':
            iconName = focused ? 'document-text' : 'document-text-outline';
            badge = 3;
            break;
          case 'Quotes':
            iconName = focused ? 'receipt' : 'receipt-outline';
            badge = 2;
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
            {badge && (
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
                {badge}
              </Badge>
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
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Orders" component={SalesOrderStack} options={{ headerShown: false }} />
    <Tab.Screen name="Quotes" component={QuotationStack} options={{ headerShown: false }} />
    <Tab.Screen name="Customers" component={CustomerStack} options={{ headerShown: false }} />
    <Tab.Screen name="Items" component={ItemStack} options={{ headerShown: false }} />
    <Tab.Screen name="More" options={{ headerShown: false }}>
      {() => <MoreStack onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

const AppStack = ({ onLogout }: { onLogout: () => void }) => (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => <MainTabs onLogout={onLogout} />}
      </Stack.Screen>
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sid = await AsyncStorage.getItem('sid');
        if (sid) {
          await ApiService.getCurrentUser();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

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
