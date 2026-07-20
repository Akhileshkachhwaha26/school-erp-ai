import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText, Plus, X } from "lucide-react";
import api from "../../api/client.js";

export default function TeacherResultsPage() {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [examForm, setExamForm] = useState({ title: "", classId: "", subject: "", date: "", totalMarks: "", passingMarks: "" });

  const [publishExam, setPublishExam] = useState("");
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
    api.get("/exams").then(({ data }) => setExams(data.exams || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!publishExam) return;
    const exam = exams.find((e) => e._id === publishExam);
    if (!exam) return;
    api.get(`/users?role=student&classId=${exam.class._id || exam.class}`).then(({ data }) => {
      setStudents(data.users || []);
      const init = {};
      data.users.forEach((s) => { init[s._id] = ""; });
      setMarks(init);
    }).catch(() => {});
  }, [publishExam, exams]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!examForm.title || !examForm.classId || !examForm.subject || !examForm.date || !examForm.totalMarks || !examForm.passingMarks) {
      toast.error("Fill all fields"); return;
    }
    setSaving(true);
    try {
      await api.post("/exams", { ...examForm, totalMarks: Number(examForm.totalMarks), passingMarks: Number(examForm.passingMarks) });
      toast.success("Exam scheduled!");
      setExamForm({ title: "", classId: "", subject: "", date: "", totalMarks: "", passingMarks: "" });
      setShowForm(false);
      const { data } = await api.get("/exams");
      setExams(data.exams || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule exam");
    } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    const results = Object.entries(marks).filter(([, v]) => v !== "").map(([student, marksObtained]) => ({ student, marksObtained: Number(marksObtained) }));
    if (results.length === 0) { toast.error("Enter marks for at least one student"); return; }
    setPublishing(true);
    try {
      await api.post(`/exams/${publishExam}/results`, { results });
      toast.success("Results published!");
      setPublishExam("");
      setMarks({});
      setStudents([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish results");
    } finally { setPublishing(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><FileText className="h-6 w-6 text-indigo-600" /> Exams & Results</h1>
          <p className="text-sm text-slate-500">Schedule exams and publish results</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Schedule Exam"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateExam} className="mb-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Exam title" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            <input placeholder="Subject" value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            <select value={examForm.classId} onChange={(e) => setExamForm({ ...examForm, classId: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              <option value="">Select class</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
            </select>
            <input type="date" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            <input type="number" placeholder="Total marks" value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            <input type="number" placeholder="Passing marks" value={examForm.passingMarks} onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
          </div>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
            {saving ? "Scheduling..." : "Schedule Exam"}
          </button>
        </form>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Publish Results</p>
        <select value={publishExam} onChange={(e) => setPublishExam(e.target.value)}
          className="mb-4 w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
          <option value="">Select an exam</option>
          {exams.map((e) => <option key={e._id} value={e._id}>{e.title} — {e.subject} ({e.class?.name} {e.class?.section})</option>)}
        </select>

        {students.length > 0 && (
          <>
            <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Student</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Marks Obtained</th>
                </tr></thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{s.name}</td>
                      <td className="px-4 py-2.5">
                        <input type="number" value={marks[s._id] || ""} onChange={(e) => setMarks((m) => ({ ...m, [s._id]: e.target.value }))}
                          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-indigo-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handlePublish} disabled={publishing}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {publishing ? "Publishing..." : "Publish Results"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
