import React, { useEffect, useState } from "react";
import { Sparkles, AlertTriangle, FileText } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/client.js";

export default function AiInsightsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Performance analysis
  const [selectedStudent, setSelectedStudent] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Report card
  const [reportStudent, setReportStudent] = useState("");
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Attendance risk
  const [selectedClass, setSelectedClass] = useState("");
  const [riskData, setRiskData] = useState(null);
  const [checkingRisk, setCheckingRisk] = useState(false);

  useEffect(() => {
    api.get("/users?role=student").then(({ data }) => setStudents(data.users || [])).catch(() => {});
    api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
  }, []);

  const runAnalysis = async () => {
    if (!selectedStudent) { toast.error("Select a student first"); return; }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const { data } = await api.get(`/ai/performance-analysis/${selectedStudent}`);
      setAnalysis(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI unavailable");
    } finally { setAnalyzing(false); }
  };

  const runReportCard = async () => {
    if (!reportStudent) { toast.error("Select a student first"); return; }
    setGenerating(true);
    setReport(null);
    try {
      const { data } = await api.get(`/ai/report-card/${reportStudent}`);
      setReport(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate report card — student may not have published results yet");
    } finally { setGenerating(false); }
  };

  const runRiskCheck = async () => {
    if (!selectedClass) { toast.error("Select a class first"); return; }
    setCheckingRisk(true);
    setRiskData(null);
    try {
      const { data } = await api.get(`/ai/attendance-risk/${selectedClass}`);
      setRiskData(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not check attendance risk");
    } finally { setCheckingRisk(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">AI Insights</h1>
        <p className="text-sm text-slate-500">AI-powered performance analysis, report cards, and attendance risk detection</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Performance Analysis */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-800">
            <Sparkles className="h-4 w-4 text-purple-500" /> AI Performance Analysis
          </h2>
          <p className="mb-4 text-xs text-slate-500">Generates an AI summary of a student's attendance, exam results, and homework trends.</p>
          <div className="flex gap-2">
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
              <option value="">Select student</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <button onClick={runAnalysis} disabled={analyzing}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
              {analyzing ? "..." : "Analyze"}
            </button>
          </div>
          {analysis && (
            <div className="mt-4 rounded-lg bg-purple-50 p-4">
              <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-slate-800">{analysis.rawData.attendancePercentage}%</p><p className="text-[10px] text-slate-500">Attendance</p></div>
                <div><p className="text-lg font-bold text-slate-800">{analysis.rawData.submittedCount}</p><p className="text-[10px] text-slate-500">Homework</p></div>
                <div><p className="text-lg font-bold text-slate-800">{analysis.rawData.resultsSummary?.length || 0}</p><p className="text-[10px] text-slate-500">Exams</p></div>
              </div>
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">{analysis.aiAnalysis}</p>
            </div>
          )}
        </div>

        {/* Attendance Risk */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-800">
            <AlertTriangle className="h-4 w-4 text-red-500" /> Attendance Risk Detection
          </h2>
          <p className="mb-4 text-xs text-slate-500">Flags students in a class whose attendance has dropped below 75%.</p>
          <div className="flex gap-2">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
              <option value="">Select class</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
            </select>
            <button onClick={runRiskCheck} disabled={checkingRisk}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
              {checkingRisk ? "..." : "Check"}
            </button>
          </div>
          {riskData && (
            <div className="mt-4 rounded-lg bg-red-50 p-4">
              <p className="mb-2 text-xs font-semibold text-red-700">{riskData.atRiskCount} of {riskData.totalStudents} students below 75% attendance</p>
              {riskData.atRiskStudents.length === 0 ? (
                <p className="text-xs text-slate-500">🎉 No students at risk!</p>
              ) : riskData.atRiskStudents.map((s) => (
                <div key={s.studentId} className="flex justify-between text-xs py-1">
                  <span className="text-slate-700">{s.name}</span>
                  <span className="font-semibold text-red-600">{s.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Card Generator */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-800">
          <FileText className="h-4 w-4 text-teal-600" /> AI Report Card Generator
        </h2>
        <p className="mb-4 text-xs text-slate-500">Generates a written report card remark based on a student's published exam results.</p>
        <div className="flex gap-2 max-w-lg">
          <select value={reportStudent} onChange={(e) => setReportStudent(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400">
            <option value="">Select student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <button onClick={runReportCard} disabled={generating}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
        {report && (
          <div className="mt-4 rounded-lg bg-teal-50 p-4">
            <p className="mb-2 text-xs font-semibold text-teal-700">{report.studentName} — Subject-wise Results</p>
            <ul className="mb-3 text-xs text-slate-600 list-disc list-inside">
              {report.results.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
            <div className="rounded-lg bg-white p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-teal-600">Report Card Remark</p>
              <p className="text-sm leading-relaxed text-slate-700">{report.reportCardRemark}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
