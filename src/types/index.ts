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

export interface DashboardData {
  todaysSales: number;
  orderCount: number;
  pendingDeliveries: number;
  pendingLeaves: number;
  expensesToday: number;
  recentActivities: {
    title: string;
    subtitle: string;
    time: string;
    icon: string;
    color: string;
  }[];
}