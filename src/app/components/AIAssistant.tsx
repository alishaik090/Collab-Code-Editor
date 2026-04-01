import { useState } from "react";
import { Bot, Code2, AlertTriangle, Wand2, X, Check, Loader2 } from "lucide-react";
import { convertCode, explainErrors, fixCode } from "../../utils/aiApi";

type Props = {
  currentCode: string;
  currentLanguage: string;
  errorOutput: string;
  onUpdateCode: (newCode: string) => void;
};

export default function AIAssistant({
  currentCode,
  currentLanguage,
  errorOutput,
  onUpdateCode,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"convert" | "explain" | "fix">("convert");
  
  const [targetLang, setTargetLang] = useState("python");
  const [loading, setLoading] = useState(false);
  
  const [resultText, setResultText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleConvert = async () => {
    if (!currentCode.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await convertCode(currentCode, currentLanguage, targetLang);
      setResultText(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!currentCode.trim() || !errorOutput.trim()) {
      setErrorMsg("Please make sure you have both code and an error output active.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await explainErrors(currentCode, errorOutput, currentLanguage);
      setResultText(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Explanation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    if (!currentCode.trim() || !errorOutput.trim()) {
      setErrorMsg("Please make sure you have both code and an error output active.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fixCode(currentCode, errorOutput, currentLanguage);
      setResultText(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Fix failed.");
    } finally {
      setLoading(false);
    }
  };

  const applyFix = () => {
    if (resultText) {
      onUpdateCode(resultText);
      setIsOpen(false);
      setResultText("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-[350px] w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] z-[60] hover:scale-110"
        title="AI Assistant"
      >
        <Bot size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#161616]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="text-purple-500"/> AI Assistant
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                <X size={24} />
              </button>
            </div>

            <div className="flex border-b border-gray-800 bg-[#1a1a1a]">
              <button
                className={`flex-1 py-3 font-medium transition flex justify-center items-center gap-2 ${activeTab === "convert" ? "text-purple-400 border-b-2 border-purple-500" : "text-gray-400 hover:text-gray-200"}`}
                onClick={() => { setActiveTab("convert"); setResultText(""); setErrorMsg(""); }}
              >
                <Code2 size={18} /> Convert
              </button>
              <button
                className={`flex-1 py-3 font-medium transition flex justify-center items-center gap-2 ${activeTab === "explain" ? "text-blue-400 border-b-2 border-blue-500" : "text-gray-400 hover:text-gray-200"}`}
                onClick={() => { setActiveTab("explain"); setResultText(""); setErrorMsg(""); }}
              >
                <AlertTriangle size={18} /> Explain Error
              </button>
              <button
                className={`flex-1 py-3 font-medium transition flex justify-center items-center gap-2 ${activeTab === "fix" ? "text-green-400 border-b-2 border-green-500" : "text-gray-400 hover:text-gray-200"}`}
                onClick={() => { setActiveTab("fix"); setResultText(""); setErrorMsg(""); }}
              >
                <Wand2 size={18} /> Fix Error
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              {activeTab === "convert" && (
                <div className="flex flex-col gap-4">
                  <p className="text-gray-300">Convert current code from <strong className="capitalize">{currentLanguage}</strong> to:</p>
                  <select 
                    value={targetLang} 
                    onChange={e => setTargetLang(e.target.value)}
                    className="bg-[#2a2a2a] border border-gray-700 text-white rounded-lg p-3 outline-none focus:border-purple-500"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                  <button 
                    onClick={handleConvert}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Convert Code"}
                  </button>
                </div>
              )}

              {activeTab === "explain" && (
                <div className="flex flex-col gap-4">
                  <p className="text-gray-300">
                    Analyze the current code and the recent terminal error/output to explain what went wrong.
                  </p>
                  <button 
                    onClick={handleExplain}
                    disabled={loading || !errorOutput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Explain Latest Error"}
                  </button>
                  {!errorOutput.trim() && (
                    <p className="text-xs text-yellow-500">You must run the code and encounter an output/error first.</p>
                  )}
                </div>
              )}

              {activeTab === "fix" && (
                <div className="flex flex-col gap-4">
                  <p className="text-gray-300">
                    Ask AI to find the bugs based on the error output and suggest fixed code.
                  </p>
                  <button 
                    onClick={handleFix}
                    disabled={loading || !errorOutput.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Generate Fix"}
                  </button>
                  {!errorOutput.trim() && (
                    <p className="text-xs text-yellow-500">You must run the code and encounter an output/error first.</p>
                  )}
                </div>
              )}

              {/* Result Area */}
              {resultText && (
                <div className="mt-4 flex flex-col gap-3">
                  <h3 className="font-semibold text-white">AI Response:</h3>
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 text-gray-200 whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                    {resultText}
                  </div>
                  
                  {/* Action based on Tab */}
                  {(activeTab === "convert" || activeTab === "fix") && (
                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-purple-500/30 flex flex-col gap-3">
                      <p className="text-sm text-gray-400">
                        {activeTab === "convert" 
                          ? "Would you like to replace your current code with this converted version?" 
                          : "Do you want to apply this fix automatically, or will you fix it yourself?"}
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={applyFix}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                          <Check size={16} /> 
                          {activeTab === "convert" ? "Apply Converted Code" : "Auto-Correct in Editor"}
                        </button>
                        <button 
                          onClick={() => { setIsOpen(false); setResultText(""); }}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition"
                        >
                          I'll Do It Myself
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}
