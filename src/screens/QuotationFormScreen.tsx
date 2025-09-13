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

interface QuotationItem {
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
}

interface Item {
  name: string;
  item_name: string;
  standard_rate?: number;
  description?: string;
}

interface TaxTemplate {
  name: string;
  title: string;
  taxes?: any[];
}

interface TaxCategory {
  name: string;
  title?: string;
}

interface ShippingRule {
  name: string;
  label?: string;
}

interface CouponCode {
  name: string;
  coupon_name?: string;
}

interface SalesPartner {
  name: string;
  partner_name?: string;
}

const stripHtml = (html: string) => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

export default function QuotationFormScreen({ route, navigation }: any) {
  const quotation = route?.params?.quotation;
  const isEdit = !!quotation;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [validityPeriod, setValidityPeriod] = useState('30');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [vatRate, setVatRate] = useState('15');
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [taxTemplates, setTaxTemplates] = useState<TaxTemplate[]>([]);
  const [selectedTaxTemplate, setSelectedTaxTemplate] = useState<TaxTemplate | null>(null);
  const [showTaxTemplateModal, setShowTaxTemplateModal] = useState(false);
  const [taxTemplateSearch, setTaxTemplateSearch] = useState('');
  const [taxTemplatesLoading, setTaxTemplatesLoading] = useState(false);


  const [couponCodes, setCouponCodes] = useState<CouponCode[]>([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState<CouponCode | null>(null);
  const [salesPartners, setSalesPartners] = useState<SalesPartner[]>([]);
  const [selectedSalesPartner, setSelectedSalesPartner] = useState<SalesPartner | null>(null);
  const [additionalDiscountPercentage, setAdditionalDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyDiscountOn, setApplyDiscountOn] = useState('Grand Total');


  const [showCouponCodeModal, setShowCouponCodeModal] = useState(false);
  const [showSalesPartnerModal, setShowSalesPartnerModal] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    (customer.customer_name && customer.customer_name.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (customer.email_id && customer.email_id.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const filteredProducts = products.filter(product => {
    if (!productSearch) return true;
    return product.item_name && product.item_name.toLowerCase().includes(productSearch.toLowerCase());
  });

  useEffect(() => {
    if (validityPeriod && quotationDate) {
      const quoteDate = new Date(quotationDate);
      quoteDate.setDate(quoteDate.getDate() + parseInt(validityPeriod));
      setValidUntil(quoteDate.toISOString().split('T')[0]);
    }
  }, [validityPeriod, quotationDate]);

  useEffect(() => {
    if (isEdit && quotation) {
      loadQuotationData();
    }
  }, [isEdit, quotation]);

  const loadQuotationData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getDocument('Quotation', quotation.quotationNumber || quotation.name);
      const data = response.data;
      
      if (data.party_name || data.customer_name) {
        setSelectedCustomer({
          name: data.party_name || data.customer_name,
          customer_name: data.customer_name || data.party_name,
          email_id: data.email_id
        });
      }
      
      setQuotationDate(data.transaction_date || quotationDate);
      setValidUntil(data.valid_till || validUntil);
      setNotes(data.tc_name || '');
      setTermsAndConditions(data.terms || '');
      setVatRate(data.vat_rate?.toString() || '15');
      setAdditionalCharges(data.additional_charges || 0);
      setAdditionalDiscountPercentage(data.additional_discount_percentage || 0);
      setDiscountAmount(data.discount_amount || 0);
      setApplyDiscountOn(data.apply_discount_on || 'Grand Total');
      
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
      
      if (data.taxes_and_charges_template) {
        try {
          const templates = await ApiService.getSalesTaxesAndChargesTemplates();
          const template = templates.data?.find((t: any) => t.name === data.taxes_and_charges_template);
          if (template) {
            setSelectedTaxTemplate(template);
          }
        } catch (error) {
          console.error('Failed to load tax template:', error);
        }
      }
      
      if (data.coupon_code) {
        try {
          const coupons = await ApiService.getCouponCodes();
          const coupon = coupons.data?.find((c: any) => c.name === data.coupon_code);
          if (coupon) {
            setSelectedCouponCode(coupon);
          }
        } catch (error) {
          console.error('Failed to load coupon code:', error);
        }
      }
      
      if (data.referral_sales_partner) {
        try {
          const partners = await ApiService.getSalesPartners();
          const partner = partners.data?.find((p: any) => p.name === data.referral_sales_partner);
          if (partner) {
            setSelectedSalesPartner(partner);
          }
        } catch (error) {
          console.error('Failed to load sales partner:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load quotation data:', error);
      Alert.alert('Error', 'Failed to load quotation data');
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
      console.log('Fetching products...');
      const response = await ApiService.getItems();
      console.log('Products response:', response);
      console.log('Products data:', response.data);
      setProducts(response.data || []);
      console.log('Products state set:', response.data?.length || 0, 'items');
      if (!response.data || response.data.length === 0) {
        Alert.alert('Info', 'No items found in the system');
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      Alert.alert('Error', 'Failed to fetch items. Please try again.');
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchTaxTemplates = async () => {
    try {
      setTaxTemplatesLoading(true);
      const response = await ApiService.getSalesTaxesAndChargesTemplates();
      setTaxTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tax templates:', error);
    } finally {
      setTaxTemplatesLoading(false);
    }
  };





  const fetchCouponCodes = async () => {
    try {
      const response = await ApiService.getCouponCodes();
      setCouponCodes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch coupon codes:', error);
    }
  };

  const fetchSalesPartners = async () => {
    try {
      const response = await ApiService.getSalesPartners();
      setSalesPartners(response.data || []);
    } catch (error) {
      console.error('Failed to fetch sales partners:', error);
    }
  };

  const filteredTaxTemplates = taxTemplates.filter(template =>
    template.title && template.title.toLowerCase().includes(taxTemplateSearch.toLowerCase())
  );

  const addItem = (product: Item) => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      name: product.name, // Use item code for quotation
      description: stripHtml(product.description || ''),
      quantity: 1,
      unitPrice: product.standard_rate || 0,
      total: product.standard_rate || 0
    };
    setItems([...items, newItem]);
    setShowProductModal(false);
    setProductSearch('');
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
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

  const subtotalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const netAmount = subtotalAmount;
  const vatAmount = (netAmount * parseFloat(vatRate)) / 100;
  const totalTaxesAndCharges = vatAmount + additionalCharges;
  const baseAmount = applyDiscountOn === 'Net Total' ? netAmount : (netAmount + totalTaxesAndCharges);
  const additionalDiscountAmount = (baseAmount * additionalDiscountPercentage) / 100;
  const finalDiscountAmount = discountAmount || additionalDiscountAmount;
  const grandTotal = netAmount + totalTaxesAndCharges - finalDiscountAmount;

  const handleSave = async () => {
    if (!selectedCustomer || items.length === 0) {
      Alert.alert('Error', 'Please select a customer and add at least one item');
      return;
    }

    try {
      setLoading(true);
      const quotationData = {
        party_name: selectedCustomer.name,
        transaction_date: quotationDate,
        valid_till: validUntil,
        currency: 'BDT',
        total: subtotalAmount,
        net_total: netAmount,
        total_taxes_and_charges: totalTaxesAndCharges,
        grand_total: grandTotal,
        taxes_and_charges_template: selectedTaxTemplate?.name,


        coupon_code: selectedCouponCode?.name,
        referral_sales_partner: selectedSalesPartner?.name,
        apply_discount_on: applyDiscountOn,
        additional_discount_percentage: additionalDiscountPercentage,
        discount_amount: finalDiscountAmount,
        items: items.map(item => ({
          item_code: item.name,
          qty: item.quantity,
          rate: item.unitPrice,
          description: item.description
        })),
        terms: termsAndConditions,
        tc_name: notes
      };

      if (isEdit) {
        await ApiService.updateDoc('Quotation', quotation.quotationNumber || quotation.name, quotationData);
        Alert.alert('Success', 'Quotation updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await ApiService.createDoc('Quotation', quotationData);
        Alert.alert('Success', 'Quotation created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuotation = async () => {
    try {
      setLoading(true);
      await ApiService.updateDoc('Quotation', quotation.quotationNumber || quotation.name, { docstatus: 1 });
      Alert.alert('Success', 'Quotation submitted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSalesOrder = async () => {
    try {
      setLoading(true);
      await ApiService.convertQuotationToSalesOrder(quotation.quotationNumber || quotation.name);
      Alert.alert('Success', 'Sales Order created successfully!', [
        {
          text: 'View Sales Order',
          onPress: () => navigation.navigate('Orders', { 
            screen: 'SalesOrderForm', 
            params: { quotation: quotation }
          })
        },
        { text: 'OK' }
      ]);
    } catch (error: any) {
      if (error.message.includes('docstatus=1')) {
        Alert.alert('Submit Required', 'Please submit the quotation first before creating a sales order.', [
          {
            text: 'Submit & Create Order',
            onPress: async () => {
              try {
                await ApiService.updateDoc('Quotation', quotation.quotationNumber || quotation.name, { docstatus: 1 });
                await ApiService.convertQuotationToSalesOrder(quotation.quotationNumber || quotation.name);
                Alert.alert('Success', 'Sales Order created successfully!');
              } catch (submitError: any) {
                Alert.alert('Error', submitError.message || 'Failed to create sales order');
              }
            }
          },
          { text: 'Cancel' }
        ]);
      } else {
        Alert.alert('Error', error.message || 'Failed to create sales order');
      }
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

        {/* Quotation Details */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Quotation Details</Label>
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.dateField}>
              <Label style={styles.fieldLabel}>Quotation Date</Label>
              <Input
                value={quotationDate}
                onChangeText={setQuotationDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateField}>
              <Label style={styles.fieldLabel}>Validity Period</Label>
              <View style={styles.validityContainer}>
                {['15', '30', '45', '60', '90'].map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.validityOption,
                      validityPeriod === period && styles.validityOptionActive
                    ]}
                    onPress={() => setValidityPeriod(period)}
                  >
                    <Text style={[
                      styles.validityText,
                      validityPeriod === period && styles.validityTextActive
                    ]}>
                      {period} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.dateField}>
            <Label style={styles.fieldLabel}>Valid Until</Label>
            <Input
              value={validUntil}
              onChangeText={setValidUntil}
              placeholder="YYYY-MM-DD"
            />
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
                  </View>
                  
                  <View style={styles.itemField}>
                    <Label style={styles.fieldLabel}>Total</Label>
                    <View style={styles.totalField}>
                      <Text style={styles.totalText}>৳{item.total.toFixed(2)}</Text>
                    </View>
                  </View>
                </Card>
              ))}
              
              <Separator style={styles.separator} />
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>৳{subtotalAmount.toFixed(2)}</Text>
                </View>

                <Separator style={styles.separator} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalAmount}>৳{netAmount.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Taxes and Charges */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Taxes and Charges</Label>
          </View>
          

          
          {selectedTaxTemplate ? (
            <View style={styles.selectedTemplate}>
              <View style={styles.templateInfo}>
                <Text style={styles.templateTitle}>{selectedTaxTemplate.title}</Text>
                <Text style={styles.templateName}>{selectedTaxTemplate.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTaxTemplate(null)}>
                <Ionicons name="close" size={20} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              variant="outline"
              onPress={() => {
                setShowTaxTemplateModal(true);
                fetchTaxTemplates();
              }}
              style={styles.selectButton}
            >
              <Ionicons name="calculator" size={16} color={theme.colors.primary} />
              <Text style={styles.selectButtonText}>Select Tax Template</Text>
            </Button>
          )}
          
          <View style={styles.taxGrid}>
            <View style={styles.taxField}>
              <Label style={styles.fieldLabel}>VAT Rate (%)</Label>
              <View style={styles.vatContainer}>
                {['0', '5', '10', '15', '20'].map(rate => (
                  <TouchableOpacity
                    key={rate}
                    style={[
                      styles.vatOption,
                      vatRate === rate && styles.vatOptionActive
                    ]}
                    onPress={() => setVatRate(rate)}
                  >
                    <Text style={[
                      styles.vatText,
                      vatRate === rate && styles.vatTextActive
                    ]}>
                      {rate}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.taxField}>
              <Label style={styles.fieldLabel}>Additional Charges</Label>
              <Input
                value={additionalCharges.toString()}
                onChangeText={(text) => setAdditionalCharges(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
          
          <Separator style={styles.separator} />
          <View style={styles.taxSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net Amount:</Text>
              <Text style={styles.summaryValue}>৳{netAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT ({vatRate}%):</Text>
              <Text style={styles.summaryValue}>৳{vatAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Additional Charges:</Text>
              <Text style={styles.summaryValue}>৳{additionalCharges.toFixed(2)}</Text>
            </View>
            <Separator style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Taxes and Charges (BDT):</Text>
              <Text style={styles.totalAmount}>৳{totalTaxesAndCharges.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Additional Discount */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={16} color={theme.colors.mutedForeground} />
            <Label>Additional Discount</Label>
          </View>
          
          <View style={styles.taxGrid}>
            <View style={styles.taxField}>
              <Label style={styles.fieldLabel}>Coupon Code</Label>
              {selectedCouponCode ? (
                <View style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{selectedCouponCode.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedCouponCode(null)}>
                    <Ionicons name="close" size={16} color={theme.colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowCouponCodeModal(true);
                    fetchCouponCodes();
                  }}
                  style={styles.selectButton}
                >
                  <Text style={styles.selectButtonText}>Select Coupon Code</Text>
                </Button>
              )}
            </View>
            
            <View style={styles.taxField}>
              <Label style={styles.fieldLabel}>Referral Sales Partner</Label>
              {selectedSalesPartner ? (
                <View style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{selectedSalesPartner.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedSalesPartner(null)}>
                    <Ionicons name="close" size={16} color={theme.colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowSalesPartnerModal(true);
                    fetchSalesPartners();
                  }}
                  style={styles.selectButton}
                >
                  <Text style={styles.selectButtonText}>Select Sales Partner</Text>
                </Button>
              )}
            </View>
          </View>
          
          <View style={styles.taxField}>
            <Label style={styles.fieldLabel}>Apply Additional Discount On</Label>
            <View style={styles.vatContainer}>
              {['Grand Total', 'Net Total'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.vatOption,
                    applyDiscountOn === option && styles.vatOptionActive
                  ]}
                  onPress={() => setApplyDiscountOn(option)}
                >
                  <Text style={[
                    styles.vatText,
                    applyDiscountOn === option && styles.vatTextActive
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.taxGrid}>
            <View style={styles.taxField}>
              <Label style={styles.fieldLabel}>Additional Discount (%)</Label>
              <Input
                value={additionalDiscountPercentage.toString()}
                onChangeText={(text) => setAdditionalDiscountPercentage(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            
            <View style={styles.taxField}>
              <Label style={styles.fieldLabel}>Discount Amount</Label>
              <Input
                value={discountAmount.toString()}
                onChangeText={(text) => setDiscountAmount(parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        </Card>

        {/* Totals */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator" size={16} color={theme.colors.mutedForeground} />
            <Label>Totals</Label>
          </View>
          
          <View style={styles.taxSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net Amount:</Text>
              <Text style={styles.summaryValue}>৳{netAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Taxes and Charges:</Text>
              <Text style={styles.summaryValue}>৳{totalTaxesAndCharges.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Additional Discount:</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>-৳{finalDiscountAmount.toFixed(2)}</Text>
            </View>
            <Separator style={styles.separator} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Grand Total (BDT):</Text>
              <Text style={styles.totalAmount}>৳{grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Notes */}
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

        {/* Terms and Conditions */}
        <Card style={styles.card}>
          <Label>Terms and Conditions (Optional)</Label>
          <Textarea
            placeholder="Payment terms, delivery conditions, etc..."
            value={termsAndConditions}
            onChangeText={setTermsAndConditions}
            rows={4}
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
              isEdit ? 'Update Quotation' : 'Create Quotation'
            )}
          </Button>
          {isEdit && (
            <>
              <Button onPress={handleSubmitQuotation} disabled={loading} variant="outline">
                Submit
              </Button>
              <Button onPress={handleCreateSalesOrder} disabled={loading} style={styles.createOrderButton}>
                Create Sales Order
              </Button>
            </>
          )}
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

      {/* Tax Template Modal */}
      <Modal visible={showTaxTemplateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Tax Template</Text>
              <TouchableOpacity onPress={() => setShowTaxTemplateModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <Input
              placeholder="Search tax templates..."
              value={taxTemplateSearch}
              onChangeText={setTaxTemplateSearch}
              style={styles.searchInput}
            />
            
            {taxTemplatesLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ margin: 20 }} />
            ) : (
              <ScrollView style={styles.templateList}>
                {filteredTaxTemplates.length === 0 ? (
                  <Text style={styles.emptyText}>No tax templates found</Text>
                ) : (
                  filteredTaxTemplates.map(template => (
                    <TouchableOpacity
                      key={template.name}
                      style={styles.templateItem}
                      onPress={() => {
                        setSelectedTaxTemplate(template);
                        setShowTaxTemplateModal(false);
                        setTaxTemplateSearch('');
                      }}
                    >
                      <Text style={styles.templateTitle}>{template.title}</Text>
                      <Text style={styles.templateName}>{template.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>





      {/* Coupon Code Modal */}
      <Modal visible={showCouponCodeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Coupon Code</Text>
              <TouchableOpacity onPress={() => setShowCouponCodeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.templateList}>
              {couponCodes.length === 0 ? (
                <Text style={styles.emptyText}>No coupon codes found</Text>
              ) : (
                couponCodes.map(coupon => (
                  <TouchableOpacity
                    key={coupon.name}
                    style={styles.templateItem}
                    onPress={() => {
                      setSelectedCouponCode(coupon);
                      setShowCouponCodeModal(false);
                    }}
                  >
                    <Text style={styles.templateTitle}>{coupon.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sales Partner Modal */}
      <Modal visible={showSalesPartnerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sales Partner</Text>
              <TouchableOpacity onPress={() => setShowSalesPartnerModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.foreground} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.templateList}>
              {salesPartners.length === 0 ? (
                <Text style={styles.emptyText}>No sales partners found</Text>
              ) : (
                salesPartners.map(partner => (
                  <TouchableOpacity
                    key={partner.name}
                    style={styles.templateItem}
                    onPress={() => {
                      setSelectedSalesPartner(partner);
                      setShowSalesPartnerModal(false);
                    }}
                  >
                    <Text style={styles.templateTitle}>{partner.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
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
    fontWeight: theme.typography.fontWeight.medium as '500',
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
  detailsGrid: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dateField: {
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  validityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  validityOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  validityOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  validityText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  validityTextActive: {
    color: theme.colors.primaryForeground,
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
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.foreground,
    flex: 1,
  },
  descriptionInput: {
    marginBottom: theme.spacing.sm,
  },
  itemGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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
  summaryContainer: {
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  discountText: {
    color: theme.colors.destructive,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.foreground,
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as 'bold',
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
    flexWrap: 'wrap',
  },
  createOrderButton: {
    backgroundColor: theme.colors.primary,
    flex: 1,
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
    fontWeight: theme.typography.fontWeight.bold as 'bold',
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
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.foreground,
  },
  productPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  taxGrid: {
    gap: theme.spacing.md,
  },
  taxField: {
    marginBottom: theme.spacing.sm,
  },
  vatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  vatOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  vatOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  vatText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
  },
  vatTextActive: {
    color: theme.colors.primaryForeground,
  },
  taxSummary: {
    gap: theme.spacing.sm,
  },
  selectedTemplate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.foreground,
  },
  templateName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
  },
  templateList: {
    maxHeight: 300,
  },
  templateItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedItemText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.foreground,
    flex: 1,
  },
});
