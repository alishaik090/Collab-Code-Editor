import { useState } from "react";
import { useNavigate } from "react-router-dom";

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function JoinRoom() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [roomId, setRoomId] = useState("");

    const handleCreate = () => {
        if (!name) return;

        navigate("/editor", {
            state: {
                userName: name,
                roomId: generateRoomId(),
                role: "host",
            },
        });
    };

    const handleJoin = () => {
        if (!name || !roomId) return;

        navigate("/editor", {
            state: {
                userName: name,
                roomId,
                role: "member",
            },
        });
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
            <div className="bg-zinc-900 p-6 rounded w-80 space-y-4">
                <h1 className="text-xl font-bold text-center">
                    Collaborative Code Editor
                </h1>

                <input
                    className="w-full p-2 bg-zinc-800 rounded"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <button
                    onClick={handleCreate}
                    className="w-full bg-green-600 py-2 rounded"
                >
                    Create New Room
                </button>

                <div className="text-center text-gray-400">OR</div>

                <input
                    className="w-full p-2 bg-zinc-800 rounded"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />

                <button
                    onClick={handleJoin}
                    className="w-full bg-blue-600 py-2 rounded"
                >
                    Join Room
                </button>
            </div>
        </div>
    );
}
