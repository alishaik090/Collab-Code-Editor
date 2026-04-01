import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
});

const rooms = {};

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join-room", ({ roomId, name, role }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                members: {},
                code: "",
            };
        }

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

        const user = room.members[socket.id];
        if (!user || !user.canEdit) return;

        room.code = code;
        socket.to(roomId).emit("code-update", code);
    });

    socket.on("request-edit", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;

        const user = room.members[socket.id];
        if (!user) return;

        io.to(roomId).emit("edit-request", {
            socketId: socket.id,
            name: user.name,
        });
    });

    socket.on("approve-edit", ({ roomId, socketId }) => {
        const room = rooms[roomId];
        if (!room) return;

        const approver = room.members[socket.id];
        if (!approver || approver.role !== "host") return;

        if (!room.members[socketId]) return;

        room.members[socketId].canEdit = true;
        io.to(roomId).emit("member-list", room.members);
    });

    socket.on("revoke-edit", ({ roomId, socketId }) => {
        const room = rooms[roomId];
        if (!room) return;

        const approver = room.members[socket.id];
        if (!approver || approver.role !== "host") return;

        if (!room.members[socketId]) return;

        room.members[socketId].canEdit = false;
        io.to(roomId).emit("member-list", room.members);
    });

    socket.on("send-message", ({ roomId, message }) => {
        io.to(roomId).emit("new-message", message);
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.members[socket.id]) {
                delete room.members[socket.id];
                io.to(roomId).emit("member-list", room.members);
            }
        }
    });
});

server.listen(3001, () => {
    console.log("Server running on 3001");
});
