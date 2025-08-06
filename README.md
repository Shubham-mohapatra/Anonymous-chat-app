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

## Setup

1. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install```
