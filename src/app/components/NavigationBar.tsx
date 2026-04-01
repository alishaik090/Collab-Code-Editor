import { Shield, Play, Loader2, Code2, Users } from "lucide-react";

type Props = {
  roomId: string;
  role: "host" | "member";
  userName: string;
  language: string;
  onRun: () => void;
  loading: boolean;
};

export default function NavigationBar({
  roomId,
  role,
  userName,
  language,
  onRun,
  loading,
}: Props) {
  return (
    <div className="h-16 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-6 border-b border-white/5 z-40 shrink-0">
      
      {/* Left Area - Status & Room Info */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 bgGradient text-transparent bg-clip-text font-bold text-lg tracking-wider">
          <Code2 className="text-purple-400 stroke-[1.5]" size={22} />
          JARVIS
        </div>

        <div className="h-6 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border
              ${role === "host" 
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}
          >
            {role === "host" && <Shield size={12} />}
            {role}
          </span>

          <span className="text-gray-300 font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            {userName}
          </span>
          
          <span className="text-gray-500 flex items-center gap-2 text-sm ml-2 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            <Users size={14} /> Room: <span className="text-gray-300 font-mono tracking-wide">{roomId}</span>
          </span>
        </div>
      </div>

      {/* Right Area - Run Controls */}
      <div className="flex items-center gap-6">
        <div className="text-gray-400 text-sm font-medium uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-md border border-white/5 flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
           {language}
        </div>

        <button
          onClick={onRun}
          disabled={loading}
          className={`group relative flex items-center gap-2 px-6 py-2 rounded-lg font-bold tracking-wide transition-all duration-300 overflow-hidden text-white shadow-lg ring-1 ring-white/10 ${
            loading 
              ? "bg-emerald-600/50 cursor-not-allowed" 
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/25 hover:ring-emerald-400/50 active:scale-95"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin text-white/90" size={18} />
          ) : (
            <>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Play className="fill-white stroke-white relative z-10" size={16} />
            </>
          )}
          <span className="relative z-10">{loading ? "Executing..." : "Run Code"}</span>
        </button>
      </div>
    </div>
  );
}
