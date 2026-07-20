import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, FileText, AlertTriangle } from "lucide-react";
import api from "../../api/client.js";

export default function TeacherAiToolsPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  // Report card generator state
  const [reportClassId, setReportClassId] = useState("");
  const [reportStudentId, setReportStudentId] = useState("");
  const [reportResult, setReportResult] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Attendance risk state
  const [riskClassId, setRiskClassId] = useState("");
  const [riskResult, setRiskResult] = useState(null);
  const [checkingRisk, setCheckingRisk] = useState(false);

  useEffect(() => {
    api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!reportClassId) { setStudents([]); return; }
    api.get(`/users?role=student&classId=${reportClassId}`).then(({ data }) => setStudents(data.users || [])).catch(() => {});
  }, [reportClassId]);

  const handleGenerateReport = async () => {
    if (!reportStudentId) { toast.error("Select a student first"); return; }
    setGeneratingReport(true);
    setReportResult(null);
    try {
      const { data } = await api.get(`/ai/report-card/${reportStudentId}`);
      setReportResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate report card");
    } finally { setGeneratingReport(false); }
  };

  const handleCheckRisk = async () => {
    if (!riskClassId) { toast.error("Select a class first"); return; }
    setCheckingRisk(true);
    setRiskResult(null);
    try {
      const { data } = await api.get(`/ai/attendance-risk/${riskClassId}`);
      setRiskResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not check attendance risk");
    } finally { setCheckingRisk(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-500" /> AI Tools
        </h1>
        <p className="text-sm text-slate-500">AI-powered report cards and attendance risk detection</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Report Card Generator */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <p className="font-semibold text-slate-800">AI Report Card Generator</p>
          </div>
          <p className="mb-4 text-xs text-slate-500">Generates a written report card summary based on a student's published exam results.</p>

          <select value={reportClassId} onChange={(e) => { setReportClassId(e.target.value); setReportStudentId(""); setReportResult(null); }}
            className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <select value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)} disabled={!students.length}
            className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 disabled:bg-slate-50">
            <option value="">Select student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.studentProfile?.rollNumber || "—"})</option>)}
          </select>
          <button onClick={handleGenerateReport} disabled={generatingReport}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {generatingReport ? "Generating..." : "Generate Report Card"}
          </button>

          {reportResult && (
            <div className="mt-4 rounded-lg bg-indigo-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">{reportResult.studentName}'s Report Card Remark</p>
              <p className="text-sm leading-relaxed text-slate-700">{reportResult.reportCardRemark}</p>
              <div className="mt-3 border-t border-indigo-100 pt-3">
                {reportResult.results.map((line, i) => (
                  <p key={i} className="text-xs text-slate-500">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Attendance Risk Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <p className="font-semibold text-slate-800">Attendance Risk Alerts</p>
          </div>
          <p className="mb-4 text-xs text-slate-500">Flags students in a class whose attendance has dropped below 75%.</p>

          <select value={riskClassId} onChange={(e) => { setRiskClassId(e.target.value); setRiskResult(null); }}
            className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <button onClick={handleCheckRisk} disabled={checkingRisk}
            className="w-full rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60">
            {checkingRisk ? "Checking..." : "Check Attendance Risk"}
          </button>

          {riskResult && (
            <div className="mt-4">
              <p className="mb-3 text-sm text-slate-600">
                <span className="font-semibold text-rose-600">{riskResult.atRiskCount}</span> of {riskResult.totalStudents} students below 75% attendance
              </p>
              {riskResult.atRiskStudents.length === 0 ? (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">✓ No students currently at risk. Great class attendance!</p>
              ) : (
                <div className="space-y-2">
                  {riskResult.atRiskStudents.map((s) => (
                    <div key={s.studentId} className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2">
                      <span className="text-sm font-medium text-slate-800">{s.name}</span>
                      <span className="text-sm font-bold text-rose-600">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
