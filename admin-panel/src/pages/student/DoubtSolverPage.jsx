import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Bot } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/client.js";

const SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science", "Physics", "Chemistry", "Biology", "History", "Geography"];

const DoubtSolverPage = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI tutor 👋 Ask me anything — I'll explain it step by step. Select a subject and type your question below." }
  ]);
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const { data } = await api.post("/ai/doubt-solver", { question: q, subject });
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || "AI is unavailable. Make sure GEMINI_API_KEY is set in backend .env";
      toast.error(errMsg);
      setMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${errMsg}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Sparkles className="h-6 w-6 text-purple-500" /> AI Doubt Solver</h1>
          <p className="text-sm text-slate-500">Powered by Google Gemini · Explains step by step</p>
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200">
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-emerald-600 text-white" : "bg-purple-100 text-purple-600"}`}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${m.role === "user" ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-slate-100 text-slate-800 rounded-tl-sm"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600"><Bot className="h-4 w-4" /></div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={`Ask a ${subject} question...`}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200" />
        <button onClick={handleSend} disabled={loading || !question.trim()}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50">
          <Send className="h-4 w-4" /> Ask
        </button>
      </div>
    </div>
  );
};

export default DoubtSolverPage;
