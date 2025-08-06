const { pgPool, redisClient } = require('../config/database');

class ScalableRoom {
  constructor() {
    this.ACTIVE_ROOMS_KEY = 'chat:active_rooms';
    this.ROOM_USERS_KEY_PREFIX = 'chat:room_users:';
  }

  // Create a new chat room
  async createRoom(roomId, users, topic = 'Any') {
    try {
      // Store in PostgreSQL for persistence and analytics
      await pgPool.query(
        'INSERT INTO chat_rooms (id, topic, status) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [roomId, topic, 'active']
      );

      // Store active room in Redis for fast access
      const roomData = {
        id: roomId,
        users: users,
        created_at: Date.now(),
        topic: topic
      };

      await redisClient.hset(this.ACTIVE_ROOMS_KEY, roomId, JSON.stringify(roomData));
      await redisClient.sadd(`${this.ROOM_USERS_KEY_PREFIX}${roomId}`, ...users);

      console.log(`Room ${roomId} created with users: ${users.join(', ')}`);
      return roomData;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Get room information
  async getRoom(roomId) {
    try {
      const roomDataStr = await redisClient.hget(this.ACTIVE_ROOMS_KEY, roomId);
      if (roomDataStr) {
        return JSON.parse(roomDataStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  // Add user to room
  async addUserToRoom(roomId, socketId) {
    try {
      const roomData = await this.getRoom(roomId);
      if (roomData) {
        roomData.users.push(socketId);
        await redisClient.hset(this.ACTIVE_ROOMS_KEY, roomId, JSON.stringify(roomData));
        await redisClient.sadd(`${this.ROOM_USERS_KEY_PREFIX}${roomId}`, socketId);
        
        console.log(`User ${socketId} added to room ${roomId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding user to room:', error);
      return false;
    }
  }

  // Remove user from room
  async removeUserFromRoom(roomId, socketId) {
    try {
      const roomData = await this.getRoom(roomId);
      if (roomData) {
        roomData.users = roomData.users.filter(id => id !== socketId);
        
        if (roomData.users.length === 0) {
          // Room is empty, delete it
          await this.deleteRoom(roomId);
        } else {
          await redisClient.hset(this.ACTIVE_ROOMS_KEY, roomId, JSON.stringify(roomData));
        }
        
        await redisClient.srem(`${this.ROOM_USERS_KEY_PREFIX}${roomId}`, socketId);
        console.log(`User ${socketId} removed from room ${roomId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing user from room:', error);
      return false;
    }
  }

  // Delete room
  async deleteRoom(roomId) {
    try {
      // Update status in PostgreSQL
      await pgPool.query(
        'UPDATE chat_rooms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['closed', roomId]
      );

      // Remove from Redis
      await redisClient.hdel(this.ACTIVE_ROOMS_KEY, roomId);
      await redisClient.del(`${this.ROOM_USERS_KEY_PREFIX}${roomId}`);

      console.log(`Room ${roomId} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  }

  // Find room by user
  async findRoomByUser(socketId) {
    try {
      const rooms = await redisClient.hgetall(this.ACTIVE_ROOMS_KEY);
      
      for (const [roomId, roomDataStr] of Object.entries(rooms)) {
        const roomData = JSON.parse(roomDataStr);
        if (roomData.users.includes(socketId)) {
          return [roomId, roomData.users];
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding room by user:', error);
      return null;
    }
  }

  // Get all active rooms (for admin/monitoring)
  async getAllRooms() {
    try {
      const rooms = await redisClient.hgetall(this.ACTIVE_ROOMS_KEY);
      const parsedRooms = {};
      
      for (const [roomId, roomDataStr] of Object.entries(rooms)) {
        parsedRooms[roomId] = JSON.parse(roomDataStr);
      }
      
      return parsedRooms;
    } catch (error) {
      console.error('Error getting all rooms:', error);
      return {};
    }
  }

  // Store message (for analytics - not shown to users)
  async storeMessage(roomId, senderId, message, messageType = 'text') {
    try {
      await pgPool.query(
        'INSERT INTO messages (room_id, sender_id, message_text, message_type) VALUES ($1, $2, $3, $4)',
        [roomId, senderId, message, messageType]
      );
    } catch (error) {
      console.error('Error storing message:', error);
      // Don't throw - message storage shouldn't break the chat
    }
  }

  // Get room statistics
  async getRoomStats() {
    try {
      const activeRoomsCount = await redisClient.hlen(this.ACTIVE_ROOMS_KEY);
      
      // Get total rooms and messages from PostgreSQL
      const totalRoomsResult = await pgPool.query('SELECT COUNT(*) FROM chat_rooms');
      const totalMessagesResult = await pgPool.query('SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL \'24 hours\'');
      
      return {
        activeRooms: activeRoomsCount,
        totalRooms: parseInt(totalRoomsResult.rows[0].count),
        messagesLast24h: parseInt(totalMessagesResult.rows[0].count),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting room stats:', error);
      return { activeRooms: 0, totalRooms: 0, messagesLast24h: 0, timestamp: Date.now() };
    }
  }
}

module.exports = new ScalableRoom();
