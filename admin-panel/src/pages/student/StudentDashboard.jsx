import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, BookOpen, FileText, Sparkles, Megaphone, Library } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";

const quickLinks = [
  { to: "/student/attendance", label: "My Attendance", icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
  { to: "/student/homework", label: "Homework", icon: BookOpen, color: "bg-amber-50 text-amber-600" },
  { to: "/student/results", label: "My Results", icon: FileText, color: "bg-green-50 text-green-600" },
  { to: "/student/doubt-solver", label: "AI Doubt Solver", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  { to: "/student/notices", label: "Notices", icon: Megaphone, color: "bg-red-50 text-red-600" },
  { to: "/student/materials", label: "Study Materials", icon: Library, color: "bg-teal-50 text-teal-600" },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [homework, setHomework] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get(`/attendance/student/${user._id}`).then(({ data }) => setAttendance(data.summary)).catch(() => {});
    const classId = user.studentProfile?.classId?._id || user.studentProfile?.classId;
    if (classId) {
      api.get(`/homework?classId=${classId}`).then(({ data }) => setHomework(data.homework?.slice(0, 3) || [])).catch(() => {});
    }
    api.get("/notices").then(({ data }) => setNotices(data.notices?.slice(0, 3) || [])).catch(() => {});
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-500">{greeting}</p>
        <h1 className="text-3xl font-bold text-slate-800">{user?.name} 👋</h1>
        <p className="mt-1 text-slate-500">
          {user?.studentProfile?.classId?.name} {user?.studentProfile?.classId?.section} &nbsp;·&nbsp; Roll No: {user?.studentProfile?.rollNumber || "—"}
        </p>
      </div>

      {attendance && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Attendance Overview</p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800">{attendance.percentage}%</p>
              <p className="text-xs text-slate-500">Overall</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">{attendance.present}</p>
              <p className="text-xs text-slate-500">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-500">{attendance.total - attendance.present}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </div>
            <div className="flex-1">
              <div className="h-3 rounded-full bg-slate-100">
                <div className={`h-3 rounded-full transition-all ${parseFloat(attendance.percentage) >= 75 ? "bg-green-500" : "bg-red-500"}`}
                  style={{ width: `${attendance.percentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-3 gap-4">
        {quickLinks.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md hover:-translate-y-0.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
            <span className="text-sm font-semibold text-slate-800">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Recent Homework</p>
          {homework.length === 0 ? <p className="text-sm text-slate-400">No homework assigned yet.</p>
            : homework.map((h) => (
              <div key={h._id} className="mb-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-slate-800">{h.title}</p>
                <p className="text-xs text-slate-500">{h.subject} · Due: {new Date(h.dueDate).toLocaleDateString("en-IN")}</p>
              </div>
            ))
          }
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Latest Notices</p>
          {notices.length === 0 ? <p className="text-sm text-slate-400">No notices yet.</p>
            : notices.map((n) => (
              <div key={n._id} className="mb-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
