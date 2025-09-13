import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import apiService from '../services/api';

interface PaymentEntryForm {
  naming_series: string;
  payment_type: string;
  company: string;
  cost_center: string;
  mode_of_payment: string;
  party_type: string;
  party: string;
  party_name: string;
  contact_person: string;
  contact_email: string;
  paid_from: string;
  paid_to: string;
  paid_amount: string;
  received_amount: string;
  reference_no: string;
  reference_date: string;
  posting_date: string;
  remarks: string;
}

export default function PaymentEntryFormScreen({ navigation, route }: any) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [modesOfPayment, setModesOfPayment] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<PaymentEntryForm>({
    naming_series: 'ACC-PAY-.YYYY.-',
    payment_type: '',
    company: '',
    cost_center: '',
    mode_of_payment: '',
    party_type: '',
    party: '',
    party_name: '',
    contact_person: '',
    contact_email: '',
    paid_from: '',
    paid_to: '',
    paid_amount: '',
    received_amount: '',
    reference_no: '',
    reference_date: new Date().toISOString().split('T')[0],
    posting_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const { paymentId } = route.params || {};
  const isEditing = !!paymentId;

  useEffect(() => {
    loadInitialData();
    if (isEditing) {
      loadPaymentEntry();
    }
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [companiesRes, customersRes, suppliersRes, accountsRes, modesRes, costCentersRes] = await Promise.all([
        apiService.getCompanies(),
        apiService.getCustomers(),
        apiService.getSuppliers(),
        apiService.getAccounts(),
        apiService.getModesOfPayment(),
        apiService.getCostCenters()
      ]);
      
      setCompanies(companiesRes.data || []);
      setCustomers(customersRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setAccounts(accountsRes.data || []);
      setModesOfPayment(modesRes.data || []);
      setCostCenters(costCentersRes.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  };



  const loadPaymentEntry = async () => {
    try {
      const response = await apiService.getDocument('Payment Entry', paymentId);
      const data = response.data;
      setFormData({
        naming_series: data.naming_series || 'ACC-PAY-.YYYY.-',
        payment_type: data.payment_type || '',
        company: data.company || '',
        cost_center: data.cost_center || '',
        mode_of_payment: data.mode_of_payment || '',
        party_type: data.party_type || '',
        party: data.party || '',
        party_name: data.party_name || '',
        contact_person: data.contact_person || '',
        contact_email: data.contact_email || '',
        paid_from: data.paid_from || '',
        paid_to: data.paid_to || '',
        paid_amount: data.paid_amount?.toString() || '',
        received_amount: data.received_amount?.toString() || '',
        reference_no: data.reference_no || '',
        reference_date: data.reference_date || new Date().toISOString().split('T')[0],
        posting_date: data.posting_date || new Date().toISOString().split('T')[0],
        remarks: data.remarks || ''
      });
    } catch (error) {
      console.error('Error loading payment entry:', error);
      Alert.alert('Error', 'Failed to load payment entry');
    }
  };

  const validateForm = () => {
    const required = ['payment_type', 'company', 'paid_amount', 'posting_date'];
    
    if (formData.payment_type !== 'Internal Transfer') {
      required.push('party_type', 'party');
    }
    
    for (const field of required) {
      if (!formData[field as keyof PaymentEntryForm]) {
        Alert.alert('Validation Error', `${field.replace('_', ' ')} is required`);
        return false;
      }
    }
    
    if (parseFloat(formData.paid_amount) <= 0) {
      Alert.alert('Validation Error', 'Paid amount must be greater than 0');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const paymentData = {
        ...formData,
        paid_amount: parseFloat(formData.paid_amount),
        received_amount: parseFloat(formData.received_amount || formData.paid_amount),
        source_exchange_rate: 1,
        target_exchange_rate: 1
      };
      
      if (isEditing) {
        await apiService.updateDoc('Payment Entry', paymentId, paymentData);
        Alert.alert('Success', 'Payment entry updated successfully');
      } else {
        await apiService.createDoc('Payment Entry', paymentData);
        Alert.alert('Success', 'Payment entry created successfully');
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving payment entry:', error);
      Alert.alert('Error', error.message || 'Failed to save payment entry');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof PaymentEntryForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPartyOptions = () => {
    if (formData.party_type === 'Customer') return customers;
    if (formData.party_type === 'Supplier') return suppliers;
    return [];
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading form data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Payment Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type of Payment</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.required]}>Payment Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.payment_type}
                onValueChange={(value) => updateFormData('payment_type', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Payment Type" value="" />
                <Picker.Item label="Receive" value="Receive" />
                <Picker.Item label="Pay" value="Pay" />
                <Picker.Item label="Internal Transfer" value="Internal Transfer" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.required]}>Company *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.company}
                onValueChange={(value) => updateFormData('company', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Company" value="" />
                {companies.map((company) => (
                  <Picker.Item key={company.name} label={company.name} value={company.name} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cost Center</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.cost_center}
                onValueChange={(value) => updateFormData('cost_center', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Cost Center" value="" />
                {costCenters.map((center) => (
                  <Picker.Item key={center.name} label={center.name} value={center.name} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mode of Payment</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.mode_of_payment}
                onValueChange={(value) => updateFormData('mode_of_payment', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Mode of Payment" value="" />
                {modesOfPayment.map((mode) => (
                  <Picker.Item key={mode.name} label={mode.name} value={mode.name} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Party Section */}
        {formData.payment_type && formData.payment_type !== 'Internal Transfer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment From / To</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Party Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.party_type}
                  onValueChange={(value) => updateFormData('party_type', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Party Type" value="" />
                  <Picker.Item label="Customer" value="Customer" />
                  <Picker.Item label="Supplier" value="Supplier" />
                  <Picker.Item label="Employee" value="Employee" />
                </Picker>
              </View>
            </View>

            {formData.party_type && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, styles.required]}>Party *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.party}
                    onValueChange={(value) => {
                      updateFormData('party', value);
                      const selectedParty = getPartyOptions().find(p => p.name === value);
                      if (selectedParty) {
                        updateFormData('party_name', selectedParty.customer_name || selectedParty.supplier_name || selectedParty.name);
                      }
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Party" value="" />
                    {getPartyOptions().map((party) => (
                      <Picker.Item 
                        key={party.name} 
                        label={party.customer_name || party.supplier_name || party.name} 
                        value={party.name} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Party Name</Text>
              <TextInput
                style={styles.input}
                value={formData.party_name}
                onChangeText={(value) => updateFormData('party_name', value)}
                placeholder="Party name will be auto-filled"
                editable={false}
              />
            </View>
          </View>
        )}

        {/* Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.required]}>Account Paid From *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.paid_from}
                onValueChange={(value) => updateFormData('paid_from', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Account" value="" />
                {accounts.map((account) => (
                  <Picker.Item key={account.name} label={account.name} value={account.name} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.required]}>Account Paid To *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.paid_to}
                onValueChange={(value) => updateFormData('paid_to', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Account" value="" />
                {accounts.map((account) => (
                  <Picker.Item key={account.name} label={account.name} value={account.name} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.required]}>Paid Amount *</Text>
            <TextInput
              style={styles.input}
              value={formData.paid_amount}
              onChangeText={(value) => {
                updateFormData('paid_amount', value);
                if (!formData.received_amount) {
                  updateFormData('received_amount', value);
                }
              }}
              placeholder="Enter paid amount"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.required]}>Received Amount *</Text>
            <TextInput
              style={styles.input}
              value={formData.received_amount}
              onChangeText={(value) => updateFormData('received_amount', value)}
              placeholder="Enter received amount"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Reference Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reference</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cheque/Reference No</Text>
            <TextInput
              style={styles.input}
              value={formData.reference_no}
              onChangeText={(value) => updateFormData('reference_no', value)}
              placeholder="Enter reference number"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reference Date</Text>
            <TextInput
              style={styles.input}
              value={formData.reference_date}
              onChangeText={(value) => updateFormData('reference_date', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, styles.required]}>Posting Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.posting_date}
              onChangeText={(value) => updateFormData('posting_date', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        {/* More Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.remarks}
              onChangeText={(value) => updateFormData('remarks', value)}
              placeholder="Enter remarks"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Payment Entry' : 'Create Payment Entry'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.mutedForeground,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.foreground,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  required: {
    color: theme.colors.destructive,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.foreground,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  picker: {
    height: 50,
    color: theme.colors.foreground,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    ...theme.shadows.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});