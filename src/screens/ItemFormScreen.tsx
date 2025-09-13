import React, { useState, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../services/api';
import { API_URL } from '../config';

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
    customer_target_price: '',
    image: item?.image || '',
    country_of_origin: item?.country_of_origin || '',
    brochure_name: '',
    calendar_name: ''
  });

  const [loading, setLoading] = useState(false);
  const [itemGroups, setItemGroups] = useState<string[]>([]);
  const [fetchingItemGroups, setFetchingItemGroups] = useState(false);
  const [itemGroupSearch, setItemGroupSearch] = useState('');
  const [uoms, setUoms] = useState<string[]>([]);
  const [fetchingUoms, setFetchingUoms] = useState(false);
  const [uomSearch, setUomSearch] = useState('');
  const [showItemGroupDropdown, setShowItemGroupDropdown] = useState(false);
  const [showUomDropdown, setShowUomDropdown] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(item?.image ? `${API_URL}${item.image}` : null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [fetchingBrands, setFetchingBrands] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [fetchingCountries, setFetchingCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [subBrands, setSubBrands] = useState<string[]>([]);
  const [subBrandSearch, setSubBrandSearch] = useState('');
  const [showSubBrandDropdown, setShowSubBrandDropdown] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<{[key: string]: string[]}>({});
  const [sizeSearches, setSizeSearches] = useState<{[key: string]: string}>({});
  const [showSizeDropdowns, setShowSizeDropdowns] = useState<{[key: string]: boolean}>({});
  const [gsmSearches, setGsmSearches] = useState<{[key: string]: string}>({});
  const [showGsmDropdowns, setShowGsmDropdowns] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchItemGroups = async () => {
      setFetchingItemGroups(true);
      try {
        const response = await ApiService.getItemGroups();
        if (response && response.data) {
          const groups = response.data.map((group: any) => group.name);
          setItemGroups(groups);
        }
      } catch (error) {
        console.error('Failed to fetch item groups:', error);
        Alert.alert('Error', 'Failed to fetch item groups');
      } finally {
        setFetchingItemGroups(false);
      }
    };

    fetchItemGroups();
    const fetchUOMs = async () => {
      setFetchingUoms(true);
      try {
        const response = await ApiService.getUOMs();
        if (response && response.data) {
          const uomNames = response.data.map((uom: any) => uom.name);
          setUoms(uomNames);
          if (!isEdit && uomNames.length > 0) {
            setFormData(prev => ({ ...prev, stock_uom: uomNames[0] }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch UOMs:', error);
        Alert.alert('Error', 'Failed to fetch UOMs');
      } finally {
        setFetchingUoms(false);
      }
    };

    fetchUOMs();
    
    const fetchBrands = async () => {
      setFetchingBrands(true);
      try {
        const response = await ApiService.getBrands();
        if (response && response.data) {
          const brandNames = response.data.map((brand: any) => brand.name);
          setBrands(brandNames);
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setFetchingBrands(false);
      }
    };

    fetchBrands();
    
    const fetchCountries = async () => {
      setFetchingCountries(true);
      try {
        const response = await ApiService.getCountries();
        if (response && response.data) {
          const countryNames = response.data.map((country: any) => country.name);
          setCountries(countryNames);
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      } finally {
        setFetchingCountries(false);
      }
    };

    fetchCountries();
    
    const fetchSubBrands = async () => {
      try {
        const response = await ApiService.getSubBrands();
        if (response && response.data) {
          const subBrandNames = response.data.map((subBrand: any) => subBrand.name);
          setSubBrands(subBrandNames);
        }
      } catch (error) {
        console.error('Failed to fetch sub brands:', error);
      }
    };

    const fetchSizeOptions = async () => {
      const sizeTypes = [
        'Holder Size', 'Box Name', 'Box Size', 'Window Size', 'Bag Size',
        'Table Matt Size', 'Tray Size', 'Wrapping Paper Size', 'Sticker Size',
        'Cone Name', 'Cone Size', 'Leaflet Size', 'Business Card Size',
        'Envelop Name', 'Envelop Size', 'Office Document Name', 'Invoice Size',
        'Paper Pages', 'File Folder Name', 'File Folder Size'
      ];
      
      const sizeData: {[key: string]: string[]} = {};
      
      for (const sizeType of sizeTypes) {
        try {
          const response = await ApiService.getSizeOptions(sizeType);
          if (response && response.data) {
            sizeData[sizeType] = response.data.map((item: any) => item.name);
          }
        } catch (error) {
          console.error(`Failed to fetch ${sizeType}:`, error);
          sizeData[sizeType] = [];
        }
      }
      
      setSizeOptions(sizeData);
    };

    fetchSubBrands();
    fetchSizeOptions();
  }, []);

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

  const gsmOptions = ['', '28', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100', '105', '110', '115', '120', '125', '130', '135', '140', '145', '150', '155', '160', '165', '170', '175', '180', '185', '190', '195', '200', '205', '210', '215', '220', '225', '230', '235', '240', '245', '250', '255', '260', '265', '270', '275', '280', '285', '290', '295', '300', '305', '310', '315', '320', '325', '330', '335', '340', '345', '350', '355', '360', '365', '370', '375', '380', '385', '390', '395', '400', '405', '410', '415', '420', '425', '430', '435', '440', '445', '450', '455', '460', '465', '470', '475', '480', '485', '490', '495', '500', '505', '510', '515', '520', '525', '530', '535', '540', '545', '550', '555', '560', '565', '570', '575', '580', '585', '590', '595', '600', '605', '610', '615', '620', '625', '630', '635', '640', '645', '650', '655', '660', '665', '670', '675', '680', '685', '690', '695', '700', '705', '710', '715', '720', '725', '730', '735', '740', '745', '750', '755', '760', '765', '770', '775', '780', '785', '790', '795', '800'];
  
  const bottomSizeOptions = ['55 MM', '60 MM', '65 MM', '70 MM', '75 MM', '80 MM', '85 MM', '90 MM', '95 MM'];
  const [bottomSizeSearch, setBottomSizeSearch] = useState('');
  const [showBottomSizeDropdown, setShowBottomSizeDropdown] = useState(false);
  
  const laminationOptions = ['Glossy', 'Matt', 'Silver', 'Burnish Glossy', 'Burnish Matt', 'Spot', 'Matt Spot'];
  const [laminationSearch, setLaminationSearch] = useState('');
  const [showLaminationDropdown, setShowLaminationDropdown] = useState(false);
  
  const foilOptions = ['Golden Foil', 'Silver Foil', 'Red Foil', 'Green Foil', 'Blue Foil', 'Pink Foil'];
  const [foilSearch, setFoilSearch] = useState('');
  const [showFoilDropdown, setShowFoilDropdown] = useState(false);
  
  const originOptions = ['China Paper', 'Bangladesh Paper', 'India Paper', 'Russia Paper', 'Korean Paper', 'Sweden Paper'];
  const [originSearch, setOriginSearch] = useState('');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const generateDescription = (updatedFormData: any) => {
    const specs: string[] = [];
    
    // Add specifications fields to description
    const specFields = [
      { key: 'brand', label: 'Brand' },
      { key: 'sub_brand', label: 'Sub Brand' },
      { key: 'country_of_origin', label: 'Country of Origin' },
      { key: 'paper_cup_size', label: 'Paper Cup Size' },
      { key: 'paper_cup_type', label: 'Paper Cup Type' },
      { key: 'paper_cup_wall', label: 'Paper Cup Wall' },
      { key: 'single_wall_paper_gsm', label: 'Single Wall Paper GSM' },
      { key: 'double_wall_paper_gsm', label: 'Double Wall Paper GSM' },
      { key: 'bottom_gsm', label: 'Bottom GSM' },
      { key: 'bottom_size', label: 'Bottom Size' },
      { key: 'lid_size', label: 'Lid Size' },
      { key: 'lid_color', label: 'Lid Color' },
      { key: 'printing_colour', label: 'Printing Colour' },
      { key: 'laminnation', label: 'Lamination' },
      { key: 'foil', label: 'Foil' },
      { key: 'origin', label: 'Origin' },
      { key: 'holder_size', label: 'Holder Size' },
      { key: 'box_name', label: 'Box Name' },
      { key: 'box_size', label: 'Box Size' },
      { key: 'window_size', label: 'Window Size' },
      { key: 'bag_size', label: 'Bag Size' },
      { key: 'table_matt_size', label: 'Table Matt Size' },
      { key: 'tray_size', label: 'Tray Size' },
      { key: 'wrapping_paper_size', label: 'Wrapping Paper Size' },
      { key: 'sticker_size', label: 'Sticker Size' },
      { key: 'cone_name', label: 'Cone Name' },
      { key: 'cone_size', label: 'Cone Size' },
      { key: 'leaflet_size', label: 'Leaflet Size' },
      { key: 'business_card_size', label: 'Business Card Size' },
      { key: 'envelop_name', label: 'Envelop Name' },
      { key: 'envelop_size', label: 'Envelop Size' },
      { key: 'office_document_name', label: 'Office Document Name' },
      { key: 'invoice_size', label: 'Invoice Size' },
      { key: 'paper_pages', label: 'Paper Pages' },
      { key: 'file_folder_name', label: 'File Folder Name' },
      { key: 'file_folder_size', label: 'File Folder Size' }
    ];
    
    specFields.forEach(field => {
      const value = updatedFormData[field.key];
      if (value && value.trim()) {
        specs.push(`${field.label}: ${value}`);
      }
    });
    
    return specs.join('\n');
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // Auto-generate item code and description if it's a specifications field
    const specFields = ['item_type', 'brand', 'sub_brand', 'country_of_origin', 'paper_cup_size', 'paper_cup_type', 'paper_cup_wall', 'single_wall_paper_gsm', 'double_wall_paper_gsm', 'bottom_gsm', 'bottom_size', 'lid_size', 'lid_color', 'printing_colour', 'laminnation', 'foil', 'origin', 'holder_size', 'box_name', 'box_size', 'window_size', 'bag_size', 'table_matt_size', 'tray_size', 'wrapping_paper_size', 'sticker_size', 'cone_name', 'cone_size', 'leaflet_size', 'business_card_size', 'envelop_name', 'envelop_size', 'office_document_name', 'invoice_size', 'paper_pages', 'file_folder_name', 'file_folder_size'];
    
    if (specFields.includes(field)) {
      // Auto-generate item code
      const codeParts = [
        updatedFormData.item_type,
        updatedFormData.paper_name,
        updatedFormData.paper_cup_size,
        updatedFormData.box_name,
        updatedFormData.bag_name,
        updatedFormData.envelop_name,
        updatedFormData.office_document_name,
        updatedFormData.file_folder_name,
        updatedFormData.brochure_name,
        updatedFormData.calendar_name,
        updatedFormData.window_size,
        updatedFormData.bag_size,
        updatedFormData.table_matt_size,
        updatedFormData.box_size,
        updatedFormData.sticker_size,
        updatedFormData.tray_size,
        updatedFormData.cone_size,
        updatedFormData.leaflet_size,
        updatedFormData.business_card_size,
        updatedFormData.wrapping_paper_size,
        updatedFormData.holder_size,
        updatedFormData.file_folder_size,
        updatedFormData.invoice_size,
        updatedFormData.envelop_size,
        updatedFormData.brand,
        updatedFormData.sub_brand,
        updatedFormData.origin
      ];
      
      const filteredCodeParts = codeParts
        .filter(part => part && String(part).trim() !== "")
        .map(part => String(part).trim());
      
      const newItemCode = filteredCodeParts.join('-');
      
      if (newItemCode) {
        updatedFormData.item_code = newItemCode;
        updatedFormData.item_name = newItemCode;
      }
      
      // Auto-generate description
      updatedFormData.description = generateDescription(updatedFormData);
    }
    
    setFormData(updatedFormData);
  };

  const filteredItemGroups = itemGroups.filter(group =>
    group.toLowerCase().includes(itemGroupSearch.toLowerCase())
  );

  const filteredUoms = uoms.filter(uom =>
    uom.toLowerCase().includes(uomSearch.toLowerCase())
  );

  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredSubBrands = subBrands.filter(subBrand =>
    subBrand.toLowerCase().includes(subBrandSearch.toLowerCase())
  );

  const getFilteredSizeOptions = (sizeType: string) => {
    const searchTerm = sizeSearches[sizeType] || '';
    return (sizeOptions[sizeType] || []).filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredGsmOptions = (gsmType: string) => {
    const searchTerm = gsmSearches[gsmType] || '';
    return gsmOptions.filter(option =>
      option.includes(searchTerm)
    );
  };

  const filteredBottomSizes = bottomSizeOptions.filter(size =>
    size.toLowerCase().includes(bottomSizeSearch.toLowerCase())
  );

  const filteredLaminations = laminationOptions.filter(option =>
    option.toLowerCase().includes(laminationSearch.toLowerCase())
  );

  const filteredFoils = foilOptions.filter(option =>
    option.toLowerCase().includes(foilSearch.toLowerCase())
  );

  const filteredOrigins = originOptions.filter(option =>
    option.toLowerCase().includes(originSearch.toLowerCase())
  );

  const renderSearchableField = (fieldName: string, label: string, sizeType: string, icon: string) => {
    const isOpen = showSizeDropdowns[sizeType] || false;
    const searchValue = sizeSearches[sizeType] || '';
    const fieldValue = (formData as any)[fieldName] || '';
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.searchableDropdown}>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowSizeDropdowns(prev => ({ ...prev, [sizeType]: !isOpen }))}
          >
            <Ionicons name={icon as any} size={20} color="#666" style={styles.inputIcon} />
            <RNTextInput
              style={styles.input}
              value={isOpen ? searchValue : fieldValue}
              onChangeText={(text) => setSizeSearches(prev => ({ ...prev, [sizeType]: text }))}
              placeholder={`Search ${label.toLowerCase()}...`}
              placeholderTextColor="#999"
              onFocus={() => setShowSizeDropdowns(prev => ({ ...prev, [sizeType]: true }))}
              onBlur={() => setTimeout(() => setShowSizeDropdowns(prev => ({ ...prev, [sizeType]: false })), 150)}
            />
            <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#666" />
          </TouchableOpacity>
          {isOpen && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {getFilteredSizeOptions(sizeType).map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange(fieldName, option);
                      setSizeSearches(prev => ({ ...prev, [sizeType]: '' }));
                      setShowSizeDropdowns(prev => ({ ...prev, [sizeType]: false }));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderGsmField = (fieldName: string, label: string, gsmType: string) => {
    const isOpen = showGsmDropdowns[gsmType] || false;
    const searchValue = gsmSearches[gsmType] || '';
    const fieldValue = (formData as any)[fieldName] || '';
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.searchableDropdown}>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowGsmDropdowns(prev => ({ ...prev, [gsmType]: !isOpen }))}
          >
            <Ionicons name="layers" size={20} color="#666" style={styles.inputIcon} />
            <RNTextInput
              style={styles.input}
              value={isOpen ? searchValue : fieldValue}
              onChangeText={(text) => setGsmSearches(prev => ({ ...prev, [gsmType]: text }))}
              placeholder={`Search ${label.toLowerCase()}...`}
              placeholderTextColor="#999"
              onFocus={() => setShowGsmDropdowns(prev => ({ ...prev, [gsmType]: true }))}
              onBlur={() => setTimeout(() => setShowGsmDropdowns(prev => ({ ...prev, [gsmType]: false })), 150)}
              keyboardType="numeric"
            />
            <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#666" />
          </TouchableOpacity>
          {isOpen && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {getFilteredGsmOptions(gsmType).map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange(fieldName, option);
                      setGsmSearches(prev => ({ ...prev, [gsmType]: '' }));
                      setShowGsmDropdowns(prev => ({ ...prev, [gsmType]: false }));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSelectField = (fieldName: string, label: string, options: string[], searchValue: string, setSearchValue: (value: string) => void, isOpen: boolean, setIsOpen: (value: boolean) => void, icon: string) => {
    const fieldValue = (formData as any)[fieldName] || '';
    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.searchableDropdown}>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setIsOpen(!isOpen)}
          >
            <Ionicons name={icon as any} size={20} color="#666" style={styles.inputIcon} />
            <RNTextInput
              style={styles.input}
              value={isOpen ? searchValue : fieldValue}
              onChangeText={setSearchValue}
              placeholder={`Search ${label.toLowerCase()}...`}
              placeholderTextColor="#999"
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            />
            <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#666" />
          </TouchableOpacity>
          {isOpen && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {filteredOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange(fieldName, option);
                      setSearchValue('');
                      setIsOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      await uploadImage(asset.uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'item-image.jpg',
      } as any);
      formData.append('is_private', '0');
      formData.append('folder', 'Home/Attachments');

      const response = await fetch(`${API_URL}api/method/upload_file`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `token ${process.env.EXPO_PUBLIC_API_KEY}:${process.env.EXPO_PUBLIC_API_SECRET}`,
        },
      });

      const data = await response.json();
      if (data.message) {
        handleInputChange('image', data.message.file_url);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.item_code.trim() || !formData.item_name.trim() || !formData.item_group.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      // Clean up empty string values to avoid server validation issues
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => value !== '')
      );
      
      if (isEdit) {
        await ApiService.updateDoc('Item', item.name, cleanedFormData);
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        await ApiService.createDoc('Item', cleanedFormData);
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
        {/* Brand Field - appears when item_type is selected */}
        {item_type && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brand</Text>
            <View style={styles.searchableDropdown}>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowBrandDropdown(!showBrandDropdown)}
              >
                <Ionicons name="pricetag" size={20} color="#666" style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  value={showBrandDropdown ? brandSearch : formData.brand}
                  onChangeText={setBrandSearch}
                  placeholder="Search brand..."
                  placeholderTextColor="#999"
                  onFocus={() => setShowBrandDropdown(true)}
                />
                <Ionicons name={showBrandDropdown ? "chevron-up" : "chevron-down"} size={16} color="#666" />
              </TouchableOpacity>
              {showBrandDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {filteredBrands.map(brand => (
                      <TouchableOpacity
                        key={brand}
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleInputChange('brand', brand);
                          setBrandSearch('');
                          setShowBrandDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{brand}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Sub Brand Field - appears when item_type is selected */}
        {item_type && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sub Brand</Text>
            <View style={styles.searchableDropdown}>
              <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setShowSubBrandDropdown(!showSubBrandDropdown)}
              >
                <Ionicons name="bookmark" size={20} color="#666" style={styles.inputIcon} />
                <RNTextInput
                  style={styles.input}
                  value={showSubBrandDropdown ? subBrandSearch : formData.sub_brand}
                  onChangeText={setSubBrandSearch}
                  placeholder="Search sub brand..."
                  placeholderTextColor="#999"
                  onFocus={() => setShowSubBrandDropdown(true)}
                />
                <Ionicons name={showSubBrandDropdown ? "chevron-up" : "chevron-down"} size={16} color="#666" />
              </TouchableOpacity>
              {showSubBrandDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {filteredSubBrands.map(subBrand => (
                      <TouchableOpacity
                        key={subBrand}
                        style={styles.dropdownItem}
                        onPress={() => {
                          handleInputChange('sub_brand', subBrand);
                          setSubBrandSearch('');
                          setShowSubBrandDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{subBrand}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Country of Origin Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country of Origin</Text>
          <View style={styles.searchableDropdown}>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowCountryDropdown(!showCountryDropdown)}
            >
              <Ionicons name="flag" size={20} color="#666" style={styles.inputIcon} />
              <RNTextInput
                style={styles.input}
                value={showCountryDropdown ? countrySearch : formData.country_of_origin}
                onChangeText={setCountrySearch}
                placeholder="Search country..."
                placeholderTextColor="#999"
                onFocus={() => setShowCountryDropdown(true)}
              />
              <Ionicons name={showCountryDropdown ? "chevron-up" : "chevron-down"} size={16} color="#666" />
            </TouchableOpacity>
            {showCountryDropdown && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {filteredCountries.map(country => (
                    <TouchableOpacity
                      key={country}
                      style={styles.dropdownItem}
                      onPress={() => {
                        handleInputChange('country_of_origin', country);
                        setCountrySearch('');
                        setShowCountryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{country}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Conditional Size Fields */}
        {item_type === 'Paper Cup Holder' && renderSearchableField('holder_size', 'Holder Size', 'Holder Size', 'resize')}
        {item_type === 'Outer BOX' && renderSearchableField('box_name', 'Box Name', 'Box Name', 'cube')}
        {item_type === 'Outer BOX' && renderSearchableField('box_size', 'Box Size', 'Box Size', 'resize')}
        {(item_type === 'Outer BOX' || item_type === 'Bags' || item_type === 'Waffle Box') && renderSearchableField('window_size', 'Window Size', 'Window Size', 'square')}
        {item_type === 'Bags' && renderSearchableField('bag_size', 'Bag Size', 'Bag Size', 'bag')}
        {item_type === 'Table Matt' && renderSearchableField('table_matt_size', 'Table Matt Size', 'Table Matt Size', 'grid')}
        {item_type === 'Food Tray' && renderSearchableField('tray_size', 'Tray Size', 'Tray Size', 'restaurant')}
        {item_type === 'Food Wrapping Paper' && renderSearchableField('wrapping_paper_size', 'Wrapping Paper Size', 'Wrapping Paper Size', 'gift')}
        {item_type === 'Sticker' && renderSearchableField('sticker_size', 'Sticker Size', 'Sticker Size', 'pricetag')}
        {item_type === 'Cone' && renderSearchableField('cone_name', 'Cone Name', 'Cone Name', 'triangle')}
        {item_type === 'Cone' && renderSearchableField('cone_size', 'Cone Size', 'Cone Size', 'resize')}
        {item_type === 'Leaflet' && renderSearchableField('leaflet_size', 'Leaflet Size', 'Leaflet Size', 'document')}
        {item_type === 'Business Card' && renderSearchableField('business_card_size', 'Business Card Size', 'Business Card Size', 'card')}
        {item_type === 'Envelope' && renderSearchableField('envelop_name', 'Envelop Name', 'Envelop Name', 'mail')}
        {item_type === 'Envelope' && renderSearchableField('envelop_size', 'Envelop Size', 'Envelop Size', 'resize')}
        {item_type === 'Invoice' && renderSearchableField('office_document_name', 'Office Document Name', 'Office Document Name', 'document-text')}
        {item_type === 'Invoice' && renderSearchableField('invoice_size', 'Invoice Size', 'Invoice Size', 'receipt')}
        {(item_type === 'Invoice' || item_type === 'Calendar' || item_type === 'Dairy' || item_type === 'Notebook') && renderSearchableField('paper_pages', 'Paper Pages', 'Paper Pages', 'library')}
        {item_type === 'File Folder' && renderSearchableField('file_folder_name', 'File Folder Name', 'File Folder Name', 'folder')}
        {item_type === 'File Folder' && renderSearchableField('file_folder_size', 'File Folder Size', 'File Folder Size', 'resize')}

        {/* Lamination Field - appears for multiple item types */}
        {(['Paper CUP', 'Paper Cup Jacket', 'Paper Cup Holder', 'Outer BOX', 'Bags', 'Table Matt', 'Food Tray', 'Sticker', 'Cone', 'Leaflet', 'Business Card', 'Hang Tag', 'Envelope', 'File Folder', 'Brochure', 'Calendar', 'Food Menu Card', 'Dairy', 'Notebook'].includes(item_type)) && 
          renderSelectField('laminnation', 'Lamination', laminationOptions, laminationSearch, setLaminationSearch, showLaminationDropdown, setShowLaminationDropdown, 'color-palette')
        }

        {/* Foil Field - appears for multiple item types including Invoice */}
        {(['Paper CUP', 'Paper Cup Jacket', 'Paper Cup Holder', 'Outer BOX', 'Bags', 'Table Matt', 'Food Tray', 'Sticker', 'Cone', 'Leaflet', 'Business Card', 'Hang Tag', 'Envelope', 'File Folder', 'Brochure', 'Calendar', 'Food Menu Card', 'Dairy', 'Notebook', 'Invoice'].includes(item_type)) && 
          renderSelectField('foil', 'Foil', foilOptions, foilSearch, setFoilSearch, showFoilDropdown, setShowFoilDropdown, 'sparkles')
        }

        {/* Origin Field - appears when item_type is selected */}
        {item_type && renderSelectField('origin', 'Origin', originOptions, originSearch, setOriginSearch, showOriginDropdown, setShowOriginDropdown, 'location')}

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

            {/* GSM Fields for Paper Cup */}
            {renderGsmField('single_wall_paper_gsm', 'Single Wall Paper GSM', 'single_wall')}
            {renderGsmField('double_wall_paper_gsm', 'Double Wall Paper GSM', 'double_wall')}
            {renderGsmField('bottom_gsm', 'Bottom GSM', 'bottom')}

            {/* Bottom Size Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bottom Size</Text>
              <View style={styles.searchableDropdown}>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowBottomSizeDropdown(!showBottomSizeDropdown)}
                >
                  <Ionicons name="resize" size={20} color="#666" style={styles.inputIcon} />
                  <RNTextInput
                    style={styles.input}
                    value={showBottomSizeDropdown ? bottomSizeSearch : formData.bottom_size}
                    onChangeText={setBottomSizeSearch}
                    placeholder="Search bottom size..."
                    placeholderTextColor="#999"
                    onFocus={() => setShowBottomSizeDropdown(true)}
                  />
                  <Ionicons name={showBottomSizeDropdown ? "chevron-up" : "chevron-down"} size={16} color="#666" />
                </TouchableOpacity>
                {showBottomSizeDropdown && (
                  <View style={styles.dropdown}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {filteredBottomSizes.map(size => (
                        <TouchableOpacity
                          key={size}
                          style={styles.dropdownItem}
                          onPress={() => {
                            handleInputChange('bottom_size', size);
                            setBottomSizeSearch('');
                            setShowBottomSizeDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{size}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
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
          <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.itemImage} />
            ) : (
              <>
                <Ionicons name="camera" size={32} color="#666" />
                <Text style={styles.imageText}>Add Photo</Text>
              </>
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
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
                <View style={styles.searchableDropdown}>
                  <TouchableOpacity 
                    style={styles.inputContainer}
                    onPress={() => setShowItemGroupDropdown(!showItemGroupDropdown)}
                  >
                    <Ionicons name="folder" size={20} color="#666" style={styles.inputIcon} />
                    <RNTextInput
                      style={styles.input}
                      value={showItemGroupDropdown ? itemGroupSearch : formData.item_group}
                      onChangeText={setItemGroupSearch}
                      placeholder="Search item group..."
                      placeholderTextColor="#999"
                      onFocus={() => setShowItemGroupDropdown(true)}
                    />
                    <Ionicons name={showItemGroupDropdown ? "chevron-up" : "chevron-down"} size={16} color="#666" />
                  </TouchableOpacity>
                  {showItemGroupDropdown && (
                    <View style={styles.dropdown}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                        {filteredItemGroups.map(group => (
                          <TouchableOpacity
                            key={group}
                            style={styles.dropdownItem}
                            onPress={() => {
                              handleInputChange('item_group', group);
                              setItemGroupSearch('');
                              setShowItemGroupDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{group}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Stock UOM *</Text>
                <View style={styles.searchableDropdown}>
                  <TouchableOpacity 
                    style={styles.inputContainer}
                    onPress={() => setShowUomDropdown(!showUomDropdown)}
                  >
                    <Ionicons name="scale" size={20} color="#666" style={styles.inputIcon} />
                    <RNTextInput
                      style={styles.input}
                      value={showUomDropdown ? uomSearch : formData.stock_uom}
                      onChangeText={setUomSearch}
                      placeholder="Search UOM..."
                      placeholderTextColor="#999"
                      onFocus={() => setShowUomDropdown(true)}
                    />
                    <Ionicons name={showUomDropdown ? "chevron-up" : "chevron-down"} size={16} color="#666" />
                  </TouchableOpacity>
                  {showUomDropdown && (
                    <View style={styles.dropdown}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                        {filteredUoms.map(uom => (
                          <TouchableOpacity
                            key={uom}
                            style={styles.dropdownItem}
                            onPress={() => {
                              handleInputChange('stock_uom', uom);
                              setUomSearch('');
                              setShowUomDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{uom}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
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
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
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
  searchableDropdown: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
});