📱 Anonymous Chat App
A real-time anonymous chat application built with React Native and Node.js that allows users to connect and chat anonymously.

🚀 Features
🔒 Anonymous real-time messaging

📶 Scalable chat system

⏳ Queue-based user matching

🛡️ Rate limiting for security

🔔 Real-time notifications

📱 Cross-platform support (Android, iOS, Web)

🗂️ Project Structure
Frontend
App.js - Main application component

index.js - Application entry point

Screens
ChatScreen.js - Main chat interface

ConnectingScreen.js - User matching and connection screen

HomeScreen.js - Initial landing screen

socket.js - WebSocket connection management

Services
NotificationService.js - Handles push notifications

SimpleNotificationService.js - Basic notification implementation

Backend
server.js - Main server entry point

app.js - Express application setup

Core Components
Config

socket.js - WebSocket configuration

Controllers

scalableChatController.js - Handles chat logic and scaling

Models

hybridQueue.js - Queue implementation for user matching

scalableQueue.js - Scalable queue system

scalableRoom.js - Chat room management

Middleware

rateLimiter.js - Rate limiting for API protection

Utils

matchmaking.js - User matching algorithm

🔍 Features in Detail
Anonymous Matching

Automatic random user pairing

Queue-based system for efficient matching

Real-time Chat

Instant message delivery

Typing indicators

Live connection status

Scalability

Hybrid queue for large-scale user handling

Scalable room management

API rate limiting for protection

Notifications

Push notifications for new messages

Connection and disconnection alerts

Basic and advanced notification options

🧩 Data Management
queue.json - Stores current user queue

stats.json - Tracks chat statistics and metrics

🧪 Testing
test-client.js - Client-side testing

test-scalable.js - Scalability testing suite

⚙️ Quick Start
Prerequisites
Node.js (v14 or higher)

npm (v6 or higher)

React Native development environment

🧑‍💻 Installation
Clone the repository

bash
Copy
Edit
git clone https://github.com/Shubham-Mohapatra/Anonymous-chat-app.git
cd Anonymous-chat-app
Start Metro Bundler

bash
Copy
Edit
npm start
Install frontend dependencies

bash
Copy
Edit
npm install
Install backend dependencies

bash
Copy
Edit
cd backend
npm install
🏃 Running the Application
Start Backend Server
bash
Copy
Edit
cd backend
node server.js
Keep this terminal open.

Start Frontend
bash
Copy
Edit
cd ..
npm start
Run on Device/Platform
bash
Copy
Edit
npm run android   # For Android  
npm run ios       # For iOS  
npm run web       # For Web  
📱 How to Use
Launch the application

You'll be matched automatically with an online user

Start chatting anonymously in real-time

🏗️ Development Setup
Android
Install Android Studio

Set up an AVD (Android Virtual Device)

Ensure ANDROID_HOME is set

iOS (Mac Only)
Install Xcode

Install CocoaPods

bash
Copy
Edit
cd ios && pod install
🔍 Testing
bash
Copy
Edit
# Run test client
cd backend
node test-client.js

# Test scalability
node test-scalable.js
🤝 Contributing
Fork the repository

Create a feature branch

bash
Copy
Edit
git checkout -b feature/AmazingFeature
Commit your changes

bash
Copy
Edit
git commit -m 'Add some AmazingFeature'
Push the branch

bash
Copy
Edit
git push origin feature/AmazingFeature
Open a Pull Request

⚠️ Common Issues
Port already in use
Check if port 3000 or 3001 is occupied

Kill the process or change the port in backend/server.js

Connection issues
Ensure both frontend and backend are running

Verify WebSocket connection URL

Check firewall settings

Dependency issues
Delete node_modules and reinstall

bash
Copy
Edit
rm -rf node_modules
npm install
Ensure you're using a compatible Node.js version

📄 License
This project is licensed under the MIT License.
