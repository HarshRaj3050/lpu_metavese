import { useAtom } from "jotai";
import { useState, useEffect, useRef } from "react";
import { messagesAtom, currentUserAtom, inMetaverseAtom, socket } from "./SocketManager";
import "../styles/ChatBox.css";

export const ChatBox = () => {
  const [messages] = useAtom(messagesAtom);
  const [currentUsername] = useAtom(currentUserAtom);
  const [inMetaverse] = useAtom(inMetaverseAtom);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() && inMetaverse) {
      socket.emit("message", inputValue);
      setInputValue("");
    }
  };

  const getMessageClass = (senderName) => {
    // Messages from the current user are marked as "own"
    return senderName === currentUsername ? "own" : "other";
  };

  // Don't show chat if not in metaverse
  if (!inMetaverse) {
    return null;
  }

  return (
    <div className={`chatbox-container ${isOpen ? "open" : "closed"}`}>
      <div className="chatbox-header">
        <h3>Chat {currentUsername && `(${currentUsername})`}</h3>
        <button
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Close" : "Open"}
        >
          {isOpen ? "−" : "+"}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${getMessageClass(msg.senderName)}`}>
                <div className="message-sender">{msg.senderName}</div>
                <div className="message-text">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chatbox-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              maxLength="200"
            />
            <button type="submit" disabled={!inputValue.trim()}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};
