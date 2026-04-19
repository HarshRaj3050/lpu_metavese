import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

io.listen(3001);

const characters = [];
const userNames = new Map();

const generateRandomPosition = () => {
  return [Math.random() * 3, 0, Math.random() * 3];
};

const generateRandomHexColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

io.on("connection", (socket) => {
  console.log("user connected");

  characters.push({
    id: socket.id,
    position: generateRandomPosition(),
    hairColor: generateRandomHexColor(),
    topColor: generateRandomHexColor(),
    bottomColor: generateRandomHexColor(),
  });

  socket.emit("hello");

  io.emit("characters", characters);

  // Generate a user name for this connection
  const userName = `User_${socket.id.slice(0, 5)}`;
  userNames.set(socket.id, userName);

  socket.on("message", (text) => {
    const messageData = {
      senderName: userNames.get(socket.id),
      text: text,
      timestamp: new Date().toISOString(),
      isOwnMessage: false,
    };
    io.emit("message", messageData);
  });

  socket.on("move", (position) => {
    const character = characters.find(
      (character) => character.id === socket.id
    );
    character.position = position;
    io.emit("characters", characters);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    characters.splice(
      characters.findIndex((character) => character.id === socket.id),
      1
    );
    userNames.delete(socket.id);
    io.emit("characters", characters);
  });
});
