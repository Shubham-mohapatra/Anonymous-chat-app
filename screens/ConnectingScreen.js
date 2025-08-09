import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import socket from './socket';
// Try to import the full notification service, fallback to simple service if there are issues
let NotificationService;
try {
  NotificationService = require('../services/NotificationService').default;
} catch (error) {
  console.log('⚠️  Using simple notification service in ConnectingScreen');
  NotificationService = require('../services/PushServices').default;
}

const ConnectingScreen = ({ navigation, route }) => {
  const { topics } = route.params || {};

  useEffect(() => {
    // Emit join_queue when screen mounts
    socket.emit('join_queue', { topics });

    // Listen for matched event
    socket.on('matched', ({ roomId }) => {
      // Show notification if app is in background
      if (AppState.currentState !== 'active') {
        NotificationService.showChatNotification(
          '',
          '',
          roomId,
          'match_found'
        );
      }
      
      navigation.replace('Chat', { mode: 'random', topics, roomId, socketId: socket.id });
    });

   
    return () => {
      socket.off('matched');
    };
  }, [navigation, topics]);

  return (
    <View style={styles.connectingContainer}>
      <ActivityIndicator size="large" color="#246BFD" style={{ marginBottom: 32 }} />
      <Text style={styles.connectingText}>Connecting you to a chat partner…</Text>
      <View style={{ flexDirection: 'row', marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        {topics && topics.map(topic => (
          <View key={topic} style={styles.connectingChip}>
            <MaterialIcons name="tag" size={15} color="#fff" style={{ marginRight: 3 }} />
            <Text style={styles.connectingChipText}>{topic}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ConnectingScreen; 