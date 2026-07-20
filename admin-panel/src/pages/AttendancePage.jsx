import React, { useEffect, useState } from "react";
import { ClipboardList, CheckCircle, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";
import { exportTableToPdf } from "../utils/pdfExport.js";

const STATUS = ["present", "absent", "late", "leave"];
const STATUS_COLOR = { present: "bg-green-100 text-green-700", absent: "bg-red-100 text-red-600", late: "bg-amber-100 text-amber-700", leave: "bg-blue-100 text-blue-600" };

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {}); }, []);

  useEffect(() => {
    if (!selectedClass) return;
    api.get(`/users?role=student&classId=${selectedClass}`).then(({ data }) => {
      setStudents(data.users || []);
      const init = {};
      data.users.forEach((s) => { init[s._id] = "present"; });
      setAttendance(init);
    }).catch(() => {});
  }, [selectedClass]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([student, status]) => ({ student, status }));
      await api.post("/attendance", { classId: selectedClass, date, records });
      toast.success("Attendance saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally { setSaving(false); }
  };

  const handleExport = () => {
    const className = classes.find((c) => c._id === selectedClass);
    const rows = students.map((s) => [s.name, s.studentProfile?.rollNumber || "—", attendance[s._id] || "—"]);
    exportTableToPdf(
      `Attendance — ${className ? `${className.name} ${className.section}` : "Class"} (${date})`,
      ["Student", "Roll No", "Status"],
      rows,
      `attendance-${date}`
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><ClipboardList className="h-6 w-6 text-blue-600" /> Attendance</h1>
        {students.length > 0 && (
          <button onClick={handleExport}
            className="no-print flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        )}
      </div>
      <div className="mb-4 flex gap-3">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
      </div>

      {students.length > 0 && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Student</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Roll No</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              </tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="px-5 py-3 text-slate-500">{s.studentProfile?.rollNumber || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {STATUS.map((st) => (
                          <button key={st} onClick={() => setAttendance((a) => ({ ...a, [s._id]: st }))}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize transition ${attendance[s._id] === st ? STATUS_COLOR[st] : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            <CheckCircle className="h-4 w-4" />
            {saving ? "Saving..." : `Save Attendance for ${students.length} Students`}
          </button>
        </>
      )}
    </div>
  );
}
