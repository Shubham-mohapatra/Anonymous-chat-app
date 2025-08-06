import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import ConnectingScreen from './screens/ConnectingScreen';
import ChatScreen from './screens/ChatScreen';
// Try to import the full notification service, fallback to simple service if there are issues
let NotificationService;
try {
  NotificationService = require('./services/NotificationService').default;
} catch (error) {
  console.log('⚠️  Full notification service failed, using simple service:', error.message);
  NotificationService = require('./services/SimpleNotificationService').default;
}

const Stack = createStackNavigator();

const topics = [
  'Any',
  'Technology',
  'Music',
  'Movies & TV',
  'Gaming',
  'Sports',
  'Books',
  'Travel',
  'Food',
  'Memes',
  'Study/School',
  'Fitness',
  'Relationships',
  'Art',
  
];

export default function App() {
  const [appState, setAppState] = useState(AppState.currentState);
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    // Initialize notifications when app starts
    initializeNotifications();

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        // Clear notifications when app becomes active
        NotificationService.clearAllNotifications();
        NotificationService.setBadgeCount(0);
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      NotificationService.cleanup();
    };
  }, [appState]);

  const initializeNotifications = async () => {
    try {
      const token = await NotificationService.initialize();
      setPushToken(token);
      
      if (token) {
        console.log('📱 Push notifications enabled');
        
        // Set up notification callbacks
        NotificationService.onNewMessageNotification = (data) => {
          console.log('New message notification received:', data);
          // You can handle this in your app (e.g., update UI, play sound)
        };
        
        NotificationService.onMatchFoundNotification = (data) => {
          console.log('Match found notification received:', data);
          // You can handle this in your app (e.g., navigate to chat)
        };
      } else {
        console.log('⚠️  Push notifications not available');
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} topics={topics} pushToken={pushToken} />}
        </Stack.Screen>
        <Stack.Screen name="Connecting" component={ConnectingScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  subtitle: {
    color: '#A1A4B2',
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#246BFD',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: '#23262F',
    color: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#23262F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  topicPickerContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 8,
    backgroundColor: '#20222A',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    minHeight: 150, // more space for chips
  },
  topicLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicLabel: {
    color: '#A1A4B2',
    fontSize: 15,
    fontWeight: '600',
  },
  chipScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center', // center chips horizontally
    width: '100%',
    rowGap: 12, // if supported, for vertical spacing between rows
    columnGap: 12, // if supported, for horizontal spacing between chips
    // If rowGap/columnGap not supported, use margin on topicChip
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 14, // more space between chips
    marginBottom: 12, // more space between rows
    borderWidth: 1.5,
    borderColor: '#246BFD',
    shadowColor: '#246BFD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  topicChipSelected: {
    backgroundColor: '#246BFD',
    borderColor: '#246BFD',
    shadowOpacity: 0.18,
    elevation: 2,
  },
  topicChipText: {
    color: '#246BFD',
    fontSize: 15,
    fontWeight: '500',
  },
  connectingContainer: {
    flex: 1,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  connectingText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  connectingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#246BFD',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  connectingChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
});
