import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

/**
 * rooms = {
 *   roomId: {
 *     code: "",
 *     hostId: socketId,
 *     members: {
 *       socketId: { name, role, canEdit }
 *     }
 *   }
 * }
 */
const rooms = {};

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join-room", ({ roomId, name, role }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                code: "",
                hostId: null,
                members: {},
            };
        }

        if (role === "host") {
            rooms[roomId].hostId = socket.id;
        }

        // 🔒 CRITICAL: member starts LOCKED
        rooms[roomId].members[socket.id] = {
            name,
            role,
            canEdit: role === "host",
        };

        socket.emit("code-update", rooms[roomId].code);
        io.to(roomId).emit("member-list", rooms[roomId].members);
    });

    socket.on("code-change", ({ roomId, code }) => {
        const room = rooms[roomId];
        if (!room) return;
        if (!room.members[socket.id]?.canEdit) return;

        room.code = code;
        socket.to(roomId).emit("code-update", code);
    });

    socket.on("request-edit", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room || !room.hostId) return;

        io.to(room.hostId).emit("edit-request", {
            socketId: socket.id,
            name: room.members[socket.id].name,
        });
    });

    socket.on("approve-edit", ({ roomId, socketId }) => {
        const room = rooms[roomId];
        if (!room) return;

        room.members[socketId].canEdit = true;

        // 🔥 ALWAYS rebroadcast
        io.to(roomId).emit("member-list", room.members);
    });

    socket.on("revoke-edit", ({ roomId, socketId }) => {
        const room = rooms[roomId];
        if (!room) return;

        room.members[socketId].canEdit = false;

        // 🔥 ALWAYS rebroadcast
        io.to(roomId).emit("member-list", room.members);
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            if (rooms[roomId].members[socket.id]) {
                delete rooms[roomId].members[socket.id];
                io.to(roomId).emit("member-list", rooms[roomId].members);
            }
        }
    });
});

server.listen(3001, () => {
    console.log("Socket server running on port 3001");
});
