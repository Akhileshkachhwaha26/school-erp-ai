import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { GraduationCap, LayoutDashboard, ClipboardList, BookOpen, FileText, Megaphone, MessageCircle, LogOut, Users, CalendarOff, Library, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ChatbotWidget from "../components/ChatbotWidget.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import usePushNotifications from "../hooks/usePushNotifications.js";

const navItems = [
  { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/teacher/attendance", label: "Mark Attendance", icon: ClipboardList },
  { to: "/teacher/homework", label: "Assign Homework", icon: BookOpen },
  { to: "/teacher/results", label: "Publish Results", icon: FileText },
  { to: "/teacher/notices", label: "Post Notice", icon: Megaphone },
  { to: "/teacher/materials", label: "Study Materials", icon: Library },
  { to: "/teacher/leave", label: "Leave", icon: CalendarOff },
  { to: "/teacher/ai-tools", label: "AI Tools", icon: Sparkles },
  { to: "/teacher/students", label: "My Students", icon: Users },
  { to: "/teacher/messages", label: "Messages", icon: MessageCircle },
];

const TeacherLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  usePushNotifications("teacher");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-slate-100">
          <div className="rounded-xl bg-blue-100 p-2">
            <GraduationCap className="h-5 w-5 text-blue-600" strokeWidth={2} />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 leading-tight">School ERP</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Teacher Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-4 pt-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user?.name?.charAt(0) || "T"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-400">Teacher</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8"><Outlet /></div>
      </main>
      <ChatbotWidget />
    </div>
  );
};

export default TeacherLayout;
