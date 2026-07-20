import React, { useEffect, useState } from "react";
import { Library, Plus, X, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";

const CAN_UPLOAD = ["admin", "teacher"];

export default function StudyMaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", classId: "", fileUrl: "" });

  const canUpload = CAN_UPLOAD.includes(user?.role);

  const loadMaterials = () => {
    api.get("/study-materials").then(({ data }) => setMaterials(data.materials || [])).catch(() => toast.error("Could not load materials")).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMaterials();
    if (canUpload) api.get("/users/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.classId || !form.fileUrl) { toast.error("Fill all fields"); return; }
    setSaving(true);
    try {
      await api.post("/study-materials", { ...form, fileType: "link" });
      toast.success("Study material added!");
      setForm({ title: "", subject: "", classId: "", fileUrl: "" });
      setShowForm(false);
      loadMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add material");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Library className="h-6 w-6 text-teal-600" /> Study Materials
          </h1>
          <p className="text-sm text-slate-500">Notes and resources shared by teachers</p>
        </div>
        {canUpload && (
          <button onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Material"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="mb-6 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
            <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          </div>
          <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400">
            <option value="">Select class</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <input placeholder="File link (Google Drive, Dropbox, etc.)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400" />
          <button type="submit" disabled={saving}
            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? "Adding..." : "Add Material"}
          </button>
        </form>
      )}

      {loading ? <p className="text-sm text-slate-400">Loading...</p>
        : materials.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <Library className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">No study materials yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {materials.map((m) => (
              <div key={m._id} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">{m.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{m.subject} · By {m.uploadedBy?.name || "Teacher"}</p>
                  <p className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                {m.fileUrl && (
                  <a href={m.fileUrl} target="_blank" rel="noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">
                    <Download className="h-3 w-3" /> Open
                  </a>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
