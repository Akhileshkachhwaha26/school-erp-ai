import React, { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";
import { exportTableToPdf } from "../../utils/pdfExport.js";

const StudentResultsPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/exams/results/student/${user._id}`).then(({ data }) => setResults(data.results || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const totalMarksObtained = results.reduce((a, r) => a + r.marksObtained, 0);
  const totalMaxMarks = results.reduce((a, r) => a + (r.exam?.totalMarks || 0), 0);
  const overallPct = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : null;

  const handleExport = () => {
    const rows = results.map((r) => {
      const passed = r.marksObtained >= (r.exam?.passingMarks || 0);
      return [r.exam?.title || "—", r.exam?.subject || "—", `${r.marksObtained} / ${r.exam?.totalMarks || "?"}`, r.grade || "—", passed ? "Pass" : "Fail"];
    });
    exportTableToPdf(`Result Report — ${user?.name}`, ["Exam", "Subject", "Marks", "Grade", "Status"], rows, `results-${user?.name?.replace(/\s+/g, "_")}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">My Results</h1><p className="text-sm text-slate-500">Published exam results</p></div>
        <button onClick={handleExport} disabled={results.length === 0}
          className="no-print flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      {overallPct && (
        <div className="mb-6 flex items-center gap-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-center"><p className="text-3xl font-bold text-slate-800">{overallPct}%</p><p className="text-xs text-slate-500">Overall Score</p></div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-center"><p className="text-2xl font-semibold text-slate-800">{totalMarksObtained}/{totalMaxMarks}</p><p className="text-xs text-slate-500">Total Marks</p></div>
          <div className="text-center"><p className="text-2xl font-semibold text-slate-800">{results.length}</p><p className="text-xs text-slate-500">Exams Taken</p></div>
        </div>
      )}

      {loading ? <p className="text-sm text-slate-400">Loading...</p>
        : results.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">No published results yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Exam</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Subject</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Marks</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Grade</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              </tr></thead>
              <tbody>
                {results.map((r) => {
                  const passed = r.marksObtained >= (r.exam?.passingMarks || 0);
                  return (
                    <tr key={r._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-800">{r.exam?.title || "—"}</td>
                      <td className="px-5 py-3 text-slate-600">{r.exam?.subject || "—"}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{r.marksObtained} / {r.exam?.totalMarks || "?"}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{r.grade || "—"}</td>
                      <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{passed ? "Pass" : "Fail"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
};

export default StudentResultsPage;
