export interface Customer {
  name: string;
  customer_name: string;
  email_id?: string;
  mobile_no?: string;
  customer_group?: string;
  territory?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  division?: string;
  district?: string;
  thana?: string;
  account_manager?: string;
  image?: string;
}

export interface Item {
  name: string;
  item_code: string;
  item_name: string;
  standard_rate?: number;
  stock_qty?: number;
  item_group?: string;
  description?: string;
  uom?: string;
}

export interface Quotation {
  name?: string;
  customer: string;
  transaction_date: string;
  valid_till: string;
  items: QuotationItem[];
  total?: number;
  grand_total?: number;
  status?: string;
  sales_order?: string;
  workflow_state?: string;
}

export interface QuotationItem {
  item_code: string;
  qty: number;
  rate: number;
  amount?: number;
}

export interface SalesOrder {
  name?: string;
  customer: string;
  transaction_date: string;
  delivery_date: string;
  items: SalesOrderItem[];
  total?: number;
  grand_total?: number;
  status?: string;
  quotation?: string;
  delivery_note?: string;
  workflow_state?: string;
}

export interface SalesOrderItem {
  item_code: string;
  qty: number;
  rate: number;
  amount?: number;
}

export interface DeliveryNote {
  name?: string;
  customer: string;
  posting_date: string;
  items: DeliveryNoteItem[];
  status?: string;
  sales_order?: string;
  workflow_state?: string;
}

export interface DeliveryNoteItem {
  item_code: string;
  qty: number;
  against_sales_order?: string;
}

export interface LeaveApplication {
  name?: string;
  employee: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days?: number;
  reason?: string;
  status?: string;
}

export interface ExpenseClaim {
  name?: string;
  title: string;
  employee: string;
  posting_date: string;
  total_claimed_amount: number;
  description?: string;
  status?: string;
}

export interface PaymentEntry {
  name?: string;
  naming_series?: string;
  payment_type: string;
  company: string;
  cost_center?: string;
  mode_of_payment?: string;
  party_type?: string;
  party?: string;
  party_name?: string;
  contact_person?: string;
  contact_email?: string;
  paid_from: string;
  paid_to: string;
  paid_amount: number;
  received_amount: number;
  source_exchange_rate?: number;
  target_exchange_rate?: number;
  reference_no?: string;
  reference_date?: string;
  posting_date: string;
  remarks?: string;
  status?: string;
}

export interface DashboardData {
  todaysSales: number;
  orderCount: number;
  pendingDeliveries: number;
  pendingLeaves: number;
  expensesToday: number;
  yearlyTarget: number;
  totalYearlySales: number;
  monthlyTarget: number;
  totalMonthlySales: number;
  quotationCount: number;
  draftQuotations: number;
  approvedQuotations: number;
  expiringQuotations: number;
  pendingOrders: number;
  recentActivities: {
    title: string;
    subtitle: string;
    time: string;
    icon: string;
    color: string;
  }[];
}
