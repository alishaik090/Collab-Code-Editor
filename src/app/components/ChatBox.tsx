import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";

type ChatMessage = {
  id: string;
  sender: string;
  content: string;
  type: "user" | "system";
  timestamp: number;
};

type Props = {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  currentUser: string;
};

export default function ChatBox({ messages, onSend, currentUser }: Props) {
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex-1 w-full flex flex-col bg-zinc-950/60 backdrop-blur-md relative overflow-hidden ring-1 ring-white/5">
      
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/5 bg-black/40 flex items-center gap-3 z-10 shrink-0 shadow-lg">
        <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg text-purple-400 ring-1 ring-white/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <MessageSquare size={16} className="fill-purple-500/20" />
        </div>
        <div className="font-semibold text-gray-200 tracking-wider text-sm">Team Chat</div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 text-sm custom-scrollbar bg-gradient-to-b from-transparent to-black/20"
      >
        {messages.slice(-50).map((msg) => {
          const isMe = msg.sender === currentUser;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {!isMe && (
                <span className="text-xs text-gray-500 mb-1 ml-1 font-medium tracking-wide">
                  {msg.sender}
                </span>
              )}
              <div 
                className={`px-4 py-2.5 rounded-2xl max-w-[85%] shadow-sm overflow-hidden break-words leading-relaxed ${
                  isMe 
                    ? "bg-purple-600/90 text-white rounded-tr-sm ring-1 ring-purple-500/50" 
                    : "bg-zinc-800 text-gray-200 rounded-tl-sm ring-1 ring-white/5"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 bg-black/60 border-t border-white/5 shrink-0">
        <div className="flex relative items-center group bg-zinc-900 rounded-full ring-1 ring-white/5 focus-within:ring-purple-500/50 transition-all shadow-inner">
          <input
            className="flex-1 bg-transparent px-5 py-2.5 outline-none text-sm text-gray-200 placeholder:text-gray-600"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            onBlur={() => window.scrollTo(0, 0)}
          />
          <button
            className="absolute right-1.5 bg-purple-600/90 hover:bg-purple-500 text-white p-2 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
