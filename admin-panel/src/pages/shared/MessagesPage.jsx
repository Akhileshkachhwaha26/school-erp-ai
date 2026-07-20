import React, { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const loadConversations = () => { api.get("/messages").then(({ data }) => setConversations(data.conversations || [])).catch(() => {}); };

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const openConversation = async (u) => {
    setActiveUser(u);
    try {
      const { data } = await api.get(`/messages/${u._id}`);
      setMessages(data.messages || []);
    } catch { toast.error("Could not load messages"); }
  };

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const { data } = await api.get(`/users?search=${encodeURIComponent(q)}`);
      setSearchResults((data.users || []).filter((u) => u._id !== user._id));
    } catch { /* ignore */ }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeUser) return;
    const content = text.trim();
    setText("");
    try {
      await api.post("/messages", { receiver: activeUser._id, content });
      setMessages((prev) => [...prev, { sender: { _id: user._id }, content, createdAt: new Date() }]);
      loadConversations();
    } catch { toast.error("Failed to send"); }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-72 shrink-0 rounded-xl border border-slate-200 bg-white flex flex-col">
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search people..." value={search} onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-slate-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(search.length >= 2 ? searchResults : conversations.map((c) => c.user)).map((u) => (
            <button key={u._id} onClick={() => openConversation(u)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 ${activeUser?._id === u._id ? "bg-slate-50" : ""}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">{u.name?.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                <p className="truncate text-xs text-slate-400 capitalize">{u.role}</p>
              </div>
            </button>
          ))}
          {search.length < 2 && conversations.length === 0 && (
            <p className="p-4 text-center text-xs text-slate-400">No conversations yet. Search someone above to start chatting.</p>
          )}
        </div>
      </div>

      <div className="flex-1 rounded-xl border border-slate-200 bg-white flex flex-col">
        {!activeUser ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-200" />
              <p className="text-sm text-slate-400">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-100 px-5 py-3">
              <p className="text-sm font-semibold text-slate-800">{activeUser.name}</p>
              <p className="text-xs text-slate-400 capitalize">{activeUser.role}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((m, i) => {
                const isMe = (m.sender?._id || m.sender) === user._id;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-slate-800 text-white rounded-tr-sm" : "bg-slate-100 text-slate-800 rounded-tl-sm"}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-4">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
              <button onClick={handleSend} className="rounded-xl bg-slate-800 px-4 py-2.5 text-white hover:bg-slate-700">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
