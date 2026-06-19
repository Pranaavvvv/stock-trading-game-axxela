import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "../lib/types";
import { GameEngine, BroadcastFn } from "./gameEngine";

const PORT = parseInt(process.env.PORT || process.env.WS_PORT || "3001", 10);

// ── Rooms ──
const rooms = new Map<string, GameEngine>();

// ── Connection Registry ──
// Map WebSocket → user info
interface UserConnection {
  username: string;
  roomId: string;
}
const socketToUser = new Map<WebSocket, UserConnection>();

function createRoomBroadcast(roomId: string): BroadcastFn {
  return (msg: ServerMessage, targetUsername?: string) => {
    const payload = JSON.stringify(msg);

    if (targetUsername) {
      // Find the specific user's socket in this room
      for (const [ws, user] of socketToUser.entries()) {
        if (user.roomId === roomId && user.username === targetUsername && ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
          return;
        }
      }
      return;
    }

    // Broadcast to all users in this room
    for (const [ws, user] of socketToUser.entries()) {
      if (user.roomId === roomId && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  };
}

function generateRoomId(): string {
  let id;
  do {
    id = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(id));
  return id;
}

// ── WebSocket Server ──
const wss = new WebSocketServer({ port: PORT });

console.log(`🎰 AXXEL WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  console.log("🔌 New WebSocket connection");

  ws.on("message", (raw: Buffer) => {
    try {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString()) as ClientMessage;
      } catch {
        ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON" }));
        return;
      }

      switch (msg.type) {
        case "CREATE_ROOM": {
          const { username, capacity } = msg;

          if (!username || username.trim().length === 0) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Username is required" }));
            return;
          }
          if (capacity < 2 || capacity > 10) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Capacity must be between 2 and 10" }));
            return;
          }

          const trimmed = username.trim();
          const roomId = generateRoomId();

          const engine = new GameEngine(roomId, capacity, createRoomBroadcast(roomId));
          rooms.set(roomId, engine);

          socketToUser.set(ws, { username: trimmed, roomId });

          const result = engine.addPlayer(trimmed);
          if (!result.success) {
            ws.send(JSON.stringify({ type: "ERROR", message: result.error || "Cannot create room" }));
            socketToUser.delete(ws);
            rooms.delete(roomId);
            return;
          }

          console.log(`🏠 Room ${roomId} created by ${trimmed}`);
          break;
        }

        case "JOIN_ROOM": {
          const { username, roomId } = msg;

          if (!username || username.trim().length === 0) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Username is required" }));
            return;
          }
          if (!roomId) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Room ID is required" }));
            return;
          }

          const trimmed = username.trim();
          const upperRoomId = roomId.toUpperCase();

          const engine = rooms.get(upperRoomId);
          if (!engine) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Room not found" }));
            return;
          }

          // Check if this username is already connected with a different socket in this room
          for (const [existingWs, user] of socketToUser.entries()) {
            if (user.roomId === upperRoomId && user.username === trimmed && existingWs !== ws && existingWs.readyState === WebSocket.OPEN) {
              existingWs.close();
            }
          }

          socketToUser.set(ws, { username: trimmed, roomId: upperRoomId });

          const result = engine.addPlayer(trimmed);
          if (!result.success) {
            ws.send(JSON.stringify({ type: "ERROR", message: result.error || "Cannot join room" }));
            socketToUser.delete(ws);
            return;
          }

          console.log(`👤 ${trimmed} joined room ${upperRoomId}`);

          // If reconnecting mid-game, send full state sync
          if (engine.phase !== "LOBBY") {
            const sync = engine.getStateSyncForPlayer(trimmed);
            ws.send(JSON.stringify(sync));
          }
          break;
        }

        case "START_GAME": {
          const user = socketToUser.get(ws);
          if (!user) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Not joined" }));
            return;
          }
          const engine = rooms.get(user.roomId);
          if (!engine) return;

          const result = engine.startGame(user.username);
          if (!result.success) {
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: result.error || "Cannot start game"
              })
            );
          }
          break;
        }

        case "PLACE_ORDER": {
          const user = socketToUser.get(ws);
          if (!user) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Not joined" }));
            return;
          }
          const engine = rooms.get(user.roomId);
          if (!engine) return;

          engine.placeOrder(user.username, msg.side, msg.price);
          break;
        }

        case "TOGGLE_PAUSE": {
          const user = socketToUser.get(ws);
          if (!user) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Not joined" }));
            return;
          }
          const engine = rooms.get(user.roomId);
          if (!engine) return;

          const result = engine.togglePause(user.username);
          if (!result.success) {
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: result.error || "Cannot pause game"
              })
            );
          }
          break;
        }

        default:
          ws.send(JSON.stringify({ type: "ERROR", message: "Unknown message type" }));
      }
    } catch (err) {
      console.error("Caught error in message handler:", err);
    }
  });

  ws.on("close", () => {
    const user = socketToUser.get(ws);
    if (user) {
      console.log(`🔌 ${user.username} disconnected from ${user.roomId}`);
      socketToUser.delete(ws);

      const engine = rooms.get(user.roomId);
      if (engine) {
        engine.removePlayer(user.username);

        let hasActivePlayers = false;
        for (const u of socketToUser.values()) {
          if (u.roomId === user.roomId) {
            hasActivePlayers = true;
            break;
          }
        }
        if (!hasActivePlayers && engine.phase === "LOBBY") {
            console.log(`🗑️ Deleting empty room ${user.roomId}`);
            rooms.delete(user.roomId);
        }
      }
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});
