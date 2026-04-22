import { useAtom } from "jotai";
import { useState, useEffect, useRef, useCallback } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { currentUserAtom, inMetaverseAtom, charactersAtom } from "./SocketManager";

// ── Agora config ──────────────────────────────────────────────
const APP_ID = import.meta.env.VITE_AGORA_APP_ID || "";

// Token server URL (same backend as your API)
const getTokenServerURL = () => {
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  if (isDev) return "http://localhost:3001";
  return import.meta.env.VITE_API_URL || "https://lpu-metavese.onrender.com";
};

// Create the Agora RTC client once (singleton)
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// ── Helper: hash username → hue for avatar colour ────────────
function usernameToHue(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ── Helper: username → Agora UID (same hash used in getUid) ──
function usernameToAgoraUid(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 1000000;
}

// ── Fetch token from backend ─────────────────────────────────
async function fetchAgoraToken(channelName, uid) {
  const baseURL = getTokenServerURL();
  const res = await fetch(
    `${baseURL}/api/agora/token?channel=${encodeURIComponent(channelName)}&uid=${uid}`
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch voice token");
  }
  const data = await res.json();
  return data.token;
}

// ── Main component ───────────────────────────────────────────
export const VoiceChat = () => {
  const [currentUsername] = useAtom(currentUserAtom);
  const [inMetaverse] = useAtom(inMetaverseAtom);
  const [characters] = useAtom(charactersAtom);

  // Build a UID → username map from the characters list
  const uidToUsername = {};
  characters.forEach((char) => {
    if (char.username) {
      uidToUsername[usernameToAgoraUid(char.username)] = char.username;
    }
  });

  // Voice state
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [error, setError] = useState(null);

  // Panel open/close
  const [isOpen, setIsOpen] = useState(false);

  // Refs
  const micTrackRef = useRef(null);
  const volumeIntervalRef = useRef(null);

  // ── Channel name derived from a shared room ────────────────
  const channelName = "metaverse-voice";

  // ── UID: use a numeric hash of the username ────────────────
  const getUid = useCallback(() => {
    if (!currentUsername) return null;
    let hash = 0;
    for (let i = 0; i < currentUsername.length; i++) {
      hash = ((hash << 5) - hash) + currentUsername.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 1000000;
  }, [currentUsername]);

  // ── Subscribe to remote user events ────────────────────────
  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.setVolume(200); // 200% volume boost
        user.audioTrack.play();
      }
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserUnpublished = (user) => {
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserJoined = () => {
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserLeft = () => {
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, []);

  // ── Volume-level polling for speaking indicators ───────────
  useEffect(() => {
    if (!isJoined) return;

    volumeIntervalRef.current = setInterval(() => {
      const speaking = new Set();

      // Local mic
      if (micTrackRef.current && !isMuted) {
        const localVol = micTrackRef.current.getVolumeLevel();
        if (localVol > 0.05) speaking.add("local");
      }

      // Remote users
      client.remoteUsers.forEach((user) => {
        if (user.audioTrack) {
          const vol = user.audioTrack.getVolumeLevel();
          if (vol > 0.05) speaking.add(user.uid);
        }
      });

      setSpeakingUsers(speaking);
    }, 200);

    return () => clearInterval(volumeIntervalRef.current);
  }, [isJoined, isMuted]);

  // ── Cleanup on unmount or leaving metaverse ────────────────
  useEffect(() => {
    if (!inMetaverse && isJoined) {
      leaveChannel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inMetaverse]);

  // ── Join voice channel ─────────────────────────────────────
  const joinChannel = async () => {
    if (!APP_ID) {
      setError("Agora App ID missing. Set VITE_AGORA_APP_ID in your .env file.");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const uid = getUid();

      // Fetch a secure token from the backend
      const token = await fetchAgoraToken(channelName, uid);

      await client.join(APP_ID, channelName, token, uid);

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "high_quality_stereo",
        AEC: true,  // Acoustic Echo Cancellation
        ANS: true,  // Automatic Noise Suppression
        AGC: true,  // Automatic Gain Control (boosts quiet voices)
      });
      micTrackRef.current = micTrack;

      await client.publish([micTrack]);

      setIsJoined(true);
      setRemoteUsers(Array.from(client.remoteUsers));
    } catch (err) {
      console.error("❌ Voice chat join error:", err);
      setError(err.message || "Failed to join voice channel");
    } finally {
      setIsConnecting(false);
    }
  };

  // ── Leave voice channel ────────────────────────────────────
  const leaveChannel = async () => {
    try {
      if (micTrackRef.current) {
        micTrackRef.current.close();
        micTrackRef.current = null;
      }
      await client.leave();
    } catch (err) {
      console.error("Voice chat leave error:", err);
    } finally {
      setIsJoined(false);
      setIsMuted(false);
      setRemoteUsers([]);
      setSpeakingUsers(new Set());
      clearInterval(volumeIntervalRef.current);
    }
  };

  // ── Toggle mute ────────────────────────────────────────────
  const toggleMute = async () => {
    if (!micTrackRef.current) return;
    await micTrackRef.current.setEnabled(isMuted); // toggle: was muted → enable, was unmuted → disable
    setIsMuted(!isMuted);
  };

  // Don't render if user isn't in metaverse
  if (!inMetaverse) return null;

  const totalUsers = isJoined ? 1 + remoteUsers.length : 0;

  return (
    <>
      {/* ── Scoped styles ─────────────────────────── */}
      <style>{`
        @keyframes vc-slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vc-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes vc-speaking {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { box-shadow: 0 0 0 4px rgba(34,197,94,0.15); }
        }
        @keyframes vc-spin {
          to { transform: rotate(360deg); }
        }
        .vc-panel       { animation: vc-slideIn 0.35s cubic-bezier(0.4,0,0.2,1); }
        .vc-speaking    { animation: vc-speaking 1s ease-in-out infinite; }
        .vc-btn {
          transition: all 0.2s ease;
        }
        .vc-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.15);
        }
        .vc-btn:active {
          transform: translateY(0);
        }
        .vc-list::-webkit-scrollbar       { width: 4px; }
        .vc-list::-webkit-scrollbar-track { background: transparent; }
        .vc-list::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      {/* ── Panel ─────────────────────────────────── */}
      <div
        className="vc-panel fixed bottom-5 left-5 z-[1000] min-w-[240px] max-w-[300px]"
        style={{ pointerEvents: "auto" }}
      >
        <div
          className="rounded-2xl overflow-hidden border border-white/[0.08]"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,15,30,0.9), rgba(25,25,50,0.85))",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* Header */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between px-4 py-[9px] cursor-pointer select-none transition-colors duration-200 hover:brightness-125"
            style={{ background: "rgba(0,0,0,1)" }}
          >
            <div className="flex items-center gap-2.5">
              {/* Mic icon */}
              <span className="text-lg">
                {isJoined ? (isMuted ? "🔇" : "🎙️") : "🔈"}
              </span>
              <span className="text-[13px] font-semibold text-white/90 tracking-[0.4px] uppercase">
                Voice
              </span>
              {isJoined && (
                <span
                  className="text-[11px] font-bold text-white px-2.5 py-[2px] rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow: "0 2px 8px rgba(34,197,94,0.4)",
                  }}
                >
                  {totalUsers}
                </span>
              )}
            </div>
            <span
              className="text-white/50 text-[14px] transition-transform duration-300 inline-block"
              style={{
                transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            >
              ▼
            </span>
          </div>

          {/* Body */}
          <div
            className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
            style={{
              maxHeight: isOpen ? "400px" : "0px",
            }}
          >
            <div className="p-4 flex flex-col gap-3">
              {/* Error */}
              {error && (
                <div
                  className="text-[12px] px-3 py-2 rounded-lg border"
                  style={{
                    color: "#fca5a5",
                    background: "rgba(239,68,68,0.1)",
                    borderColor: "rgba(239,68,68,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Join / Leave button */}
              {!isJoined ? (
                <button
                  onClick={joinChannel}
                  disabled={isConnecting}
                  className="vc-btn flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
                  }}
                >
                  {isConnecting ? (
                    <>
                      <span
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        style={{ animation: "vc-spin 0.6s linear infinite" }}
                      />
                      Connecting…
                    </>
                  ) : (
                    <>🎤 Join Voice</>
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  {/* Mute / Unmute */}
                  <button
                    onClick={toggleMute}
                    className="vc-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white border-none cursor-pointer"
                    style={{
                      background: isMuted
                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                        : "linear-gradient(135deg, #6366f1, #4f46e5)",
                      boxShadow: isMuted
                        ? "0 4px 14px rgba(239,68,68,0.3)"
                        : "0 4px 14px rgba(99,102,241,0.3)",
                    }}
                  >
                    {isMuted ? "🔇 Unmute" : "🎙️ Mute"}
                  </button>

                  {/* Leave */}
                  <button
                    onClick={leaveChannel}
                    className="vc-btn flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white border-none cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                      boxShadow: "0 4px 14px rgba(239,68,68,0.25)",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ── Connected users list ──────────── */}
              {isJoined && (
                <div className="vc-list flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
                  {/* Local user (you) */}
                  <div
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors duration-200 ${speakingUsers.has("local") ? "vc-speaking" : ""
                      }`}
                    style={{
                      background: speakingUsers.has("local")
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white uppercase flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, hsl(${usernameToHue(
                          currentUsername || "User"
                        )}, 65%, 50%), hsl(${usernameToHue(
                          currentUsername || "User"
                        )}, 65%, 40%))`,
                      }}
                    >
                      {(currentUsername || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-semibold text-violet-400 truncate">
                        {currentUsername || "You"}
                        <span className="text-[10px] text-violet-400/60 ml-1">
                          (You)
                        </span>
                      </span>
                      <span className="text-[10px] text-white/40">
                        {isMuted ? "Muted" : speakingUsers.has("local") ? "Speaking" : "Connected"}
                      </span>
                    </div>
                    {/* Status icon */}
                    <span className="ml-auto text-[14px]">
                      {isMuted ? "🔇" : speakingUsers.has("local") ? "🗣️" : "🎙️"}
                    </span>
                  </div>

                  {/* Remote users */}
                  {remoteUsers.map((user) => {
                    const isSpeaking = speakingUsers.has(user.uid);
                    const label = uidToUsername[user.uid] || `User ${user.uid}`;
                    return (
                      <div
                        key={user.uid}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors duration-200 ${isSpeaking ? "vc-speaking" : ""
                          }`}
                        style={{
                          background: isSpeaking
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white uppercase flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, hsl(${usernameToHue(
                              label
                            )}, 65%, 50%), hsl(${usernameToHue(
                              label
                            )}, 65%, 40%))`,
                          }}
                        >
                          {label.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-semibold text-white/85 truncate">
                            {label}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {isSpeaking ? "Speaking" : "Connected"}
                          </span>
                        </div>
                        <span className="ml-auto text-[14px]">
                          {isSpeaking ? "🗣️" : "🎙️"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hint when not joined */}
              {!isJoined && !error && (
                <p className="text-[11px] text-white/30 text-center m-0">
                  Join to talk with other players in the metaverse
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
