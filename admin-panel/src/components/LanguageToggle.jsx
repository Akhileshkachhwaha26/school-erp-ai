import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      title="Switch language / भाषा बदलें"
      className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "EN" : "हि"}
    </button>
  );
}
