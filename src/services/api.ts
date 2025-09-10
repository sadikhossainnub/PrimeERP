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
  updateDoc(doctype: string, docname: string, data: any): Promise<any>;
  createDoc(doctype: string, data: any): Promise<any>;
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
      console.error('Logout failed:', error);
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
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  async getDashboardData() {
    try {
      const headers = await this.getAuthHeaders(false);
      
      const [salesOrders, quotations, customers] = await Promise.all([
        axios.get(`${this.baseURL}api/resource/Sales Order`, {
          params: { limit_page_length: 0 },
          headers
        }),
        axios.get(`${this.baseURL}api/resource/Quotation`, {
          params: { limit_page_length: 0 },
          headers
        }),
        axios.get(`${this.baseURL}api/resource/Customer`, {
          params: { limit_page_length: 0 },
          headers
        })
      ]);

      const totalSales = salesOrders.data.data?.reduce((sum: number, order: any) =>
        sum + (order.grand_total || 0), 0) || 0;
      
      const pendingOrders = salesOrders.data.data?.filter((order: any) =>
        order.status === 'pending').length || 0;

      const quotationCount = quotations.data.data?.length || 0;
      const draftQuotations = quotations.data.data?.filter((quote: any) => quote.status === 'Draft').length || 0;
      const approvedQuotations = quotationCount - draftQuotations;

      return {
        todaysSales: totalSales,
        orderCount: salesOrders.data.data?.length || 0,
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
        recentActivities: this.getRecentActivities(salesOrders.data.data, quotations.data.data)
      };
    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      throw error;
    }
  }

  private getRecentActivities(salesOrders: any[], quotations: any[]) {
    const activities: RecentActivity[] = [];
    
    salesOrders?.slice(0, 3).forEach(order => {
      activities.push({
        type: 'Sales Order',
        title: `${order.name} created`,
        subtitle: `Customer: ${order.customer}`,
        time: new Date(order.creation).toLocaleDateString(),
        icon: 'document-text',
        color: '#2196F3'
      });
    });
    
    quotations?.slice(0, 2).forEach(quote => {
      activities.push({
        type: 'Quotation',
        title: `${quote.name} created`,
        subtitle: `Customer: ${quote.party_name}`,
        time: new Date(quote.creation).toLocaleDateString(),
        icon: 'receipt',
        color: '#9C27B0'
      });
    });
    
    return activities.slice(0, 5);
  }

  async getCustomers(limit = 0, offset = 0, search = '') {
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
      params.filters = JSON.stringify([['customer_name', 'like', `%${search}%`]]);
    }
    
    const response = await axios.get(`${this.baseURL}api/resource/Customer`, {
      params,
      headers: await this.getAuthHeaders(false)
    });
    return response.data;
  }

  async getCustomer(name: string) {
    const response = await axios.get(`${this.baseURL}api/resource/Customer/${name}`, {
      headers: await this.getAuthHeaders(false)
    });
    return response.data;
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
    } catch (error) {
      return { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
    }
  }

  async createCustomer(customerData: any) {
    const response = await axios.post(`${this.baseURL}api/resource/Customer`, customerData, {
      headers: await this.getAuthHeaders()
    });
    return response.data;
  }

  async updateCustomer(name: string, customerData: any) {
    const response = await axios.put(`${this.baseURL}api/resource/Customer/${name}`, customerData, {
      headers: await this.getAuthHeaders()
    });
    return response.data;
  }

  async getSalesOrders(limit = 0, offset = 0, search = '') {
    const params: any = {
      limit_page_length: 0,
      limit_start: offset,
      fields: JSON.stringify([
        "name",
        "customer",
        "customer_name",
        "transaction_date",
        "delivery_date",
        "grand_total",
        "currency",
        "status"
      ])
    };
    if (search) {
      params.filters = JSON.stringify([['customer', 'like', `%${search}%`]]);
    }
    
    const response = await axios.get(`${this.baseURL}api/resource/Sales Order`, {
      params,
      headers: await this.getAuthHeaders(false)
    });
    return response.data;
  }

  async getQuotations(limit = 0, offset = 0, search = '') {
    const params: any = {
      limit_page_length: 0,
      limit_start: offset,
      fields: JSON.stringify([
        "name",
        "customer_name",
        "email",
        "transaction_date",
        "valid_till",
        "grand_total",
        "total_qty",
        "status"
      ])
    };
    if (search) {
      params.filters = JSON.stringify([['customer_name', 'like', `%${search}%`]]);
    }
    
    const response = await axios.get(`${this.baseURL}api/resource/Quotation`, {
      params,
      headers: await this.getAuthHeaders(false)
    });
    return response.data;
  }

  async getItems(limit = 0, offset = 0, search = '') {
    try {
      const params: any = {
        limit_page_length: 0,
        limit_start: offset
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
      console.error('Item Groups API error:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  async createDoc(doctype: string, data: any) {
    const response = await axios.post(`${this.baseURL}api/resource/${doctype}`, data, {
      headers: await this.getAuthHeaders()
    });
    return response.data;
  }

  async updateDoc(doctype: string, docname: string, data: any) {
    const response = await axios.put(`${this.baseURL}api/resource/${doctype}/${docname}`, data, {
      headers: await this.getAuthHeaders()
    });
    return response.data;
  }
}

export default new ApiService();