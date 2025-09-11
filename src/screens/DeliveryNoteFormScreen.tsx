import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiService from '../services/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { DeliveryNote, DeliveryNoteItem } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

type DeliveryNoteFormScreenRouteProp = RouteProp<RootStackParamList, 'DeliveryNoteForm'>;
type DeliveryNoteFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeliveryNoteForm'>;

export default function DeliveryNoteFormScreen() {
  const navigation = useNavigation<DeliveryNoteFormScreenNavigationProp>();
  const route = useRoute<DeliveryNoteFormScreenRouteProp>();
  const { name: deliveryNoteName } = route.params || {};

  const [deliveryNote, setDeliveryNote] = useState<Partial<DeliveryNote>>({
    customer: '',
    posting_date: new Date().toISOString().split('T')[0],
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (deliveryNoteName) {
      setIsEditing(true);
      fetchDeliveryNote(deliveryNoteName);
    }
  }, [deliveryNoteName]);

  const fetchDeliveryNote = async (name: string) => {
    setLoading(true);
    try {
      // Assuming a getDeliveryNote by name exists in apiService
      // For now, we'll simulate fetching if it's not implemented yet
      // const response = await apiService.getDeliveryNote(name);
      // setDeliveryNote(response.data);
      Alert.alert('Info', 'Fetching existing Delivery Note is not yet implemented.');
    } catch (error) {
      console.error('Failed to fetch delivery note:', error);
      Alert.alert('Error', 'Failed to load delivery note.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DeliveryNote, value: any) => {
    setDeliveryNote({ ...deliveryNote, [field]: value });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date(deliveryNote.posting_date || new Date());
    setShowDatePicker(false);
    handleInputChange('posting_date', currentDate.toISOString().split('T')[0]);
  };

  const handleAddItem = () => {
    setDeliveryNote((prev) => ({
      ...prev,
      items: [...(prev.items || []), { item_code: '', qty: 0 }],
    }));
  };

  const handleItemChange = (index: number, field: keyof DeliveryNoteItem, value: any) => {
    const newItems = [...(deliveryNote.items || [])];
    (newItems[index] as any)[field] = value;
    setDeliveryNote({ ...deliveryNote, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(deliveryNote.items || [])];
    newItems.splice(index, 1);
    setDeliveryNote({ ...deliveryNote, items: newItems });
  };

  const handleSubmit = async () => {
    if (!deliveryNote.customer || !deliveryNote.posting_date || !deliveryNote.items?.length) {
      Alert.alert('Validation Error', 'Please fill all required fields and add at least one item.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await apiService.updateDoc('Delivery Note', deliveryNoteName!, deliveryNote);
        Alert.alert('Success', 'Delivery Note updated successfully!');
      } else {
        await apiService.createDoc('Delivery Note', deliveryNote);
        Alert.alert('Success', 'Delivery Note created successfully!');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to save delivery note:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save delivery note.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Delivery Note' : 'Create Delivery Note'}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Customer <Text style={styles.required}>*</Text></Text>
        <Input
          placeholder="Customer"
          value={deliveryNote.customer}
          onChangeText={(text) => handleInputChange('customer', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Posting Date <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text>{deliveryNote.posting_date}</Text>
          <Ionicons name="calendar-outline" size={24} color="#555" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(deliveryNote.posting_date || new Date())}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <Text style={styles.sectionTitle}>Items <Text style={styles.required}>*</Text></Text>
      {deliveryNote.items?.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.itemRow}>
            <View style={styles.itemInputContainer}>
              <Text style={styles.label}>Item Code</Text>
              <Input
                placeholder="Item Code"
                value={item.item_code}
                onChangeText={(text) => handleItemChange(index, 'item_code', text)}
              />
            </View>
            <View style={styles.itemInputContainer}>
              <Text style={styles.label}>Quantity</Text>
              <Input
                placeholder="Qty"
                keyboardType="numeric"
                value={item.qty?.toString()}
                onChangeText={(text) => handleItemChange(index, 'qty', parseFloat(text) || 0)}
              />
            </View>
          </View>
          <Button variant="destructive" onPress={() => handleRemoveItem(index)}>
            Remove Item
          </Button>
        </View>
      ))}
      <Button onPress={handleAddItem} style={styles.addItemButton}>
        Add Item
      </Button>

      <Button onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
        {loading ? <ActivityIndicator color="#fff" /> : (isEditing ? 'Update Delivery Note' : 'Create Delivery Note')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  required: {
    color: 'red',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  addItemButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#28a745',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
});