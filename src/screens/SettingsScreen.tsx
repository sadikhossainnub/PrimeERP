import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';
import NotificationService from '../services/notifications';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [url, key, secret, theme, notif] = await Promise.all([
        AsyncStorage.getItem('serverUrl'),
        AsyncStorage.getItem('apiKey'),
        AsyncStorage.getItem('apiSecret'),
        AsyncStorage.getItem('darkMode'),
        AsyncStorage.getItem('notifications'),
      ]);

      setServerUrl(url || '');
      setApiKey(key || '');
      setApiSecret(secret || '');
      setDarkMode(theme === 'true');
      setNotifications(notif !== 'false');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveCredentials = async () => {
    if (!serverUrl || !apiKey || !apiSecret) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await ApiService.setCredentials(serverUrl, apiKey, apiSecret);
      Alert.alert('Success', 'Credentials saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save credentials');
      console.error('Failed to save credentials:', error);
    }
  };

  const testConnection = async () => {
    try {
      await ApiService.getList('User', undefined, ['name'], 1);
      Alert.alert('Success', 'Connection test successful');
    } catch (error) {
      Alert.alert('Error', 'Connection test failed. Please check your credentials.');
      console.error('Connection test failed:', error);
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem('darkMode', value.toString());
  };

  const toggleNotifications = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem('notifications', value.toString());
    
    if (value) {
      const token = await NotificationService.registerForPushNotifications();
      if (token) {
        await NotificationService.saveTokenToERPNext(token);
      }
    }
  };

  const clearData = async () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all stored data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            setServerUrl('');
            setApiKey('');
            setApiSecret('');
            setDarkMode(false);
            setNotifications(true);
            Alert.alert('Success', 'All data cleared');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ERPNext Server Configuration</Text>
        
        <TextInput
          label="Server URL *"
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="https://your-erpnext-server.com"
          style={styles.input}
        />

        <TextInput
          label="API Key *"
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          label="API Secret *"
          value={apiSecret}
          onChangeText={setApiSecret}
          secureTextEntry
          style={styles.input}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={saveCredentials}>
            <Text style={styles.buttonText}>Save Credentials</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={testConnection}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Test Connection</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch value={notifications} onValueChange={toggleNotifications} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearData}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.48,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  dangerButtonText: {
    color: 'white',
  },
});