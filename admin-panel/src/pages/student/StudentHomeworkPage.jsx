import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, CheckCircle, Clock, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";

const StudentHomeworkPage = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [aiHelp, setAiHelp] = useState({});
  const [aiLoading, setAiLoading] = useState(null);

  const classId = user?.studentProfile?.classId?._id || user?.studentProfile?.classId;

  useEffect(() => {
    if (!classId) return;
    api.get(`/homework?classId=${classId}`).then(({ data }) => setHomework(data.homework || [])).catch(() => {}).finally(() => setLoading(false));
  }, [classId]);

  const handleSubmit = async (homeworkId) => {
    setSubmitting(homeworkId);
    try {
      await api.post(`/homework/${homeworkId}/submit`, { attachment: { url: "", name: "Submitted via web portal" } });
      toast.success("Homework submitted!");
      const { data } = await api.get(`/homework?classId=${classId}`);
      setHomework(data.homework || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally { setSubmitting(null); }
  };

  const handleAiHelp = async (hw) => {
    setAiLoading(hw._id);
    try {
      const { data } = await api.post("/ai/homework-assistant", { homeworkId: hw._id, query: "Can you help me understand what this assignment is asking me to do?" });
      setAiHelp((prev) => ({ ...prev, [hw._id]: data.answer }));
    } catch (err) {
      toast.error(err.response?.data?.message || "AI unavailable");
    } finally { setAiLoading(null); }
  };

  const getMySubmission = (hw) => hw.submissions?.find((s) => s.student === user?._id || s.student?._id === user?._id);

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Homework</h1><p className="text-sm text-slate-500">All assignments for your class</p></div>

      {loading ? <p className="text-sm text-slate-400">Loading...</p>
        : homework.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">No homework assigned yet.</p>
          </div>
        ) : homework.map((hw) => {
          const mySubmission = getMySubmission(hw);
          const isOverdue = new Date() > new Date(hw.dueDate);
          const dueDate = new Date(hw.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

          return (
            <div key={hw._id} className="mb-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{hw.subject}</span>
                    {mySubmission && (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        mySubmission.status === "graded" ? "bg-green-100 text-green-700" :
                        mySubmission.status === "late" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {mySubmission.status === "graded" ? `✓ Graded: ${mySubmission.grade || ""}` : mySubmission.status === "late" ? "⚠ Submitted Late" : "✓ Submitted"}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">{hw.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{hw.description}</p>
                  {mySubmission?.feedback && (
                    <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><strong>Teacher's feedback:</strong> {mySubmission.feedback}</p>
                  )}
                  {aiHelp[hw._id] && (
                    <div className="mt-2 rounded-lg bg-purple-50 px-3 py-2">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-purple-500">AI Guidance</p>
                      <p className="whitespace-pre-line text-sm text-slate-700">{aiHelp[hw._id]}</p>
                    </div>
                  )}
                  <button onClick={() => handleAiHelp(hw)} disabled={aiLoading === hw._id}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700">
                    <Sparkles className="h-3.5 w-3.5" /> {aiLoading === hw._id ? "Thinking..." : "Ask AI for help"}
                  </button>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className={`flex items-center gap-1 text-xs ${isOverdue && !mySubmission ? "text-red-500" : "text-slate-500"}`}>
                    {isOverdue && !mySubmission ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    Due: {dueDate}
                  </div>
                  {!mySubmission ? (
                    <button onClick={() => handleSubmit(hw._id)} disabled={submitting === hw._id}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                      {submitting === hw._id ? "Submitting..." : "Mark as Done"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-medium text-green-600"><CheckCircle className="h-3.5 w-3.5" /> Done</div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  );
};

export default StudentHomeworkPage;
