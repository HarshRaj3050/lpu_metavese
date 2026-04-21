/**
 * WebSocket + Database Integration Examples
 * Add these functions to your components to use the database-backed WebSocket
 */

import { socket } from './SocketManager';

/**
 * Example 1: Send a message (saved to database)
 */
export const sendMessage = (messageText) => {
  if (messageText.trim()) {
    socket.emit('message', messageText);
    console.log('Message sent:', messageText);
  }
};

/**
 * Example 2: Update character position (saved to database)
 */
export const updateCharacterPosition = (x, y, z) => {
  const position = [x, y, z];
  socket.emit('move', position);
  console.log('Position updated:', position);
};

/**
 * Example 3: Listen for messages
 */
export const setupMessageListener = (onMessageReceived) => {
  socket.on('message', (messageData) => {
    console.log('Message received:', messageData);
    onMessageReceived(messageData);
  });
};

/**
 * Example 4: Listen for character updates
 */
export const setupCharacterListener = (onCharactersUpdate) => {
  socket.on('characters', (characters) => {
    console.log('Characters updated:', characters);
    onCharactersUpdate(characters);
  });
};

/**
 * Example 5: Handle connection events
 */
export const setupConnectionListeners = () => {
  socket.on('connect', () => {
    console.log('✓ Connected to WebSocket server');
  });

  socket.on('disconnect', () => {
    console.log('✗ Disconnected from WebSocket server');
  });

  socket.on('hello', () => {
    console.log('✓ Hello message received from server');
  });
};

/**
 * Example 6: React Hook for Chat Component
 */
export const useChatSocket = () => {
  const [messages, setMessages] = React.useState([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    // Setup connection listeners
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Setup message listener
    socket.on('message', (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
    };
  }, []);

  return {
    messages,
    isConnected,
    sendMessage: (text) => socket.emit('message', text),
  };
};

/**
 * Example 7: React Hook for Character Movement
 */
export const useCharacterSocket = () => {
  const [characters, setCharacters] = React.useState([]);

  React.useEffect(() => {
    // Listen for character updates
    socket.on('characters', (chars) => {
      setCharacters(chars);
    });

    // Request initial characters
    socket.emit('hello');

    return () => {
      socket.off('characters');
    };
  }, []);

  const moveCharacter = (x, y, z) => {
    socket.emit('move', [x, y, z]);
  };

  return {
    characters,
    moveCharacter,
  };
};

/**
 * Example 8: Usage in ChatBox Component
 * 
 * import { sendMessage, setupMessageListener } from './websocketExamples';
 * 
 * export const ChatBox = () => {
 *   const [messages, setMessages] = useState([]);
 * 
 *   useEffect(() => {
 *     setupMessageListener((msg) => {
 *       setMessages(prev => [...prev, msg]);
 *     });
 *   }, []);
 * 
 *   const handleSendMessage = (text) => {
 *     sendMessage(text);
 *   };
 * 
 *   return (
 *     <div>
 *       {messages.map((msg, idx) => (
 *         <p key={idx}>{msg.senderName}: {msg.text}</p>
 *       ))}
 *       <input 
 *         onKeyPress={(e) => {
 *           if (e.key === 'Enter') {
 *             handleSendMessage(e.target.value);
 *             e.target.value = '';
 *           }
 *         }}
 *       />
 *     </div>
 *   );
 * };
 */

/**
 * Example 9: Usage in 3D Experience Component
 * 
 * import { updateCharacterPosition, setupCharacterListener } from './websocketExamples';
 * 
 * export const Experience = () => {
 *   const [characters, setCharacters] = useState([]);
 * 
 *   useEffect(() => {
 *     setupCharacterListener((chars) => {
 *       setCharacters(chars);
 *     });
 *   }, []);
 * 
 *   const handlePlayerMove = (newPosition) => {
 *     updateCharacterPosition(newPosition.x, newPosition.y, newPosition.z);
 *   };
 * 
 *   return (
 *     <canvas>
 *       {characters.map(char => (
 *         <Character 
 *           key={char.id} 
 *           position={char.position}
 *           colors={{
 *             hair: char.hairColor,
 *             top: char.topColor,
 *             bottom: char.bottomColor
 *           }}
 *         />
 *       ))}
 *     </canvas>
 *   );
 * };
 */
