import React, { useEffect, useState } from "react";
import { Megaphone, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", audience: "all" });

  const loadNotices = () => {
    api.get("/notices").then(({ data }) => setNotices(data.notices || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadNotices(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) { toast.error("Fill in title and message"); return; }
    setSaving(true);
    try {
      await api.post("/notices", form);
      toast.success("Notice posted!");
      setForm({ title: "", message: "", audience: "all" });
      setShowForm(false);
      loadNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post notice");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Megaphone className="h-6 w-6 text-orange-500" /> Notices & Circulars</h1>
          <p className="text-sm text-slate-500">School-wide announcements</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New Notice"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <input placeholder="Notice title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="h-24 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">
            <option value="all">Everyone</option>
            <option value="students">Students only</option>
            <option value="parents">Parents only</option>
            <option value="teachers">Teachers only</option>
          </select>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {saving ? "Posting..." : "Post Notice"}
          </button>
        </form>
      )}

      {loading ? <p className="text-sm text-slate-400">Loading...</p>
        : notices.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <Megaphone className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">No notices yet.</p>
          </div>
        ) : notices.map((n) => (
          <div key={n._id} className="mb-3 rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 capitalize">{n.audience}</span>
              <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-800">{n.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{n.message}</p>
          </div>
        ))
      }
    </div>
  );
}
