import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { Classroom, Note } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  GraduationCap, 
  FileText,
  Sparkles,
  Download,
  Award
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export function StudentDashboard() {
  const { profile, user } = useAuth();
  const [enrolledClasses, setEnrolledClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchEnrolledClasses();
    }
  }, [user]);

  const fetchEnrolledClasses = async () => {
    if (!user) return;
    try {
      // Step 1: Get all classroom IDs where student is enrolled
      const q = query(collection(db, "classrooms")); // In production, use a decentralized index or array
      const allSnapshot = await getDocs(q);
      
      const enrolled: Classroom[] = [];
      for (const classroomDoc of allSnapshot.docs) {
        const studentDoc = await getDocs(query(collection(db, "classrooms", classroomDoc.id, "students"), where("__name__", "==", user.uid)));
        if (!studentDoc.empty) {
          enrolled.push({ ...classroomDoc.data(), id: classroomDoc.id } as Classroom);
        }
      }
      setEnrolledClasses(enrolled);
    } catch (error) {
      console.error("Error fetching enrolled classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || !user) return;
    setError("");

    try {
      const q = query(collection(db, "classrooms"), where("inviteCode", "==", inviteCode.toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setError("Invalid invite code. Please check with your teacher.");
        return;
      }

      const classroomId = snap.docs[0].id;
      await setDoc(doc(db, "classrooms", classroomId, "students", user.uid), {
        enrolledAt: serverTimestamp(),
      });

      setShowJoin(false);
      setInviteCode("");
      fetchEnrolledClasses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (selectedClassId) {
    const selectedClass = enrolledClasses.find(c => c.id === selectedClassId);
    return <StudentClassroomView classroom={selectedClass!} onBack={() => setSelectedClassId(null)} />;
  }

  return (
    <div className="bg-black p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-8">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-emerald mb-4">Student Workspace</h2>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-white uppercase font-display leading-[0.85]">
              My<br/><span className="text-white/40">Lectures</span>
            </h1>
          </div>
          <button 
            onClick={() => setShowJoin(true)}
            className="flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-brand-emerald hover:text-white shadow-2xl shadow-white/5"
          >
            <Plus className="w-5 h-5" />
            Join Class
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {enrolledClasses.map((cls, idx) => (
            <motion.div 
              key={cls.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedClassId(cls.id)}
              className="group bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl hover:border-brand-emerald hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10">
                <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-brand-emerald group-hover:scale-110 transition-all">
                <BookOpen className="w-8 h-8 text-white/20 group-hover:text-white" />
              </div>
              
              <h3 className="text-3xl font-black mb-1 tracking-tighter uppercase font-display leading-tight">{cls.name}</h3>
              <p className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-10">Prof. {cls.teacherName}</p>
              
              <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white/20" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">12 Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-white/20" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {enrolledClasses.length === 0 && !loading && (
          <div className="bg-white/2 rounded-[4rem] border-2 border-dashed border-white/5 p-32 text-center">
            <GraduationCap className="w-20 h-20 text-white/10 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-white/20 uppercase tracking-tighter">Your shelf is empty</h3>
            <p className="text-[10px] font-bold text-white/20 mt-4 uppercase tracking-[0.2em]">Contact your professor for an access key</p>
          </div>
        )}
      </div>

      {showJoin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <motion.form 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleJoinClass}
            className="bg-white rounded-[3rem] p-14 w-full max-w-md shadow-2xl text-black"
          >
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                <Plus className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Join Room</h2>
                <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Secure Access Protocol</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] uppercase font-black text-black/30 ml-1 tracking-[0.2em]">Keycode (6 DIGITS)</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="X Y Z 1 2 3"
                  maxLength={6}
                  className="w-full bg-gray-100 border-none rounded-2xl py-6 px-8 mt-2 text-center font-mono text-2xl font-black uppercase tracking-[0.4em] outline-none focus:ring-2 focus:ring-brand-emerald"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                />
              </div>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest px-2">{error}</p>}
              <div className="flex gap-6 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowJoin(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-emerald hover:shadow-2xl hover:shadow-brand-emerald/20 transition-all"
                >
                  Confirm Key
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}

function StudentClassroomView({ classroom, onBack }: { classroom: Classroom, onBack: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "classrooms", classroom.id, "notes"), 
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Note)));
    });
    return () => unsubscribe();
  }, [classroom.id]);

  return (
    <div className="bg-black font-sans min-h-screen">
      {/* Top Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-3xl z-30 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={onBack}
              className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter font-display leading-none">{classroom.name}</h1>
              <p className="text-[10px] font-black text-brand-emerald uppercase tracking-[0.2em] mt-2">Prof. {classroom.teacherName}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Live Stream</p>
                <p className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">CONNECTED</p>
             </div>
             <div className="w-2.5 h-2.5 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 sm:p-12 mt-6 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Knowledge Modules</h3>
              <div className="space-y-6">
                {notes.map((note) => (
                  <motion.div 
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className="group bg-white/5 border border-white/10 rounded-[3rem] p-8 sm:p-10 hover:border-brand-emerald hover:bg-white/10 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-8"
                  >
                    <div className="flex gap-8">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-emerald transition-all group-hover:scale-110 shrink-0">
                        <FileText className="w-8 h-8 text-white/20 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-brand-emerald transition-colors font-display italic leading-tight">{note.title}</h4>
                        <p className="text-[10px] font-bold text-white/30 mt-2 flex items-center gap-3 uppercase tracking-widest">
                          <Clock className="w-4 h-4" />
                          {note.date?.toDate().toLocaleDateString()}
                        </p>
                        <p className="text-sm text-white/40 mt-6 line-clamp-2 leading-relaxed uppercase tracking-tighter">
                          {note.summary}
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-6">
                       <button className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                          <Download className="w-4 h-4" />
                          Vault
                       </button>
                       <Award className="w-6 h-6 text-brand-emerald hidden sm:block opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
                {notes.length === 0 && (
                  <div className="p-32 text-center bg-white/2 rounded-[4rem] border-2 border-dashed border-white/5">
                    <Clock className="w-20 h-20 text-white/10 mx-auto mb-8" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Lecture archive is empty</p>
                  </div>
                )}
              </div>
           </div>

           <div className="lg:col-span-1 space-y-10">
              <div className="bg-brand-emerald rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                 <Sparkles className="w-12 h-12 text-white mb-8 group-hover:scale-110 transition-transform" />
                 <h4 className="text-3xl font-black uppercase tracking-tight mb-4 font-display italic">AI Cortex Quiz</h4>
                 <p className="text-sm font-medium text-white/60 mb-10 leading-relaxed">Neural analysis of your lectures suggests you prioritize these 4 concepts for the upcoming exam.</p>
                 <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-2xl transition-all">Engage Review</button>
                 <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-black/10 rounded-full blur-3xl" />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">Neural Stats</h5>
                 <div className="space-y-8">
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                          <span className="text-white/40">Knowledge Sync</span>
                          <span className="text-brand-emerald">72%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-emerald w-[72%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                          <span className="text-white/40">Engagement</span>
                          <span className="text-brand-blue">94%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-blue w-[94%] shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Shared Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/90 backdrop-blur-2xl"
            onClick={() => setSelectedNote(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="bg-white w-full max-w-5xl h-[95vh] sm:h-[90vh] rounded-t-[4rem] sm:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden text-black"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10 sm:p-20 border-b flex justify-between items-start shrink-0">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4 mb-5">
                     <span className="px-5 py-2 bg-brand-emerald text-white text-[10px] font-black rounded-full uppercase tracking-widest">Vault Verified</span>
                     <span className="text-[10px] text-black/30 font-black uppercase tracking-widest">{selectedNote.date?.toDate().toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black text-black tracking-tighter uppercase font-display leading-[0.95] italic">{selectedNote.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-lg"
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 sm:p-20">
                  <div className="bg-emerald-50 rounded-[3rem] p-12 mb-16 border border-emerald-100/50 relative overflow-hidden">
                       <h5 className="flex items-center gap-3 text-brand-emerald text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                          <Sparkles className="w-5 h-5" />
                          Cortex Extraction
                       </h5>
                       <p className="text-2xl font-serif italic text-gray-800 leading-relaxed tracking-tight underline decoration-brand-emerald/10 decoration-8 underline-offset-8 relative z-10">
                          {selectedNote.summary}
                       </p>
                       <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl" />
                  </div>

                  <div className="markdown-body prose prose-xl prose-slate max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tighter prose-p:leading-relaxed prose-p:text-gray-600 prose-li:font-medium">
                     <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                  </div>
              </div>

              <div className="p-10 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-8 sm:px-20">
                 <div className="flex items-center gap-10">
                    <button className="text-[10px] font-black text-black/40 hover:text-black transition-colors uppercase tracking-widest">Request Triage</button>
                    <button className="text-[10px] font-black text-black/40 hover:text-black transition-colors uppercase tracking-widest">Report Anomaly</button>
                 </div>
                 <button className="w-full sm:w-auto bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-emerald transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-4">
                    <Download className="w-5 h-5" />
                    Download PDF
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

