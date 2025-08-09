import { Platform, Alert } from 'react-native';

// Simple notification service that works without expo-notifications
class SimpleNotificationService {
  constructor() {
    this.isAvailable = false;
    this.expoPushToken = null;
    this.lastNotificationTime = 0;
    this.notificationQueue = [];
    this.isProcessing = false;
  }

  // Initialize (placeholder for compatibility)
  async initialize() {
    console.log('Simple notification service initialized');
    console.log('Using fallback notification system');
    this.isAvailable = true;
    
    // Start processing notifications immediately
    this.processNotificationQueue();
    
    return 'simple-service-token';
  }

  // Show simple alert instead of push notification
  async showChatNotification(senderName, message, roomId, type = 'new_message') {
    // Don't delay important notifications, process immediately
    this.sendLocalNotification(
      `Message from ${senderName}`,
      message,
      { roomId, type }
    );
    
    // Trigger callback for immediate UI updates
    if (type === 'new_message' && this.onNewMessageNotification) {
      this.onNewMessageNotification({ 
        senderName, 
        message, 
        roomId, 
        timestamp: Date.now() 
      });
    }
  }

  // Send local notification (fallback) - using Alert for immediate visibility
  async sendLocalNotification(title, body, data = {}) {
    console.log(`📱 Local notification: ${title} - ${body}`);
    
    // Use platform-specific notification approach for immediate display
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // For foreground notifications, use Alert
      if (data.forceAlert || global.appState === 'active') {
        Alert.alert(
          title,
          body,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      } else {
        // For background, we'd need a native module
        // This is where you'd integrate with native notifications
        console.log('Background notification would appear here');
        
        // If you have react-native-push-notification installed, use it here
        try {
          const PushNotification = require('react-native-push-notification');
          PushNotification.localNotification({
            channelId: "chat-messages",
            title: title,
            message: body,
            playSound: true,
            soundName: "default",
            importance: "high",
            priority: "high",
            userInfo: data
          });
        } catch (err) {
          console.log('Push notification module not available:', err.message);
        }
      }
    }
  }

  // Process notification queue to avoid blocking
  async processNotificationQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) return;
    
    this.isProcessing = true;
    const notification = this.notificationQueue.shift();
    
    try {
      await this.sendLocalNotification(
        notification.title,
        notification.body,
        notification.data
      );
    } catch (error) {
      console.error('Error showing notification:', error);
    }
    
    this.isProcessing = false;
    
    // Continue processing if there are more
    if (this.notificationQueue.length > 0) {
      this.processNotificationQueue();
    }
  }

  // Placeholder methods for compatibility
  setupNotificationListeners() {
    console.log('Notification listeners set up (simple mode)');
    
    // Set global app state tracker for notification decisions
    global.appState = 'active';
    
    try {
      const { AppState } = require('react-native');
      AppState.addEventListener('change', (nextAppState) => {
        global.appState = nextAppState;
      });
    } catch (err) {
      console.log('AppState not available');
    }
  }

  handleForegroundNotification(notification) {
    console.log('Foreground notification handled (simple mode)');
  }

  handleNotificationTap(response) {
    console.log('Notification tap handled (simple mode)');
  }

  onNewMessageNotification = (data) => {
    // Override this in your main component
  };

  onMatchFoundNotification = (data) => {
    // Override this in your main component
  };

  cleanup() {
    console.log('Notification service cleaned up (simple mode)');
    this.notificationQueue = [];
  }

  getPushToken() {
    return this.expoPushToken;
  }

  async clearAllNotifications() {
    console.log('Notifications cleared (simple mode)');
    this.notificationQueue = [];
  }

  async setBadgeCount(count) {
    console.log(`Badge count set to ${count} (simple mode)`);
  }
}

// Create singleton instance
const simpleNotificationService = new SimpleNotificationService();

export default simpleNotificationService;
