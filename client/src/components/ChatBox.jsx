import { useAtom } from "jotai";
import { useState, useEffect, useRef } from "react";
import {
  messagesAtom,
  currentUserAtom,
  inMetaverseAtom,
  socket,
} from "./SocketManager";

export const ChatBox = () => {
  const [messages] = useAtom(messagesAtom);
  const [currentUsername] = useAtom(currentUserAtom);
  const [inMetaverse] = useAtom(inMetaverseAtom);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-open chat when a new message arrives from someone else
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderName !== currentUsername) {
      setIsOpen(true);
    }
  }, [messages.length]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() && inMetaverse) {
      socket.emit("message", inputValue);
      setInputValue("");
    }
  };

  if (!inMetaverse) return null;

  return (
    <>
      <style>{`
        .cb-messages::-webkit-scrollbar       { width: 6px; }
        .cb-messages::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .cb-messages::-webkit-scrollbar-thumb { background: #667eea; border-radius: 10px; }
        .cb-messages::-webkit-scrollbar-thumb:hover { background: #764ba2; }
        .cb-input:focus { border-color: #667eea; outline: none; }
      `}</style>

      <div
        className="fixed bottom-5 right-5 w-[350px] bg-white rounded-xl z-[1000] overflow-hidden flex flex-col transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "500px" : "50px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center bg-black text-white px-[15px] py-3 rounded-t-xl cursor-pointer select-none flex-shrink-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="m-0 text-base font-semibold">
            Chat {currentUsername && `(${currentUsername})`}
          </h3>
          <div className="bg-white/20 border-none text-white text-xl cursor-pointer px-2   rounded hover:bg-white/30 transition-colors duration-200 leading-none">
            <button
              className=""
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              title={isOpen ? "Close" : "Open"}
            >
              {isOpen ? "-" : "+"}
            </button>
          </div>
        </div>

        {/* Messages */}
        {isOpen && (
          <>
            <div className="cb-messages flex-1 overflow-y-auto p-3 bg-[#f5f5f5] flex flex-col gap-2">
              {messages.map((msg, index) => {
                const isOwn = msg.senderName === currentUsername;
                return (
                  <div
                    key={index}
                    className={`px-3 py-2 rounded-lg max-w-[85%] break-words flex flex-col gap-0.5
                      ${isOwn
                        ? "self-end bg-[rgb(102,102,255)] text-white"
                        : "self-start bg-white border border-[#ddd] text-[#333]"
                      }`}
                  >
                    <span className="text-[12px] font-semibold opacity-80">
                      {msg.senderName}
                    </span>
                    <span className="text-[14px] leading-[1.4]">
                      {msg.text}
                    </span>
                    <span className="text-[11px] opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="flex gap-1.5 p-2.5 bg-white border-t border-[#ddd] rounded-b-xl"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                maxLength="200"
                className="cb-input flex-1 border border-[#ddd] rounded-md px-3 py-2 text-sm transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-[rgb(102,102,255)] text-white border-none rounded-md px-4 py-2 font-semibold cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
};
