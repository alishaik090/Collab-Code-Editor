import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { socket } from "../../utils/socket";

import NavigationBar from "../components/NavigationBar";
import CodeEditor from "../components/CodeEditor";
import Terminal from "../components/Terminal";
import ChatBox from "../components/ChatBox";
import AIAssistant from "../components/AIAssistant";

import { detectLanguage } from "../../utils/detectLanguage";
import { JUDGE0_LANGUAGE_ID } from "../../utils/languageMap";
import { runCode } from "../../utils/judge0";

type Member = {
    name: string;
    role: "host" | "member";
    canEdit: boolean;
};

type ChatMessage = {
    id: string;
    sender: string;
    content: string;
    type: "user";
    timestamp: number;
};

type Language = "python" | "c" | "cpp" | "java" | "unknown";

export default function Editor() {
    const location = useLocation();
    const state = location.state as
        | { userName: string; roomId: string; role: "host" | "member" }
        | undefined;

    if (!state) return <Navigate to="/" />;

    const { userName, roomId, role } = state;

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState<Language>("python");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const [members, setMembers] = useState<Record<string, Member>>({});
    const [myId, setMyId] = useState("");
    const [requests, setRequests] = useState<
        { socketId: string; name: string }[]
    >([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        setMyId(socket.id || "");

        socket.emit("join-room", { roomId, name: userName, role });

        socket.on("code-update", (newCode?: string) => {
            setCode(newCode ?? "");
        });

        socket.on("member-list", (list) => {
            setMembers(list);
        });

        socket.on("edit-request", (req) => {
            if (role === "host") {
                setRequests((prev) => [...prev, req]);
            }
        });

        socket.on("new-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("code-update");
            socket.off("member-list");
            socket.off("edit-request");
            socket.off("new-message");
        };
    }, []);

    const canEdit =
        role === "host" || members[myId]?.canEdit === true;

    useEffect(() => {
        const detected = detectLanguage(code);
        if (detected !== "unknown") setLanguage(detected);
    }, [code]);

    const handleCodeChange = (newCode: string) => {
        if (!canEdit) return;
        setCode(newCode);
        socket.emit("code-change", { roomId, code: newCode });
    };

    const handleRun = async () => {
        if (language === "unknown") return;

        setLoading(true);
        setOutput("");

        try {
            const result = await runCode(code, JUDGE0_LANGUAGE_ID[language], input);
            setOutput(
                result.compile_output ||
                result.stderr ||
                result.stdout ||
                "✔ Executed"
            );
        } finally {
            setLoading(false);
        }
    };

    const requestEdit = () => {
        socket.emit("request-edit", { roomId });
    };

    const togglePermission = (socketId: string, enable: boolean) => {
        socket.emit(enable ? "approve-edit" : "revoke-edit", {
            roomId,
            socketId,
        });
    };

    const sendMessage = (content: string) => {
        socket.emit("send-message", {
            roomId,
            message: {
                id: Date.now().toString(),
                sender: userName,
                content,
                type: "user",
                timestamp: Date.now(),
            },
        });
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden relative selection:bg-purple-500/30">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10 translate-y-[-50%]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none -z-10 translate-x-[20%] translate-y-[20%]" />

            <NavigationBar
                roomId={roomId}
                role={role}
                userName={userName}
                language={language}
                onRun={handleRun}
                loading={loading}
            />

            <div className="flex flex-1 overflow-hidden p-2 gap-2 h-full z-0">

                {/* LEFT (Editor & Terminal) */}
                <div className="flex flex-col flex-1 min-w-0 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5 bg-[#1e1e1e]/60 backdrop-blur-sm relative">
                    <div className="flex-[0.7] overflow-hidden relative min-h-0 flex flex-col">
                        <CodeEditor
                            code={code}
                            setCode={handleCodeChange}
                            language={language}
                            canEdit={canEdit}
                        />
                    </div>
                    <div className="flex-[0.3] min-h-[150px] flex flex-col">
                        <Terminal input={input} setInput={setInput} output={output} />
                    </div>
                </div>

                {/* RIGHT PANEL (Members & Chat) */}
                <div className="w-full md:w-[320px] lg:w-[340px] flex flex-col gap-2 relative shrink-0">

                    {/* Members Glass Panel */}
                    <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-950/60 backdrop-blur-md ring-1 ring-white/5 rounded-xl shadow-2xl flex flex-col">
                        <div className="p-3 border-b border-white/5 bg-black/40 flex items-center justify-between shadow-sm shrink-0">
                            <h3 className="font-semibold text-gray-200 tracking-wide text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                Participants
                            </h3>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-mono">
                                {Object.keys(members).length} online
                            </span>
                        </div>
                        
                        <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                            {role === "host" &&
                                requests.map((r) => (
                                    <div key={r.socketId} className="flex justify-between items-center bg-blue-500/10 p-2.5 rounded-lg ring-1 ring-blue-500/20">
                                        <span className="text-sm font-medium">{r.name}</span>
                                        <button
                                            className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold rounded-md shadow transition-colors"
                                            onClick={() => {
                                                togglePermission(r.socketId, true);
                                                setRequests((prev) =>
                                                    prev.filter((x) => x.socketId !== r.socketId)
                                                );
                                            }}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))}

                            {Object.entries(members).map(([id, m]) => (
                                <div key={id} className="flex justify-between items-center group py-1.5 px-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${m.canEdit ? "bg-emerald-400" : "bg-gray-600"}`} />
                                        <span className="text-sm tracking-wide text-gray-200 group-hover:text-white transition-colors">
                                            {m.name} {id === myId && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                                        </span>
                                    </div>

                                    {role === "host" && m.role === "member" && (
                                        <label className="relative inline-flex items-center cursor-pointer scale-75 origin-right">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={m.canEdit}
                                                onChange={(e) => togglePermission(id, e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                                        </label>
                                    )}

                                    {role === "member" && id === myId && !m.canEdit && (
                                        <button
                                            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 text-xs font-semibold rounded shadow transition-colors"
                                            onClick={requestEdit}
                                        >
                                            Ask Edit
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Glass Panel */}
                    <div className="flex-1 min-h-0 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                        <ChatBox messages={messages} onSend={sendMessage} currentUser={userName} />
                    </div>

                </div>
            </div>
            
            {/* AI ASSISTANT OVERLAY */}
            <AIAssistant 
                currentCode={code} 
                currentLanguage={language} 
                errorOutput={output} 
                onUpdateCode={handleCodeChange} 
            />
        </div>
    );
}
