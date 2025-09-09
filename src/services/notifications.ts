import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import ApiService from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return null;
      }

      // Skip token generation in Expo Go
      console.log('Push notifications configured (token generation skipped in Expo Go)');
      return null;
    } catch (error) {
      console.log('Push notification setup failed:', error);
      return null;
    }
  }

  async saveTokenToERPNext(token: string | null) {
    if (!token) return;
    
    try {
      await ApiService.callMethod('frappe.core.doctype.user.user.save_push_token', {
        token: token,
        device_type: Platform.OS
      });
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }
}

export default new NotificationService();