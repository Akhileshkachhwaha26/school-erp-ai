import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  GraduationCap, LayoutDashboard, Users, UserCog, ClipboardList,
  BookOpen, Wallet, Megaphone, Sparkles, LogOut, CalendarOff, Library, MessageCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ChatbotWidget from "../components/ChatbotWidget.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import usePushNotifications from "../hooks/usePushNotifications.js";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/teachers", label: "Teachers", icon: UserCog },
  { to: "/attendance", label: "Attendance", icon: ClipboardList },
  { to: "/homework", label: "Homework", icon: BookOpen },
  { to: "/fees", label: "Fees", icon: Wallet },
  { to: "/notices", label: "Notices", icon: Megaphone },
  { to: "/leave", label: "Leave Requests", icon: CalendarOff },
  { to: "/materials", label: "Study Materials", icon: Library },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/ai-insights", label: "AI Insights", icon: Sparkles },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  usePushNotifications("admin");

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <aside className="w-64 shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <GraduationCap className="h-5 w-5 text-indigo-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">School ERP</p>
              <p className="text-xs text-slate-400">& LMS Admin</p>
            </div>
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
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-400">Admin</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-8"><Outlet /></div>
      </main>

      <ChatbotWidget />
    </div>
  );
}
