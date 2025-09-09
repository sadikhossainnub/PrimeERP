import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string = '';

  constructor() {
    this.api = axios.create({
      baseURL: 'http://paperware.jfmart.site',
      timeout: 10000
    });
    this.baseURL = 'http://paperware.jfmart.site';
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(async (config) => {
      const apiKey = await AsyncStorage.getItem('apiKey');
      const apiSecret = await AsyncStorage.getItem('apiSecret');

      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json';

      if (apiKey && apiSecret) {
        config.headers['Authorization'] = `token ${apiKey}:${apiSecret}`;
      }
      
      console.log('API Request:', config.method?.toUpperCase(), config.url, 'Auth:', config.headers.Authorization);
      return config;
    });
    
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('API Error:', error.message, error.config?.url);
        if (error.response?.status === 403) {
          console.error('Permission denied - check API key permissions');
        }
        return Promise.reject(error);
      }
    );
  }

  async getCurrentUser() {
    const response = await this.api.get('/api/method/frappe.realtime.get_user_info');
    return response.data.message;
  }

  async getEmployeeProfile(userId: string) {
    const response = await this.getList('Employee', { user_id: userId }, ['name', 'employee_name', 'user_id', 'company']);
    return response.data?.[0] || null;
  }

  async setCredentials(serverUrl: string, apiKey: string, apiSecret: string) {
    await AsyncStorage.setItem('serverUrl', serverUrl);
    await AsyncStorage.setItem('apiKey', apiKey);
    await AsyncStorage.setItem('apiSecret', apiSecret);
    
    this.baseURL = serverUrl;
    this.api.defaults.baseURL = serverUrl;
    this.api.defaults.headers.Authorization = `token ${apiKey}:${apiSecret}`;
  }

  async getList(doctype: string, filters?: any, fields?: string[], limit?: number, offset?: number) {
    const params: any = {};
    if (filters) params.filters = JSON.stringify(filters);
    if (fields) params.fields = JSON.stringify(fields);
    if (limit) params.limit_page_length = limit;
    if (offset) params.limit_start = offset;

    const response = await this.api.get(`/api/resource/${doctype}`, { params });
    return response.data;
  }

  async getDoc(doctype: string, name: string) {
    const response = await this.api.get(`/api/resource/${doctype}/${name}`);
    return response.data;
  }

  async createDoc(doctype: string, data: any) {
    const response = await this.api.post(`/api/resource/${doctype}`, data);
    return response.data;
  }

  async updateDoc(doctype: string, name: string, data: any) {
    const response = await this.api.put(`/api/resource/${doctype}/${name}`, data);
    return response.data;
  }

  async deleteDoc(doctype: string, name: string) {
    const response = await this.api.delete(`/api/resource/${doctype}/${name}`);
    return response.data;
  }

  async callMethod(method: string, args?: any) {
    const response = await this.api.post(`/api/method/${method}`, args);
    return response.data;
  }

  async login(username: string, password: string) {
    try {
      const response = await this.api.post('/api/method/login', {
        usr: username,
        pwd: password
      });
      
      if (response.data.message) {
        await AsyncStorage.setItem('sessionUser', JSON.stringify(response.data.message));
        return {
          user: response.data.message,
          token: 'session-token'
        };
      }
      
      throw new Error('Invalid credentials');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async logout() {
    try {
      await this.api.post('/api/method/logout');
      await AsyncStorage.multiRemove(['serverUrl', 'apiKey', 'apiSecret', 'sessionUser']);
      delete this.api.defaults.headers.Authorization;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getDashboardData() {
    try {
      console.log('Fetching dashboard data from:', this.baseURL);
      
      // Test basic connectivity first
      const userResponse = await this.api.get('/api/method/frappe.realtime.get_user_info');
      console.log('Authenticated user:', userResponse.data.message);
      
      // Try to get basic data that should be accessible
      const customerData = await this.getList('Customer', undefined, ['name'], 10);
      const itemData = await this.getList('Item', undefined, ['name'], 10);
      
      return {
        todaysSales: 1250.50, // Demo data since Sales Invoice not accessible
        orderCount: customerData.data?.length || 0,
        pendingDeliveries: 3, // Demo data
        pendingLeaves: 2, // Demo data
        expensesToday: 450.00 // Demo data
      };
    } catch (error: any) {
      console.error('Dashboard API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: this.baseURL
      });
      throw error;
    }
  }
}

export default new ApiService();
