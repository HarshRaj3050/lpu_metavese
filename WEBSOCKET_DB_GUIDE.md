# WebSocket Database Integration Guide

## Overview
Your server now integrates MongoDB with Socket.io for real-time communication. All user sessions, messages, and movements are persisted in the database.

## Features Added

### 1. **Session Management**
- User sessions are created in the database when they connect
- Sessions are marked as offline when users disconnect
- Active sessions are loaded on server restart

### 2. **Message Persistence**
- All chat messages are saved to the database
- Messages include sender information, timestamp, and room ID
- Message history can be retrieved on demand

### 3. **Position Tracking**
- User positions are updated in real-time and saved to database
- Last active timestamp is recorded for each session

## Database Collections

### Sessions Collection
```javascript
{
  _id: ObjectId,
  socketId: String,           // Socket.io connection ID
  userId: ObjectId,           // Reference to user (optional)
  username: String,
  position: [Number],         // [x, y, z] coordinates
  hairColor: String,
  topColor: String,
  bottomColor: String,
  isOnline: Boolean,
  lastActive: Date,
  createdAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  senderName: String,
  senderId: ObjectId,         // Reference to session
  text: String,
  timestamp: Date,
  roomId: String              // For multi-room support
}
```

## Usage Example (Client Side)

```javascript
// Connect to server
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Send message
socket.emit('message', 'Hello everyone!');

// Listen for messages
socket.on('message', (messageData) => {
  console.log(`${messageData.senderName}: ${messageData.text}`);
});

// Send position
socket.emit('move', [1, 0, 2]);

// Listen for character updates
socket.on('characters', (characters) => {
  console.log('Current characters:', characters);
});
```

## Environment Variables Required

Make sure your `.env` file includes:
```
MONGO_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/your_db
JWT_SECRET=your_secret_key
PORT=3001
CLIENT_URL=http://localhost:5173
```

## API Endpoints for WebSocket Data

You can add these Express endpoints to retrieve WebSocket data:

```javascript
// Get message history
app.get('/api/messages/:roomId', async (req, res) => {
  const messages = await messageModel.find({ roomId: req.params.roomId });
  res.json(messages);
});

// Get active sessions
app.get('/api/sessions/active', async (req, res) => {
  const sessions = await sessionModel.find({ isOnline: true });
  res.json(sessions);
});

// Get user session
app.get('/api/sessions/:socketId', async (req, res) => {
  const session = await sessionModel.findOne({ socketId: req.params.socketId });
  res.json(session);
});
```

## Server Functions Available

Use these in [socket.service.js](../services/socket.service.js):

- `createSession(socketId, username, colors, position)` - Create new session
- `saveMessage(senderName, senderId, text, roomId)` - Save chat message
- `updatePosition(sessionId, position)` - Update user position
- `markOffline(sessionId)` - Mark session as offline
- `loadActiveSessions()` - Load all active sessions
- `getMessageHistory(roomId, limit)` - Get message history
- `cleanupExpiredSessions(hoursOld)` - Delete old offline sessions

## Testing

1. Start your server: `npm run dev`
2. Open multiple browser tabs at `http://localhost:5173`
3. See users connect/disconnect
4. Send messages and verify they appear in database
5. Check MongoDB collections with MongoDB Atlas or MongoDB Compass

## Troubleshooting

**Sessions not saving?**
- Check `MONGO_URI` is correct in `.env`
- Ensure MongoDB connection is active
- Check browser console for connection errors

**Messages not appearing?**
- Verify Socket.io connection is established
- Check server console for error logs
- Ensure `socket.emit('message', text)` is being called correctly
