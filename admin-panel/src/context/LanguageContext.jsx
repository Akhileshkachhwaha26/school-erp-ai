import React, { createContext, useContext, useState } from "react";

// Translations cover the shared chrome (sidebars, common buttons, headings)
// across all four portals. Deep page-level content (e.g. AI-generated text,
// dynamic data from the database) is not translated since it's produced or
// entered at runtime, not static UI copy.
const translations = {
  en: {
    dashboard: "Dashboard",
    students: "Students",
    teachers: "Teachers",
    attendance: "Attendance",
    myAttendance: "My Attendance",
    markAttendance: "Mark Attendance",
    homework: "Homework",
    assignHomework: "Assign Homework",
    myResults: "My Results",
    results: "Results",
    publishResults: "Publish Results",
    fees: "Fees",
    notices: "Notices",
    postNotice: "Post Notice",
    leave: "Leave",
    leaveApplication: "Leave Application",
    studyMaterials: "Study Materials",
    messages: "Messages",
    aiInsights: "AI Insights",
    aiTools: "AI Tools",
    aiPerformance: "AI Performance",
    doubtSolver: "AI Doubt Solver",
    myStudents: "My Students",
    signOut: "Sign out",
    signIn: "Sign In",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    welcome: "Welcome",
    email: "Email Address",
    password: "Password",
    signInPortal: "Sign in to your portal",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    students: "छात्र",
    teachers: "शिक्षक",
    attendance: "उपस्थिति",
    myAttendance: "मेरी उपस्थिति",
    markAttendance: "उपस्थिति दर्ज करें",
    homework: "गृहकार्य",
    assignHomework: "गृहकार्य दें",
    myResults: "मेरे परिणाम",
    results: "परिणाम",
    publishResults: "परिणाम प्रकाशित करें",
    fees: "फीस",
    notices: "सूचनाएं",
    postNotice: "सूचना पोस्ट करें",
    leave: "छुट्टी",
    leaveApplication: "छुट्टी आवेदन",
    studyMaterials: "अध्ययन सामग्री",
    messages: "संदेश",
    aiInsights: "AI जानकारी",
    aiTools: "AI उपकरण",
    aiPerformance: "AI प्रदर्शन",
    doubtSolver: "AI शंका समाधान",
    myStudents: "मेरे छात्र",
    signOut: "साइन आउट",
    signIn: "साइन इन करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है...",
    welcome: "स्वागत है",
    email: "ईमेल पता",
    password: "पासवर्ड",
    signInPortal: "अपने पोर्टल में साइन इन करें",
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("erp_lang") || "en");

  const toggleLang = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("erp_lang", next);
  };

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return <LanguageContext.Provider value={{ lang, toggleLang, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
