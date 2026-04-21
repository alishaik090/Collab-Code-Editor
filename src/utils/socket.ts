import { io } from "socket.io-client";

export const socket = io("https://collab-code-editor-1-3f3i.onrender.com", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 60000,
    transports: ["websocket", "polling"]
});
