const fs = require('fs').promises;
const path = require('path');

class HybridQueue {
  constructor() {
    this.inMemoryQueue = []; // Fast access
    this.inMemoryUsers = new Map(); // User sessions
    this.dataDir = path.join(__dirname, '../data');
    this.queueFile = path.join(this.dataDir, 'queue.json');
    this.statsFile = path.join(this.dataDir, 'stats.json');
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize queue file
      try {
        await fs.access(this.queueFile);
      } catch {
        await fs.writeFile(this.queueFile, '[]');
      }
      
      // Initialize stats file
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
      
      console.log('✅ Storage initialized');
    } catch (error) {
      console.log('⚠️  Using memory only:', error.message);
    }
  }

  async addUser(socketId, topics) {
    const userData = {
      socketId,
      topics,
      timestamp: Date.now()
    };

    // Add to memory for fast access
    this.inMemoryQueue.push(userData);
    this.inMemoryUsers.set(socketId, userData);
    
    console.log(`User ${socketId} added to queue with topics: ${topics.join(', ')}`);
  }

  async removeUser(socketId) {
    // Remove from memory
    this.inMemoryQueue = this.inMemoryQueue.filter(u => u.socketId !== socketId);
    this.inMemoryUsers.delete(socketId);
    
    console.log(`User ${socketId} removed from queue`);
  }

  async findMatch(socketId, userTopics) {
    // Sort by timestamp (oldest first - fair matching)
    const queue = [...this.inMemoryQueue].sort((a, b) => a.timestamp - b.timestamp);

    for (const user of queue) {
      if (user.socketId === socketId) continue;
      
      if (this.areTopicsCompatible(userTopics, user.topics)) {
        await this.removeUser(user.socketId);
        return user;
      }
    }
    
    return null;
  }

  // Strict matching: only match users with EXACT same topics
  areTopicsCompatible(topics1, topics2) {
    // Sort both arrays for comparison
    const sorted1 = [...topics1].sort();
    const sorted2 = [...topics2].sort();
    
    // Check if arrays are exactly the same
    if (sorted1.length !== sorted2.length) {
      return false;
    }
    
    return sorted1.every((topic, index) => topic === sorted2[index]);
  }
  
  // Alternative: Flexible matching (original logic) - uncomment to use
  // areTopicsCompatible(topics1, topics2) {
  //   return (
  //     topics1.includes('Any') ||
  //     topics2.includes('Any') ||
  //     topics1.some(topic => topics2.includes(topic))
  //   );
  // }

  async getQueueStats() {
    return {
      waitingUsers: this.inMemoryQueue.length,
      totalActiveUsers: this.inMemoryUsers.size,
      timestamp: Date.now()
    };
  }

  // Cleanup old entries (prevent memory leaks)
  async cleanup(maxAgeMs = 5 * 60 * 1000) { // 5 minutes
    const cutoffTime = Date.now() - maxAgeMs;
    const beforeCount = this.inMemoryQueue.length;
    
    this.inMemoryQueue = this.inMemoryQueue.filter(user => user.timestamp > cutoffTime);
    
    const removedCount = beforeCount - this.inMemoryQueue.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old queue entries`);
    }

    return removedCount;
  }
}

module.exports = new HybridQueue();
