import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";
import { exportTableToPdf } from "../../utils/pdfExport.js";

const STATUS_COLORS = { present: "bg-green-100 text-green-700", absent: "bg-red-100 text-red-600", late: "bg-amber-100 text-amber-700", leave: "bg-blue-100 text-blue-600" };

const StudentAttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/attendance/student/${user._id}`).then(({ data }) => { setRecords(data.records); setSummary(data.summary); }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleExport = () => {
    const rows = records.map((r) => {
      const d = new Date(r.date);
      return [d.toLocaleDateString("en-IN"), d.toLocaleDateString("en-IN", { weekday: "long" }), r.status, r.remarks || "—"];
    });
    exportTableToPdf(
      `Attendance Report — ${user?.name}`,
      ["Date", "Day", "Status", "Remarks"],
      rows,
      `attendance-${user?.name?.replace(/\s+/g, "_")}`
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
          <p className="text-sm text-slate-500">Full attendance record for the current session</p>
        </div>
        <button onClick={handleExport} disabled={records.length === 0}
          className="no-print flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      {summary && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Days", value: summary.total, color: "text-slate-800" },
            { label: "Present", value: summary.present, color: "text-green-600" },
            { label: "Absent", value: summary.total - summary.present, color: "text-red-500" },
            { label: "Percentage", value: `${summary.percentage}%`, color: parseFloat(summary.percentage) >= 75 ? "text-green-600" : "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Date</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Day</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Remarks</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">No attendance records found.</td></tr>
            ) : records.map((r) => {
              const d = new Date(r.date);
              return (
                <tr key={r._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{d.toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3 text-slate-500">{d.toLocaleDateString("en-IN", { weekday: "long" })}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[r.status] || "bg-slate-100 text-slate-500"}`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{r.remarks || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendancePage;
