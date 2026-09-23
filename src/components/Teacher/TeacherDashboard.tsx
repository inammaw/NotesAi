import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { Classroom } from "../../types";
import { motion } from "motion/react";
import { Plus, Users, BookOpen, ChevronRight, LayoutGrid, Calendar, School } from "lucide-react";
import { ClassroomView } from "./ClassroomView";

export function TeacherDashboard() {
  const { profile } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    fetchClassrooms();
  }, [profile]);

  const fetchClassrooms = async () => {
    if (!profile) return;
    try {
      const q = query(collection(db, "classrooms"), where("teacherId", "==", profile.uid));
      const querySnapshot = await getDocs(q);
      setClassrooms(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Classroom)));
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !profile) return;
    
    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const docRef = await addDoc(collection(db, "classrooms"), {
        name: newClassName,
        teacherId: profile.uid,
        teacherName: profile.displayName || profile.email.split('@')[0],
        inviteCode,
        createdAt: serverTimestamp(),
      });
      
      const newClass: Classroom = {
        id: docRef.id,
        name: newClassName,
        description: "",
        teacherId: profile.uid,
        teacherName: profile.displayName || profile.email,
        inviteCode,
        createdAt: serverTimestamp() as any,
      };
      
      setClassrooms([...classrooms, newClass]);
      setNewClassName("");
      setShowCreate(false);
    } catch (error) {
      console.error("Error creating classroom:", error);
    }
  };

  if (selectedClassId) {
    const selectedClass = classrooms.find(c => c.id === selectedClassId);
    return <ClassroomView classroom={selectedClass!} onBack={() => setSelectedClassId(null)} />;
  }

  return (
    <div className="bg-black p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-8">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue mb-4">Faculty Workspace</h2>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-white uppercase font-display leading-[0.85]">
              My<br/><span className="text-white/40">Classrooms</span>
            </h1>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-brand-blue hover:text-white"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Launch Classroom
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classrooms.map((cls, idx) => (
            <motion.div 
              key={cls.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedClassId(cls.id)}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl hover:border-brand-blue hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-14">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center transition-all group-hover:bg-brand-blue group-hover:scale-110">
                  <LayoutGrid className="w-8 h-8 text-white/20 group-hover:text-white" />
                </div>
                <div className="bg-brand-blue/10 text-brand-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {cls.inviteCode}
                </div>
              </div>
              
              <h3 className="text-3xl font-black mb-2 tracking-tighter uppercase font-display leading-tight">{cls.name}</h3>
              <p className="text-[10px] font-bold text-white/30 mb-10 uppercase tracking-widest">Engineering Department • Semester 4</p>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-8">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-white/30">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">12</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/30">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">8 Recorded</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {classrooms.length === 0 && !loading && (
          <div className="bg-white/2 rounded-[4rem] border-2 border-dashed border-white/5 p-32 text-center">
            <School className="w-16 h-16 text-white/10 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-white/20 uppercase tracking-tighter">No active lecture rooms</h3>
            <p className="text-[10px] font-bold text-white/20 mt-4 uppercase tracking-[0.2em]">Deploy your first classroom to begin AI processing</p>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <motion.form 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleCreateClass}
            className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl text-black"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                <Plus className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">New Classroom</h2>
                <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Broadcast Settings</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase font-black text-black/30 ml-1 tracking-widest">Class Title</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. DATA STRUCTURES 101"
                  className="w-full bg-gray-100 border-none rounded-2xl py-5 px-8 mt-1 outline-none focus:ring-2 focus:ring-brand-blue font-bold tracking-tight"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <div className="flex gap-4 mt-12 pb-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-blue transition-all"
                >
                  Create Room
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
