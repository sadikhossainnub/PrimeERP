import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DocumentPreviewScreen({ route, navigation }: any) {
  const { document, docType } = route.params || {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount?.toLocaleString('en-BD') || '0'}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return '#FF9800';
      case 'sent': case 'submitted': return '#2196F3';
      case 'approved': case 'completed': return '#4CAF50';
      case 'rejected': case 'cancelled': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#666';
    }
  };

  const shareDocument = async () => {
    try {
      await Share.share({
        message: `${getDocumentTitle()} - ${document.name || document.title}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getDocumentTitle = () => {
    switch (docType) {
      case 'quotation': return 'Quotation';
      case 'sales_order': return 'Sales Order';
      case 'delivery_note': return 'Delivery Note';
      case 'leave_application': return 'Leave Application';
      case 'expense_claim': return 'Expense Claim';
      case 'payment_entry': return 'Payment Entry';
      default: return 'Document';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.docType}>{getDocumentTitle()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
          <Text style={styles.statusText}>{document.status || 'Draft'}</Text>
        </View>
      </View>
      <Text style={styles.docNumber}>{document.name || document.title}</Text>
    </View>
  );

  const renderQuotation = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.fieldValue}>{document.customer_name || document.customer}</Text>
        {document.email && <Text style={styles.fieldSubtext}>{document.email}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Quote Date:</Text>
          <Text style={styles.fieldValue}>{formatDate(document.transaction_date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Valid Until:</Text>
          <Text style={styles.fieldValue}>{formatDate(document.valid_till)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Total Amount:</Text>
          <Text style={styles.fieldValue}>{formatCurrency(document.grand_total)}</Text>
        </View>
      </View>

      {document.items && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({document.total_qty || document.items.length})</Text>
          {document.items.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.item_code}</Text>
              <Text style={styles.itemQty}>Qty: {item.qty}</Text>
              <Text style={styles.itemAmount}>{formatCurrency(item.amount || item.rate * item.qty)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderLeaveApplication = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Information</Text>
        <Text style={styles.fieldValue}>{document.employee}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leave Details</Text>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Leave Type:</Text>
          <Text style={styles.fieldValue}>{document.leave_type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>From Date:</Text>
          <Text style={styles.fieldValue}>{formatDate(document.from_date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>To Date:</Text>
          <Text style={styles.fieldValue}>{formatDate(document.to_date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Total Days:</Text>
          <Text style={styles.fieldValue}>{document.total_leave_days}</Text>
        </View>
      </View>

      {document.reason && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason</Text>
          <Text style={styles.fieldValue}>{document.reason}</Text>
        </View>
      )}
    </View>
  );

  const renderExpenseClaim = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Information</Text>
        <Text style={styles.fieldValue}>{document.title}</Text>
        <Text style={styles.fieldSubtext}>{document.employee}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Date:</Text>
          <Text style={styles.fieldValue}>{formatDate(document.posting_date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Amount:</Text>
          <Text style={styles.fieldValue}>{formatCurrency(document.total_claimed_amount)}</Text>
        </View>
      </View>

      {document.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.fieldValue}>{document.description}</Text>
        </View>
      )}
    </View>
  );

  const renderGenericDocument = () => (
    <View style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Details</Text>
        {Object.entries(document).map(([key, value]) => {
          if (key === 'name' || key === 'status' || !value) return null;
          return (
            <View key={key} style={styles.row}>
              <Text style={styles.fieldLabel}>{key.replace(/_/g, ' ').toUpperCase()}:</Text>
              <Text style={styles.fieldValue}>{String(value)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (docType) {
      case 'quotation':
      case 'sales_order':
      case 'delivery_note':
        return renderQuotation();
      case 'leave_application':
        return renderLeaveApplication();
      case 'expense_claim':
        return renderExpenseClaim();
      default:
        return renderGenericDocument();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <TouchableOpacity onPress={shareDocument}>
          <Ionicons name="share-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 40,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  docType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  docNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
  fieldSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 2,
  },
  itemQty: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
});