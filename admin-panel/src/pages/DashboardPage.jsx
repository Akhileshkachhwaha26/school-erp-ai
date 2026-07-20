import React, { useEffect, useState } from "react";
import { Users, UserCog, Wallet, AlertTriangle } from "lucide-react";
import api from "../api/client.js";

export default function DashboardPage() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, pendingFees: 0, atRisk: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/users?role=student"),
      api.get("/users?role=teacher"),
      api.get("/fees?status=pending"),
    ]).then(([s, t, f]) => {
      setStats((prev) => ({
        ...prev,
        students: s.data.count || 0,
        teachers: t.data.count || 0,
        pendingFees: f.data.fees?.length || 0,
      }));
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Students", value: stats.students, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Teachers", value: stats.teachers, icon: UserCog, color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending Fees", value: stats.pendingFees, icon: Wallet, color: "bg-amber-50 text-amber-600" },
    { label: "At-Risk Attendance", value: stats.atRisk, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-1 text-slate-500">Overview of your school's operations today</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Quick Links</h2>
        <p className="text-sm text-slate-500">Use the sidebar to manage students, teachers, attendance, homework, fees, notices, leave requests, study materials, and AI insights.</p>
      </div>
    </div>
  );
}
