const hybridQueue = require('../models/hybridQueue');

// Simple in-memory room management (reuse existing)
const room = {
  rooms: {},
  createRoom(roomId, users) {
    this.rooms[roomId] = users;
  },
  deleteRoom(roomId) {
    delete this.rooms[roomId];
  },
  findRoomByUser(socketId) {
    for (const [roomId, users] of Object.entries(this.rooms)) {
      if (users.includes(socketId)) {
        return [roomId, users];
      }
    }
    return null;
  },
  getAllRooms() {
    return this.rooms;
  }
};

// Simple rate limiting (in-memory)
const messageLimits = new Map(); // socketId -> [timestamps]
const spamDetection = new Map(); // socketId -> recent messages

class ScalableChatController {
  
  async handleJoinQueue(socket, topics, io) {
    try {
      // Add user info for better tracking
      const userInfo = {
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      };

      // Check for existing match
      const match = await hybridQueue.findMatch(socket.id, topics);
      
      if (match) {
        // Found a match!
        const roomId = `room_${socket.id}_${match.socketId}`;
        room.createRoom(roomId, [socket.id, match.socketId]);
        
        // Join both users to the room
        socket.join(roomId);
        io.to(match.socketId).socketsJoin(roomId);
        
        // Emit matched event to both users
        io.to(socket.id).emit('matched', { roomId });
        io.to(match.socketId).emit('matched', { roomId });
        
        console.log(`✅ Match found! Room: ${roomId}`);
      } else {
        // No match, add to queue
        await hybridQueue.addUser(socket.id, topics, userInfo);
        console.log(`⏳ User ${socket.id} waiting for match...`);
      }
    } catch (error) {
      console.error('Error in handleJoinQueue:', error);
      socket.emit('error', { message: 'Failed to join queue' });
    }
  }

  async handleMessage(socket, { roomId, message }) {
    try {
      // Rate limiting check
      if (!this.checkMessageRate(socket.id)) {
        socket.emit('rate_limited', { message: 'Too many messages, slow down!' });
        return;
      }

      // Spam detection
      if (this.detectSpam(socket.id, message)) {
        socket.emit('spam_detected', { message: 'Spam detected, message blocked' });
        return;
      }

      // Message length check
      if (message.length > 500) {
        socket.emit('message_too_long', { message: 'Message too long (max 500 characters)' });
        return;
      }

      // Send message to room
      socket.to(roomId).emit('message', { 
        sender: socket.id, 
        message,
        timestamp: Date.now()
      });

      console.log(`💬 Message sent in room ${roomId}`);
    } catch (error) {
      console.error('Error in handleMessage:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  async handleDisconnect(socket, io) {
    try {
      // Remove from queue
      await hybridQueue.removeUser(socket.id);
      
      // Handle room disconnection
      const found = room.findRoomByUser(socket.id);
      if (found) {
        const [roomId, users] = found;
        
        // Notify other users in the room
        users.forEach(uid => {
          if (uid !== socket.id) {
            io.to(uid).emit('peer_disconnected');
          }
        });
        
        room.deleteRoom(roomId);
        console.log(`🚪 User ${socket.id} disconnected from room ${roomId}`);
      }

      // Cleanup rate limiting data
      messageLimits.delete(socket.id);
      spamDetection.delete(socket.id);
      
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    }
  }

  // Simple rate limiting (30 messages per minute)
  checkMessageRate(socketId, limit = 30, windowMs = 60000) {
    const now = Date.now();
    const userLimits = messageLimits.get(socketId) || [];
    
    // Remove old timestamps
    const validTimestamps = userLimits.filter(timestamp => now - timestamp < windowMs);
    
    if (validTimestamps.length >= limit) {
      return false; // Rate limited
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    messageLimits.set(socketId, validTimestamps);
    
    return true;
  }

  // Simple spam detection
  detectSpam(socketId, message) {
    const recentMessages = spamDetection.get(socketId) || [];
    const now = Date.now();
    
    // Keep only last 5 minutes of messages
    const validMessages = recentMessages.filter(msg => now - msg.timestamp < 300000);
    
    // Check for repeated messages
    const duplicates = validMessages.filter(msg => msg.text === message);
    if (duplicates.length >= 3) {
      return true; // Spam detected
    }
    
    // Add current message
    validMessages.push({ text: message, timestamp: now });
    
    // Keep only last 10 messages
    if (validMessages.length > 10) {
      validMessages.shift();
    }
    
    spamDetection.set(socketId, validMessages);
    return false;
  }

  // Get statistics
  async getStats() {
    const queueStats = await hybridQueue.getQueueStats();
    const allRooms = room.getAllRooms();
    
    return {
      ...queueStats,
      activeRooms: Object.keys(allRooms).length,
      totalUsersInRooms: Object.values(allRooms).flat().length
    };
  }
}

module.exports = new ScalableChatController();
