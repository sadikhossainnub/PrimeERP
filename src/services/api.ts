import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_KEY, API_SECRET } from '../config';

// Configure axios defaults
axios.defaults.timeout = 30000;

interface RecentActivity {
  type: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  color: string;
}

interface IApiService {
  login(username: string, password: string): Promise<{ success: boolean; user: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<any>;
  getDashboardData(): Promise<{
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
    recentActivities: RecentActivity[];
  }>;
  getCustomers(limit?: number, offset?: number, search?: string): Promise<any>;
  getCustomer(name: string): Promise<any>;
  createCustomer(customerData: any): Promise<any>;
  updateCustomer(name: string, customerData: any): Promise<any>;
  getSalesOrders(limit?: number, offset?: number, search?: string): Promise<any>;
  getQuotations(limit?: number, offset?: number, search?: string): Promise<any>;
  getItems(limit?: number, offset?: number, search?: string): Promise<any>;
  getPaymentEntries(limit?: number, offset?: number, search?: string): Promise<any>;
  getDeliveryNotes(limit?: number, offset?: number, search?: string): Promise<any>;
  updateDoc(doctype: string, docname: string, data: any): Promise<any>;
  createDoc(doctype: string, data: any): Promise<any>;
  getTerritories(): Promise<any>;
  getDivisions(): Promise<any>;
  getDistricts(): Promise<any>;
  getThanas(): Promise<any>;
  getCustomerGroups(): Promise<any>;
  getAccountManagers(): Promise<any>;
  getUOMs(): Promise<any>;
  getItemFields(): Promise<any>;
  getItemStock(): Promise<any>;
  getAttendance(employee?: string): Promise<any>;
  getTasks(assignedTo?: string): Promise<any>;
  checkIn(employee: string, location?: { latitude: number; longitude: number }, deviceId?: string): Promise<any>;
  checkOut(employee: string, location?: { latitude: number; longitude: number }, deviceId?: string): Promise<any>;
}

class ApiService implements IApiService {
  private baseURL: string = API_URL;

