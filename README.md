# Anonymous-chat-app

A real-time anonymous chat application built with React Native and Node.js that allows users to connect and chat anonymously.

## Features

- Anonymous real-time messaging
- Scalable chat system
- Queue-based user matching
- Rate limiting for security
- Real-time notifications
- Cross-platform support (mobile and web)

## Project Structure

### Frontend
- `App.js` - Main application component
- `index.js` - Application entry point

#### Screens
- `ChatScreen.js` - Main chat interface
- `ConnectingScreen.js` - User matching and connection screen
- `HomeScreen.js` - Initial landing screen
- `socket.js` - WebSocket connection management

#### Services
- `NotificationService.js` - Handles push notifications
- `SimpleNotificationService.js` - Basic notification implementation

### Backend
- `server.js` - Main server entry point
- `app.js` - Express application setup

#### Core Components
- **Config**
  - `socket.js` - WebSocket configuration

- **Controllers**
  - `scalableChatController.js` - Handles chat logic and scaling

- **Models**
  - `hybridQueue.js` - Queue implementation for user matching
  - `scalableQueue.js` - Scalable queue system
  - `scalableRoom.js` - Chat room management

- **Middleware**
  - `rateLimiter.js` - Rate limiting for API protection

- **Utils**
  - `matchmaking.js` - User matching algorithm
 
## Features in Detail
1. Anonymous Matching
   
   - Users are automatically matched with random partners
   - Queue-based matching system for efficient pairing
2. Real-time Chat
   
   - Instant message delivery
   - Typing indicators
   - Connection status updates
3. Scalability
   
   - Hybrid queue system for handling multiple users
   - Scalable room management
   - Rate limiting for API protection
4. Notifications
   
   - Push notifications for new messages
   - Connection status updates
   - Simple and advanced notification options
## Data Management
- queue.json - Manages active user queue
- stats.json - Stores chat statistics and metrics
## Testing
- test-client.js - Client-side testing utilities
- test-scalable.js - Scalability testing suite

## Setup

1. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install```
