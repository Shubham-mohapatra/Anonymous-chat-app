const express = require('express');
const router = express.Router();
const scalableChatController = require('../controllers/scalableChatController');


router.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Anonymous Chat Backend',
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await scalableChatController.getStats();
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get statistics'
    });
  }
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: Date.now()
  });
});

module.exports = router;
