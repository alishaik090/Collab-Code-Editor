import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const rooms = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

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

        // Notify everyone
        io.to(roomId).emit("system-message", {
            id: Date.now().toString(),
            sender: "System",
            content: `${name} joined the room`,
            type: "system",
            timestamp: Date.now(),
        });

        io.to(roomId).emit("member-list", rooms[roomId].members);

        // Send existing code to new member
        socket.emit("code-update", rooms[roomId].code);
    });

    socket.on("code-change", ({ roomId, code }) => {
        if (!rooms[roomId]) return;
        rooms[roomId].code = code;
        socket.to(roomId).emit("code-update", code);
    });

    socket.on("send-message", ({ roomId, message }) => {
        io.to(roomId).emit("new-message", message);
    });

    socket.on("request-edit", ({ roomId }) => {
        const user = rooms[roomId]?.members[socket.id];
        if (!user) return;

        io.to(roomId).emit("system-message", {
            id: Date.now().toString(),
            sender: "System",
            content: `${user.name} requested edit access`,
            type: "system",
            timestamp: Date.now(),
        });

        io.to(roomId).emit("edit-request", {
            socketId: socket.id,
            name: user.name,
        });
    });

    socket.on("approve-edit", ({ roomId, socketId }) => {
        if (!rooms[roomId]) return;

        rooms[roomId].members[socketId].canEdit = true;

        io.to(roomId).emit("system-message", {
            id: Date.now().toString(),
            sender: "System",
            content: `${rooms[roomId].members[socketId].name} was granted edit access`,
            type: "system",
            timestamp: Date.now(),
        });

        io.to(roomId).emit("member-list", rooms[roomId].members);
    });

    socket.on("revoke-edit", ({ roomId, socketId }) => {
        if (!rooms[roomId]) return;

        rooms[roomId].members[socketId].canEdit = false;

        io.to(roomId).emit("system-message", {
            id: Date.now().toString(),
            sender: "System",
            content: `${rooms[roomId].members[socketId].name}'s edit access was revoked`,
            type: "system",
            timestamp: Date.now(),
        });

        io.to(roomId).emit("member-list", rooms[roomId].members);
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            if (rooms[roomId].members[socket.id]) {
                const name = rooms[roomId].members[socket.id].name;

                delete rooms[roomId].members[socket.id];

                io.to(roomId).emit("system-message", {
                    id: Date.now().toString(),
                    sender: "System",
                    content: `${name} left the room`,
                    type: "system",
                    timestamp: Date.now(),
                });

                io.to(roomId).emit("member-list", rooms[roomId].members);
            }
        }
    });
});

server.listen(3001, () => {
    console.log("Server running on port 3001");
});
