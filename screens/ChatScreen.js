import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Keyboard, AppState, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import socket from './socket';
// Try to import the full notification service, fallback to simple service if there are issues
let NotificationService;
try {
  NotificationService = require('../services/NotificationService').default;
} catch (error) {
  console.log(' Using simple notification service in ChatScreen');
  NotificationService = require('../services/PushServices').default;
}

const ChatScreen = ({ route, navigation }) => {
  const { roomId } = route?.params || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [disconnected, setDisconnected] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const flatListRef = useRef();

  // Implement auto-scroll to end when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle app state changes for notifications
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Define the handlePeerDisconnect function outside the effect
  const handlePeerDisconnect = () => {
    setMessages(prev => [...prev, { system: true, message: 'Your chat partner has disconnected. Searching for a new partner…' }]);
    setDisconnected(true);
    
    // Wait a moment to show the disconnection message before redirecting
    setTimeout(() => {
      navigation.replace('Connecting', { topics: route?.params?.topics || ['Any'] });
    }, 2000);
  };

  // Add a new effect to check active connection when coming from background
  useEffect(() => {
    if (appState === 'active' && roomId) {
      // Verify connection is still active when coming back to the app
      socket.emit('check_connection', { roomId }, (response) => {
        if (response && response.disconnected) {
          handlePeerDisconnect();
        }
      });
    }
  }, [appState, roomId]);

  useEffect(() => {
    if (!roomId) return;
    
    const handleMessage = ({ sender, message }) => {
      const isFromOtherUser = sender !== socket.id;
      setMessages(prev => [...prev, { sender, message, self: !isFromOtherUser }]);
      
      // Always show notification if app is in background and message is from other user
      if (isFromOtherUser && appState !== 'active') {
        NotificationService.showChatNotification(
          'Anonymous User',
          message,
          roomId,
          'new_message'
        );
      }
    };
    
    socket.on('message', handleMessage);
    return () => {
      socket.off('message', handleMessage);
    };
  }, [roomId, appState]);

  useEffect(() => {
    if (!roomId) return;
    
    socket.on('peer_disconnected', handlePeerDisconnect);
    
    return () => {
      socket.off('peer_disconnected', handlePeerDisconnect);
    };
  }, [roomId]);

  const sendMessage = () => {
    if (input.trim() && roomId && !disconnected) {
      socket.emit('message', { roomId, message: input });
      setMessages(prev => [...prev, { sender: socket.id, message: input, self: true }]);
      setInput('');
      // Remove automatic keyboard dismiss - let user tap elsewhere to dismiss
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderItem = ({ item }) => {
    if (item.system) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{item.message}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.messageRow, item.self ? styles.selfRow : styles.otherRow]}>
        <View style={[styles.messageBubble, item.self ? styles.selfBubble : styles.otherBubble]}>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Chat</Text>
          <View style={{ width: 32 }} />
        </View>
        
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.chatArea}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={(_, idx) => idx.toString()}
              style={styles.messagesList}
              contentContainerStyle={{ paddingVertical: 16 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableWithoutFeedback>
        
        <View style={[styles.inputRow, disconnected && { opacity: 0.5 }]}> 
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={disconnected ? 'Waiting for new partner...' : 'Type a message...'}
            placeholderTextColor="#A1A4B2"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!disconnected}
            blurOnSubmit={false}
            multiline={true}
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={disconnected}>
            <MaterialIcons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16171B',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181A20',
    paddingTop: Platform.OS === 'ios' ? 48 : 18,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#23262F',
    elevation: 2,
    zIndex: 2,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#191B22',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 2,
  },
  messagesList: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  selfRow: {
    justifyContent: 'flex-end',
  },
  otherRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selfBubble: {
    backgroundColor: '#246BFD',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
  },
  otherBubble: {
    backgroundColor: '#23262F',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessage: {
    color: '#A1A4B2',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#23262F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#20222A',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 10,
    marginBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    minHeight: 50,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#246BFD',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 8,
    elevation: 2,
    alignSelf: 'flex-end',
  },
});

export default ChatScreen;