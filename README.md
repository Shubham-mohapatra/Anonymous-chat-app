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

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- React Native development environment

### Installation

1. Clone the repository
```bash
git clone https://github.com/Shubham-Mohapatra/Anonymous-chat-app.git
cd Anonymous-chat-app
   npm start
   ```
   This will start the Metro bundler.
Install frontend dependencies
bash
Run
npm install
Install backend dependencies
bash
Run
cd backendnpm install
Running the Application
Start the backend server
bash
Run
cd backendnode server.js
Keep this terminal open.

In a new terminal, start the frontend
bash
Run
# Go back to the root directorycd ..npm start
Run on your preferred platform
bash
Run
# For Androidnpm run android# For iOSnpm run ios# For webnpm run web
📱 How to Use
Launch the application
You'll be automatically matched with another online user
Start chatting anonymously!
🔧 Development Setup
Android Development
Install Android Studio
Set up an Android Virtual Device (AVD)
Ensure ANDROID_HOME environment variable is set
iOS Development (Mac only)
Install Xcode
Install CocoaPods
Run cd ios && pod install
🏗️ Project Structure
Frontend
App.js - Main application component
index.js - Application entry point
Screens
ChatScreen.js - Main chat interface
ConnectingScreen.js - User matching screen
HomeScreen.js - Initial landing screen
socket.js - WebSocket connection management
Backend
server.js - Main server entry point
app.js - Express application setup
Core Components
Config: WebSocket configuration
Controllers: Chat logic and scaling
Models: Queue and room management
Middleware: Rate limiting
Utils: Matchmaking algorithm
🔍 Testing
Run the test client:

bash
Run
cd backendnode test-client.js
Test scalability:

bash
Run
node test-scalable.js
🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
⚠️ Common Issues
Port already in use

Check if any other service is using port 3000/3001
Kill the process or change the port in backend/server.js
Connection issues

Ensure both backend and frontend are running
Check your firewall settings
Verify WebSocket connection URL
Dependency issues

Try removing node_modules and reinstalling dependencies
Ensure you're using compatible Node.js version
