import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/api';

interface ItemFormProps {
  route?: any;
  navigation: any;
}

export default function ItemFormScreen({ route, navigation }: ItemFormProps) {
  const item = route?.params?.item;
  const isEdit = !!item;

  const [formData, setFormData] = useState({
    // Basic fields
    naming_series: 'STO-ITEM-.YYYY.-',
    item_code: item?.item_code || '',
    item_name: item?.item_name || '',
    item_group: item?.item_group || '',
    stock_uom: item?.stock_uom || '',
    brand: item?.brand || '',
    description: item?.description || '',
    item_type: item?.item_type || '',
    
    // Item Attributes
    paper_cup_size: '',
    paper_cup_type: '',
    paper_cup_wall: '',
    single_wall_paper_gsm: '',
    double_wall_paper_gsm: '',
    bottom_gsm: '',
    bottom_size: '',
    printing_colour: '',
    laminnation: '',
    foil: '',
    origin: '',
    sub_brand: '',
    
    // Lid specific
    lid_size: '',
    lid_color: '',
    lid_type: '',
    quality: '',
    
    // Paper attributes
    paper_name: '',
    paper_gsm: '',
    printing_metallic: '',
    printing_sandy: '',
    corrugated: '',
    pasting: '',
    cup_lock: '',
    
    // Size attributes
    holder_size: '',
    box_name: '',
    box_size: '',
    bag_name: '',
    bag_size: '',
    table_matt_size: '',
    tray_size: '',
    wrapping_paper_size: '',
    sticker_size: '',
    cone_name: '',
    cone_size: '',
    leaflet_size: '',
    business_card_size: '',
    envelop_name: '',
    envelop_size: '',
    office_document_name: '',
    invoice_size: '',
    file_folder_name: '',
    file_folder_size: '',
    
    // Other attributes
    ambush: '',
    window: '',
    window_size: '',
    ribbon: '',
    die_cut: '',
    page_fold: '',
    screen_printing: '',
    paper_pages: '',
    eye_late: '',
    tear_away_label: '',
    heat_transfer_label: '',
    brand_label: '',
    woven_label: '',
    printed_fabric_label: '',
    satin_label: '',
    main_label: '',
    care_label: '',
    size_label: '',
    composition_label: '',
    customer_target_price: ''
  });

  const [loading, setLoading] = useState(false);

  const itemTypes = [
    'Paper CUP', 'Paper Cup Lid', 'Paper Cup Jacket', 'Paper Cup Holder',
    'Outer BOX', 'Bags', 'Table Matt', 'Food Tray', 'Food Wrapping Paper',
    'Sticker', 'Cone', 'Leaflet', 'Business Card', 'Hang Tag', 'Envelope',
    'Invoice', 'File Folder', 'Brochure', 'Calendar', 'Food Menu Card',
    'Dairy', 'Notebook', 'Waffle Box'
  ];

  const paperCupSizes = [
    '60 ML', '70 ML', '80 ML', '100 ML', '120 ML', '150 ML Auto', '150 ML Manual',
    '200 ML', '210 ML', '250 ML', '300 ML', '350 ML', '450 ML', '8 Oz ML', '12 Oz ML', '16 Oz ML'
  ];

  const gsmOptions = Array.from({ length: 193 }, (_, i) => (28 + i * 4).toString());

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.item_code.trim() || !formData.item_name.trim() || !formData.item_group.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await ApiService.updateDoc('Item', item.name, formData);
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        await ApiService.createDoc('Item', formData);
        Alert.alert('Success', 'Item created successfully!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save item:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const renderConditionalFields = () => {
    const { item_type } = formData;
    
    return (
      <View>
        {/* Paper Cup Fields */}
        {(item_type === 'Paper CUP' || item_type === 'Paper Cup Lid' || 
          item_type === 'Paper Cup Jacket' || item_type === 'Paper Cup Holder') && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Paper Cup Size</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.paper_cup_size}
                onValueChange={(value) => handleInputChange('paper_cup_size', value)}
              >
                <Picker.Item label="Select Size" value="" />
                {paperCupSizes.map(size => (
                  <Picker.Item key={size} label={size} value={size} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Paper Cup Specific */}
        {item_type === 'Paper CUP' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Paper Cup Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.paper_cup_type}
                  onValueChange={(value) => handleInputChange('paper_cup_type', value)}
                >
                  <Picker.Item label="Select Type" value="" />
                  <Picker.Item label="Hot" value="Hot" />
                  <Picker.Item label="Cold" value="Cold" />
                  <Picker.Item label="Ice cream" value="Ice cream" />
                  <Picker.Item label="Hot & Cold" value="Hot & Cold" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Paper Cup Wall</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.paper_cup_wall}
                  onValueChange={(value) => handleInputChange('paper_cup_wall', value)}
                >
                  <Picker.Item label="Select Wall" value="" />
                  <Picker.Item label="Single Wall" value="Single Wall" />
                  <Picker.Item label="Double Wall" value="Double Wall" />
                  <Picker.Item label="Ripple Wall" value="Ripple Wall" />
                  <Picker.Item label="Double PE" value="Double PE" />
                </Picker>
              </View>
            </View>
          </>
        )}

        {/* Lid Specific */}
        {item_type === 'Paper Cup Lid' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Lid Size</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.lid_size}
                  onValueChange={(value) => handleInputChange('lid_size', value)}
                >
                  <Picker.Item label="Select Size" value="" />
                  <Picker.Item label="70 MM" value="70 MM" />
                  <Picker.Item label="80 MM" value="80 MM" />
                  <Picker.Item label="90 MM" value="90 MM" />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Lid Color</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.lid_color}
                  onValueChange={(value) => handleInputChange('lid_color', value)}
                >
                  <Picker.Item label="Select Color" value="" />
                  <Picker.Item label="White" value="White" />
                  <Picker.Item label="Black" value="Black" />
                  <Picker.Item label="Transparent" value="Transparent" />
                </Picker>
              </View>
            </View>
          </>
        )}

        {/* Common printing fields */}
        {(item_type === 'Paper CUP' || item_type === 'Paper Cup Jacket' || 
          item_type === 'Paper Cup Holder' || item_type === 'Outer BOX' || 
          item_type === 'Bags') && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Printing Colour</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.printing_colour}
                onValueChange={(value) => handleInputChange('printing_colour', value)}
              >
                <Picker.Item label="Select Colour" value="" />
                {[1,2,3,4,5,6,7,8].map(num => (
                  <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {isEdit ? 'Edit Item' : 'Create Item'}
          </Text>
        </View>
        
        <View style={styles.cardContent}>
          {/* Basic Information */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Item Code *</Text>
            <TextInput
              style={styles.input}
              value={formData.item_code}
              onChangeText={(text) => handleInputChange('item_code', text)}
              placeholder="Enter item code"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.item_name}
              onChangeText={(text) => handleInputChange('item_name', text)}
              placeholder="Enter item name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Item Group *</Text>
            <TextInput
              style={styles.input}
              value={formData.item_group}
              onChangeText={(text) => handleInputChange('item_group', text)}
              placeholder="Enter item group"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Stock UOM *</Text>
            <TextInput
              style={styles.input}
              value={formData.stock_uom}
              onChangeText={(text) => handleInputChange('stock_uom', text)}
              placeholder="Enter unit of measure"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Item Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.item_type}
                onValueChange={(value) => handleInputChange('item_type', value)}
              >
                <Picker.Item label="Select Item Type" value="" />
                {itemTypes.map(type => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Customer Target Price</Text>
            <TextInput
              style={styles.input}
              value={formData.customer_target_price}
              onChangeText={(text) => handleInputChange('customer_target_price', text)}
              placeholder="Enter target price"
              keyboardType="numeric"
            />
          </View>

          {/* Conditional Fields */}
          {renderConditionalFields()}

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Update Item' : 'Create Item'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
  },
  cardContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#030213',
    marginBottom: 8,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerContainer: {
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  saveButton: {
    backgroundColor: '#030213',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});