  private async getAuthHeaders(includeContentType = true) {
    const sid = await AsyncStorage.getItem('sid');
    const headers: any = {
      'Cookie': sid,
      'Authorization': `token ${API_KEY}:${API_SECRET}`,
    };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  async login(username: string, password: string) {
    try {
      const loginData = { usr: username, pwd: password };

      const response = await axios.post(`${this.baseURL}api/method/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.data.message === 'Logged In') {
        const sidCookie = response.headers['set-cookie']?.[0];
        if (sidCookie) {
          await AsyncStorage.setItem('sid', sidCookie);
        }
        return { success: true, user: username };
      }

      throw new Error('Login failed');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error during login:', error.message);
        throw new Error('Network Error: Could not connect to the server. Please check your internet connection.');
      }
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async logout() {
    try {
      console.log('Attempting logout...');
      await axios.post(`${this.baseURL}api/method/logout`, {}, {
        headers: await this.getAuthHeaders(),
      });
      await AsyncStorage.removeItem('sid');
      console.log('Logout successful');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error during logout:', error.message);
        throw new Error('Network Error: Could not connect to the server. Please check your internet connection.');
      }
      console.error('Logout failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  async getCurrentUser() {
    try {
      const userResponse = await axios.get(`${this.baseURL}api/method/frappe.auth.get_logged_user`, {
        headers: await this.getAuthHeaders(false)
      });
      
      const username = userResponse.data.message;
      
      // Fetch full user profile
      const profileResponse = await axios.get(`${this.baseURL}api/resource/User/${username}`, {
        headers: await this.getAuthHeaders(false)
      });
      
      const userData = profileResponse.data.data;
      return {
        email: userData.email || username,
        name: userData.full_name || userData.first_name || username,
        username: username,
        user_image: userData.user_image ? `${this.baseURL}${userData.user_image}` : null
      };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching user data:', error.message);
        throw new Error('Network Error: Could not connect to the server to fetch user data. Please check your internet connection.');
      }
      console.error('Failed to fetch user data:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async getDashboardData() {
    try {
      const headers = await this.getAuthHeaders(false);
      const user = await this.getCurrentUser();
      
      const [salesOrders, quotations, customers] = await Promise.all([
        axios.get(`${this.baseURL}api/resource/Sales Order`, {
          params: { 
            limit_page_length: 50,
            fields: JSON.stringify(['name', 'customer', 'customer_name', 'grand_total', 'status', 'creation', 'owner']),
            filters: JSON.stringify([['owner', '=', user.email]])
          },
          headers
        }),
        axios.get(`${this.baseURL}api/resource/Quotation`, {
          params: { 
            limit_page_length: 50,
            fields: JSON.stringify(['name', 'party_name', 'customer_name', 'grand_total', 'status', 'creation', 'valid_till', 'owner']),
            filters: JSON.stringify([['owner', '=', user.email]])
          },
          headers
        }),
        axios.get(`${this.baseURL}api/resource/Customer`, {
          params: { limit_page_length: 0 },
          headers
        })
      ]);

      const salesOrdersData = salesOrders.data?.data || [];
      const quotationsData = quotations.data?.data || [];
      
      const totalSales = salesOrdersData.reduce((sum: number, order: any) =>
        sum + (order.grand_total || 0), 0);
      
      const pendingOrders = salesOrdersData.filter((order: any) =>
        order.status === 'pending' || order.status === 'Pending').length;

      const quotationCount = quotationsData.length;
      const draftQuotations = quotationsData.filter((quote: any) => quote.status === 'Draft').length;
      const approvedQuotations = quotationCount - draftQuotations;

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const expiringQuotations = quotationsData.filter((quote: any) => {
        if (!quote.valid_till) return false;
        const validTill = new Date(quote.valid_till);
        return validTill <= nextWeek && validTill >= today;
      }).length;
      
      const pendingOrdersCount = salesOrdersData.filter((order: any) => 
        order.status === 'Draft' || order.status === 'To Deliver and Bill'
      ).length;

      return {
        todaysSales: totalSales,
        orderCount: salesOrdersData.length,
        pendingDeliveries: pendingOrders,
        pendingLeaves: 2,
        expensesToday: 450.00,
        yearlyTarget: 5000000,
        totalYearlySales: totalSales,
        monthlyTarget: 500000,
        totalMonthlySales: totalSales,
        quotationCount,
        draftQuotations,
        approvedQuotations,
        expiringQuotations,
        pendingOrders: pendingOrdersCount,
        recentActivities: this.getRecentActivities(salesOrdersData, quotationsData)
      };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching dashboard data:', error.message);
        throw new Error('Network Error: Could not connect to the server to fetch dashboard data. Please check your internet connection.');
      }
      console.error('Dashboard data fetch error:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  private getRecentActivities(salesOrders: any[], quotations: any[]): RecentActivity[] {
    const activities: RecentActivity[] = [];
    
    // Add recent sales orders
    if (salesOrders && Array.isArray(salesOrders)) {
      salesOrders.slice(0, 3).forEach(order => {
        if (order && order.name) {
          activities.push({
            type: 'Sales Order',
            title: `${order.name} created`,
            subtitle: `Customer: ${order.customer || order.customer_name || 'Unknown'}`,
            time: order.creation ? new Date(order.creation).toLocaleDateString() : 'Recently',
            icon: 'document-text',
            color: '#2196F3'
          });
        }
      });
    }
    
    // Add recent quotations
    if (quotations && Array.isArray(quotations)) {
      quotations.slice(0, 2).forEach(quote => {
        if (quote && quote.name) {
          activities.push({
            type: 'Quotation',
            title: `${quote.name} created`,
            subtitle: `Customer: ${quote.party_name || quote.customer_name || 'Unknown'}`,
            time: quote.creation ? new Date(quote.creation).toLocaleDateString() : 'Recently',
            icon: 'receipt',
            color: '#9C27B0'
          });
        }
      });
    }
    
    // If no activities found, add some default ones
    if (activities.length === 0) {
      activities.push(
        {
          type: 'System',
          title: 'Welcome to PrimeERP',
          subtitle: 'Start creating orders and quotations',
          time: 'Today',
          icon: 'checkmark-circle',
          color: '#4CAF50'
        },
        {
          type: 'System',
          title: 'Dashboard loaded',
          subtitle: 'All systems operational',
          time: 'Now',
          icon: 'information-circle',
          color: '#2196F3'
        }
      );
    }
    
    return activities.slice(0, 5);
  }

  async getCustomers(limit = 0, offset = 0, search = '') {
    try {
      const params: any = {
        limit_page_length: 0,
        limit_start: offset,
        fields: JSON.stringify([
          "name",
          "customer_name",
          "email_id",
          "mobile_no",
          "customer_primary_address",
          "disabled",
          "creation",
          "image"
        ])
      };
      if (search) {
        params.filters = JSON.stringify([['customer_name', 'like', '%' + search + '%']]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Customer`, {
        params,
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching customers:', error.message);
        throw new Error('Network Error: Could not connect to the server to fetch customers. Please check your internet connection.');
      }
      console.error('Customers API error:', error.response?.data?.message || error.message);
      throw error;
      throw error;
    }
  }

  async getCustomer(name: string) {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Customer/${name}`, {
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching customer:', error.message);
        throw new Error('Network Error: Could not connect to the server to fetch customer details. Please check your internet connection.');
      }
      console.error('Customer API error:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async getCustomerStats(customerName: string) {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Sales Order`, {
        params: {
          filters: JSON.stringify([['customer', '=', customerName]]),
          fields: JSON.stringify(['grand_total', 'transaction_date'])
        },
        headers: await this.getAuthHeaders(false)
      });
      
      const orders = response.data.data || [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.grand_total || 0), 0);
      const lastOrderDate = orders.length > 0 ? 
        orders.sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())[0].transaction_date :
        null;
      
