import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_KEY, API_SECRET } from '../config';

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
  getDashboardData(): Promise<any>;
  getCustomers(limit?: number, offset?: number, search?: string): Promise<any>;
  getCustomer(name: string): Promise<any>;
  createCustomer(customerData: any): Promise<any>;
  updateCustomer(name: string, customerData: any): Promise<any>;
  getSalesOrders(limit?: number, offset?: number, search?: string): Promise<any>;
}

class ApiService implements IApiService {
  private baseURL: string = API_URL;

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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      await AsyncStorage.removeItem('sid');
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout failed:', error);
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  }

  async getCurrentUser() {
    const sid = await AsyncStorage.getItem('sid');
    const response = await axios.get(`${this.baseURL}api/method/frappe.auth.get_logged_user`, {
      headers: { Cookie: sid }
    });
    return response.data.message;
  }

  async getDashboardData() {
    try {
      const sid = await AsyncStorage.getItem('sid');
      const headers = { Cookie: sid };
      
      const [salesOrders, quotations, customers] = await Promise.all([
        axios.get(`${this.baseURL}api/resource/Sales Order`, {
          params: { limit_page_length: 100 },
          headers
        }),
        axios.get(`${this.baseURL}api/resource/Quotation`, {
          params: { limit_page_length: 100 },
          headers
        }),
        axios.get(`${this.baseURL}api/resource/Customer`, {
          params: { limit_page_length: 10 },
          headers
        })
      ]);

      const totalSales = salesOrders.data.data?.reduce((sum: number, order: any) => 
        sum + (order.grand_total || 0), 0) || 0;
      
      const pendingOrders = salesOrders.data.data?.filter((order: any) => 
        order.status === 'Draft' || order.status === 'To Deliver').length || 0;

      return {
        todaysSales: totalSales,
        orderCount: salesOrders.data.data?.length || 0,
        pendingDeliveries: pendingOrders,
        pendingLeaves: 2,
        expensesToday: 450.00,
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

  async getCustomers(limit = 20, offset = 0, search = '') {
    const sid = await AsyncStorage.getItem('sid');
    const params: any = { limit_page_length: limit, limit_start: offset };
    if (search) {
      params.filters = JSON.stringify([['customer_name', 'like', `%${search}%`]]);
    }
    
    const response = await axios.get(`${this.baseURL}api/resource/Customer`, {
      params,
      headers: { Cookie: sid }
    });
    return response.data;
  }

  async getCustomer(name: string) {
    const sid = await AsyncStorage.getItem('sid');
    const response = await axios.get(`${this.baseURL}api/resource/Customer/${name}`, {
      headers: { Cookie: sid }
    });
    return response.data;
  }

  async createCustomer(customerData: any) {
    const sid = await AsyncStorage.getItem('sid');
    const response = await axios.post(`${this.baseURL}api/resource/Customer`, customerData, {
      headers: { Cookie: sid, 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async updateCustomer(name: string, customerData: any) {
    const sid = await AsyncStorage.getItem('sid');
    const response = await axios.put(`${this.baseURL}api/resource/Customer/${name}`, customerData, {
      headers: { Cookie: sid, 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async getSalesOrders(limit = 50, offset = 0, search = '') {
    const sid = await AsyncStorage.getItem('sid');
    const params: any = {
      limit_page_length: limit,
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
      headers: { Cookie: sid }
    });
    return response.data;
  }

  async getQuotations(limit = 50, offset = 0, search = '') {
    const sid = await AsyncStorage.getItem('sid');
    const params: any = { limit_page_length: limit, limit_start: offset };
    if (search) {
      params.filters = JSON.stringify([['party_name', 'like', `%${search}%`]]);
    }
    
    const response = await axios.get(`${this.baseURL}api/resource/Quotation`, {
      params,
      headers: { Cookie: sid }
    });
    return response.data;
  }
}

export default new ApiService();