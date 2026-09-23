import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Classroom, Note } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Square, 
  ArrowLeft, 
  FileText, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  Award,
  ChevronDown,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { processLectureTranscript } from "../../lib/ai";
import ReactMarkdown from "react-markdown";

interface ClassroomViewProps {
  classroom: Classroom;
  onBack: () => void;
}

export function ClassroomView({ classroom, onBack }: ClassroomViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  const recognitionRef = useRef<any>(null);

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

  const startRecording = () => {
    setIsRecording(true);
    setTranscript("");
    
    // Check for webkitSpeechRecognition support
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + " " + currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (isRecording) recognition.start();
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const title = `Lecture: ${new Date().toLocaleDateString()}`;
      const { fullNotes, summary } = await processLectureTranscript(transcript, classroom.name);
      
      await addDoc(collection(db, "classrooms", classroom.id, "notes"), {
        classroomId: classroom.id,
        teacherId: classroom.teacherId,
        title,
        content: fullNotes,
        summary,
        transcript,
        date: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error processing notes:", error);
    } finally {
      setIsProcessing(false);
    }
  };

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
              <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] mt-2">Classroom ID: {classroom.inviteCode}</p>
            </div>
          </div>
          
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn(
              "flex items-center gap-4 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-2xl shadow-brand-blue/20 disabled:opacity-50",
              isRecording 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-white text-black hover:bg-brand-blue hover:text-white"
            )}
          >
            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            {isProcessing ? "AI PROCESSING..." : isRecording ? "Stop Broadcast" : "Begin Lecture"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12 pb-40">
        {/* Sidebar Status / Actions */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2.5 h-2.5 bg-brand-emerald rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">AI SENSORS ACTIVE</span>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tight mb-6 font-display">Broadcast Intel</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Latency</span>
                <span className="text-[10px] font-mono font-bold text-brand-blue">24ms</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Engagement</span>
                <span className="text-[10px] font-black uppercase text-brand-emerald">OPTIMAL</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Transcript</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-brand-blue rounded-full opacity-40" />)}
                </div>
              </div>
            </div>
            
            <button className="w-full mt-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:border-white hover:text-white transition-all">
              Manage Access
            </button>
          </div>

          <div className="bg-brand-blue rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <Sparkles className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-2xl font-black uppercase tracking-tight mb-2 font-display">Biometric Voice</h4>
            <p className="text-sm font-medium text-white/60 mb-8 leading-relaxed">Lock the sound system to your specific vocal profile for 100% background isolation.</p>
            <button className="bg-white text-brand-blue px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl">Setup Now</button>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Archive Feeds</h3>
          
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[3rem] p-12 shadow-2xl border-4 border-brand-blue"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                      <Mic className="w-7 h-7 text-red-500 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-tight text-black text-xl">Streaming...</h4>
                      <p className="text-[10px] text-black/40 uppercase font-black tracking-widest">REAL-TIME ISOLATION MAPPED</p>
                    </div>
                  </div>
                  <div className="px-5 py-2 bg-gray-100 rounded-full text-[10px] font-mono font-black tracking-widest uppercase text-black">DECRYPTING</div>
                </div>
                
                <div className="min-h-[120px] text-black italic leading-relaxed text-2xl font-serif border-l-4 border-gray-100 pl-8">
                  {transcript || "NoteAi is listening. Signal strength optimal."}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            {notes.map((note, idx) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedNote(note)}
                className="group bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer flex items-start justify-between"
              >
                <div className="flex gap-8">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-blue transition-all group-hover:scale-110">
                    <FileText className="w-7 h-7 text-white/20 group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-brand-blue transition-colors font-display italic">{note.title}</h4>
                    <p className="text-[10px] font-bold text-white/30 mt-1 flex items-center gap-3 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {note.date?.toDate().toLocaleDateString()} • {note.date?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-white/40 mt-5 line-clamp-1 max-w-[400px] font-medium leading-relaxed uppercase tracking-tighter">
                      {note.summary}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-5">
                   <div className="p-3 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all group-hover:bg-brand-blue">
                      <ChevronRight className="w-5 h-5 text-white" />
                   </div>
                   <div className="flex items-center gap-2">
                      <Award className="w-3 h-3 text-brand-emerald" />
                      <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest">READY</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Note View Modal */}
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
              className="bg-white w-full max-w-5xl h-[95vh] sm:h-[90vh] rounded-t-[3rem] sm:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden text-black"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10 sm:p-14 border-b flex justify-between items-start shrink-0">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-5 py-2 bg-brand-blue text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-brand-blue/30">AI Transcribed</span>
                    <span className="text-[10px] text-black/30 font-black uppercase tracking-widest">{selectedNote.date?.toDate().toDateString()}</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black text-black tracking-tighter uppercase font-display leading-[0.95] italic">{selectedNote.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-lg"
                >
                  <ChevronDown className="w-8 h-8" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 sm:p-20">
                <div className="bg-gray-50 rounded-[2.5rem] p-10 mb-16 border border-gray-100 shadow-sm">
                   <h5 className="uppercase text-[10px] font-black tracking-[0.2em] text-brand-blue mb-6 flex items-center gap-3">
                      <Sparkles className="w-4 h-4" />
                      Executive Summary
                   </h5>
                   <p className="text-2xl font-serif italic text-gray-800 leading-relaxed tracking-tight underline decoration-brand-blue/10 decoration-8 underline-offset-8">
                      {selectedNote.summary}
                   </p>
                </div>
                
                <div className="bg-black/5 rounded-3xl p-2 mb-12 flex gap-2 w-fit">
                   <button className="bg-white shadow-md px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Structured Knowledge</button>
                   <button className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-all">Raw Signal</button>
                   <button className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-all inline-flex items-center gap-3">
                      <ExternalLink className="w-3 h-3" />
                      Data Audit
                   </button>
                </div>

                <div className="markdown-body prose prose-xl prose-slate max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tighter prose-p:leading-relaxed prose-p:text-gray-600 prose-li:font-medium">
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              </div>

              <div className="p-10 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-8 sm:px-20">
                <div className="flex items-center gap-10">
                  <button className="text-[10px] font-black text-black/40 hover:text-black transition-colors uppercase tracking-widest">Edit Payload</button>
                  <button className="text-[10px] font-black text-brand-blue hover:underline transition-all uppercase tracking-widest">Share with Campus</button>
                </div>
                <button className="w-full sm:w-auto bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-blue transition-all shadow-xl shadow-black/10">
                  Export PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
