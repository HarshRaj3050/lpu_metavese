const { Server } = require("socket.io");
const http = require("http");
const app = require("./src/app");
const connectDB = require('./src/db/db');
const sessionModel = require('./src/models/session.model');
const messageModel = require('./src/models/message.model');

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

connectDB();

// Create HTTP server
const server = http.createServer(app);

// Support multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

if (CLIENT_URL && !allowedOrigins.includes(CLIENT_URL)) {
  allowedOrigins.push(CLIENT_URL);
}

// Attach socket.io to server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const characters = [];
const userNames = new Map();
const userSessions = new Map();
const dirtyPositions = new Map(); // Track positions that need DB writes

const generateRandomPosition = () => {
  return [Math.random() * 3, 0, Math.random() * 3];
};

const generateRandomHexColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

// Batch DB writes for positions every 2 seconds instead of on every move
setInterval(async () => {
  for (const [socketId, position] of dirtyPositions.entries()) {
    const sessionId = userSessions.get(socketId);
    if (sessionId) {
      try {
        await sessionModel.findByIdAndUpdate(
          sessionId,
          { position, lastActive: new Date() },
          { new: true }
        );
      } catch (err) {
        console.error("Error batch-updating position:", err.message);
      }
    }
  }
  dirtyPositions.clear();
}, 2000);

// Start fresh - characters only created when users explicitly join metaverse
console.log("🚀 Server starting - character list will be populated as users join metaverse");

io.on("connection", async (socket) => {
  console.log("Socket connected (not yet in metaverse):", socket.id);

  // Just track connected sockets, don't create character yet
  socket.emit("connected", { socketId: socket.id });

  // NEW: User joins metaverse after login
  socket.on("join-metaverse", async (userData) => {
    try {
      const { username, email } = userData;
      
      if (!username) {
        socket.emit("error", { message: "Username required to join metaverse" });
        return;
      }

      console.log(`✓ User joining metaverse: ${username} (${socket.id})`);

      const position = generateRandomPosition();
      const hairColor = generateRandomHexColor();
      const topColor = generateRandomHexColor();
      const bottomColor = generateRandomHexColor();

      // Set username in map
      userNames.set(socket.id, username);

      // Save session to database
      let sessionId = null;
      try {
        const newSession = await sessionModel.create({
          socketId: socket.id,
          username: username,
          position,
          hairColor,
          topColor,
          bottomColor,
          isOnline: true,
          lastActive: new Date(),
        });
        sessionId = newSession._id;
        userSessions.set(socket.id, sessionId);
        console.log("✓ Session saved to DB:", username);
      } catch (err) {
        console.error("Error creating session:", err.message);
        socket.emit("error", { message: "Failed to create session" });
        return;
      }

      // Add character to list
      const character = {
        id: socket.id,
        username: username,
        position,
        hairColor,
        topColor,
        bottomColor,
      };
      characters.push(character);

      // Send welcome to the user
      socket.emit("metaverse-joined", { 
        username, 
        character,
        socketId: socket.id,
        allCharacters: characters 
      });
      
      // Broadcast updated character list to all clients
      io.emit("characters", characters);
      
      console.log(`✓ Character created for ${username}`);

    } catch (err) {
      console.error("Error in join-metaverse:", err.message);
      socket.emit("error", { message: "Failed to join metaverse" });
    }
  });

  socket.on("message", async (text) => {
    try {
      if (!text || !text.trim()) {
        console.warn("Empty message received");
        return;
      }

      const senderName = userNames.get(socket.id);
      if (!senderName) {
        console.warn("Message from unknown user:", socket.id);
        return;
      }

      const messageData = {
        senderName,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        isOwnMessage: false,
      };

      // Save message to database
      const senderId = userSessions.get(socket.id);
      if (senderId) {
        await messageModel.create({
          senderName: messageData.senderName,
          senderId,
          text: messageData.text,
          timestamp: new Date(),
          roomId: 'global',
        });
        console.log(`✓ Message saved - ${messageData.senderName}: ${text}`);
      } else {
        console.warn(`Message not saved to DB - No session ID for ${senderName}`);
      }

      io.emit("message", messageData);
    } catch (err) {
      console.error("Error handling message:", err.message);
    }
  });

  socket.on("move", (position) => {
    if (!position || !Array.isArray(position) || position.length !== 3) {
      return;
    }

    const character = characters.find(c => c.id === socket.id);
    if (!character) {
      return;
    }

    character.position = position;

    // Mark position as dirty for batch DB write (every 2s)
    dirtyPositions.set(socket.id, position);

    // Use volatile emit — if client can't keep up, drop stale position packets
    io.volatile.emit("characters", characters);
  });

  socket.on("disconnect", async () => {
    try {
      const userName = userNames.get(socket.id);
      console.log(`✗ User disconnected: ${userName} (${socket.id})`);

      // Remove from character list
      const index = characters.findIndex(c => c.id === socket.id);
      if (index !== -1) {
        characters.splice(index, 1);
      }

      // Mark session as offline in database
      const sessionId = userSessions.get(socket.id);
      if (sessionId) {
        await sessionModel.findByIdAndUpdate(
          sessionId,
          { isOnline: false, lastActive: new Date() },
          { new: true }
        );
      }

      // Clean up maps
      userNames.delete(socket.id);
      userSessions.delete(socket.id);

      // Broadcast updated character list
      io.emit("characters", characters);
    } catch (err) {
      console.error("Error handling disconnect:", err.message);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});