# LPU - 3D Metaverse Platform

A real-time, multiplayer 3D metaverse application built with React Three Fiber, Express, and Socket.io. Users can create accounts, authenticate via email, and interact with other players in a 3D virtual environment with voice/video communication.

Video explain - https://www.linkedin.com/in/harshraj3050/

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![Node Version](https://img.shields.io/badge/node-16%2B-blue)
![React Version](https://img.shields.io/badge/react-18.2.0-blue)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Architecture](#project-architecture)
- [Key Components](#key-components)
- [Real-Time Communication](#real-time-communication)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**R3F Sims Online** is a full-stack web application that creates an immersive 3D metaverse experience. It combines modern frontend technologies with a robust backend to provide real-time multiplayer interactions, voice/video communication, and persistent user sessions.

**Key Highlights:**
- Real-time multiplayer environment with physics-based character movement
- Secure user authentication with email verification
- Voice/video communication using Agora RTC
- Smooth character animations and 3D interactions
- Socket.io for instant position synchronization

---

## Tech Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| **React 18.2.0** | UI framework for interactive components |
| **Vite 8.0.9** | Lightning-fast build tool and dev server |
| **React Three Fiber (R3F)** | React renderer for Three.js 3D graphics |
| **Three.js** | WebGL 3D graphics library |
| **React Three Rapier** | Physics engine for realistic movement |
| **Tailwind CSS** | Utility-first CSS framework |
| **Socket.io Client** | Real-time bidirectional communication |
| **Agora RTC SDK** | Voice/video calling capabilities |
| **React Router DOM** | Client-side routing |
| **Jotai** | Lightweight state management |
| **GSAP** | Animation library for smooth transitions |

### Backend (Server)
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database for user data |
| **Mongoose** | MongoDB object modeling |
| **Socket.io** | Real-time event-driven communication |
| **JWT** | Secure token-based authentication |
| **Bcrypt** | Password hashing and security |
| **Nodemailer** | Email sending service |
| **Agora Token** | Generate secure Agora tokens |

---

## Project Structure

```
r3f-sims-online/
│
├── client/                           # Frontend application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Experience.jsx       # Main 3D scene and physics controller
│   │   │   ├── AnimatedWoman.jsx    # Character model and animations
│   │   │   ├── SocketManager.jsx    # Socket.io connection manager
│   │   │   ├── ChatBox.jsx          # Chat UI component
│   │   │   ├── ControlsHUD.jsx      # On-screen controls display
│   │   │   ├── VoiceChat.jsx        # Voice/video chat component
│   │   │   ├── OnlinePlayersList.jsx # Active players display
│   │   │   ├── BuildingWithCollider.jsx # 3D environment objects
│   │   │   ├── Item.jsx             # Interactive game items
│   │   │   ├── Menu.jsx             # Main menu UI
│   │   │   ├── websocketExamples.js # Socket.io usage examples
│   │   │   └── animation/           # Animation-related components
│   │   │       ├── BubbleMenu.jsx
│   │   │       ├── Shuffle.jsx
│   │   │       ├── Silk.jsx
│   │   │       └── WordAnimation.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx        # User login page
│   │   │   │   ├── Signup.jsx       # User registration page
│   │   │   │   └── VerifyEmail.jsx  # Email verification page
│   │   │   └── metavese/
│   │   │       └── MetaVerse.jsx    # Main 3D metaverse environment
│   │   ├── assets/                  # Static assets (images, models, etc.)
│   │   ├── styles/                  # Global styles
│   │   ├── App.jsx                  # Root application component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global CSS
│   ├── public/                      # Public static files
│   │   └── models/                  # 3D model files
│   │       └── items/               # Item models
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── vercel.json                  # Vercel deployment config
│   └── index.html                   # HTML entry point
│
├── server/                          # Backend application
│   ├── src/
│   │   ├── app.js                   # Express app setup and middleware
│   │   ├── config/
│   │   │   └── config.js            # Environment configuration
│   │   ├── controllers/             # Business logic
│   │   │   ├── auth.controller.js   # Authentication logic
│   │   │   └── agora.controller.js  # Agora token generation
│   │   ├── routes/                  # API route handlers
│   │   │   ├── auth.route.js        # Authentication endpoints
│   │   │   └── agora.route.js       # Agora endpoints
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── user.model.js        # User schema
│   │   │   ├── session.model.js     # Session schema
│   │   │   ├── message.model.js     # Message schema
│   │   │   └── otp.model.js         # OTP schema
│   │   ├── services/                # Business services
│   │   │   ├── email.service.js     # Email sending service
│   │   │   └── socket.service.js    # Socket.io event handlers
│   │   ├── utils/
│   │   │   └── otp.utils.js         # OTP generation utility
│   │   └── db/
│   │       └── db.js                # Database connection setup
│   ├── index.js                     # Server entry point
│   ├── package.json                 # Backend dependencies
│   └── .env.example                 # Environment variables template
│
└── README.md                        # This file
```

---

## Features

### 🔐 Authentication & Security
- **User Registration**: Create new accounts with email verification
- **Email Verification**: OTP-based email confirmation using Nodemailer
- **Secure Login**: JWT token-based authentication
- **Password Security**: Bcrypt hashing for password protection
- **Session Management**: Track user sessions and online status

### 🌐 Real-Time Multiplayer
- **Position Synchronization**: Live updates of player positions via Socket.io
- **Character Display**: See other players' animated characters in real-time
- **Physics-Based Movement**: Accurate character movement using Rapier physics engine
- **Online Players List**: View all active users in the metaverse

### 🎬 3D Graphics & Animation
- **React Three Fiber**: Modern React-based 3D rendering
- **Animated Characters**: Smooth character animations with GSAP
- **Physics Engine**: Rapier physics for realistic collision and movement
- **Interactive Environment**: 3D buildings, items, and interactive objects
- **Lighting & Shadows**: Professional rendering with Contact Shadows

### 🎤 Voice & Video Communication
- **Agora Integration**: Real-time voice and video calling
- **Secure Token Generation**: Server-generated Agora tokens for security
- **Group Communication**: Multiple users can communicate simultaneously
- **VoiceChat Component**: Dedicated UI for voice/video controls

### 💬 Chat System
- **Real-Time Messaging**: Instant message delivery
- **Socket.io Events**: Efficient message broadcasting
- **Chat History**: Persistent message storage

### 🎮 Game Controls
- **WASD Movement**: Smooth character movement with keyboard controls
- **Mouse Look**: First-person camera control with pointer lock
- **Responsive Controls**: On-screen HUD for control hints

---

## Prerequisites

### System Requirements
- **Node.js**: Version 16.0 or higher
- **npm** or **yarn**: Package manager
- **MongoDB**: Local or cloud instance (MongoDB Atlas recommended)
- **Modern Browser**: Chrome, Firefox, Edge, or Safari with WebGL support

### Required Accounts
- **MongoDB Atlas**: For database hosting (https://www.mongodb.com/cloud/atlas)
- **Agora Account**: For voice/video capabilities (https://www.agora.io/)
- **Google OAuth**: For email services (Gmail account with app password)

---

## Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/r3f-sims-online.git
cd r3f-sims-online
```

### Step 2: Setup Backend (Server)
```bash
cd server
npm install
```

### Step 3: Setup Frontend (Client)
```bash
cd ../client
npm install
```

### Step 4: Configure Environment Variables
See [Environment Variables](#environment-variables) section below.

---

## Environment Variables

### Backend Environment Variables (.env)

Create a `.env` file in the `server/` directory:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_google_email@gmail.com

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Agora Configuration
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

### Frontend Environment Variables (.env)

Create a `.env` file in the `client/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Agora Configuration
VITE_AGORA_APP_ID=your_agora_app_id
```

### Setting Up Email Service
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASS`

### Setting Up Agora
1. Sign up at https://www.agora.io/
2. Create a new project
3. Find your App ID and App Certificate in the project settings
4. Add these to environment variables

---

## Running the Application

### Development Mode

#### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:5000`

#### Terminal 2: Start Frontend Client
```bash
cd client
npm run dev
```
Client runs on: `http://localhost:5173`

### Production Mode

#### Build Client
```bash
cd client
npm run build
```

#### Start Server with Production Build
```bash
cd server
npm start
```

---

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username"
}

Response:
{
  "success": true,
  "message": "User registered. Check email for verification.",
  "userId": "user_id"
}
```

#### Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### Agora Endpoints

#### Generate Agora Token
```
POST /api/agora/generate-token
Content-Type: application/json

{
  "channel": "metaverse_channel",
  "uid": "user_id"
}

Response:
{
  "token": "agora_token"
}
```

---

## Project Architecture

### Frontend Architecture

```
User Interface (React Components)
         ↓
   State Management (Jotai)
         ↓
   Socket.io Manager (SocketManager.jsx)
         ↓
Socket Events ← → Server
         ↓
   3D Scene (Experience.jsx)
         ↓
React Three Fiber + Rapier Physics
         ↓
WebGL Rendering (Three.js)
```

### Backend Architecture

```
Client Request
    ↓
Express Middleware (CORS, JSON, Cookies)
    ↓
Route Handler
    ↓
Controller (Business Logic)
    ↓
Database Query (MongoDB/Mongoose)
    ↓
Response to Client
```

### Real-Time Communication Flow

```
Client A sends movement
    ↓
Socket.io emits event
    ↓
Socket Server receives event
    ↓
Broadcasts to all connected clients
    ↓
Client B receives update
    ↓
Position synchronized in 3D scene
```

---

## Key Components

### 1. **Experience.jsx** - Main 3D Scene
- Manages the 3D environment and physics
- Implements third-person camera controller
- Handles keyboard input (WASD) for movement
- Synchronizes player positions via Socket.io
- Maintains physics body for collisions

**Key Features:**
- Pointer lock for mouse look
- Delta-time based smooth movement
- Optimized camera following (9:1 lerp ratio)
- Physics-driven character positioning

### 2. **SocketManager.jsx** - Real-Time Communication
- Establishes Socket.io connection with server
- Manages character data (positions, animations)
- Broadcasts player position updates
- Listens for other players' position changes
- Maintains global state using Jotai atoms

**Key Jotai Atoms:**
- `charactersAtom` - All connected players' data
- `localPlayerPosAtom` - Current player's physics position

### 3. **AnimatedWoman.jsx** - Character Model
- Loads and displays 3D character model
- Handles character animations
- Synchronizes animations with movement
- Applies character customization

### 4. **VoiceChat.jsx** - Agora Integration
- Initializes Agora RTC client
- Manages voice/video connections
- Provides UI controls for audio/video
- Handles microphone and camera permissions

### 5. **BuildingWithCollider.jsx** - Environment
- Creates static 3D environment objects
- Implements collision detection
- Loads 3D models from public/models
- Prevents character clipping through walls

### 6. **ChatBox.jsx** - Messaging
- Displays chat messages in real-time
- Sends messages via Socket.io
- Shows sender information and timestamps
- Auto-scrolls to latest messages

---

## Real-Time Communication

### Socket.io Events

#### Client to Server
```javascript
// Send player position update
socket.emit('player-position', {
  id: socket.id,
  position: [x, y, z],
  rotation: angle,
  animation: 'walking'
});

// Send chat message
socket.emit('send-message', {
  from: userId,
  text: messageContent,
  timestamp: Date.now()
});
```

#### Server to Client
```javascript
// Receive other players' positions
socket.on('characters-update', (characters) => {
  // Update positions in 3D scene
});

// Receive chat message
socket.on('receive-message', (message) => {
  // Display message in chat box
});
```

### Position Synchronization Flow

1. **Local Player Movement**: WASD keys update physics body
2. **Emit Update**: Position sent via Socket.io (~20 updates/sec)
3. **Server Broadcast**: Sends all player positions to clients
4. **Render Update**: AnimatedWoman updates character position
5. **Smooth Animation**: GSAP interpolates between positions

---

## Database Models

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  username: String,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Session Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  loginTime: Date,
  logoutTime: Date,
  status: String ('active', 'inactive')
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  from: ObjectId,
  text: String,
  timestamp: Date,
  channel: String
}
```

### OTP Model
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String,
  expiresAt: Date,
  createdAt: Date
}
```

---

## Development Workflow

### Adding a New Feature

1. **Backend (Server)**
   - Create route handler in `routes/`
   - Implement controller logic in `controllers/`
   - Add database schema if needed in `models/`
   - Add Socket.io event handler if real-time

2. **Frontend (Client)**
   - Create component in `components/`
   - Add Socket.io listener in `SocketManager.jsx`
   - Add state management with Jotai if needed
   - Import and use in appropriate page

3. **Testing**
   - Test API with Postman or curl
   - Test Socket.io with multiple clients
   - Test 3D rendering in different browsers

### Code Structure Best Practices

- **Separation of Concerns**: Keep components, services, and utilities separate
- **Reusable Components**: Create components that can be used in multiple places
- **Error Handling**: Always handle errors in API calls and Socket events
- **Performance**: Use React.memo and useMemo for expensive computations
- **Type Safety**: Use prop types or TypeScript for type checking

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: MONGO_URI is not defined
```
**Solution**: Ensure `.env` file exists in `server/` directory with correct MONGO_URI

#### 2. CORS Error
```
Cross-Origin Request Blocked
```
**Solution**: Check `CLIENT_URL` in server `.env` matches your frontend URL

#### 3. Email Not Sending
```
Cannot send email verification
```
**Solution**: Verify Gmail app password and enable "Less secure app access"

#### 4. Agora Token Generation Fails
```
Agora token error
```
**Solution**: Verify AGORA_APP_ID and AGORA_APP_CERTIFICATE in `.env`

#### 5. 3D Scene Not Loading
```
WebGL context lost
```
**Solution**: Check browser console, ensure GPU drivers are updated, try different browser

---

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Dynamic imports for route components
- **Lazy Loading**: Load 3D models only when needed
- **Memoization**: Use React.memo to prevent unnecessary re-renders
- **WebGL Optimization**: Limit particle effects, use LOD models

### Backend Optimization
- **Database Indexing**: Index frequently queried fields
- **Caching**: Cache user sessions and configuration
- **Socket Throttling**: Limit position update frequency (20/sec)
- **Database Connection Pooling**: Reuse connections

### Network Optimization
- **Message Compression**: Use Socket.io compression
- **Delta Updates**: Send only changed position data
- **Bandwidth Management**: Optimize model file sizes

---

## Deployment

### Deploy to Vercel (Frontend)
```bash
cd client
npm run build
# Deploy build/ folder to Vercel
```

### Deploy to Heroku (Backend)
```bash
cd server
# Create Procfile with: web: node index.js
git push heroku main
```

### Environment Variables in Production
Set all `.env` variables in your hosting platform's environment settings.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention
```
[type]: [description]
Examples:
- feat: Add voice chat feature
- fix: Correct position sync delay
- docs: Update README
- refactor: Optimize character rendering
```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support & Contact

For questions or issues, please:
- Open an issue on GitHub
- Check existing documentation
- Review Socket.io and Three.js documentation

---

## Acknowledgments

- **React Three Fiber**: Amazing 3D graphics library
- **Agora**: Voice and video communication platform
- **MongoDB**: NoSQL database
- **Socket.io**: Real-time communication framework

---

**Happy coding! 🚀**

Last updated: April 2026
