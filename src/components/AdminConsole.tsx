import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Upload, CheckCircle, FileText, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  uploadedSyllabus: {
    id: string;
    grade: string;
    subject: string;
    topics: string[];
    description: string;
    timestamp: string;
  }[];
  onUploadSyllabus: (grade: string, subject: string, topics: string[], description: string) => void;
  onDeleteSyllabus: (id: string) => void;
}

const CLASSES = [
  "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", 
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
];

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  primary: ["English", "Mathematics", "EVS", "Science", "Social Science", "Tamil", "Hindi"],
  secondary: ["English", "Mathematics", "Science", "Social Science", "Tamil", "Hindi", "Computer Science"],
  higher: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "Commerce", "Accountancy", "Economics", "Business Studies", "History", "Political Science"]
};

export default function AdminConsole({ uploadedSyllabus, onUploadSyllabus, onDeleteSyllabus }: Props) {
  const { t } = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState('Class 7');
  const [selectedSubject, setSelectedSubject] = useState('Social Science');
  const [topicInput, setTopicInput] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get subjects based on grade selection
  const getSubjectsForGrade = (grade: string) => {
    if (grade === 'LKG' || grade === 'UKG') return ["Alphabet Learning", "Numbers", "Shapes", "Colors", "General Awareness"];
    const num = parseInt(grade.replace('Class ', ''));
    if (num <= 5) return SUBJECTS_BY_GRADE.primary;
    if (num <= 10) return SUBJECTS_BY_GRADE.secondary;
    return SUBJECTS_BY_GRADE.higher;
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) {
      alert("Please enter topics");
      return;
    }

    const topicsArray = topicInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onUploadSyllabus(selectedGrade, selectedSubject, topicsArray, description || "Syllabus covering critical thinking goals.");
    
    setTopicInput('');
    setDescription('');
    setSuccessMsg('Syllabus content published successfully! Teachers have been notified to align study plans.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const currentSubjects = getSubjectsForGrade(selectedGrade);

  return (
    <div className="font-sans max-w-5xl mx-auto my-6 p-4 space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-purple-950 rounded-2xl border-2 border-slate-950 p-6 text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Jigyasa Governance Console
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Curriculum Syllabus Administrator
          </h2>
          <p className="text-xs text-slate-350 mt-0.5">
            Upload verified regional curriculum guidelines. Uploads automatically alert class teachers to design localized critical thinking missions.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 text-emerald-900 shadow-sm animate-fade-in font-semibold text-xs">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Upload Form */}
        <div className="md:col-span-5 bg-white border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Upload className="w-4 h-4 text-purple-600" /> Publish Syllabus Guideline
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Class/Grade Level</label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  const subList = getSubjectsForGrade(e.target.value);
                  setSelectedSubject(subList[0] || "");
                }}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600"
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600"
              >
                {currentSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topics (Comma separated)</label>
              <span className="text-[10px] text-slate-400 block mb-1.5">Enter key topics like: Panchayat System, Local Democracy</span>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="E.g. Panchayat System, Local Democracy"
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Critical Thinking Brief / Objectives</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. This syllabus segment targets local resource limits, budgeting, and civic water security..."
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600 resize-none h-20"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs py-3 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Publish Guidelines <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Database View */}
        <div className="md:col-span-7 bg-white border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-purple-600" /> Active Curriculums ({uploadedSyllabus.length})
          </h3>

          {uploadedSyllabus.length > 0 ? (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {uploadedSyllabus.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-400 transition-all flex justify-between gap-4 items-start">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-purple-250">
                        {item.grade}
                      </span>
                      <span className="bg-indigo-150 text-indigo-900 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-indigo-200">
                        {item.subject}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-800 font-bold">
                      Topics: <span className="text-purple-700 font-medium">{item.topics.join(', ')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal italic">
                      "{item.description}"
                    </p>
                    <span className="text-[9px] font-mono text-slate-400 block pt-1">Published: {item.timestamp}</span>
                  </div>

                  <button
                    onClick={() => onDeleteSyllabus(item.id)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-250 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h5 className="font-semibold text-slate-700 text-xs">No Custom Syllabus Published</h5>
              <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                Syllabus guidelines are empty. Complete the upload form to publish official class requirements and notify educators.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
