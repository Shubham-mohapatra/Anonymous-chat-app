import React, { useEffect, useState } from 'react';
import { AppState, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ConnectingScreen from './screens/ConnectingScreen';
import ChatScreen from './screens/ChatScreen';

// Import services
import SimpleNotificationService from './services/PushServices';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: Cannot update a component',
  'Non-serializable values were found in the navigation state',
]);

const Stack = createNativeStackNavigator();

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

  // Initialize services
  useEffect(() => {
    // Initialize notification service
    SimpleNotificationService.initialize();
    SimpleNotificationService.setupNotificationListeners();
    
    // Track app state for notifications
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
      global.appState = nextAppState;
    });
    
    return () => {
      subscription.remove();
      SimpleNotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} topics={topics} pushToken={pushToken} />}
          </Stack.Screen>
          <Stack.Screen name="Connecting" component={ConnectingScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
