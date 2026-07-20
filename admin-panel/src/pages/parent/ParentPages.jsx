import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap, LayoutDashboard, ClipboardList, FileText, Wallet,
  Megaphone, Sparkles, LogOut, BookOpen, MessageCircle, CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/client.js";
import toast from "react-hot-toast";
import ChatbotWidget from "../../components/ChatbotWidget.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import LanguageToggle from "../../components/LanguageToggle.jsx";
import usePushNotifications from "../../hooks/usePushNotifications.js";

const navItems = [
  { to: "/parent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/parent/attendance", label: "Attendance", icon: ClipboardList },
  { to: "/parent/homework", label: "Homework", icon: BookOpen },
  { to: "/parent/results", label: "Results", icon: FileText },
  { to: "/parent/fees", label: "Fees", icon: Wallet },
  { to: "/parent/notices", label: "Notices", icon: Megaphone },
  { to: "/parent/performance", label: "AI Performance", icon: Sparkles },
  { to: "/parent/messages", label: "Messages", icon: MessageCircle },
];

export const ParentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  usePushNotifications("parent");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-slate-800 font-bold text-sm">School ERP</p><p className="text-slate-400 text-xs">Parent Portal</p></div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-6 pt-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-purple-50 text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0] || "P"}</div>
            <div className="flex-1 min-w-0"><p className="text-slate-800 text-xs font-semibold truncate">{user?.name}</p><p className="text-slate-400 text-[11px]">Parent</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto"><div className="max-w-5xl mx-auto p-8"><Outlet /></div></main>
      <ChatbotWidget />
    </div>
  );
};

const useChildId = () => {
  const { user } = useAuth();
  return user?.parentProfile?.children?.[0]?._id || user?.parentProfile?.children?.[0];
};

export const ParentDashboard = () => {
  const { user } = useAuth();
  const childId = useChildId();
  const [child, setChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (!childId) return;
    api.get(`/users/${childId}`).then(({ data }) => setChild(data.user)).catch(() => {});
    api.get(`/attendance/student/${childId}`).then(({ data }) => setAttendance(data.summary)).catch(() => {});
    api.get(`/fees/student/${childId}`).then(({ data }) => setFees(data.fees || [])).catch(() => {});
  }, [childId]);

  const pendingFees = fees.filter((f) => f.status === "pending");

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-500">Parent Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-800">Welcome, {user?.name} 👋</h1>
        {child && <p className="mt-1 text-slate-500">Monitoring: <strong>{child.name}</strong></p>}
      </div>
      {!childId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">⚠️ No child linked to your account yet. Contact school admin.</div>
      )}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Attendance</p>
          <p className={`text-3xl font-bold ${attendance && parseFloat(attendance.percentage) < 75 ? "text-red-500" : "text-green-600"}`}>{attendance?.percentage || 0}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Pending Fees</p>
          <p className="text-3xl font-bold text-red-500">{pendingFees.length}</p>
          <p className="text-xs text-slate-400 mt-1">₹{pendingFees.reduce((a, f) => a + f.amount, 0).toLocaleString("en-IN")} due</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Fees Paid</p>
          <p className="text-3xl font-bold text-green-600">{fees.filter((f) => f.status === "paid").length}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { to: "/parent/attendance", label: "View Attendance", icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
          { to: "/parent/results", label: "View Results", icon: FileText, color: "bg-green-50 text-green-600" },
          { to: "/parent/fees", label: "Pay Fees", icon: Wallet, color: "bg-red-50 text-red-600" },
          { to: "/parent/homework", label: "Homework", icon: BookOpen, color: "bg-amber-50 text-amber-600" },
          { to: "/parent/notices", label: "Notices", icon: Megaphone, color: "bg-orange-50 text-orange-600" },
          { to: "/parent/performance", label: "AI Report", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-md hover:-translate-y-0.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
            <span className="text-sm font-semibold text-slate-800">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const ParentPerformancePage = () => {
  const childId = useChildId();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (!childId) { toast.error("No child linked to your account"); return; }
    setLoading(true);
    try { const { data } = await api.get(`/ai/performance-analysis/${childId}`); setAnalysis(data); }
    catch (err) { toast.error(err.response?.data?.message || "AI unavailable"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Sparkles className="h-6 w-6 text-purple-500" /> AI Performance Report</h1></div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-5">
        <p className="text-sm text-slate-600 mb-4">Click below to generate an AI analysis of your child's progress.</p>
        <button onClick={runAnalysis} disabled={loading} className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
          <Sparkles className="h-4 w-4" /> {loading ? "Analyzing..." : "Generate AI Report"}
        </button>
      </div>
      {analysis && (
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-6">
          <div className="grid grid-cols-3 gap-4 mb-5 text-center">
            <div><p className="text-2xl font-bold text-slate-800">{analysis.rawData.attendancePercentage}%</p><p className="text-xs text-slate-500">Attendance</p></div>
            <div><p className="text-2xl font-bold text-slate-800">{analysis.rawData.submittedCount}</p><p className="text-xs text-slate-500">Homeworks</p></div>
            <div><p className="text-2xl font-bold text-slate-800">{analysis.rawData.resultsSummary?.length || 0}</p><p className="text-xs text-slate-500">Exams</p></div>
          </div>
          <div className="bg-white rounded-lg p-4"><p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{analysis.aiAnalysis}</p></div>
        </div>
      )}
    </div>
  );
};

export const ParentFeesPage = () => {
  const childId = useChildId();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const loadFees = () => {
    if (!childId) return;
    api.get(`/fees/student/${childId}`).then(({ data }) => setFees(data.fees || [])).finally(() => setLoading(false));
  };
  useEffect(() => { loadFees(); }, [childId]);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePay = async (fee) => {
    setPayingId(fee._id);
    try {
      const { data } = await api.post(`/fees/${fee._id}/create-order`);
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Could not load payment gateway"); setPayingId(null); return; }

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "School ERP & LMS",
        description: fee.feeType,
        handler: async (response) => {
          try {
            await api.post(`/fees/${fee._id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful!");
            loadFees();
          } catch { toast.error("Payment verification failed"); }
        },
        theme: { color: "#9333ea" },
        modal: { ondismiss: () => setPayingId(null) },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start payment");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-800">Fee Status</h1></div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Fee Type</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Amount</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Due Date</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"></th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">Loading...</td></tr>
              : fees.length === 0 ? <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">No fee records found.</td></tr>
              : fees.map((f) => (
                <tr key={f._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-800">{f.feeType}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">₹{f.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(f.dueDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${f.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{f.status}</span></td>
                  <td className="px-5 py-3">
                    {f.status !== "paid" && (
                      <button onClick={() => handlePay(f)} disabled={payingId === f._id}
                        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-60">
                        <CreditCard className="h-3.5 w-3.5" /> {payingId === f._id ? "Processing..." : "Pay Now"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
