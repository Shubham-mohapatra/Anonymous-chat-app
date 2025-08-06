import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications should be handled when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }


  async initialize() {
    try {
     
      if (!Device.isDevice) {
        console.log('⚠️  Push notifications only work on physical devices');
        return null;
      }

      // Get existing notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;      }

      if (finalStatus !== 'granted') {
        console.log('⚠️  Push notification permissions denied');
        return null;
      }

      // Get push token for this device
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '12d6e976-2502-4535-b5ba-f8d46a78e544',
      });

      this.expoPushToken = token.data;
      console.log('✅ Push token obtained:', this.expoPushToken);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('chat-messages', {
          name: 'Chat Messages',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#246BFD',
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('chat-matches', {
          name: 'Chat Matches',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500],
          lightColor: '#00FF00',
          sound: 'default',
        });
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      return this.expoPushToken;

    } catch (error) {
      console.error('Notification initialization error:', error);
      return null;
    }
  }

  // Set up listeners for incoming notifications
  setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      // You can handle foreground notifications here
      this.handleForegroundNotification(notification);
    });

    // Listen for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationTap(response);
    });
  }

  // Handle notifications received while app is active
  handleForegroundNotification(notification) {
    const { title, body, data } = notification.request.content;
    
    // You can show custom in-app notification here
    console.log(`📱 Foreground notification: ${title} - ${body}`);
    
    if (data.type === 'new_message') {
      // Handle new message notification
      this.onNewMessageNotification(data);
    } else if (data.type === 'match_found') {
      // Handle match found notification
      this.onMatchFoundNotification(data);
    }
  }

  // Handle notification tap (opens app)
  handleNotificationTap(response) {
    const { data } = response.notification.request.content;
    
    if (data.type === 'new_message') {
      // Navigate to chat screen
      // You'll need to implement navigation here
      console.log('Navigate to chat:', data.roomId);
    } else if (data.type === 'match_found') {
      // Navigate to connecting screen or chat
      console.log('Navigate to new match:', data.roomId);
    }
  }

  // Callback functions (implement in your components)
  onNewMessageNotification = (data) => {
    // Override this in your main component
  };

  onMatchFoundNotification = (data) => {
    // Override this in your main component
  };

  // Send local notification (when app is active)
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Local notification error:', error);
    }
  }

  // Show notification with custom styling
  async showChatNotification(senderName, message, roomId, type = 'new_message') {
    const notificationContent = {
      title: type === 'match_found' ? '🎯 Match Found!' : '💬 New Message',
      body: type === 'match_found' 
        ? 'You\'ve been matched with someone! Start chatting now.' 
        : `${senderName}: ${message.length > 50 ? message.substring(0, 47) + '...' : message}`,
      data: {
        type,
        roomId,
        timestamp: Date.now(),
      },
      sound: 'default',
      badge: 1,
    };

    // Add channel for Android
    if (Platform.OS === 'android') {
      notificationContent.channelId = type === 'match_found' ? 'chat-matches' : 'chat-messages';
    }

    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null,
    });
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get push token for sending to backend
  getPushToken() {
    return this.expoPushToken;
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Set notification badge count
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
