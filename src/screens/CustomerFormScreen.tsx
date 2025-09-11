import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
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
    companyName: customer?.customer_name || customer?.name || '',
    customerType: 'Company', // Default value, can be changed based on requirements
    customerGroup: '', // New field
    c_contact_person_name: '',
    job_title: '',
    c_email: '',
    c_mobile_number: '',
    website: '',
    
    // Address Information
    c_address: '',
    c_division: '',
    c_district: '',
    c_thana: '',
    c_post_code: '',
    country: '',
    
    // Business Information
    industry: '',
    companySize: '',
    taxId: '',
    paymentTerms: '30',
    creditLimit: '',
    currency: 'BDT',
    territory: customer?.territory || '',

    // Additional Information
    notes: '',
    preferredContact: 'c_email',
    account_manager: '',
    image: customer?.image || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Territory state
  const [territories, setTerritories] = useState<string[]>([]);
  const [filteredTerritories, setFilteredTerritories] = useState<string[]>([]);
  const [territorySearchQuery, setTerritorySearchQuery] = useState('');
  const [territoryModalVisible, setTerritoryModalVisible] = useState(false);

  // Division state
  const [divisions, setDivisions] = useState<string[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<string[]>([]);
  const [divisionSearchQuery, setDivisionSearchQuery] = useState('');
  const [divisionModalVisible, setDivisionModalVisible] = useState(false);

  // District state
  const [districts, setDistricts] = useState<string[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  // Thana state
  const [thanas, setThanas] = useState<string[]>([]);
  const [filteredThanas, setFilteredThanas] = useState<string[]>([]);
  const [thanaSearchQuery, setThanaSearchQuery] = useState('');
  const [thanaModalVisible, setThanaModalVisible] = useState(false);

  // Customer Group state
  const [customerGroups, setCustomerGroups] = useState<string[]>([]);
  const [filteredCustomerGroups, setFilteredCustomerGroups] = useState<string[]>([]);
  const [customerGroupSearchQuery, setCustomerGroupSearchQuery] = useState('');
  const [customerGroupModalVisible, setCustomerGroupModalVisible] = useState(false);

  // Account Manager state
  const [accountManagers, setAccountManagers] = useState<string[]>([]);
  const [filteredAccountManagers, setFilteredAccountManagers] = useState<string[]>([]);
  const [accountManagerSearchQuery, setAccountManagerSearchQuery] = useState('');
  const [accountManagerModalVisible, setAccountManagerModalVisible] = useState(false);

  const handleChooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to grant permission to access the photo library.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!pickerResult.canceled) {
      const base64Image = `data:image/jpeg;base64,${pickerResult.assets[0].base64}`;
      handleInputChange('image', base64Image);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [territoriesRes, divisionsRes, districtsRes, thanasRes, customerGroupsRes, accountManagersRes] = await Promise.all([
          ApiService.getTerritories(),
          ApiService.getDivisions(),
          ApiService.getDistricts(),
          ApiService.getThanas(),
          ApiService.getCustomerGroups(), // New API call
          ApiService.getAccountManagers(),
        ]);

        if (territoriesRes.data) {
          const fetchedTerritories = territoriesRes.data.map((t: any) => t.name);
          setTerritories(fetchedTerritories);
          setFilteredTerritories(fetchedTerritories);
        }
        if (divisionsRes.data) {
          const fetchedDivisions = divisionsRes.data.map((d: any) => d.name);
          setDivisions(fetchedDivisions);
          setFilteredDivisions(fetchedDivisions);
        }
        if (districtsRes.data) {
          const fetchedDistricts = districtsRes.data.map((d: any) => d.name);
          setDistricts(fetchedDistricts);
          setFilteredDistricts(fetchedDistricts);
        }
        if (thanasRes.data) {
          const fetchedThanas = thanasRes.data.map((t: any) => t.name);
          setThanas(fetchedThanas);
          setFilteredThanas(fetchedThanas);
        }
        if (customerGroupsRes.data) {
          const fetchedCustomerGroups = customerGroupsRes.data.map((g: any) => g.name);
          setCustomerGroups(fetchedCustomerGroups);
          setFilteredCustomerGroups(fetchedCustomerGroups);
        }
        if (accountManagersRes.data) {
          const fetchedAccountManagers = accountManagersRes.data.map((m: any) => m.full_name);
          setAccountManagers(fetchedAccountManagers);
          setFilteredAccountManagers(fetchedAccountManagers);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        Alert.alert('Error', 'Failed to load data for dropdowns.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (territorySearchQuery) {
      setFilteredTerritories(
        territories.filter(t => t.toLowerCase().includes(territorySearchQuery.toLowerCase()))
      );
    } else {
      setFilteredTerritories(territories);
    }
  }, [territorySearchQuery, territories]);

  useEffect(() => {
    if (divisionSearchQuery) {
      setFilteredDivisions(
        divisions.filter(d => d.toLowerCase().includes(divisionSearchQuery.toLowerCase()))
      );
    } else {
      setFilteredDivisions(divisions);
    }
  }, [divisionSearchQuery, divisions]);

  useEffect(() => {
    if (districtSearchQuery) {
      setFilteredDistricts(
        districts.filter(d => d.toLowerCase().includes(districtSearchQuery.toLowerCase()))
      );
    } else {
      setFilteredDistricts(districts);
    }
  }, [districtSearchQuery, districts]);

  useEffect(() => {
    if (thanaSearchQuery) {
      setFilteredThanas(
        thanas.filter(t => t.toLowerCase().includes(thanaSearchQuery.toLowerCase()))
      );
    } else {
      setFilteredThanas(thanas);
    }
  }, [thanaSearchQuery, thanas]);

  useEffect(() => {
    if (territorySearchQuery) {
      setFilteredTerritories(
        territories.filter(t => t.toLowerCase().includes(territorySearchQuery.toLowerCase()))
      );
    } else {
      setFilteredTerritories(territories);
    }
  }, [territorySearchQuery, territories]);

  useEffect(() => {
    if (customerGroupSearchQuery) {
      setFilteredCustomerGroups(
        customerGroups.filter(g => g.toLowerCase().includes(customerGroupSearchQuery.toLowerCase()))
      );
    } else {
      setFilteredCustomerGroups(customerGroups);
    }
  }, [customerGroupSearchQuery, customerGroups]);

  useEffect(() => {
    if (accountManagerSearchQuery) {
      setFilteredAccountManagers(
        accountManagers.filter(m => m.toLowerCase().includes(accountManagerSearchQuery.toLowerCase()))
      );
    } else {
      setFilteredAccountManagers(accountManagers);
    }
  }, [accountManagerSearchQuery, accountManagers]);

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
    
    if (!formData.c_contact_person_name.trim()) {
      newErrors.c_contact_person_name = 'Contact person name is required';
    }
    
    if (!formData.c_email.trim()) {
      newErrors.c_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.c_email)) {
      newErrors.c_email = 'Please enter a valid email address';
    }
    
    if (!formData.c_mobile_number.trim()) {
      newErrors.c_mobile_number = 'Phone number is required';
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
        customer_type: formData.customerType,
        customer_group: formData.customerGroup,
        c_contact_person_name: formData.c_contact_person_name,
        job_title: formData.job_title,
        email_id: formData.c_email,
        mobile_no: formData.c_mobile_number,
        website: formData.website,
        territory: formData.territory,
        address_line1: formData.c_address,
        division: formData.c_division,
        district: formData.c_district,
        thana: formData.c_thana,
        pincode: formData.c_post_code,
        industry: formData.industry,
        company_size: formData.companySize,
        tax_id: formData.taxId,
        credit_limit: formData.creditLimit,
        currency: formData.currency,
        notes: formData.notes,
        preferred_contact: formData.preferredContact,
        account_manager: formData.account_manager,
        image: formData.image,
      };

      if (isEdit) {
        await ApiService.updateDoc('Customer', customer.id, customerData);
        Alert.alert('Success', 'Customer updated successfully!');
      } else {
        await ApiService.createDoc('Customer', customerData);
        Alert.alert('Success', 'Customer created successfully!');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to save Customer:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        Alert.alert('Error', `Failed to save Customer: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request data:', error.request);
        Alert.alert('Error', 'Failed to save Customer: No response from server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        Alert.alert('Error', `Failed to save Customer: ${error.message}`);
      }
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
          {formData.image && (
            <Image source={{ uri: formData.image }} style={styles.customerImage} />
          )}
          <TouchableOpacity style={styles.imagePickerButton} onPress={handleChooseImage}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.imagePickerButtonText}>
              {formData.image ? 'Change Image' : 'Upload Image'}
            </Text>
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={[styles.input, errors.companyName ? styles.inputError : null]}
              placeholder="Enter company name"
              value={formData.companyName}
              onChangeText={(text) => handleInputChange('companyName', text)}
            />
            {errors.companyName && (
              <Text style={styles.errorText}>{errors.companyName}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer Type</Text>
            <Picker
              selectedValue={formData.customerType}
              style={styles.picker}
              onValueChange={(itemValue) => handleInputChange('customerType', itemValue)}
            >
              <Picker.Item label="Company" value="Company" />
              <Picker.Item label="Individual" value="Individual" />
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer Group</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setCustomerGroupModalVisible(true)}
            >
              <Text style={styles.pickerInputText}>
                {formData.customerGroup || "Select Customer Group"}
              </Text>
              <Ionicons name="caret-down" size={16} color="#666" />
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={customerGroupModalVisible}
              onRequestClose={() => setCustomerGroupModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Customer Group..."
                    value={customerGroupSearchQuery}
                    onChangeText={setCustomerGroupSearchQuery}
                  />
                  <FlatList
                    data={filteredCustomerGroups}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          handleInputChange('customerGroup', item);
                          setCustomerGroupModalVisible(false);
                          setCustomerGroupSearchQuery('');
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setCustomerGroupModalVisible(false);
                      setCustomerGroupSearchQuery('');
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Contact Person *</Text>
              <TextInput
                style={[styles.input, errors.c_contact_person_name ? styles.inputError : null]}
                placeholder="Full name"
                value={formData.c_contact_person_name}
                onChangeText={(text) => handleInputChange('c_contact_person_name', text)}
              />
              {errors.c_contact_person_name && (
                <Text style={styles.errorText}>{errors.c_contact_person_name}</Text>
              )}
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Job Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sales Manager"
                value={formData.job_title}
                onChangeText={(text) => handleInputChange('job_title', text)}
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
              style={[styles.input, errors.c_email ? styles.inputError : null]}
              placeholder="contact@company.com"
              value={formData.c_email}
              onChangeText={(text) => handleInputChange('c_email', text)}
              keyboardType="email-address"
            />
            {errors.c_email && (
              <Text style={styles.errorText}>{errors.c_email}</Text>
            )}
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.c_mobile_number ? styles.inputError : null]}
                placeholder="+880 1234-567890"
                value={formData.c_mobile_number}
                onChangeText={(text) => handleInputChange('c_mobile_number', text)}
                keyboardType="phone-pad"
              />
              {errors.c_mobile_number && (
                <Text style={styles.errorText}>{errors.c_mobile_number}</Text>
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
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter customer address"
              value={formData.c_address}
              onChangeText={(text) => handleInputChange('c_address', text)}
            />
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Division</Text>
              <TouchableOpacity
                style={styles.pickerInput}
                onPress={() => setDivisionModalVisible(true)}
              >
                <Text style={styles.pickerInputText}>
                  {formData.c_division || "Select Division"}
                </Text>
                <Ionicons name="caret-down" size={16} color="#666" />
              </TouchableOpacity>

              <Modal
                animationType="slide"
                transparent={true}
                visible={divisionModalVisible}
                onRequestClose={() => setDivisionModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search Division..."
                      value={divisionSearchQuery}
                      onChangeText={setDivisionSearchQuery}
                    />
                    <FlatList
                      data={filteredDivisions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => {
                            handleInputChange('c_division', item);
                            setDivisionModalVisible(false);
                            setDivisionSearchQuery('');
                          }}
                        >
                          <Text style={styles.modalItemText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        setDivisionModalVisible(false);
                        setDivisionSearchQuery('');
                      }}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>District</Text>
              <TouchableOpacity
                style={styles.pickerInput}
                onPress={() => setDistrictModalVisible(true)}
              >
                <Text style={styles.pickerInputText}>
                  {formData.c_district || "Select District"}
                </Text>
                <Ionicons name="caret-down" size={16} color="#666" />
              </TouchableOpacity>

              <Modal
                animationType="slide"
                transparent={true}
                visible={districtModalVisible}
                onRequestClose={() => setDistrictModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search District..."
                      value={districtSearchQuery}
                      onChangeText={setDistrictSearchQuery}
                    />
                    <FlatList
                      data={filteredDistricts}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => {
                            handleInputChange('c_district', item);
                            setDistrictModalVisible(false);
                            setDistrictSearchQuery('');
                          }}
                        >
                          <Text style={styles.modalItemText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        setDistrictModalVisible(false);
                        setDistrictSearchQuery('');
                      }}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Thana</Text>
              <TouchableOpacity
                style={styles.pickerInput}
                onPress={() => setThanaModalVisible(true)}
              >
                <Text style={styles.pickerInputText}>
                  {formData.c_thana || "Select Thana"}
                </Text>
                <Ionicons name="caret-down" size={16} color="#666" />
              </TouchableOpacity>

              <Modal
                animationType="slide"
                transparent={true}
                visible={thanaModalVisible}
                onRequestClose={() => setThanaModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search Thana..."
                      value={thanaSearchQuery}
                      onChangeText={setThanaSearchQuery}
                    />
                    <FlatList
                      data={filteredThanas}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => {
                            handleInputChange('c_thana', item);
                            setThanaModalVisible(false);
                            setThanaSearchQuery('');
                          }}
                        >
                          <Text style={styles.modalItemText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        setThanaModalVisible(false);
                        setThanaSearchQuery('');
                      }}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter postal code"
                value={formData.c_post_code}
                onChangeText={(text) => handleInputChange('c_post_code', text)}
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
            <Text style={styles.label}>Territory</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setTerritoryModalVisible(true)}
            >
              <Text style={styles.pickerInputText}>
                {formData.territory || "Select Territory"}
              </Text>
              <Ionicons name="caret-down" size={16} color="#666" />
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={territoryModalVisible}
              onRequestClose={() => setTerritoryModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Territory..."
                    value={territorySearchQuery}
                    onChangeText={setTerritorySearchQuery}
                  />
                  <FlatList
                    data={filteredTerritories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          handleInputChange('territory', item);
                          setTerritoryModalVisible(false);
                          setTerritorySearchQuery(''); // Clear search after selection
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setTerritoryModalVisible(false);
                      setTerritorySearchQuery(''); // Clear search on close
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Manager</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setAccountManagerModalVisible(true)}
            >
              <Text style={styles.pickerInputText}>
                {formData.account_manager || "Select Account Manager"}
              </Text>
              <Ionicons name="caret-down" size={16} color="#666" />
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={accountManagerModalVisible}
              onRequestClose={() => setAccountManagerModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Account Manager..."
                    value={accountManagerSearchQuery}
                    onChangeText={setAccountManagerSearchQuery}
                  />
                  <FlatList
                    data={filteredAccountManagers}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          handleInputChange('account_manager', item);
                          setAccountManagerModalVisible(false);
                          setAccountManagerSearchQuery('');
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setAccountManagerModalVisible(false);
                      setAccountManagerSearchQuery('');
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

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
  picker: { // This style is no longer directly used by Picker, but keeping for reference if needed
    height: 48,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    color: '#030213',
  },
  pickerInput: {
    height: 48,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerInputText: {
    fontSize: 16,
    color: '#030213',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  searchInput: {
    height: 40,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemText: {
    fontSize: 16,
    color: '#030213',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#030213',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  customerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030213',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
