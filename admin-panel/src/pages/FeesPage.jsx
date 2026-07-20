import React, { useEffect, useState } from "react";
import { Wallet, Plus, X, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";

export default function FeesPage() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState("single"); // "single" | "bulk"
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ student: "", classId: "", feeType: "", amount: "", dueDate: "" });

  const loadFees = () => {
    api.get("/fees").then(({ data }) => setFees(data.fees || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFees();
    api.get("/users?role=student").then(({ data }) => setStudents(data.users || [])).catch(() => {});
    api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
  }, []);

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    if (!form.student || !form.feeType || !form.amount || !form.dueDate) { toast.error("Fill all fields"); return; }
    setSaving(true);
    try {
      const student = students.find((s) => s._id === form.student);
      await api.post("/fees", {
        student: form.student,
        classId: student?.studentProfile?.classId?._id || student?.studentProfile?.classId,
        feeType: form.feeType, amount: Number(form.amount), dueDate: form.dueDate,
      });
      toast.success("Fee record created!");
      setForm({ student: "", classId: "", feeType: "", amount: "", dueDate: "" });
      setShowForm(false);
      loadFees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create fee record");
    } finally { setSaving(false); }
  };

  const handleCreateBulk = async (e) => {
    e.preventDefault();
    if (!form.classId || !form.feeType || !form.amount || !form.dueDate) { toast.error("Fill all fields"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/fees/bulk", {
        classId: form.classId, feeType: form.feeType, amount: Number(form.amount), dueDate: form.dueDate,
      });
      toast.success(`Fee assigned to ${data.count} students!`);
      setForm({ student: "", classId: "", feeType: "", amount: "", dueDate: "" });
      setShowForm(false);
      loadFees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to bulk-assign fees");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Wallet className="h-6 w-6 text-red-500" /> Fee Management</h1>
          <p className="text-sm text-slate-500">Assign and track student fees</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Assign Fee"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          {/* Mode toggle */}
          <div className="mb-4 flex gap-2 rounded-lg bg-slate-100 p-1 w-fit">
            <button type="button" onClick={() => setMode("single")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${mode === "single" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
              Single Student
            </button>
            <button type="button" onClick={() => setMode("bulk")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${mode === "bulk" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
              <Users className="h-3.5 w-3.5" /> Whole Class (Bulk)
            </button>
          </div>

          {mode === "single" ? (
            <form onSubmit={handleCreateSingle} className="space-y-3">
              <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="">Select student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.studentProfile?.rollNumber || "no roll no"})</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Fee type (e.g. Tuition Q1)" value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                <input placeholder="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
              </div>
              <button type="submit" disabled={saving}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                {saving ? "Creating..." : "Create Fee Record"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateBulk} className="space-y-3">
              <p className="text-xs text-slate-500">This creates the same fee record for every student currently enrolled in the selected class.</p>
              <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                <option value="">Select class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section} ({c.students?.length || 0} students)</option>)}
              </select>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Fee type (e.g. Tuition Q1)" value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                <input placeholder="Amount per student (₹)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
              </div>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                <Users className="h-4 w-4" />
                {saving ? "Assigning..." : "Assign to Entire Class"}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Student</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Fee Type</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Due Date</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">Loading...</td></tr>
            ) : fees.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">No fee records yet.</td></tr>
            ) : fees.map((f) => (
              <tr key={f._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{f.student?.name}</td>
                <td className="px-5 py-3 text-slate-500">{f.feeType}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">₹{f.amount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-slate-500">{new Date(f.dueDate).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${f.status === "paid" ? "bg-green-100 text-green-700" : f.status === "overdue" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
