"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameSocket } from "../../lib/ws-client";
import type {
  PlayerInfo,
  ServerMessage,
} from "../../lib/types";

type LobbyMode = "INITIAL" | "CREATE" | "JOIN" | "IN_ROOM";

export default function LobbyPage() {
  const router = useRouter();
  const { connected, lastMessage, connect, send, disconnect } = useGameSocket();

  const [mode, setMode] = useState<LobbyMode>("INITIAL");
  const [username, setUsername] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [capacity, setCapacity] = useState(6);
  
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [currentCapacity, setCurrentCapacity] = useState(6);
  const [error, setError] = useState<string | null>(null);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    const msg = lastMessage as any; // Cast to access custom properties if types don't match fully

    switch (msg.type) {
      case "USER_REGISTRY":
        setPlayers(msg.users);
        setCurrentRoomId(msg.roomId);
        setCurrentCapacity(msg.capacity);
        
        // Check if we're admin
        const me = msg.users.find((u: PlayerInfo) => u.username === username);
        if (me) {
          setIsAdmin(me.isAdmin);
          setMode("IN_ROOM");
          // Persist username and roomId for trade page
          sessionStorage.setItem("axxel_username", username);
          sessionStorage.setItem("axxel_roomId", msg.roomId);
        }
        break;
      case "GAME_STARTING":
      case "STATE_SYNC":
        router.push("/trade");
        break;
      case "ERROR":
        setError(msg.message);
        break;
    }
  }, [lastMessage, username, router]);

  const handleCreateRoom = useCallback(() => {
    if (!username.trim()) return;
    if (!connected) {
      connect();
      const checkAndJoin = setInterval(() => {
        send({ type: "CREATE_ROOM", username: username.trim(), capacity } as any);
        clearInterval(checkAndJoin);
      }, 300);
    } else {
      send({ type: "CREATE_ROOM", username: username.trim(), capacity } as any);
    }
  }, [username, capacity, connected, connect, send]);

  const handleJoinRoom = useCallback(() => {
    if (!username.trim() || !roomIdInput.trim()) return;
    if (!connected) {
      connect();
      const checkAndJoin = setInterval(() => {
        send({ type: "JOIN_ROOM", username: username.trim(), roomId: roomIdInput.trim() } as any);
        clearInterval(checkAndJoin);
      }, 300);
    } else {
      send({ type: "JOIN_ROOM", username: username.trim(), roomId: roomIdInput.trim() } as any);
    }
  }, [username, roomIdInput, connected, connect, send]);

  const handleStart = useCallback(() => {
    send({ type: "START_GAME" } as any);
  }, [send]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const renderInitial = () => (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <button
        onClick={() => setMode("CREATE")}
        className="px-6 py-4 rounded-xl font-bold text-[15px] text-white bg-buy-green hover:brightness-110 active:brightness-90 transition-all duration-200"
      >
        Create New Room
      </button>
      <button
        onClick={() => setMode("JOIN")}
        className="px-6 py-4 rounded-xl font-bold text-[15px] text-text-primary bg-panel-bg-alt border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200"
      >
        Join Existing Room
      </button>
    </div>
  );

  const renderCreate = () => (
    <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06] animate-fade-in-up space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-text-secondary mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(null); }}
          placeholder="Your name..."
          className="w-full bg-input-bg text-text-primary text-[14px] font-medium rounded-lg px-4 py-3 placeholder:text-input-placeholder outline-none border border-transparent focus:border-ring-stroke/40"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-text-secondary mb-2">Max Players (2-10)</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="2"
            max="10"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
            className="flex-1 accent-buy-green"
          />
          <span className="text-[14px] font-bold text-white w-6 text-center">{capacity}</span>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setMode("INITIAL")}
          className="px-4 py-3 rounded-lg font-bold text-[14px] text-text-secondary hover:text-text-primary bg-white/[0.02] transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleCreateRoom}
          disabled={!username.trim() || !connected}
          className="flex-1 px-6 py-3 rounded-lg font-bold text-[14px] text-white bg-buy-green hover:brightness-110 disabled:bg-disabled-grey transition-all"
        >
          Create Room
        </button>
      </div>
      {error && <p className="text-[12px] text-sell-red text-center">{error}</p>}
    </div>
  );

  const renderJoin = () => (
    <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06] animate-fade-in-up space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-text-secondary mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(null); }}
          placeholder="Your name..."
          className="w-full bg-input-bg text-text-primary text-[14px] font-medium rounded-lg px-4 py-3 placeholder:text-input-placeholder outline-none border border-transparent focus:border-ring-stroke/40"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-text-secondary mb-2">4-Digit Room Code</label>
        <input
          type="text"
          maxLength={4}
          value={roomIdInput}
          onChange={(e) => { setRoomIdInput(e.target.value.toUpperCase()); setError(null); }}
          placeholder="1234"
          className="w-full bg-input-bg text-text-primary text-[14px] font-medium rounded-lg px-4 py-3 placeholder:text-input-placeholder outline-none border border-transparent focus:border-ring-stroke/40 uppercase text-center tracking-widest"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setMode("INITIAL")}
          className="px-4 py-3 rounded-lg font-bold text-[14px] text-text-secondary hover:text-text-primary bg-white/[0.02] transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleJoinRoom}
          disabled={!username.trim() || roomIdInput.length !== 4 || !connected}
          className="flex-1 px-6 py-3 rounded-lg font-bold text-[14px] text-white bg-buy-green hover:brightness-110 disabled:bg-disabled-grey transition-all"
        >
          Join Room
        </button>
      </div>
      {error && <p className="text-[12px] text-sell-red text-center">{error}</p>}
    </div>
  );

  const renderInRoom = () => (
    <div className="space-y-5 animate-fade-in-up">
      <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06] text-center">
        <p className="text-[12px] text-text-secondary font-medium uppercase tracking-widest mb-1">Room Code</p>
        <h2 className="text-[32px] font-bold text-white tracking-[0.2em]">{currentRoomId}</h2>
      </div>

      <div className="bg-panel-bg rounded-xl p-6 border border-white/[0.06]">
        <h2 className="text-[14px] font-semibold text-text-primary mb-4">
          Players ({players.length}/{currentCapacity})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: currentCapacity }).map((_, idx) => {
            const player = players[idx];
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  player
                    ? "bg-white/[0.04] border border-white/[0.08]"
                    : "bg-white/[0.02] border border-dashed border-white/[0.06]"
                }`}
              >
                <div
                  className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-[14px] font-bold ${
                    player
                      ? player.connected
                        ? "bg-seat-fill text-white"
                        : "bg-seat-fill/40 text-white/40"
                      : "bg-white/[0.06] text-text-muted"
                  }`}
                >
                  {player ? player.username[0].toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-primary truncate">
                    {player ? player.username : "Open"}
                  </p>
                  {player?.isAdmin && (
                    <span className="text-[10px] text-[#D4A24E] font-medium">Admin</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-2">
          <button
            onClick={handleStart}
            disabled={players.length < 2}
            className="w-full py-4 rounded-xl font-bold text-[16px] text-white bg-gradient-to-r from-buy-green to-[#1EA00A] hover:brightness-110 active:brightness-90 shadow-[0_0_20px_rgba(39,185,15,0.2)] disabled:from-disabled-grey disabled:to-disabled-grey disabled:shadow-none transition-all duration-200"
          >
            Start Game
          </button>
          {players.length < 2 && (
            <p className="text-center text-[12px] text-text-muted">Need at least 2 players to start.</p>
          )}
          {error && <p className="text-center text-[12px] text-sell-red mt-2">{error}</p>}
        </div>
      ) : (
        <div className="text-center py-4 text-[14px] text-text-muted">
          Waiting for admin to start...
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <div className="absolute top-6 right-8 flex gap-3">
        <a href="/how-to-play" className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2 rounded-lg border border-white/10 hover:border-white/20">How to Play</a>
        <a href="/demo" className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2 rounded-lg border border-white/10 hover:border-white/20">Watch Demo</a>
      </div>

      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-[#D4A24E] text-[14px]">▲</span>
            <h1 className="text-[42px] font-extrabold tracking-[0.15em] text-text-primary">AXXEL</h1>
            <span className="text-[#D4A24E] text-[14px]">▲</span>
          </div>
          <p className="text-text-muted text-[12px] tracking-[0.2em] uppercase">Digit Sum Trading</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-buy-green" : "bg-sell-red"}`} />
          <span className="text-[11px] text-text-muted">{connected ? "Connected" : "Connecting..."}</span>
        </div>

        {mode === "INITIAL" && renderInitial()}
        {mode === "CREATE" && renderCreate()}
        {mode === "JOIN" && renderJoin()}
        {mode === "IN_ROOM" && renderInRoom()}
      </div>
    </div>
  );
}
