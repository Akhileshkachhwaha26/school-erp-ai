import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext.jsx";

// Auth
import LoginPage from "./pages/LoginPage.jsx";

// Admin
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import TeachersPage from "./pages/TeachersPage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import HomeworkPage from "./pages/HomeworkPage.jsx";
import FeesPage from "./pages/FeesPage.jsx";
import NoticesPage from "./pages/NoticesPage.jsx";
import AiInsightsPage from "./pages/AiInsightsPage.jsx";

// Student
import StudentLayout from "./layouts/StudentLayout.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentAttendancePage from "./pages/student/StudentAttendancePage.jsx";
import StudentHomeworkPage from "./pages/student/StudentHomeworkPage.jsx";
import StudentResultsPage from "./pages/student/StudentResultsPage.jsx";
import DoubtSolverPage from "./pages/student/DoubtSolverPage.jsx";

// Teacher
import TeacherLayout from "./layouts/TeacherLayout.jsx";
import { TeacherDashboard, TeacherAttendancePage, TeacherHomeworkPage } from "./pages/teacher/TeacherPages.jsx";
import TeacherResultsPage from "./pages/teacher/TeacherResultsPage.jsx";
import TeacherAiToolsPage from "./pages/teacher/TeacherAiToolsPage.jsx";

// Parent
import { ParentLayout, ParentDashboard, ParentPerformancePage, ParentFeesPage } from "./pages/parent/ParentPages.jsx";

// Shared (work across all roles)
import SharedNoticesPage from "./pages/shared/NoticesPage.jsx";
import LeavePage from "./pages/shared/LeavePage.jsx";
import StudyMaterialsPage from "./pages/shared/StudyMaterialsPage.jsx";
import MessagesPage from "./pages/shared/MessagesPage.jsx";

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/dashboard" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === "parent") return <Navigate to="/parent/dashboard" replace />;
  if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const RoleGuard = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <RoleRedirect />;
  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: "14px" } }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RoleRedirect />} />

        {/* ── ADMIN ── */}
        <Route path="/" element={<RoleGuard allowedRoles={["admin"]}><DashboardLayout /></RoleGuard>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="homework" element={<HomeworkPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="ai-insights" element={<AiInsightsPage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="materials" element={<StudyMaterialsPage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        {/* ── STUDENT ── */}
        <Route path="/student" element={<RoleGuard allowedRoles={["student"]}><StudentLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="homework" element={<StudentHomeworkPage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="notices" element={<SharedNoticesPage />} />
          <Route path="materials" element={<StudyMaterialsPage />} />
          <Route path="doubt-solver" element={<DoubtSolverPage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        {/* ── TEACHER ── */}
        <Route path="/teacher" element={<RoleGuard allowedRoles={["teacher"]}><TeacherLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="homework" element={<TeacherHomeworkPage />} />
          <Route path="results" element={<TeacherResultsPage />} />
          <Route path="notices" element={<SharedNoticesPage />} />
          <Route path="materials" element={<StudyMaterialsPage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="ai-tools" element={<TeacherAiToolsPage />} />
          <Route path="students" element={<TeacherDashboard />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        {/* ── PARENT ── */}
        <Route path="/parent" element={<RoleGuard allowedRoles={["parent"]}><ParentLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/parent/dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="homework" element={<StudentHomeworkPage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="fees" element={<ParentFeesPage />} />
          <Route path="notices" element={<SharedNoticesPage />} />
          <Route path="performance" element={<ParentPerformancePage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </>
  );
}

export default App;
