import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { theme } from '../styles/theme';
import ApiService from '../services/api';

interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Customer {
  name: string;
  customer_name: string;
  email_id?: string;
  mobile_no?: string;
  c_address?: string;
  c_division?: string;
  c_district?: string;
  c_thana?: string;
  c_post_code?: string;
  c_contact_person_name?: string;
  c_mobile_number?: string;
  c_office_mobile?: string;
  c_email?: string;
  c_email_personal?: string;
}

interface Item {
  name: string;
  item_name: string;
  standard_rate?: number;
  description?: string;
}

export default function SalesOrderFormScreen({ route, navigation }: any) {
  const order = route?.params?.order;
  const quotation = route?.params?.quotation;
  const isEdit = !!order;
  const isFromQuotation = !!quotation;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    isFromQuotation ? {
      name: quotation?.customer || '',
      customer_name: quotation?.customer_name || quotation?.party_name || '',
      email_id: quotation?.contact_email || quotation?.email_id || ''
    } : null
  );
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [poNo, setPoNo] = useState('');
  const [poDate, setPoDate] = useState('');
  const [orderType, setOrderType] = useState('Sales');
  const [company, setCompany] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [sellingPriceList, setSellingPriceList] = useState('');
  const [taxId, setTaxId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [territory, setTerritory] = useState('');
  const [conversionRate, setConversionRate] = useState(1);
  const [priceListCurrency, setPriceListCurrency] = useState('BDT');
  const [plcConversionRate, setPlcConversionRate] = useState(1);
  const [setWarehouse, setSetWarehouse] = useState('');
  const [taxCategory, setTaxCategory] = useState('');
  const [shippingRule, setShippingRule] = useState('');
  const [taxesAndCharges, setTaxesAndCharges] = useState('');
  const [additionalDiscountPercentage, setAdditionalDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentTermsTemplate, setPaymentTermsTemplate] = useState('');
  const [tcName, setTcName] = useState('');
  const [project, setProject] = useState('');
  const [source, setSource] = useState('');
  const [campaign, setCampaign] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<OrderItem[]>(
    isFromQuotation && quotation?.items ? quotation.items.map((item: any, index: number) => ({
      id: index.toString(),
      name: item.item_code || item.item_name || item.name,
      description: item.description || item.item_name || '',
      quantity: item.qty || item.quantity || 1,
      unitPrice: item.rate || item.price_list_rate || item.standard_rate || 0,
      total: (item.qty || item.quantity || 1) * (item.rate || item.price_list_rate || item.standard_rate || 0)
    })) : []
  );
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Item[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [taxCategories, setTaxCategories] = useState<any[]>([]);
  const [shippingRules, setShippingRules] = useState<any[]>([]);
  const [taxTemplates, setTaxTemplates] = useState<any[]>([]);
  const [paymentTermsTemplates, setPaymentTermsTemplates] = useState<any[]>([]);
  const [termsTemplates, setTermsTemplates] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [leadSources, setLeadSources] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && order) {
      loadSalesOrderData();
    } else if (isFromQuotation && quotation) {
      loadQuotationData();
    }
    loadFormData();
  }, [isEdit, order, isFromQuotation, quotation]);

  const loadFormData = async () => {
    const loadData = async (apiCall: () => Promise<any>, setter: (data: any[]) => void, fieldName: string) => {
      try {
        console.log(`Loading ${fieldName}...`);
        const response = await apiCall();
        console.log(`✅ ${fieldName}: Loaded ${response.data?.length || 0} items`);
        setter(response.data || []);
        return response.data || [];
      } catch (error: any) {
        if (error.response?.status === 403) {
          console.log(`🚫 ${fieldName}: Permission denied (403) - User lacks read permission`);
        } else {
          console.log(`❌ ${fieldName}: Failed with error ${error.response?.status || 'unknown'} - ${error.message}`);
        }
        setter([]);
        return [];
      }
    };

    console.log('🔄 Starting Sales Order form data loading...');
    
    const [
      companiesData,
      priceListsData,
      currenciesData,
      territoriesData,
      warehousesData
    ] = await Promise.all([
      loadData(() => ApiService.getCompanies(), setCompanies, 'Companies'),
      loadData(() => ApiService.getPriceLists(), setPriceLists, 'Price Lists'),
      loadData(() => ApiService.getCurrencies(), setCurrencies, 'Currencies'),
      loadData(() => ApiService.getTerritories(), setTerritories, 'Territories'),
      loadData(() => ApiService.getWarehouses(), setWarehouses, 'Warehouses')
    ]);

    // Load optional data that might have permission issues
    await loadData(() => ApiService.getTaxCategories(), setTaxCategories, 'Tax Categories');
    await loadData(() => ApiService.getShippingRules(), setShippingRules, 'Shipping Rules');
    await loadData(() => ApiService.getSalesTaxesAndChargesTemplates(), setTaxTemplates, 'Sales Taxes Templates');
    await loadData(() => ApiService.getPaymentTermsTemplates(), setPaymentTermsTemplates, 'Payment Terms Templates');
    await loadData(() => ApiService.getTermsAndConditions(), setTermsTemplates, 'Terms and Conditions');
    await loadData(() => ApiService.getProjects(), setProjects, 'Projects');
    await loadData(() => ApiService.getLeadSources(), setLeadSources, 'Lead Sources');
    await loadData(() => ApiService.getCampaigns(), setCampaigns, 'Campaigns');
    
    console.log('✅ Sales Order form data loading completed');

    // Set defaults
    if (companiesData.length > 0) {
      setCompany(companiesData[0].name);
      console.log(`📋 Default company set: ${companiesData[0].name}`);
    }
    if (currenciesData.length > 0) {
      const defaultCurrency = currenciesData.find((c: any) => c.enabled) || currenciesData[0];
      setCurrency(defaultCurrency.name);
      setPriceListCurrency(defaultCurrency.name);
      console.log(`💰 Default currency set: ${defaultCurrency.name}`);
    }
  };

  const loadQuotationData = () => {
    if (quotation) {
      setOrderDate(quotation.transaction_date || new Date().toISOString().split('T')[0]);
      setDeliveryDate(quotation.valid_till || '');
      setCurrency(quotation.currency || 'BDT');
      setSellingPriceList(quotation.selling_price_list || '');
      setTerms(quotation.terms || '');
      setNotes(quotation.tc_name || '');
      setPoNo(quotation.po_no || '');
      setPoDate(quotation.po_date || '');
    }
  };

  const loadSalesOrderData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getDocument('Sales Order', order.orderNumber || order.name);
      const data = response.data;
      
      if (data.customer) {
        setSelectedCustomer({
          name: data.customer,
          customer_name: data.customer_name || data.customer,
          email_id: data.contact_email
        });
      }
      
      setOrderDate(data.transaction_date || orderDate);
      setDeliveryDate(data.delivery_date || deliveryDate);
      setPoNo(data.po_no || '');
      setPoDate(data.po_date || '');
      setOrderType(data.order_type || 'Sales');
      setCompany(data.company || '');
      setCurrency(data.currency || 'BDT');
      setSellingPriceList(data.selling_price_list || '');
      setTaxId(data.tax_id || '');
      setCustomerAddress(data.address_display || '');
      setContactPerson(data.contact_display || '');
      setContactMobile(data.contact_mobile || '');
      setContactEmail(data.contact_email || '');
      setShippingAddress(data.shipping_address || '');
      setTerritory(data.territory || '');
      setConversionRate(data.conversion_rate || 1);
      setPriceListCurrency(data.price_list_currency || 'BDT');
      setPlcConversionRate(data.plc_conversion_rate || 1);
      setSetWarehouse(data.set_warehouse || '');
      setTaxCategory(data.tax_category || '');
      setShippingRule(data.shipping_rule || '');
      setTaxesAndCharges(data.taxes_and_charges || '');
      setAdditionalDiscountPercentage(data.additional_discount_percentage || 0);
      setDiscountAmount(data.discount_amount || 0);
      setPaymentTermsTemplate(data.payment_terms_template || '');
      setTcName(data.tc_name || '');
      setProject(data.project || '');
      setSource(data.source || '');
      setCampaign(data.campaign || '');
      setNotes(data.tc_name || '');
      setTerms(data.terms || '');
      
      if (data.items && data.items.length > 0) {
        const loadedItems = data.items.map((item: any, index: number) => ({
          id: index.toString(),
          name: item.item_code,
          description: item.description || '',
          quantity: item.qty || 1,
          unitPrice: item.rate || 0,
          total: (item.qty || 1) * (item.rate || 0)
        }));
        setItems(loadedItems);
      }
    } catch (error) {
      console.error('Failed to load sales order data:', error);
      Alert.alert('Error', 'Failed to load sales order data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await ApiService.getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await ApiService.getItems();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.customer_name && customer.customer_name.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (customer.email_id && customer.email_id.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const filteredProducts = products.filter(product => {
    if (!productSearch) return true;
    return product.item_name && product.item_name.toLowerCase().includes(productSearch.toLowerCase());
  });

  const addItem = (product: Item) => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: product.name,
      description: product.description || '',
      quantity: 1,
      unitPrice: product.standard_rate || 0,
      total: product.standard_rate || 0
    };
    setItems([...items, newItem]);
    setShowProductModal(false);
    setProductSearch('');
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSave = async () => {
    if (!selectedCustomer || items.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item');
      return;
    }

    try {
      setLoading(true);
      const salesOrderData = {
        customer: selectedCustomer.name,
        customer_name: selectedCustomer.customer_name,
        transaction_date: orderDate,
        delivery_date: deliveryDate,
        po_no: poNo,
        po_date: poDate,
        order_type: orderType,
        company: company,
        currency: currency,
        selling_price_list: sellingPriceList,
        total: totalAmount,
        grand_total: totalAmount,
        items: items.map(item => ({
          item_code: item.name,
          qty: item.quantity,
          rate: item.unitPrice,
          description: item.description
        })),
        tc_name: notes,
        terms: terms,
        ...(selectedCustomer.c_address && {
          address: selectedCustomer.c_address,
          division: selectedCustomer.c_division,
          district: selectedCustomer.c_district,
          thana: selectedCustomer.c_thana,
          post_code: selectedCustomer.c_post_code,
          contact_person_name: selectedCustomer.c_contact_person_name,
          mobile_number: selectedCustomer.c_mobile_number,
          office_mobile: selectedCustomer.c_office_mobile,
          email: selectedCustomer.c_email,
          personal_email: selectedCustomer.c_email_personal
        })
      };

      if (isEdit) {
        await ApiService.updateDoc('Sales Order', order.orderNumber || order.name, salesOrderData);
        Alert.alert('Success', 'Sales order updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await ApiService.createDoc('Sales Order', salesOrderData);
        Alert.alert('Success', 'Sales order created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save sales order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Customer Selection */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Customer</Label>
          </View>
          
          {selectedCustomer ? (
            <View style={styles.selectedCustomer}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerCompany}>{selectedCustomer.customer_name}</Text>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerEmail}>{selectedCustomer.email_id || 'No email'}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                <Ionicons name="close" size={20} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              variant="outline"
              onPress={() => {
                setShowCustomerModal(true);
                fetchCustomers();
              }}
              style={styles.selectButton}
            >
              <Ionicons name="search" size={16} color={theme.colors.primary} />
              <Text style={styles.selectButtonText}>Select Customer</Text>
            </Button>
          )}
        </Card>

        {/* Order Details */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Order Details</Label>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Order Type</Label>
              <Input
                value={orderType}
                onChangeText={setOrderType}
                placeholder="Sales"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Company</Label>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  Alert.alert(
                    'Select Company',
                    '',
                    companies.map(comp => ({
                      text: comp.name,
                      onPress: () => setCompany(comp.name)
                    }))
                  );
                }}
              >
                <Text style={styles.dropdownText}>{company || 'Select Company'}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Order Date</Label>
              <Input
                value={orderDate}
                onChangeText={setOrderDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Delivery Date</Label>
              <Input
                value={deliveryDate}
                onChangeText={setDeliveryDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Customer PO No</Label>
              <Input
                value={poNo}
                onChangeText={setPoNo}
                placeholder="Purchase Order Number"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>PO Date</Label>
              <Input
                value={poDate}
                onChangeText={setPoDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Currency</Label>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  Alert.alert(
                    'Select Currency',
                    '',
                    currencies.map(curr => ({
                      text: curr.name,
                      onPress: () => setCurrency(curr.name)
                    }))
                  );
                }}
              >
                <Text style={styles.dropdownText}>{currency || 'Select Currency'}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Price List</Label>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  Alert.alert(
                    'Select Price List',
                    '',
                    priceLists.map(pl => ({
                      text: pl.name,
                      onPress: () => setSellingPriceList(pl.name)
                    }))
                  );
                }}
              >
                <Text style={styles.dropdownText}>{sellingPriceList || 'Select Price List'}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Items */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Items</Label>
            <TouchableOpacity onPress={() => {
              setShowProductModal(true);
              fetchProducts();
            }}>
              <Ionicons name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <Text style={styles.emptyText}>No items added yet</Text>
          ) : (
            <View style={styles.itemsList}>
              {items.map(item => (
                <Card key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Ionicons name="close" size={16} color={theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                  
                  <Input
                    placeholder="Description (optional)"
                    value={item.description}
                    onChangeText={(text) => updateItem(item.id, 'description', text)}
                    style={styles.descriptionInput}
                  />
                  
                  <View style={styles.itemGrid}>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Qty</Label>
                      <Input
                        value={item.quantity.toString()}
                        onChangeText={(text) => updateItem(item.id, 'quantity', parseInt(text) || 1)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Unit Price</Label>
                      <Input
                        value={item.unitPrice.toString()}
                        onChangeText={(text) => updateItem(item.id, 'unitPrice', parseFloat(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Label style={styles.fieldLabel}>Total</Label>
                      <View style={styles.totalField}>
                        <Text style={styles.totalText}>৳{item.total.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
              
              <Separator style={styles.separator} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>৳{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Address & Contact */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Address & Contact</Label>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Tax ID</Label>
              <Input
                value={taxId}
                onChangeText={setTaxId}
                placeholder="Tax ID"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Territory</Label>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  Alert.alert(
                    'Select Territory',
                    '',
                    territories.map(terr => ({
                      text: terr.name,
                      onPress: () => setTerritory(terr.name)
                    }))
                  );
                }}
              >
                <Text style={styles.dropdownText}>{territory || 'Select Territory'}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Customer Address</Label>
              <Input
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="Customer Address"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Shipping Address</Label>
              <Input
                value={shippingAddress}
                onChangeText={setShippingAddress}
                placeholder="Shipping Address"
              />
            </View>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Contact Person</Label>
              <Input
                value={contactPerson}
                onChangeText={setContactPerson}
                placeholder="Contact Person"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Contact Mobile</Label>
              <Input
                value={contactMobile}
                onChangeText={setContactMobile}
                placeholder="Mobile Number"
              />
            </View>
          </View>
          
          <View style={styles.formField}>
            <Label style={styles.fieldLabel}>Contact Email</Label>
            <Input
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="Email Address"
            />
          </View>
        </Card>

        {/* Currency & Pricing */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Currency & Exchange</Label>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Exchange Rate</Label>
              <Input
                value={conversionRate.toString()}
                onChangeText={(text) => setConversionRate(parseFloat(text) || 1)}
                placeholder="1.0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Price List Currency</Label>
              <Input
                value={priceListCurrency}
                onChangeText={setPriceListCurrency}
                placeholder="BDT"
              />
            </View>
          </View>
          
          <View style={styles.formField}>
            <Label style={styles.fieldLabel}>Price List Exchange Rate</Label>
            <Input
              value={plcConversionRate.toString()}
              onChangeText={(text) => setPlcConversionRate(parseFloat(text) || 1)}
              placeholder="1.0"
              keyboardType="numeric"
            />
          </View>
        </Card>

        {/* Warehouse */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Warehouse</Label>
          </View>
          
          <View style={styles.formField}>
            <Label style={styles.fieldLabel}>Set Source Warehouse</Label>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                Alert.alert(
                  'Select Warehouse',
                  '',
                  warehouses.map(wh => ({
                    text: wh.name,
                    onPress: () => setSetWarehouse(wh.name)
                  }))
                );
              }}
            >
              <Text style={styles.dropdownText}>{setWarehouse || 'Select Warehouse'}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Taxes */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Taxes</Label>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Tax Category</Label>
              <Input
                value={taxCategory}
                onChangeText={setTaxCategory}
                placeholder="Tax Category"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Shipping Rule</Label>
              <Input
                value={shippingRule}
                onChangeText={setShippingRule}
                placeholder="Shipping Rule"
              />
            </View>
          </View>
          
          <View style={styles.formField}>
            <Label style={styles.fieldLabel}>Sales Taxes Template</Label>
            <Input
              value={taxesAndCharges}
              onChangeText={setTaxesAndCharges}
              placeholder="Taxes Template"
            />
          </View>
        </Card>

        {/* Additional Discount */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Additional Discount</Label>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Discount %</Label>
              <Input
                value={additionalDiscountPercentage.toString()}
                onChangeText={(text) => setAdditionalDiscountPercentage(parseFloat(text) || 0)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Discount Amount</Label>
              <Input
                value={discountAmount.toString()}
                onChangeText={(text) => setDiscountAmount(parseFloat(text) || 0)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        {/* Payment Terms */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Payment Terms</Label>
          </View>
          
          <View style={styles.formField}>
            <Label style={styles.fieldLabel}>Payment Terms Template</Label>
            <Input
              value={paymentTermsTemplate}
              onChangeText={setPaymentTermsTemplate}
              placeholder="Payment Terms Template"
            />
          </View>
        </Card>

        {/* Terms & Conditions */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Terms & Conditions</Label>
          </View>
          
          <View style={styles.formField}>
            <Label style={styles.fieldLabel}>Terms Template</Label>
            <Input
              value={tcName}
              onChangeText={setTcName}
              placeholder="Terms Template"
            />
          </View>
          
          <Textarea
            placeholder="Terms and conditions details..."
            value={terms}
            onChangeText={setTerms}
            rows={3}
            style={styles.notesInput}
          />
        </Card>

        {/* More Info */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>More Info</Label>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Project</Label>
              <Input
                value={project}
                onChangeText={setProject}
                placeholder="Project"
              />
            </View>
            <View style={styles.formField}>
              <Label style={styles.fieldLabel}>Source</Label>
              <Input
                value={source}
                onChangeText={setSource}
                placeholder="Lead Source"
              />
            </View>
          </View>
          
          <View style={styles.formField}>
            <Label style={styles.fieldLabel}>Campaign</Label>
            <Input
              value={campaign}
              onChangeText={setCampaign}
              placeholder="Campaign"
            />
          </View>
        </Card>
        
        <Card style={styles.card}>
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="Additional notes or special instructions..."
            value={notes}
            onChangeText={setNotes}
            rows={3}
            style={styles.notesInput}
          />
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.actionGrid}>
          <Button variant="outline" onPress={() => navigation.goBack()}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
            ) : (
              isEdit ? 'Update Order' : 'Create Order'
            )}
          </Button>
        </View>
      </View>

      {/* Customer Modal */}
      <Modal visible={showCustomerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChangeText={setCustomerSearch}
              style={styles.searchInput}
            />
            
            {customersLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.customerList}>
                {filteredCustomers.map(customer => (
                  <TouchableOpacity
                    key={customer.name}
                    style={styles.customerItem}
                    onPress={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerModal(false);
                      setCustomerSearch('');
                    }}
                  >
                    <Text style={styles.customerCompany}>{customer.customer_name}</Text>
                    <Text style={styles.customerName}>{customer.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal visible={showProductModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChangeText={setProductSearch}
              style={styles.searchInput}
            />
            
            {productsLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.productList}>
                {filteredProducts.length === 0 ? (
                  <Text style={styles.emptyText}>No products found</Text>
                ) : (
                  filteredProducts.map(product => (
                    <TouchableOpacity
                      key={product.name}
                      style={styles.productItem}
                      onPress={() => addItem(product)}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.item_name}</Text>
                        <Text style={styles.productPrice}>৳{product.standard_rate || 0}</Text>
                      </View>
                      <Ionicons name="add" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  selectedCustomer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
  },
  customerInfo: {
    flex: 1,
  },
  customerCompany: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  customerName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  customerEmail: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectButtonText: {
    color: theme.colors.primary,
  },
  formGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.mutedForeground,
    paddingVertical: theme.spacing.xl,
  },
  itemsList: {
    gap: theme.spacing.md,
  },
  itemCard: {
    padding: theme.spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
    flex: 1,
  },
  descriptionInput: {
    marginBottom: theme.spacing.sm,
  },
  itemGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  itemField: {
    flex: 1,
  },
  totalField: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.md,
  },
  totalText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  separator: {
    marginVertical: theme.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  notesInput: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
  },
  searchInput: {
    margin: theme.spacing.lg,
  },
  customerList: {
    maxHeight: 300,
  },
  customerItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productList: {
    maxHeight: 300,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  productPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  dropdownText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
  },
});