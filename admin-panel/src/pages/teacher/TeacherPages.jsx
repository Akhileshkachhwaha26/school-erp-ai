import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, BookOpen, ClipboardList, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);

  useEffect(() => { api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {}); }, []);

  const myClasses = classes.filter((c) =>
    user?.teacherProfile?.classesAssigned?.some((id) => (id?._id || id)?.toString() === c._id?.toString())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Welcome, {user?.name} 👋</h1>
        <p className="mt-1 text-slate-500">{user?.teacherProfile?.subjects?.join(", ") || "Teacher"} · {user?.teacherProfile?.employeeId || ""}</p>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Classes Assigned", value: myClasses.length, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
          { label: "Total Students", value: myClasses.reduce((a, c) => a + (c.students?.length || 0), 0), icon: Users, color: "bg-green-50 text-green-600" },
          { label: "Subjects", value: user?.teacherProfile?.subjects?.length || 0, icon: ClipboardList, color: "bg-amber-50 text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">My Classes</p>
        {myClasses.length === 0 ? <p className="text-sm text-slate-400">No classes assigned yet.</p>
          : myClasses.map((c) => (
            <div key={c._id} className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
              <div>
                <p className="font-medium text-slate-800">{c.name} - Section {c.section}</p>
                <p className="text-xs text-slate-500">{c.students?.length || 0} students · {c.subjects?.join(", ")}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export const TeacherAttendancePage = () => {
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

  const STATUS = ["present", "absent", "late", "leave"];
  const STATUS_COLOR = { present: "bg-green-100 text-green-700", absent: "bg-red-100 text-red-600", late: "bg-amber-100 text-amber-700", leave: "bg-blue-100 text-blue-600" };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1></div>
      <div className="mb-4 flex gap-3">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400">
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
      </div>

      {students.length > 0 && (
        <>
          <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
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
};

export const TeacherHomeworkPage = () => {
  const [classes, setClasses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subject: "", classId: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
    api.get("/homework").then(({ data }) => setHomework(data.homework || [])).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.classId || !form.dueDate || !form.subject) { toast.error("Fill all fields"); return; }
    setSaving(true);
    try {
      await api.post("/homework", form);
      toast.success("Homework assigned!");
      setForm({ title: "", description: "", subject: "", classId: "", dueDate: "" });
      const { data } = await api.get("/homework");
      setHomework(data.homework || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Assign Homework</h1></div>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">New Assignment</p>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
          <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
          <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400">
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
          <textarea placeholder="Description / Instructions" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="col-span-2 h-20 resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
        </div>
        <button onClick={handleCreate} disabled={saving}
          className="mt-3 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Saving..." : "Assign Homework"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Title</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Subject</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Class</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Due Date</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Submissions</th>
          </tr></thead>
          <tbody>
            {homework.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">No homework assigned yet.</td></tr>
            ) : homework.map((h) => (
              <tr key={h._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{h.title}</td>
                <td className="px-5 py-3 text-slate-500">{h.subject}</td>
                <td className="px-5 py-3 text-slate-500">{h.class?.name} {h.class?.section}</td>
                <td className="px-5 py-3 text-slate-500">{new Date(h.dueDate).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">{h.submissions?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
