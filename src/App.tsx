import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./components/Auth/AuthPage";
import { TeacherDashboard } from "./components/Teacher/TeacherDashboard";
import { StudentDashboard } from "./components/Student/StudentDashboard";
import { Navbar } from "./components/Layout/Navbar";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0]">
        <Loader2 className="w-10 h-10 text-black animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">Initializing NoteAi</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={profile?.role}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pt-24 min-h-[calc(100vh-200px)]"
        >
          {profile?.role === "teacher" ? (
            <TeacherDashboard />
          ) : (
            <StudentDashboard />
          )}
        </motion.main>
      </AnimatePresence>
      
      <footer className="px-12 py-12 flex flex-col sm:flex-row border-t border-white/5 items-center justify-between gap-8 mt-20">
        <div className="flex gap-12 items-center">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-emerald"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">AI Engine Online</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Voice Isolation Priority</span>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 text-center sm:text-right leading-loose font-mono">
          © 2026 NoteAi Technologies • Designed for APJ AKTU<br/>
          Built with Firebase • Secure LectureLens Infra
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
