"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ServerMessage, ClientMessage } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL as string;

let globalWs: WebSocket | null = null;
let reconnectAttempt = 0;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
const subscribers = new Set<(msg: ServerMessage) => void>();
const connectionSubscribers = new Set<(connected: boolean) => void>();

function getGlobalWs(): WebSocket {
  if (globalWs) return globalWs;

  globalWs = new WebSocket(WS_URL);

  globalWs.onopen = () => {
    console.log("✅ WebSocket connected");
    reconnectAttempt = 0;
    connectionSubscribers.forEach((cb) => cb(true));
  };

  globalWs.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as ServerMessage;
      subscribers.forEach((cb) => cb(msg));
    } catch (e) {
      console.error("Failed to parse WS message:", e);
    }
  };

  globalWs.onclose = () => {
    console.log("🔌 WebSocket disconnected");
    globalWs = null;
    connectionSubscribers.forEach((cb) => cb(false));

    // Auto-reconnect
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 10000);
    reconnectAttempt++;
    reconnectTimeout = setTimeout(getGlobalWs, delay);
  };

  globalWs.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return globalWs;
}

export function useGameSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<ServerMessage[]>([]);

  useEffect(() => {
    // Subscribe to connection state changes
    const connCb = (c: boolean) => setConnected(c);
    connectionSubscribers.add(connCb);
    
    // Subscribe to messages
    const msgCb = (msg: ServerMessage) => {
      setLastMessage(msg);
      setMessageHistory((prev) => [...prev, msg]);
    };
    subscribers.add(msgCb);

    // Initial connection state
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      setConnected(true);
    }

    return () => {
      connectionSubscribers.delete(connCb);
      subscribers.delete(msgCb);
    };
  }, []);

  const connect = useCallback(() => {
    getGlobalWs();
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify(msg));
    } else {
      console.warn("WebSocket not connected, cannot send:", msg);
    }
  }, []);

  const disconnect = useCallback(() => {
    // We don't actually close the global socket anymore,
    // so pages can navigate without dropping the connection.
  }, []);

  return {
    connected,
    lastMessage,
    messageHistory,
    connect,
    send,
    disconnect,
  };
}
