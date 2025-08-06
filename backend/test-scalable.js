const { io } = require("socket.io-client");

console.log(' Testing Scalable Anonymous Chat Backend');
console.log('==========================================');

// Test multiple connections
const connections = [];
const totalConnections = 5;

for (let i = 0; i < totalConnections; i++) {
  const socket = io("http://10.5.173.214:5000");
  
  socket.on("connect", () => {
    console.log(` Client ${i + 1} connected:`, socket.id);
    
    // Join queue with random topics
    const topics = ['Technology', 'Gaming', 'Music', 'Any'][Math.floor(Math.random() * 4)];
    socket.emit("join_queue", { topics: [topics] });
    console.log(` Client ${i + 1} joining queue with topic: ${topics}`);
  });

  socket.on("matched", ({ roomId }) => {
    console.log(` Client ${i + 1} matched! Room: ${roomId}`);
    
    // Send a test message
    setTimeout(() => {
      socket.emit("message", { 
        roomId, 
        message: `Hello from client ${i + 1}! This is a test message.` 
      });
    }, 1000);
  });

  socket.on("message", ({ sender, message }) => {
    console.log(`Client ${i + 1} received message from ${sender}: ${message}`);
  });

  socket.on("rate_limited", ({ message }) => {
    console.log(`  Client ${i + 1} rate limited: ${message}`);
  });

  socket.on("spam_detected", ({ message }) => {
    console.log(` Client ${i + 1} spam detected: ${message}`);
  });

  socket.on("peer_disconnected", () => {
    console.log(` Client ${i + 1} peer disconnected`);
  });

  socket.on("connect_error", (error) => {
    console.log(` Client ${i + 1} connection error:`, error.message);
  });

  connections.push(socket);
}

// Test rate limiting after 5 seconds
setTimeout(() => {
  console.log('\n Testing rate limiting...');
  const testSocket = connections[0];
  
  // Send many messages quickly
  for (let i = 0; i < 35; i++) {
    testSocket.emit("message", { 
      roomId: "test_room", 
      message: `Spam message ${i}` 
    });
  }
}, 5000);


setTimeout(() => {
  console.log('\nTesting spam detection...');
  const testSocket = connections[1];
  
  for (let i = 0; i < 5; i++) {
    testSocket.emit("message", { 
      roomId: "test_room", 
      message: "This is spam! This is spam! This is spam!" 
    });
  }
}, 10000);

// Disconnect all clients after 15 seconds
setTimeout(() => {
  console.log('\nDisconnecting all clients...');
  connections.forEach((socket, i) => {
    socket.disconnect();
    console.log(` Client ${i + 1} disconnected`);
  });
  
  console.log('\n Test completed!');
  process.exit(0);
}, 15000);
