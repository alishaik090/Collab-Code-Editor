import { TerminalSquare } from "lucide-react";

type TerminalProps = {
  input: string;
  setInput: (value: string) => void;
  output: string;
};

export default function Terminal({ input, setInput, output }: TerminalProps) {
  return (
    <div className="flex-1 w-full flex flex-col bg-[#1e1e1e]/80 backdrop-blur border-t border-r border-white/5 overflow-hidden relative ring-1 ring-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      
      {/* Chrome Header */}
      <div className="h-9 bg-zinc-950 flex items-center px-4 border-b border-white/5 gap-3 select-none z-20">
        <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
          <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-[inset_0_1px_rgba(255,255,255,0.2)]" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/90 shadow-[inset_0_1px_rgba(255,255,255,0.2)]" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-[inset_0_1px_rgba(255,255,255,0.2)]" />
        </div>
        <div className="flex-1 text-center font-mono text-[11px] text-gray-500 tracking-wider flex items-center justify-center gap-2">
          <TerminalSquare size={14} className="opacity-50" />
          bash - interactive
        </div>
      </div>
      
      {/* Pane Splitter */}
      <div className="flex flex-1 overflow-hidden font-mono divide-x divide-white/5 z-10 w-full relative">
        
        {/* Input */}
        <div className="flex-[0.4] p-5 flex flex-col bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors group relative">
          <div className="text-gray-500 mb-3 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
            Standard Input
          </div>
          <textarea
            className="flex-1 w-full bg-transparent outline-none resize-none text-gray-300 text-sm focus:text-white transition-colors custom-scrollbar placeholder:text-gray-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="[ stdin ] >"
          />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Output */}
        <div className="flex-[0.6] p-5 flex flex-col bg-black/60 relative group">
          <div className="text-gray-500 mb-3 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 relative z-10">
            <span className={`w-1.5 h-1.5 rounded-full ${output ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-gray-600"}`} />
            STDOUT / Return
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 leading-relaxed">
            <pre className="text-[13px] whitespace-pre-wrap text-emerald-400 font-medium tracking-tight">
              {output || (
                <span className="text-gray-600">Waiting for execution context...</span>
              )}
              {/* Blinking block cursor */}
              <span className="inline-block w-2 h-4 ml-1 bg-emerald-400/80 animate-[ping_1.5s_infinite] translate-y-[2px]" />
            </pre>
          </div>
          {/* Subtle background glow when active output exists */}
          {output && <div className="absolute inset-0 bg-emerald-500/[0.03] pointer-events-none" />}
        </div>

      </div>
    </div>
  );
}
