const { redisClient } = require('../config/database');

class ScalableQueue {
  constructor() {
    this.QUEUE_KEY = 'chat:waiting_users';
    this.USER_SESSION_KEY = 'chat:user_sessions';
  }

  // Add user to waiting queue
  async addUser(socketId, topics, userInfo = {}) {
    const userData = {
      socketId,
      topics: JSON.stringify(topics),
      timestamp: Date.now(),
      ...userInfo
    };

    // Add to sorted set (priority queue by timestamp)
    await redisClient.zadd(this.QUEUE_KEY, Date.now(), JSON.stringify(userData));
    
    // Store user session info
    await redisClient.hset(this.USER_SESSION_KEY, socketId, JSON.stringify(userData));
    
    console.log(`User ${socketId} added to queue with topics: ${topics.join(', ')}`);
  }

  // Remove user from queue
  async removeUser(socketId) {
    // Get user data first
    const userDataStr = await redisClient.hget(this.USER_SESSION_KEY, socketId);
    if (userDataStr) {
      // Remove from sorted set
      await redisClient.zrem(this.QUEUE_KEY, userDataStr);
    }
    
    // Remove from session store
    await redisClient.hdel(this.USER_SESSION_KEY, socketId);
    
    console.log(`User ${socketId} removed from queue`);
  }

  // Find a match for the user
  async findMatch(socketId, userTopics) {
    try {
      // Get all waiting users (oldest first)
      const waitingUsers = await redisClient.zrange(this.QUEUE_KEY, 0, -1);
      
      for (const userDataStr of waitingUsers) {
        const userData = JSON.parse(userDataStr);
        const candidateTopics = JSON.parse(userData.topics);
        
        // Skip self
        if (userData.socketId === socketId) continue;
        
        // Check topic compatibility
        if (this.areTopicsCompatible(userTopics, candidateTopics)) {
          // Remove matched user from queue
          await this.removeUser(userData.socketId);
          return userData;
        }
      }
      
      return null; // No match found
    } catch (error) {
      console.error('Error finding match:', error);
      return null;
    }
  }

  // Check if topics are compatible
  areTopicsCompatible(topics1, topics2) {
    return (
      topics1.includes('Any') ||
      topics2.includes('Any') ||
      topics1.some(topic => topics2.includes(topic))
    );
  }

  // Get queue statistics
  async getQueueStats() {
    const queueLength = await redisClient.zcard(this.QUEUE_KEY);
    const activeUsers = await redisClient.hlen(this.USER_SESSION_KEY);
    
    return {
      waitingUsers: queueLength,
      totalActiveUsers: activeUsers,
      timestamp: Date.now()
    };
  }

  // Clean up old entries (run periodically)
  async cleanupOldEntries(maxAgeMs = 5 * 60 * 1000) { // 5 minutes
    const cutoffTime = Date.now() - maxAgeMs;
    const removed = await redisClient.zremrangebyscore(this.QUEUE_KEY, '-inf', cutoffTime);
    
    if (removed > 0) {
      console.log(`Cleaned up ${removed} old queue entries`);
    }
    
    return removed;
  }
}

module.exports = new ScalableQueue();
