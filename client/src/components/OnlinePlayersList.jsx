import { useAtom } from "jotai";
import { useState } from "react";
import { charactersAtom, currentUserAtom, inMetaverseAtom, socket } from "./SocketManager";

function usernameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 50%)`;
}

export const OnlinePlayersList = () => {
  const [characters] = useAtom(charactersAtom);
  const [currentUsername] = useAtom(currentUserAtom);
  const [inMetaverse] = useAtom(inMetaverseAtom);
  const [isOpen, setIsOpen] = useState(false);

  if (!inMetaverse) return null;

  const sortedPlayers = [...characters].sort((a, b) => {
    if (a.id === socket.id) return -1;
    if (b.id === socket.id) return 1;
    return (a.username || "").localeCompare(b.username || "");
  });

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeInItem {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .op-panel        { animation: slideIn 0.4s cubic-bezier(0.4,0,0.2,1); }
        .op-pulse::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 9999px;
          background: rgba(34,197,94,0.3);
          animation: pulseRing 2s ease-in-out infinite;
        }
        .op-item         { animation: fadeInItem 0.3s ease forwards; }
        .op-list::-webkit-scrollbar       { width: 4px; }
        .op-list::-webkit-scrollbar-track { background: transparent; }
        .op-list::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
        .op-list::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }
      `}</style>

      {/* Container */}
      <div className="fixed top-4 left-4 z-[100] min-w-[220px] max-w-[280px] pointer-events-auto transition-all duration-300">

        {/* Panel */}
        <div
          className="op-panel rounded-2xl overflow-hidden border border-white/[0.08]"
          style={{
            background: "linear-gradient(135deg, rgba(15,15,30,0.85), rgba(25,25,50,0.8))",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* Header */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? "Collapse player list" : "Expand player list"}
            className="flex items-center justify-between px-4 py-[14px] border-b border-white/[0.06] cursor-pointer select-none transition-all duration-200 hover:brightness-125"
            style={{ background: 'black' }}
          >
            <div className="flex items-center gap-[10px]">
              {/* Pulse dot */}
              <span className="op-pulse relative w-[10px] h-[10px] rounded-full bg-green-500 flex-shrink-0" />

              <span className="text-[13px] font-semibold text-white/90 tracking-[0.4px] uppercase">
                Online
              </span>

              <span
                className="text-[11px] font-bold text-white px-[10px] py-[1px] rounded-full min-w-[24px] text-center"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
                }}
              >
                {characters.length}
              </span>
            </div>

            <span
              className="text-white/50 text-[14px] ml-2 transition-transform duration-300"
              style={{ display: "inline-block", transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
            >
              ▼
            </span>
          </div>

          {/* Player List */}
          <div
            className="op-list overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ maxHeight: isOpen ? "300px" : "0px", padding: isOpen ? "8px 0" : "0", overflow: isOpen ? "auto" : "hidden" }}
          >
            {sortedPlayers.length === 0 ? (
              <div className="px-4 py-5 text-center text-white/35 text-[12px] italic">
                No players online
              </div>
            ) : (
              sortedPlayers.map((player, index) => {
                const isCurrentUser = player.id === socket.id;
                const displayName = player.username || `Player ${index + 1}`;
                const initial = displayName.charAt(0).toUpperCase();
                const avatarColor = usernameToColor(displayName);

                return (
                  <div
                    key={player.id}
                    className="op-item flex items-center gap-3 px-4 py-2 opacity-0 hover:bg-white/[0.04] transition-colors duration-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Avatar */}
                    <div
                      className="relative w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[14px] font-bold text-white uppercase flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      {initial}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-green-500 rounded-full border-2"
                        style={{ borderColor: "rgba(15,15,30,0.9)" }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-[13px] font-semibold truncate ${isCurrentUser ? "text-violet-400" : "text-white/[0.88]"}`}
                      >
                        {displayName}
                        {isCurrentUser && (
                          <span className="text-[10px] font-medium text-violet-400/80 tracking-[0.5px] ml-1">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-white/40">In Metaverse</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};