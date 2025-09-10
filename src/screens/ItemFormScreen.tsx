import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image,
  TextInput as RNTextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Paper Cup Size</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="resize" size={20} color="#666" style={styles.pickerIcon} />
              <Picker
                selectedValue={formData.paper_cup_size}
                onValueChange={(value) => handleInputChange('paper_cup_size', value)}
                style={styles.picker}
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Paper Cup Type</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="thermometer" size={20} color="#666" style={styles.pickerIcon} />
                <Picker
                  selectedValue={formData.paper_cup_type}
                  onValueChange={(value) => handleInputChange('paper_cup_type', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Type" value="" />
                  <Picker.Item label="Hot" value="Hot" />
                  <Picker.Item label="Cold" value="Cold" />
                  <Picker.Item label="Ice cream" value="Ice cream" />
                  <Picker.Item label="Hot & Cold" value="Hot & Cold" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Paper Cup Wall</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="layers" size={20} color="#666" style={styles.pickerIcon} />
                <Picker
                  selectedValue={formData.paper_cup_wall}
                  onValueChange={(value) => handleInputChange('paper_cup_wall', value)}
                  style={styles.picker}
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lid Size</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="ellipse" size={20} color="#666" style={styles.pickerIcon} />
                <Picker
                  selectedValue={formData.lid_size}
                  onValueChange={(value) => handleInputChange('lid_size', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Size" value="" />
                  <Picker.Item label="70 MM" value="70 MM" />
                  <Picker.Item label="80 MM" value="80 MM" />
                  <Picker.Item label="90 MM" value="90 MM" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lid Color</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="color-palette" size={20} color="#666" style={styles.pickerIcon} />
                <Picker
                  selectedValue={formData.lid_color}
                  onValueChange={(value) => handleInputChange('lid_color', value)}
                  style={styles.picker}
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Printing Colour</Text>
            <View style={styles.pickerContainer}>
              <Ionicons name="brush" size={20} color="#666" style={styles.pickerIcon} />
              <Picker
                selectedValue={formData.printing_colour}
                onValueChange={(value) => handleInputChange('printing_colour', value)}
                style={styles.picker}
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
    <View style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={styles.imageText}>Add Photo</Text>
          </View>
        </View>

        {/* Basic Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Code *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="barcode" size={20} color="#666" style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  value={formData.item_code}
                  onChangeText={(text) => handleInputChange('item_code', text)}
                  placeholder="Enter item code"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cube" size={20} color="#666" style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  value={formData.item_name}
                  onChangeText={(text) => handleInputChange('item_name', text)}
                  placeholder="Enter item name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Item Group *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="folder" size={20} color="#666" style={styles.inputIcon} />
                  <RNTextInput
                    style={styles.input}
                    value={formData.item_group}
                    onChangeText={(text) => handleInputChange('item_group', text)}
                    placeholder="Group"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Stock UOM *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="scale" size={20} color="#666" style={styles.inputIcon} />
                  <RNTextInput
                    style={styles.input}
                    value={formData.stock_uom}
                    onChangeText={(text) => handleInputChange('stock_uom', text)}
                    placeholder="UOM"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <RNTextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                  placeholder="Enter item description..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Item Type & Pricing Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="pricetag" size={20} color="#FF9800" />
            <Text style={styles.cardTitle}>Type & Pricing</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Type</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="list" size={20} color="#666" style={styles.pickerIcon} />
                <Picker
                  selectedValue={formData.item_type}
                  onValueChange={(value) => handleInputChange('item_type', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Item Type" value="" />
                  {itemTypes.map(type => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Target Price</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash" size={20} color="#666" style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  value={formData.customer_target_price}
                  onChangeText={(text) => handleInputChange('customer_target_price', text)}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Conditional Fields */}
        {formData.item_type && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={20} color="#9C27B0" />
              <Text style={styles.cardTitle}>Specifications</Text>
            </View>
            <View style={styles.cardContent}>
              {renderConditionalFields()}
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Update Item' : 'Create Item'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  cardContent: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 0,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingLeft: 16,
    minHeight: 52,
  },
  pickerIcon: {
    marginRight: 12,
  },
  picker: {
    flex: 1,
    color: '#1f2937',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});