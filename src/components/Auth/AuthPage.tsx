import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { Role } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Github, LogIn, UserPlus, GraduationCap, School, Phone } from "lucide-react";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!role) throw new Error("Please select a role");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: role,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase font-display">NoteAi</span>
            <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-widest ml-2">Beta 0.1.0</span>
          </div>

          <h1 className="text-[70px] sm:text-[100px] leading-[0.85] font-black tracking-tighter uppercase mb-8 font-display">
            Pure<br/>Lectures.<br/><span className="text-brand-blue">Zero</span> Noise.
          </h1>
          <p className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-md font-medium">
            AI-powered voice isolation for classrooms. Capture your teacher's voice with precision, filtering out every distraction.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <div className="p-6 border border-white/10 rounded-2xl flex-1 bg-white/5 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-widest text-brand-blue font-bold mb-2">For Educators</div>
              <div className="text-sm text-white/80 leading-snug">Record, filter, and sync notes to your students instantly.</div>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl flex-1 bg-white/5 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-widest text-brand-emerald font-bold mb-2">For Students</div>
              <div className="text-sm text-white/80 leading-snug">Access clean summaries and AI-transcribed lectures using NoteAi.</div>
            </div>
          </div>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-md rounded-[40px] p-10 sm:p-14 text-black shadow-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 font-display uppercase italic">Join the Beta.</h2>
          <p className="text-black/40 text-sm mb-10 font-medium font-sans">Secure login for authorized classrooms.</p>
          
          <div className="w-full flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                isLogin ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                !isLogin ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"
              )}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 mb-6"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Choose your role</p>
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={cn(
                        "flex-1 flex flex-col items-center p-4 border-2 rounded-2xl transition-all",
                        role === "teacher" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <School className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Teacher</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole("student")}
                      className={cn(
                        "flex-1 flex flex-col items-center p-4 border-2 rounded-2xl transition-all",
                        role === "student" ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <GraduationCap className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Student</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="professor@noteai.edu"
                className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-brand-blue outline-none transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-brand-blue outline-none transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest px-2">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold py-5 rounded-2xl hover:bg-brand-blue transition-colors text-xs uppercase tracking-widest shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Access Dashboard" : "Create Account"}
            </button>
          </form>

          <div className="mt-8 space-y-6">
            <div className="relative flex items-center py-2 h-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase text-gray-300 font-black tracking-widest">or continue with</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleAuth}
                className="flex items-center justify-center gap-3 py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all font-sans"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                Google
              </button>
              <button 
                type="button"
                className="flex items-center justify-center gap-3 py-4 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 cursor-not-allowed"
              >
                <School className="w-4 h-4" />
                Apple
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-black/30">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold">JD</div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold">AM</div>
              <div className="w-9 h-9 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] text-purple-600 font-bold">+8k</div>
            </div>
            <span>Scale: Worldwide</span>
          </div>
        </motion.div>
      </div>

      <footer className="w-full max-w-6xl mt-20 pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex gap-12 items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">AI Engine Online</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Voice Filtering Active</span>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">
          Built for APJ Abdul Kalam Technological University Students
        </div>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
