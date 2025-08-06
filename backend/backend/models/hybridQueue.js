const fs = require('fs').promises;
const path = require('path');

class HybridQueue {
  constructor() {
    this.inMemoryQueue = []; // Fallback for development
    this.inMemoryUsers = new Map(); // User sessions
    this.dataDir = path.join(__dirname, '../data');
    this.queueFile = path.join(this.dataDir, 'queue.json');
    this.statsFile = path.join(this.dataDir, 'stats.json');
    this.useFileSystem = process.env.NODE_ENV === 'production';
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
      try {
        await fs.access(this.queueFile);
      } catch {
        await fs.writeFile(this.queueFile, '[]');
      }
      
      try {
        await fs.access(this.statsFile);
      } catch {
        await fs.writeFile(this.statsFile, JSON.stringify({
          totalConnections: 0,
          totalMatches: 0,
          messagesCount: 0,
          lastUpdated: Date.now()
        }));
      }
      
      console.log(' Hybrid storage initialized');
    } catch (error) {
      console.log('  File storage unavailable, using memory only');
      this.useFileSystem = false;
    }
  }

  async addUser(socketId, topics, userInfo = {}) {
    const userData = {
      socketId,
      topics,
      timestamp: Date.now(),
      ipAddress: userInfo.ipAddress,
      userAgent: userInfo.userAgent
    };

    if (this.useFileSystem) {
      try {
        const queue = await this.loadQueue();
        queue.push(userData);
        await this.saveQueue(queue);
      } catch (error) {
        console.log('File storage failed, using memory:', error.message);
        this.inMemoryQueue.push(userData);
      }
    } else {
      this.inMemoryQueue.push(userData);
    }

    this.inMemoryUsers.set(socketId, userData);
    await this.updateStats({ totalConnections: 1 });
    
    console.log(`User ${socketId} added to queue with topics: ${topics.join(', ')}`);
  }

  async removeUser(socketId) {
    // Remove from persistent storage
    if (this.useFileSystem) {
      try {
        const queue = await this.loadQueue();
        const filteredQueue = queue.filter(u => u.socketId !== socketId);
        await this.saveQueue(filteredQueue);
      } catch (error) {
        console.log('File removal failed:', error.message);
      }
    }

    // Remove from memory
    this.inMemoryQueue = this.inMemoryQueue.filter(u => u.socketId !== socketId);
    this.inMemoryUsers.delete(socketId);
    
    console.log(`User ${socketId} removed from queue`);
  }

  async findMatch(socketId, userTopics) {
    let queue;
    
    if (this.useFileSystem) {
      try {
        queue = await this.loadQueue();
      } catch (error) {
        queue = this.inMemoryQueue;
      }
    } else {
      queue = this.inMemoryQueue;
    }

    // Sort by timestamp (oldest first)
    queue.sort((a, b) => a.timestamp - b.timestamp);

    for (const user of queue) {
      if (user.socketId === socketId) continue;
      
      if (this.areTopicsCompatible(userTopics, user.topics)) {
        await this.removeUser(user.socketId);
        await this.updateStats({ totalMatches: 1 });
        return user;
      }
    }
    
    return null;
  }

  areTopicsCompatible(topics1, topics2) {
    return (
      topics1.includes('Any') ||
      topics2.includes('Any') ||
      topics1.some(topic => topics2.includes(topic))
    );
  }

  async loadQueue() {
    const data = await fs.readFile(this.queueFile, 'utf8');
    return JSON.parse(data);
  }

  async saveQueue(queue) {
    await fs.writeFile(this.queueFile, JSON.stringify(queue, null, 2));
  }

  async getQueueStats() {
    let queueLength = 0;
    
    if (this.useFileSystem) {
      try {
        const queue = await this.loadQueue();
        queueLength = queue.length;
      } catch (error) {
        queueLength = this.inMemoryQueue.length;
      }
    } else {
      queueLength = this.inMemoryQueue.length;
    }

    const stats = await this.loadStats();
    
    return {
      waitingUsers: queueLength,
      totalActiveUsers: this.inMemoryUsers.size,
      totalConnections: stats.totalConnections,
      totalMatches: stats.totalMatches,
      messagesCount: stats.messagesCount,
      timestamp: Date.now()
    };
  }

  async updateStats(increment = {}) {
    if (!this.useFileSystem) return;
    
    try {
      const stats = await this.loadStats();
      
      if (increment.totalConnections) {
        stats.totalConnections += increment.totalConnections;
      }
      if (increment.totalMatches) {
        stats.totalMatches += increment.totalMatches;
      }
      if (increment.messagesCount) {
        stats.messagesCount += increment.messagesCount;
      }
      
      stats.lastUpdated = Date.now();
      
      await fs.writeFile(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.log('Stats update failed:', error.message);
    }
  }

  async loadStats() {
    try {
      const data = await fs.readFile(this.statsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {
        totalConnections: 0,
        totalMatches: 0,
        messagesCount: 0,
        lastUpdated: Date.now()
      };
    }
  }

  // Cleanup old entries periodically
  async cleanup(maxAgeMs = 5 * 60 * 1000) { // 5 minutes
    const cutoffTime = Date.now() - maxAgeMs;
    let removedCount = 0;

    if (this.useFileSystem) {
      try {
        const queue = await this.loadQueue();
        const filteredQueue = queue.filter(user => user.timestamp > cutoffTime);
        removedCount = queue.length - filteredQueue.length;
        await this.saveQueue(filteredQueue);
      } catch (error) {
        console.log('Cleanup failed:', error.message);
      }
    }

    // Cleanup memory too
    const beforeCount = this.inMemoryQueue.length;
    this.inMemoryQueue = this.inMemoryQueue.filter(user => user.timestamp > cutoffTime);
    removedCount += beforeCount - this.inMemoryQueue.length;

    if (removedCount > 0) {
      console.log(` Cleaned up ${removedCount} old queue entries`);
    }

    return removedCount;
  }
}

module.exports = new HybridQueue();
