import React from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User, Bell, Search, LayoutGrid, School } from "lucide-react";

export function Navbar() {
  const { user, profile, signOut } = useAuth();

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-xl z-40 px-6 sm:px-12 border-b border-white/5">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase font-display">NoteAi</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Classrooms</button>
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Resources</button>
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Knowledge Base</button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 group focus-within:border-brand-blue transition-all">
            <Search className="w-4 h-4 text-white/30 group-focus-within:text-brand-blue" />
            <input type="text" placeholder="CMD+K Search" className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-24 placeholder:text-white/20" />
          </div>
          
          <button className="relative text-white/40 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-brand-blue rounded-full" />
          </button>

          <div className="flex items-center gap-4 pl-8 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest">{profile?.displayName || user.email?.split('@')[0]}</p>
              <p className="text-[8px] uppercase font-black text-brand-blue mt-1 tracking-widest">{profile?.role}</p>
            </div>
            <div className="group relative">
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 hover:border-brand-blue transition-colors overflow-hidden">
                <User className="w-5 h-5 text-white/40" />
              </button>
              
              <div className="absolute top-full right-0 mt-4 w-56 bg-white rounded-[2rem] shadow-2xl overflow-hidden py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-6 py-3 border-b border-gray-50 mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Membership</p>
                </div>
                <button className="w-full text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-gray-50 flex items-center gap-3 transition-colors">
                   <User className="w-4 h-4 text-black/20" /> Profile
                </button>
                <button className="w-full text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-gray-50 flex items-center gap-3 transition-colors">
                   <LayoutGrid className="w-4 h-4 text-black/20" /> Archive
                </button>
                <div className="h-px bg-gray-50 my-2 mx-6" />
                <button 
                  onClick={signOut}
                  className="w-full text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-300" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