      return { totalOrders, totalSpent, lastOrderDate };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching customer stats:', error.message);
        return { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      }
      console.error('Customer Stats API error:', error.response?.data?.message || error.message);
      return { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
    }
  }

  async createCustomer(customerData: any) {
    try {
      const response = await axios.post(`${this.baseURL}api/resource/Customer`, customerData, {
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error creating customer:', error.message);
        throw new Error('Network Error: Could not connect to the server to create customer. Please check your internet connection.');
      }
      console.error('Create Customer API error:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async updateCustomer(name: string, customerData: any) {
    try {
      const response = await axios.put(`${this.baseURL}api/resource/Customer/${name}`, customerData, {
        headers: await this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error updating customer:', error.message);
        throw new Error('Network Error: Could not connect to the server to update customer. Please check your internet connection.');
      }
      console.error('Update Customer API error:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async getSalesOrders(limit = 0, offset = 0, search = '') {
    try {
      const user = await this.getCurrentUser();
      const params: any = {
        limit_page_length: limit || 50,
        limit_start: offset,
        fields: JSON.stringify([
          "name",
          "customer",
          "customer_name",
          "transaction_date",
          "delivery_date",
          "grand_total",
          "currency",
          "status",
          "owner"
        ])
      };
      const filters = [['owner', '=', user.email]];
      if (search) {
        filters.push(['customer', 'like', `%${search}%`]);
      }
      params.filters = JSON.stringify(filters);
      
      const response = await axios.get(`${this.baseURL}api/resource/Sales Order`, {
        params,
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching sales orders:', error.message);
        return { data: [] };
      }
      console.error('Sales Orders API error:', error.response?.status, error.response?.data);
      return { data: [] };
    }
  }

  async getQuotations(limit = 0, offset = 0, search = '') {
    try {
      const user = await this.getCurrentUser();
      const params: any = {
        limit_page_length: limit || 50,
        limit_start: offset,
        fields: JSON.stringify([
          "name",
          "party_name",
          "customer_name",
          "transaction_date",
          "valid_till",
          "grand_total",
          "total_qty",
          "status",
          "owner"
        ])
      };
      const filters = [['owner', '=', user.email]];
      if (search) {
        filters.push(['customer_name', 'like', `%${search}%`]);
      }
      params.filters = JSON.stringify(filters);
      
      const response = await axios.get(`${this.baseURL}api/resource/Quotation`, {
        params,
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching quotations:', error.message);
        return { data: [] };
      }
      console.error('Quotations API error:', error.response?.status, error.response?.data);
      return { data: [] };
    }
  }

  async getItems(limit = 0, offset = 0, search = '') {
    try {
      const params: any = {
        limit_page_length: 0,
        limit_start: offset,
        fields: JSON.stringify([
          'name',
          'item_code',
          'item_name',
          'description',
          'item_group',
          'standard_rate',
          'valuation_rate',
          'stock_uom',
          'disabled',
          'creation',
          'is_stock_item',
          'image',
          'brand',
          'item_type',
          'weight_per_unit',
          'weight_uom',
          'country_of_origin'
        ])
      };
      if (search) {
        params.filters = JSON.stringify([['item_name', 'like', `%${search}%`]]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Item`, {
        params,
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching items:', error.message);
        throw new Error('Network Error: Could not connect to the server to fetch items. Please check your internet connection.');
      }
      console.error('Items API error:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  async getItemGroups(limit = 0, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Item Group`, {
        params: {
          limit_page_length: 0,
          limit_start: offset
        },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching item groups:', error.message);
        throw new Error('Network Error: Could not connect to the server to fetch item groups. Please check your internet connection.');
      }
      console.error('Item Groups API error:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  async getTerritories() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Territory`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching territories:', error.message);
        return { data: [] };
      }
      console.error('Territories API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getDivisions() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Division`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching divisions:', error.message);
        return { data: [] };
      }
      console.error('Divisions API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getDistricts() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/District`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching districts:', error.message);
        return { data: [] };
      }
      console.error('Districts API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getThanas() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Thana`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching thanas:', error.message);
        return { data: [] };
      }
      console.error('Thanas API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async createDoc(doctype: string, data: any) {
    try {
      const response = await axios.post(`${this.baseURL}api/resource/${doctype}`, data, {
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error(`Network Error creating ${doctype}:`, error.message);
        throw new Error(`Network Error: Could not connect to the server to create ${doctype}. Please check your internet connection.`);
      }
      console.error(`Create ${doctype} API error:`, error.response?.status, error.response?.data);
      throw error;
    }
  }

  async updateDoc(doctype: string, name: string, data: any) {
    try {
      const response = await axios.put(`${this.baseURL}api/resource/${doctype}/${name}`, data, {
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error(`Network Error updating ${doctype}:`, error.message);
        throw new Error(`Network Error: Could not connect to the server to update ${doctype}. Please check your internet connection.`);
      }
      console.error(`Update ${doctype} API error:`, error.response?.status, error.response?.data);
      throw error;
    }
  }

  async getPaymentEntries(limit = 0, offset = 0, search = '') {
    try {
      const params: any = {
        limit_page_length: limit,
        limit_start: offset,
        fields: JSON.stringify([
          "name",
          "posting_date",
          "party_type",
          "party",
          "paid_amount",
          "mode_of_payment",
          "status"
        ])
      };
      if (search) {
        params.filters = JSON.stringify([['party', 'like', `%${search}%`]]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Payment Entry`, {
        params,
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching payment entries:', error.message);
        return { data: [] };
      }
      console.error('Payment Entries API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getDeliveryNotes(limit = 0, offset = 0, search = '') {
    try {
      const params: any = {
        limit_page_length: limit,
        limit_start: offset,
        fields: JSON.stringify([
          "name",
          "posting_date",
          "customer",
          "customer_name",
          "grand_total",
          "status",
          "workflow_state",
          "sales_order"
        ])
      };
      if (search) {
        params.filters = JSON.stringify([['customer', 'like', `%${search}%`]]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Delivery Note`, {
        params,
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching delivery notes:', error.message);
        return { data: [] };
      }
      console.error('Delivery Notes API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getCustomerGroups() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Customer Group`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching customer groups:', error.message);
        return { data: [] };
      }
      console.error('Customer Groups API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getAccountManagers() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/User`, {
        params: { 
          limit_page_length: 0,
          fields: JSON.stringify(["name", "full_name"]),
          filters: JSON.stringify([["role_profile_name", "=", "Account Manager"]])
        },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching account managers:', error.message);
        return { data: [] };
      }
      console.error('Account Managers API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getUOMs() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/UOM`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching UOMs:', error.message);
        return { data: [] };
      }
      console.error('UOMs API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getBrands() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Brand`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching brands:', error.message);
        return { data: [] };
      }
      console.error('Brands API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getCountries() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Country`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching countries:', error.message);
        return { data: [] };
      }
      console.error('Countries API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getSubBrands() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Sub Brand`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching sub brands:', error.message);
        return { data: [] };
      }
      console.error('Sub Brands API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getSizeOptions(doctype: string) {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/${doctype}`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error(`Network Error fetching ${doctype}:`, error.message);
        return { data: [] };
      }
      console.error(`${doctype} API error:`, error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getItemFields() {
    try {
      const response = await axios.get(`${this.baseURL}api/method/frappe.desk.form.meta.get_meta`, {
        params: { doctype: 'Item' },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching item fields:', error.message);
        return { message: { fields: [] } };
      }
      console.error('Item Fields API error:', error.response?.data?.message || error.message);
      return { message: { fields: [] } };
    }
  }

  async getItemStock() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Bin`, {
        params: {
          fields: JSON.stringify(['item_code', 'warehouse', 'actual_qty']),
          limit_page_length: 0
        },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching item stock:', error.message);
        return { data: [] };
      }
      console.error('Item Stock API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getSalesTaxesAndChargesTemplates() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Sales Taxes and Charges Template`, {
        params: { 
          limit_page_length: 0,
          fields: JSON.stringify(['name', 'title', 'taxes'])
        },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching sales taxes templates:', error.message);
        return { data: [] };
      }
      console.error('Sales Taxes Templates API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getTaxCategories() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Tax Category`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching tax categories:', error.message);
        return { data: [] };
      }
      console.error('Tax Categories API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getShippingRules() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Shipping Rule`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching shipping rules:', error.message);
        return { data: [] };
      }
      console.error('Shipping Rules API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getCouponCodes() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Coupon Code`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching coupon codes:', error.message);
        return { data: [] };
      }
      console.error('Coupon Codes API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getSalesPartners() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Sales Partner`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching sales partners:', error.message);
        return { data: [] };
      }
      console.error('Sales Partners API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getAttendance(employee?: string) {
    try {
      // First get current user to find employee record
      const user = await this.getCurrentUser();
      
      // Try to get employee record for current user
      let employeeId = employee;
      if (!employeeId) {
        try {
          const empResponse = await axios.get(`${this.baseURL}api/resource/Employee`, {
            params: {
              filters: JSON.stringify([['user_id', '=', user.email]]),
              fields: JSON.stringify(['name'])
            },
            headers: await this.getAuthHeaders(false)
          });
          if (empResponse.data.data && empResponse.data.data.length > 0) {
            employeeId = empResponse.data.data[0].name;
          }
        } catch (empError: any) {
          console.log('Employee record not found, using user email:', empError.message);
          employeeId = user.email;
        }
      }
      
      const params: any = {
        limit_page_length: 50,
        fields: JSON.stringify(['name', 'employee', 'attendance_date', 'status', 'in_time', 'out_time'])
      };
      
      if (employeeId) {
        params.filters = JSON.stringify([['employee', '=', employeeId]]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Attendance`, {
        params,
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching attendance:', error.message);
        return { data: [] };
      }
      console.error('Attendance API error:', error.response?.status, error.response?.data);
      // Return empty data instead of throwing to prevent app crash
      return { data: [] };
    }
  }

  async getTasks(assignedTo?: string) {
    try {
      const params: any = {
        limit_page_length: 0,
        fields: JSON.stringify(['name', 'subject', 'description', 'status', 'priority', 'exp_end_date', 'assigned_by', 'assigned_to'])
      };
      if (assignedTo) {
        params.filters = JSON.stringify([['assigned_to', '=', assignedTo]]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Task`, {
        params,
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching tasks:', error.message);
        return { data: [] };
      }
      console.error('Tasks API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async checkIn(employee: string, location?: { latitude: number; longitude: number }, deviceId?: string) {
    try {
      // Get current user and find employee record
      const user = await this.getCurrentUser();
      let employeeId = employee;
      
      try {
        const empResponse = await axios.get(`${this.baseURL}api/resource/Employee`, {
          params: {
            filters: JSON.stringify([['user_id', '=', user.email]]),
            fields: JSON.stringify(['name'])
          },
          headers: await this.getAuthHeaders(false)
        });
        if (empResponse.data.data && empResponse.data.data.length > 0) {
          employeeId = empResponse.data.data[0].name;
        }
      } catch (empError: any) {
        console.log('Using user email as employee ID:', empError.message);
        employeeId = user.email;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      const data: any = {
        employee: employeeId,
        attendance_date: today,
        status: 'Present',
        in_time: currentTime
      };
      
      if (location) {
        data.custom_latitude = location.latitude;
        data.custom_longitude = location.longitude;
      }
      
      if (deviceId) {
        data.custom_device_id = deviceId;
      }
      
      console.log('Check-in data:', data);
      const response = await axios.post(`${this.baseURL}api/resource/Attendance`, data, {
        headers: await this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error during check-in:', error.message);
        throw new Error('Network Error: Could not connect to the server to check in. Please check your internet connection.');
      }
      console.error('Check-in API error:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to check in. Please ensure you have proper permissions.');
    }
  }

  async checkOut(employee: string, location?: { latitude: number; longitude: number }, deviceId?: string) {
    try {
      // Get current user and find employee record
      const user = await this.getCurrentUser();
      let employeeId = employee;
      
      try {
        const empResponse = await axios.get(`${this.baseURL}api/resource/Employee`, {
          params: {
            filters: JSON.stringify([['user_id', '=', user.email]]),
            fields: JSON.stringify(['name'])
          },
          headers: await this.getAuthHeaders(false)
        });
        if (empResponse.data.data && empResponse.data.data.length > 0) {
          employeeId = empResponse.data.data[0].name;
        }
      } catch (empError: any) {
        console.log('Using user email as employee ID:', empError.message);
        employeeId = user.email;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      // Find today's attendance record
      const attendanceResponse = await axios.get(`${this.baseURL}api/resource/Attendance`, {
        params: {
          filters: JSON.stringify([['employee', '=', employeeId], ['attendance_date', '=', today]])
        },
        headers: await this.getAuthHeaders(false)
      });
      
      const attendanceRecords = attendanceResponse.data.data;
      if (attendanceRecords && attendanceRecords.length > 0) {
        const attendanceRecord = attendanceRecords[0];
        
        const updateData: any = {
          out_time: currentTime
        };
        
        if (location) {
          updateData.custom_checkout_latitude = location.latitude;
          updateData.custom_checkout_longitude = location.longitude;
        }
        
        console.log('Check-out data:', updateData);
        const response = await axios.put(`${this.baseURL}api/resource/Attendance/${attendanceRecord.name}`, updateData, {
          headers: await this.getAuthHeaders()
        });
        return response.data;
      } else {
        throw new Error('No check-in record found for today');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error during check-out:', error.message);
        throw new Error('Network Error: Could not connect to the server to check out. Please check your internet connection.');
      }
      console.error('Check-out API error:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to check out. Please ensure you have proper permissions.');
    }
  }

  // Workflow methods
  async convertQuotationToSalesOrder(quotationName: string) {
    try {
      const response = await axios.post(`${this.baseURL}api/method/erpnext.selling.doctype.quotation.quotation.make_sales_order`, {
        source_name: quotationName
      }, {
        headers: await this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error converting quotation to sales order:', error.message);
        throw new Error('Network Error: Could not connect to the server to convert quotation to sales order. Please check your internet connection.');
      }
      console.error('Convert quotation to sales order error:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to convert quotation to sales order');
    }
  }

  async convertSalesOrderToDeliveryNote(salesOrderName: string) {
    try {
      const response = await axios.post(`${this.baseURL}api/method/erpnext.selling.doctype.sales_order.sales_order.make_delivery_note`, {
        source_name: salesOrderName
      }, {
        headers: await this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error converting sales order to delivery note:', error.message);
        throw new Error('Network Error: Could not connect to the server to convert sales order to delivery note. Please check your internet connection.');
      }
      console.error('Convert sales order to delivery note error:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to convert sales order to delivery note');
    }
  }

  async getDocument(doctype: string, name: string) {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/${doctype}/${name}`, {
        headers: await this.getAuthHeaders(false)
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error(`Network Error fetching ${doctype}:`, error.message);
        throw new Error(`Network Error: Could not connect to the server to fetch ${doctype}. Please check your internet connection.`);
      }
      console.error(`Get ${doctype} error:`, error.response?.status, error.response?.data);
      throw error;
    }
  }

  async getCompanies() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Company`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching companies:', error.message);
        return { data: [] };
      }
      console.error('Companies API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getPriceLists() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Price List`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching price lists:', error.message);
        return { data: [] };
      }
      console.error('Price Lists API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getCurrencies() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Currency`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching currencies:', error.message);
        return { data: [] };
      }
      console.error('Currencies API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getWarehouses() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Warehouse`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching warehouses:', error.message);
        return { data: [] };
      }
      console.error('Warehouses API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getProjects() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Project`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching projects:', error.message);
        return { data: [] };
      }
      console.error('Projects API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getLeadSources() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Lead Source`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching lead sources:', error.message);
        return { data: [] };
      }
      console.error('Lead Sources API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getCampaigns() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Campaign`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching campaigns:', error.message);
        return { data: [] };
      }
      console.error('Campaigns API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getPaymentTermsTemplates() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Payment Terms Template`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching payment terms templates:', error.message);
        return { data: [] };
      }
      console.error('Payment Terms Templates API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getTermsAndConditions() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Terms and Conditions`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching terms and conditions:', error.message);
        return { data: [] };
      }
      console.error('Terms and Conditions API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getSuppliers(limit = 0, offset = 0, search = '') {
    try {
      const params: any = {
        limit_page_length: limit,
        limit_start: offset,
        fields: JSON.stringify([
          "name",
          "supplier_name",
          "email_id",
          "mobile_no",
          "supplier_group",
          "creation"
        ])
      };
      if (search) {
        params.filters = JSON.stringify([['supplier_name', 'like', '%' + search + '%']]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Supplier`, {
        params,
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching suppliers:', error.message);
        return { data: [] };
      }
      console.error('Suppliers API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getAccounts(limit = 0, offset = 0, search = '') {
    try {
      const params: any = {
        limit_page_length: limit,
        limit_start: offset,
        fields: JSON.stringify([
          "name",
          "account_name",
          "account_type",
          "account_currency",
          "is_group",
          "disabled"
        ])
      };
      if (search) {
        params.filters = JSON.stringify([['account_name', 'like', '%' + search + '%']]);
      }
      
      const response = await axios.get(`${this.baseURL}api/resource/Account`, {
        params,
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching accounts:', error.message);
        return { data: [] };
      }
      console.error('Accounts API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getModesOfPayment() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Mode of Payment`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching modes of payment:', error.message);
        return { data: [] };
      }
      console.error('Modes of Payment API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

  async getCostCenters() {
    try {
      const response = await axios.get(`${this.baseURL}api/resource/Cost Center`, {
        params: { limit_page_length: 0 },
        headers: {
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.error('Network Error fetching cost centers:', error.message);
        return { data: [] };
      }
      console.error('Cost Centers API error:', error.response?.data?.message || error.message);
      return { data: [] };
    }
  }

}

export default new ApiService();
