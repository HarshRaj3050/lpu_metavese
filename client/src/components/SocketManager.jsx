import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Determine socket URL based on environment
const getSocketURL = () => {
  const isDev = window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1";
  
  if (isDev) {
    return "http://localhost:3001";
  }
  
  // Production: Use Render backend URL
  const backendURL = import.meta.env.VITE_SOCKET_URL || 
                     "https://lpu-metavese.onrender.com";
  return backendURL;
};

export const socket = io(getSocketURL(), {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  autoConnect: true,
});

export const charactersAtom = atom([]);
export const messagesAtom = atom([]);
export const currentUserAtom = atom(null);
export const inMetaverseAtom = atom(false);

/**
 * Call this after user login to join the metaverse with character
 */
export const joinMetaverse = (username, email = "") => {
  socket.emit("join-metaverse", { username, email });
};

export const SocketManager = () => {
  const [_characters, setCharacters] = useAtom(charactersAtom);
  const [_messages, setMessages] = useAtom(messagesAtom);
  const [_currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [_inMetaverse, setInMetaverse] = useAtom(inMetaverseAtom);

  useEffect(() => {
    function onConnected(data) {
      console.log("✓ Socket connected:", data.socketId);
    }

    function onConnect() {
      console.log("✓ Socket reconnected");
    }

    function onDisconnect() {
      console.log("✗ Socket disconnected");
      setInMetaverse(false);
    }

    function onMetaverseJoined(data) {
      console.log("✓ Metaverse joined:", data.username);
      setCurrentUser(data.username);
      setInMetaverse(true);
      setCharacters(data.allCharacters || []);
    }

    function onCharacters(value) {
      setCharacters(value);
    }

    function onMessage(message) {
      console.log("📨 Message received:", message);
      setMessages((prev) => [...prev, message]);
    }

    function onError(error) {
      console.error("❌ Socket error:", error.message);
    }

    socket.on("connected", onConnected);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("metaverse-joined", onMetaverseJoined);
    socket.on("characters", onCharacters);
    socket.on("message", onMessage);
    socket.on("error", onError);

    return () => {
      socket.off("connected", onConnected);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("metaverse-joined", onMetaverseJoined);
      socket.off("characters", onCharacters);
      socket.off("message", onMessage);
      socket.off("error", onError);
    };
  }, [setCharacters, setMessages, setCurrentUser, setInMetaverse]);

  return null;
};
