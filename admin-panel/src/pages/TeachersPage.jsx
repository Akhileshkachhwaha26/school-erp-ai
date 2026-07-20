import React, { useEffect, useState } from "react";
import { UserCog, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", subjects: "", employeeId: "" });

  const loadTeachers = () => {
    api.get("/users?role=teacher").then(({ data }) => setTeachers(data.users || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadTeachers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error("Fill all required fields"); return; }
    setSaving(true);
    try {
      await api.post("/auth/register", {
        name: form.name, email: form.email, password: form.password, role: "teacher",
        teacherProfile: { subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean), employeeId: form.employeeId },
      });
      toast.success("Teacher added!");
      setForm({ name: "", email: "", password: "", subjects: "", employeeId: "" });
      setShowForm(false);
      loadTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add teacher");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><UserCog className="h-6 w-6 text-emerald-600" /> Teachers</h1>
          <p className="text-sm text-slate-500">Manage teaching staff</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Teacher"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            <input placeholder="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          </div>
          <input placeholder="Subjects (comma separated)" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <button type="submit" disabled={saving}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Adding..." : "Add Teacher"}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Subjects</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Employee ID</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-400">Loading...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-400">No teachers yet.</td></tr>
            ) : teachers.map((t) => (
              <tr key={t._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{t.name}</td>
                <td className="px-5 py-3 text-slate-500">{t.email}</td>
                <td className="px-5 py-3 text-slate-500">{t.teacherProfile?.subjects?.join(", ") || "—"}</td>
                <td className="px-5 py-3 text-slate-500">{t.teacherProfile?.employeeId || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
