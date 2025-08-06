import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation, topics }) => {
  const [roomCode, setRoomCode] = useState('');
  const [selectedTopics, setSelectedTopics] = useState(['Any']);

  const toggleTopic = (topic) => {
    if (topic === 'Any') {
      setSelectedTopics(['Any']);
    } else {
      let newTopics = selectedTopics.includes(topic)
        ? selectedTopics.filter(t => t !== topic)
        : [...selectedTopics.filter(t => t !== 'Any'), topic];
      if (newTopics.length === 0) newTopics = ['Any'];
      setSelectedTopics(newTopics);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      <View style={styles.centered}>
        <Text style={styles.logo}>💬</Text>
        <Text style={styles.appName}>AnonChat</Text>
        <Text style={styles.subtitle}>Chat instantly. No sign-up. No history.</Text>
        <View style={{ height: 32 }} />
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Connecting', { topics: selectedTopics })}
        >
          <Text style={styles.primaryButtonText}>Random Chat</Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Room code or topic"
            placeholderTextColor="#A1A4B2"
            value={roomCode}
            onChangeText={setRoomCode}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => {
              if (roomCode.trim()) {
                navigation.navigate('Chat', { mode: 'room', roomCode });
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Join Room</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 28 }} />
        <View style={styles.topicPickerContainer}>
          <View style={styles.topicLabelRow}>
            <MaterialIcons name="local-offer" size={20} color="#A1A4B2" style={{ marginRight: 6 }} />
            <Text style={styles.topicLabel}>Choose Topics</Text>
          </View>
          <View style={styles.chipScroll}>
            {topics.map(topic => {
              const selected = selectedTopics.includes(topic);
              return (
                <TouchableOpacity
                  key={topic}
                  style={[styles.topicChip, selected && styles.topicChipSelected]}
                  onPress={() => toggleTopic(topic)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="tag" size={16} color={selected ? '#fff' : '#246BFD'} style={{ marginRight: 4 }} />
                  <Text style={[styles.topicChipText, selected && { color: '#fff' }]}>{topic}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
    padding: 24, // increased padding
    minHeight: 120, // make container bigger
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
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
    flexWrap: 'wrap', // allow chips to wrap to next line
    alignItems: 'center',
    paddingVertical: 2,
    paddingRight: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 10,
    marginBottom: 6,
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
});

export default HomeScreen; 