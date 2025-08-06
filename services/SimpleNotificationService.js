import { Platform, Alert } from 'react-native';

// Simple notification service that works without expo-notifications
class SimpleNotificationService {
  constructor() {
    this.isAvailable = false;
    this.expoPushToken = null;
  }

  // Initialize (placeholder for compatibility)
  async initialize() {
    console.log(' Simple notification service initialized');
    console.log(' Using fallback notification system');
    this.isAvailable = true;
    return 'simple-service-token';
  }

  // Show simple alert instead of push notification
  async showChatNotification(senderName, message, roomId, type = 'new_message') {
    if (!this.isAvailable) return;

    const title = type === 'match_found' ? '🎯 Match Found!' : '💬 New Message';
    const body = type === 'match_found' 
      ? 'You\'ve been matched with someone!' 
      : `${senderName}: ${message.length > 50 ? message.substring(0, 47) + '...' : message}`;

    // Show alert only if app is in foreground
    console.log(`📱 Notification: ${title} - ${body}`);
    
    // You could also use a toast library here instead of Alert
    // Alert.alert(title, body);
  }

  // Send local notification (fallback)
  async sendLocalNotification(title, body, data = {}) {
    console.log(`📱 Local notification: ${title} - ${body}`);
  }

  // Placeholder methods for compatibility
  setupNotificationListeners() {
    console.log(' Notification listeners set up (simple mode)');
  }

  handleForegroundNotification(notification) {
    console.log(' Foreground notification handled (simple mode)');
  }

  handleNotificationTap(response) {
    console.log(' Notification tap handled (simple mode)');
  }

  onNewMessageNotification = (data) => {
    // Override this in your main component
  };

  onMatchFoundNotification = (data) => {
    // Override this in your main component
  };

  cleanup() {
    console.log(' Notification service cleaned up (simple mode)');
  }

  getPushToken() {
    return this.expoPushToken;
  }

  async clearAllNotifications() {
    console.log(' Notifications cleared (simple mode)');
  }

  async setBadgeCount(count) {
    console.log(` Badge count set to ${count} (simple mode)`);
  }
}

// Create singleton instance
const simpleNotificationService = new SimpleNotificationService();

export default simpleNotificationService;
