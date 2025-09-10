import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

interface CustomerFormProps {
  route?: any;
  navigation: any;
}

export default function CustomerFormScreen({ route, navigation }: CustomerFormProps) {
  const customer = route?.params?.customer;
  const isEdit = !!customer;

  const [formData, setFormData] = useState({
    // Basic Information
    companyName: customer?.name || '',
    contactPersonName: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    
    // Address Information
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    
    // Business Information
    industry: '',
    companySize: '',
    taxId: '',
    paymentTerms: '30',
    creditLimit: '',
    currency: 'BDT',
    
    // Additional Information
    notes: '',
    isActive: true,
    preferredContact: 'email'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = 'Contact person name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const customerData = {
        customer_name: formData.companyName,
        customer_type: 'Company',
        territory: 'All Territories'
      };

      if (isEdit) {
        await ApiService.updateCustomer(customer.id, customerData);
        Alert.alert('Success', 'Customer updated successfully!');
      } else {
        await ApiService.createCustomer(customerData);
        Alert.alert('Success', 'Customer created successfully!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save Customer:', error);
      Alert.alert('Error', 'Failed to save Customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Basic Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.cardTitle}>Basic Information</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={[styles.input, errors.companyName && styles.inputError]}
              placeholder="Enter company name"
              value={formData.companyName}
              onChangeText={(text) => handleInputChange('companyName', text)}
            />
            {errors.companyName && (
              <Text style={styles.errorText}>{errors.companyName}</Text>
            )}
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Contact Person *</Text>
              <TextInput
                style={[styles.input, errors.contactPersonName && styles.inputError]}
                placeholder="Full name"
                value={formData.contactPersonName}
                onChangeText={(text) => handleInputChange('contactPersonName', text)}
              />
              {errors.contactPersonName && (
                <Text style={styles.errorText}>{errors.contactPersonName}</Text>
              )}
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Job Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sales Manager"
                value={formData.jobTitle}
                onChangeText={(text) => handleInputChange('jobTitle', text)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="mail" size={16} color="#666" />
          <Text style={styles.cardTitle}>Contact Information</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="contact@company.com"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="+880 1234-567890"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                placeholder="https://company.com"
                value={formData.website}
                onChangeText={(text) => handleInputChange('website', text)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Address Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.cardTitle}>Address Information</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 1</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              value={formData.addressLine1}
              onChangeText={(text) => handleInputChange('addressLine1', text)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Apartment, suite, etc. (optional)"
              value={formData.addressLine2}
              onChangeText={(text) => handleInputChange('addressLine2', text)}
            />
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>State/Division</Text>
              <TextInput
                style={styles.input}
                placeholder="State or Division"
                value={formData.state}
                onChangeText={(text) => handleInputChange('state', text)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Additional Information */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={16} color="#666" />
          <Text style={styles.cardTitle}>Additional Information</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes about this customer..."
              value={formData.notes}
              onChangeText={(text) => handleInputChange('notes', text)}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Customer Status</Text>
              <Text style={styles.subLabel}>Enable to mark customer as active</Text>
            </View>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => handleInputChange('isActive', value)}
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {isEdit ? 'Update Customer' : 'Create Customer'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#030213',
  },
  cardContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#030213',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    height: 48,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#030213',
    backgroundColor: '#f8f8f8',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#030213',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});