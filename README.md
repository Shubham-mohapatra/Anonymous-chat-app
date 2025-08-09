
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
=======
# 📱 Anonymous Chat App

A real-time anonymous chat application built with **React Native** and **Node.js** that allows users to connect and chat anonymously.

---

## 🚀 Features

- 🔒 Anonymous real-time messaging  
- 📶 Scalable chat system  
- ⏳ Queue-based user matching  
- 🛡️ Rate limiting for security  
- 🔔 Real-time notifications  
- 📱 Cross-platform support (Android, iOS, Web)  

---

## 🗂️ Project Structure

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

---

## 🔍 Features in Detail

1. **Anonymous Matching**  
   - Automatic random user pairing  
   - Queue-based system for efficient matching  

2. **Real-time Chat**  
   - Instant message delivery  
   - Typing indicators  
   - Live connection status  

3. **Scalability**  
   - Hybrid queue for large-scale user handling  
   - Scalable room management  
   - API rate limiting for protection  

4. **Notifications**  
   - Push notifications for new messages  
   - Connection and disconnection alerts  
   - Basic and advanced notification options  

---

## 🧩 Data Management

- `queue.json` - Stores current user queue  
- `stats.json` - Tracks chat statistics and metrics  

---

## 🧪 Testing

- `test-client.js` - Client-side testing  
- `test-scalable.js` - Scalability testing suite  

---

## ⚙️ Quick Start

### ✅ Prerequisites

- Node.js (v14 or higher)  
- npm (v6 or higher)  
- React Native development environment  

---

1. Clone the Repository
```bash 
git clone https://github.com/Shubham-Mohapatra/Anonymous-chat-app.git
cd Anonymous-chat-app
```

3. 🌐 Hosted on Expo Go
🧪 Live Preview (Expo Link):
https://expo.dev/accounts/shubham290704/projects/MyAnonymousChatApp

📱 Scan the QR Code:
After running the following command, scan the QR code with the Expo Go app on your phone:

```bash
npx expo start
```
Make sure you have the Expo Go app installed on your Android or iOS device.

