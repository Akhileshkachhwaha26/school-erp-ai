import React, { useEffect, useState } from "react";
import { Users, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", classId: "", rollNumber: "" });

  const loadStudents = () => {
    api.get("/users?role=student").then(({ data }) => setStudents(data.users || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
    api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.classId) { toast.error("Fill all required fields"); return; }
    setSaving(true);
    try {
      await api.post("/auth/register", {
        name: form.name, email: form.email, password: form.password, role: "student",
        studentProfile: { classId: form.classId, rollNumber: form.rollNumber },
      });
      toast.success("Student added!");
      setForm({ name: "", email: "", password: "", classId: "", rollNumber: "" });
      setShowForm(false);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" /> Students</h1>
          <p className="text-sm text-slate-500">Manage student records</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Student"}
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
            <input placeholder="Roll number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          </div>
          <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Adding..." : "Add Student"}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Class</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Roll No</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-400">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-400">No students yet.</td></tr>
            ) : students.map((s) => (
              <tr key={s._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-5 py-3 text-slate-500">{s.email}</td>
                <td className="px-5 py-3 text-slate-500">{s.studentProfile?.classId?.name} {s.studentProfile?.classId?.section}</td>
                <td className="px-5 py-3 text-slate-500">{s.studentProfile?.rollNumber || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
