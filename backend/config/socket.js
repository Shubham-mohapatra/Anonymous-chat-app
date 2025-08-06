const { Server } = require('socket.io');
const scalableChatController = require('../controllers/scalableChatController');
const hybridQueue = require('../models/hybridQueue');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_queue', ({ topics }) => {
      scalableChatController.handleJoinQueue(socket, topics, io);
    });

    socket.on('message', (data) => {
      scalableChatController.handleMessage(socket, data);
    });

    socket.on('disconnect', () => {
      scalableChatController.handleDisconnect(socket, io);
      console.log('User disconnected:', socket.id);
    });
  });

  // Periodic cleanup (every 5 minutes)
  setInterval(async () => {
    try {
      await hybridQueue.cleanup();
      console.log('🧹 Periodic cleanup completed');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  return io;
}

module.exports = setupSocket; 