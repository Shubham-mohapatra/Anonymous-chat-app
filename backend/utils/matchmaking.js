function findMatch(topics, socketId, waitingUsers) {
  for (let i = 0; i < waitingUsers.length; i++) {
    const user = waitingUsers[i];
    if (
      user.socketId !== socketId &&
      (topics.includes('Any') ||
        user.topics.includes('Any') ||
        user.topics.some(t => topics.includes(t)))
    ) {
      return user;
    }
  }
  return null;
}

module.exports = { findMatch }; 