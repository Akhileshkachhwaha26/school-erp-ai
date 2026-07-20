import React, { useEffect, useState } from "react";
import { CalendarOff, Plus, X, Check, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";

const CAN_REVIEW = ["admin", "teacher"];
const CAN_APPLY = ["student", "teacher"];
const STATUS_STYLE = { pending: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };

export default function LeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "" });

  const canApply = CAN_APPLY.includes(user?.role);
  const canReview = CAN_REVIEW.includes(user?.role);

  const loadLeaves = () => {
    api.get("/leaves").then(({ data }) => setLeaves(data.leaves || [])).catch(() => toast.error("Could not load leave applications")).finally(() => setLoading(false));
  };

  useEffect(() => { loadLeaves(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) { toast.error("Fill all fields"); return; }
    setSaving(true);
    try {
      await api.post("/leaves", form);
      toast.success("Leave application submitted!");
      setForm({ fromDate: "", toDate: "", reason: "" });
      setShowForm(false);
      loadLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally { setSaving(false); }
  };

  const handleReview = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/review`, { status });
      toast.success(`Leave ${status}`);
      loadLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarOff className="h-6 w-6 text-rose-500" /> Leave Applications
          </h1>
          <p className="text-sm text-slate-500">{canReview ? "Review and manage leave requests" : "Apply for leave and track status"}</p>
        </div>
        {canApply && (
          <button onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Apply for Leave"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleApply} className="mb-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">From</label>
              <input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">To</label>
              <input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>
          <textarea placeholder="Reason for leave" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="h-20 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <button type="submit" disabled={saving}
            className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60">
            {saving ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      )}

      {loading ? <p className="text-sm text-slate-400">Loading...</p>
        : leaves.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <CalendarOff className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">No leave applications yet.</p>
          </div>
        ) : leaves.map((l) => (
          <div key={l._id} className="mb-3 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  {canReview && <span className="text-sm font-semibold text-slate-800">{l.applicant?.name}</span>}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[l.status]}`}>{l.status}</span>
                </div>
                <p className="text-sm text-slate-600">{l.reason}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(l.fromDate).toLocaleDateString("en-IN")} → {new Date(l.toDate).toLocaleDateString("en-IN")}</p>
              </div>
              {canReview && l.status === "pending" && (
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => handleReview(l._id, "approved")}
                    className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => handleReview(l._id, "rejected")}
                    className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}
