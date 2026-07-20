import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";

export default function HomeworkPage() {
  const [classes, setClasses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subject: "", classId: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
    api.get("/homework").then(({ data }) => setHomework(data.homework || [])).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.classId || !form.dueDate || !form.subject) { toast.error("Fill all fields"); return; }
    setSaving(true);
    try {
      await api.post("/homework", form);
      toast.success("Homework assigned!");
      setForm({ title: "", description: "", subject: "", classId: "", dueDate: "" });
      const { data } = await api.get("/homework");
      setHomework(data.homework || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookOpen className="h-6 w-6 text-amber-600" /> Homework</h1></div>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">New Assignment</p>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <textarea placeholder="Description / Instructions" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="col-span-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 h-20 resize-none" />
        </div>
        <button onClick={handleCreate} disabled={saving}
          className="mt-3 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
          {saving ? "Saving..." : "Assign Homework"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Title</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Subject</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Class</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Due Date</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Submissions</th>
          </tr></thead>
          <tbody>
            {homework.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">No homework assigned yet.</td></tr>
            ) : homework.map((h) => (
              <tr key={h._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{h.title}</td>
                <td className="px-5 py-3 text-slate-500">{h.subject}</td>
                <td className="px-5 py-3 text-slate-500">{h.class?.name} {h.class?.section}</td>
                <td className="px-5 py-3 text-slate-500">{new Date(h.dueDate).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">{h.submissions?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
