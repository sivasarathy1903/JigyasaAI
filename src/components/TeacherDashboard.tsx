import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, AlertTriangle, BookOpen, FileText, CheckCircle, 
  HelpCircle, Copy, Sparkles, Send, Loader2, ArrowRight, BarChart2, Grid
} from 'lucide-react';
import { TeacherQuizQuestion, TeacherDashboardData } from '../types';

interface Props {
  currentTopic: string;
  currentGrade: string;
  currentSubject: string;
  onChangeParams?: (updates: any) => void;
  classrooms?: any[];
  onAddStudent?: any;
  classChallenges?: any[];
  onAddChallenge?: any;
  uploadedSyllabus?: any[];
  studyPlans?: any[];
  onAddStudyPlan?: any;
}

export default function TeacherDashboard({ currentTopic, currentGrade, currentSubject, onChangeParams, uploadedSyllabus }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'attention' | 'insights' | 'quiz' | 'report' | 'heatmap'>('attention');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<TeacherQuizQuestion[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportStudent, setReportStudent] = useState('Meena');
  const [generatedReport, setGeneratedReport] = useState('');
  
  // Static Teacher Dashboard sample data
  const [dashboardData] = useState<TeacherDashboardData>({
    studentsAttention: [
      {
        name: 'Karthik S.',
        responseType: 'RECALL',
        engagement: 'low',
        sessionsThisWeek: 1,
        intervention: '⚠️ Stuck at memorized facts only. Action: Prompt with "Why do residents object to moving structures?" rather than generic definitions.'
      },
      {
        name: 'Ravi Raj',
        responseType: 'RECALL',
        engagement: 'low',
        sessionsThisWeek: 0,
        intervention: '⚠️ Zero sessions completed this week. Action: Trigger the Sprout/Explorer "Water Mission Launcher" gamified text to spark interest.'
      },
      {
        name: 'Priya K.',
        responseType: 'PARTIAL_REASONING',
        engagement: 'medium',
        sessionsThisWeek: 3,
        intervention: '💡 Strong concept association but forgets financial trade-offs. Action: Push her to formulate budget solutions in a quick 1-on-1.'
      },
      {
        name: 'Arun Kumar',
        responseType: 'FULL_REASONING',
        engagement: 'high',
        sessionsThisWeek: 4,
        intervention: '⭐ High systemic thinker. Action: Nominate as peer debate captain or challenge with high-complexity "Drought Crisis Simulation".'
      }
    ],
    classInsight: {
      strength: 'Excellent spatial mapping & local geographical connection. 80% of students immediately understood Chennai water levels.',
      struggle: 'Severe difficulty calculating cost limits. Most students suggested unbudgeted solutions exceeding ₹50 lakhs.',
      suggestion: 'Incorporate basic budget calculations into the next math cycle. Have students evaluate cost vs benefit before proposing ideas.'
    }
  });

  const students = ['Meena', 'Arun', 'Priya', 'Karthik', 'Ravi'];

  // Heatmap Student Skills mock database
  const studentSkills = [
    { name: "Meena S.", critical: 92, problem: 85, creative: 95, comm: 88, collab: 80, adapt: 90 },
    { name: "Arun Kumar", critical: 88, problem: 90, creative: 82, comm: 85, collab: 92, adapt: 86 },
    { name: "Priya K.", critical: 75, problem: 78, creative: 80, comm: 82, collab: 76, adapt: 80 },
    { name: "Karthik S.", critical: 45, problem: 52, creative: 60, comm: 55, collab: 68, adapt: 50 },
    { name: "Ravi Raj", critical: 38, problem: 40, creative: 45, comm: 42, collab: 50, adapt: 48 }
  ];

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await fetch('/api/teacher/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic || 'Water Cycle',
          grade: currentGrade || 'Class 7',
          subject: currentSubject || 'Science'
        })
      });
      const data = await res.json();
      if (data.questions) {
        setQuizQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch('/api/teacher/parent-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: reportStudent,
          topic: currentTopic || 'Water Cycle',
          dataSummary: {
            grade: currentGrade,
            subject: currentSubject,
            sessionsCompleted: 12,
            reasoningLevel: reportStudent === 'Meena' ? 'FULL_REASONING' : 'PARTIAL_REASONING'
          }
        })
      });
      const data = await res.json();
      if (data.report) {
        setGeneratedReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  };

  const getHeatmapColor = (score: number) => {
    if (score >= 85) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 70) return "bg-indigo-50 text-indigo-800 border-indigo-200";
    if (score >= 50) return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-rose-50 text-rose-800 border-rose-200";
  };

  return (
    <div className="bg-slate-50 rounded-3xl border-2 border-slate-950 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] font-sans max-w-5xl mx-auto my-8">
      
      {/* Teacher Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 bg-purple-100 border border-purple-200 text-purple-700 text-xs px-3 py-1 rounded-full w-fit font-mono font-bold uppercase mb-1">
            <Users className="w-3.5 h-3.5" /> Jigyasa Teacher Console
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Class Intelligence Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time diagnostics for <span className="font-semibold">{currentGrade || 'Class 7'}</span> • <span className="font-semibold">{currentSubject || 'Social Science'}</span>
          </p>
        </div>
        <div className="relative z-20">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-slate-900 text-slate-100 px-4 py-2 border-2 border-slate-950 rounded-xl text-xs font-mono shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            📚 ASSIGN TOPIC: <span className="text-amber-400 font-bold">{currentTopic || 'Local Governance'}</span>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-2 max-h-60 overflow-y-auto z-50">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-2 px-2">Pre-loaded Chapters</div>
              {uploadedSyllabus?.flatMap((syl: any) => syl.topics).map((topic: string) => (
                <div 
                  key={topic} 
                  onClick={() => {
                     if(onChangeParams) {
                         onChangeParams({ topic });
                         setIsDropdownOpen(false);
                         alert(`Topic "${topic}" sent to all student devices instantly via local sync!`);
                     }
                  }}
                  className="p-2 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  {topic}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('attention')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
            activeTab === 'attention'
              ? 'bg-rose-100 border-rose-500 text-rose-950 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-650'
          }`}
        >
          🚨 Attention List
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-purple-100 border-purple-500 text-purple-950 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-650'
          }`}
        >
          💡 {t('learningOutcomes')} & Insights
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-650'
          }`}
        >
          📝 {t('assessmentSummary')}
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-650'
          }`}
        >
          👨‍👩‍👧 {t('teacherRubric')} & Report
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
            activeTab === 'heatmap'
              ? 'bg-indigo-100 border-indigo-500 text-indigo-950 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-400 text-slate-650'
          }`}
        >
          📊 {t('skillHeatmap')} & Comparison
        </button>
      </div>

      {/* Content Panels */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 min-h-[350px] shadow-sm">
        
        {/* 1. ATTENTION LIST */}
        {activeTab === 'attention' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4.5 flex gap-3 text-rose-950 items-start">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Micro-diagnostic Alerts</h4>
                <p className="text-xs text-rose-800 leading-relaxed mt-1 font-semibold">
                  Students below are currently demonstrating passive textbook recitation ([RECALL]) or complete disengagement. Use the specific tailored action probes during class today to jumpstart critical analysis.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.studentsAttention.map((st) => (
                <div 
                  key={st.name} 
                  className={`p-4 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] ${
                    st.engagement === 'low' ? 'bg-rose-50/40' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-900 text-sm">{st.name}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      st.responseType === 'RECALL' ? 'bg-rose-200 text-rose-900 border border-rose-300' : 'bg-amber-200 text-amber-900 border border-amber-300'
                    }`}>
                      {st.responseType}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] font-mono text-slate-400 mb-3">
                    <span>ENGAGEMENT: <strong className="text-slate-600 uppercase">{st.engagement}</strong></span>
                    <span>SESSIONS: <strong className="text-slate-600">{st.sessionsThisWeek}</strong></span>
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                    {st.intervention}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. LEARNING OUTCOMES & INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border-2 border-slate-900 rounded-2xl p-5 bg-emerald-50/20 relative shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-950 flex items-center gap-1.5 font-bold mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Major Class Strengths
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-xl font-medium">
                  {dashboardData.classInsight.strength}
                </p>
              </div>

              <div className="border-2 border-slate-900 rounded-2xl p-5 bg-amber-50/20 relative shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-950 flex items-center gap-1.5 font-bold mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Core Conceptual Gaps
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-4 rounded-xl font-medium">
                  {dashboardData.classInsight.struggle}
                </p>
              </div>

            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-purple-900 flex items-center gap-1.5 font-bold mb-2">
                💡 Suggested Learning Outcome Strategy
              </h4>
              <p className="text-xs text-purple-950 leading-relaxed font-semibold">
                {dashboardData.classInsight.suggestion}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-white hover:bg-purple-100 cursor-pointer text-purple-900 text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded-xl border border-purple-200 shadow-sm transition-all">
                  ⚡ Download Group Worksheet
                </span>
                <span className="bg-white hover:bg-purple-100 cursor-pointer text-purple-900 text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded-xl border border-purple-200 shadow-sm transition-all">
                  📊 Request Visual Resource Kit
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. ASSESSMENT SUMMARY & SYLLABUS QUIZ */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Continuous Assessment Generator
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Produces 10 diagnostic questions covering multiple cognitive dimensions on <strong className="text-purple-600">{currentTopic || 'chapter assigned'}</strong>
                </p>
              </div>
              
              <button
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 disabled:opacity-50 flex items-center gap-1.5 rounded-xl shrink-0 cursor-pointer"
              >
                {quizLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate 10-Question Test
                  </>
                )}
              </button>
            </div>

            {quizQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Questions generated successfully via Gemini 3.5</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(quizQuestions, null, 2));
                      alert('Classroom test copied to clipboard!');
                    }}
                    className="flex items-center gap-1 hover:text-purple-600 font-bold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy JSON Code
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">Q{idx + 1}. {q.question}</span>
                        <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                          q.level === 'Analysis' ? 'bg-purple-100 text-purple-900' :
                          q.level === 'Application' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {q.level}
                        </span>
                      </div>
                      
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 my-2 pl-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="text-[11px] text-slate-650 bg-white border border-slate-150 p-1.5 rounded-lg">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded-lg mt-1.5 border border-emerald-100 font-semibold">
                        📄 Benchmark: {q.answerKey}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h5 className="font-semibold text-slate-700 text-sm">No Assessment Loaded</h5>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the generate button above to draft dynamic Class questions categorized under Knowledge, Application, and Analysis levels.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. RUBRIC EVALUATION & PARENT REPORT */}
        {activeTab === 'report' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
              <div className="grow">
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Select Student</label>
                <select
                  value={reportStudent}
                  onChange={(e) => setReportStudent(e.target.value)}
                  className="bg-white border-2 border-slate-900 text-xs rounded-xl px-3 py-2 font-semibold font-sans focus:outline-none w-full sm:w-48"
                >
                  {students.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grow">
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Assessed Curriculum Skill</label>
                <div className="text-xs font-bold text-slate-800 py-2">
                  Systems reasoning & Resource management ({currentTopic || 'General'})
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center gap-1.5 rounded-xl active:translate-y-0.5 disabled:opacity-50 cursor-pointer transition-all"
              >
                {reportLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" /> Draft Report
                  </>
                )}
              </button>
            </div>

            {generatedReport ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Heartwarming parenting-focused metrics card</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedReport);
                      alert('Parent report copied!');
                    }}
                    className="flex items-center gap-1 hover:text-purple-600 font-bold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Text
                  </button>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs text-slate-700 leading-relaxed font-sans max-h-[300px] overflow-y-auto whitespace-pre-wrap font-medium">
                  {generatedReport}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h5 className="font-semibold text-slate-700 text-sm">Draft Competency Report</h5>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Rather than printing simple letters like 'A' or scores like '75%', Jigyasa AI creates detailed, heartwarming reports outlining rural/regional Socratic milestones.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. SKILL HEATMAP & CLASS COMPARISON */}
        {activeTab === 'heatmap' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Heatmap Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
                <Grid className="w-4 h-4 text-purple-600" /> Student Skill Matrix
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-250 text-slate-600 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4 text-left">Student Name</th>
                      <th className="py-3 px-3 text-center">Critical thinking</th>
                      <th className="py-3 px-3 text-center">Problem solving</th>
                      <th className="py-3 px-3 text-center">Creativity</th>
                      <th className="py-3 px-3 text-center">Communication</th>
                      <th className="py-3 px-3 text-center">Collaboration</th>
                      <th className="py-3 px-3 text-center">Adaptability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-semibold text-slate-800">
                    {studentSkills.map((s, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-100">{s.name}</td>
                        <td className={`py-2 px-3 text-center border-r border-slate-100 ${getHeatmapColor(s.critical)}`}>{s.critical}%</td>
                        <td className={`py-2 px-3 text-center border-r border-slate-100 ${getHeatmapColor(s.problem)}`}>{s.problem}%</td>
                        <td className={`py-2 px-3 text-center border-r border-slate-100 ${getHeatmapColor(s.creative)}`}>{s.creative}%</td>
                        <td className={`py-2 px-3 text-center border-r border-slate-100 ${getHeatmapColor(s.comm)}`}>{s.comm}%</td>
                        <td className={`py-2 px-3 text-center border-r border-slate-100 ${getHeatmapColor(s.collab)}`}>{s.collab}%</td>
                        <td className={`py-2 px-3 text-center ${getHeatmapColor(s.adapt)}`}>{s.adapt}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3 text-[9px] font-mono text-slate-400 justify-end pt-1">
                <span className="flex items-center gap-1">🟢 Advanced (&gt;85)</span>
                <span className="flex items-center gap-1">🔵 Proficient (70-84)</span>
                <span className="flex items-center gap-1">🟡 Developing (50-69)</span>
                <span className="flex items-center gap-1">🔴 Critical Needs (&lt;50)</span>
              </div>
            </div>

            {/* Class Comparison Section */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-bold">
                <BarChart2 className="w-4 h-4 text-purple-600" /> Class Section Comparison
              </h4>

              <div className="space-y-4">
                {[
                  { section: "Section 7A (Our Class)", val: 82, color: "bg-purple-600" },
                  { section: "Section 7B", val: 74, color: "bg-slate-400" },
                  { section: "Section 7C", val: 68, color: "bg-slate-350" }
                ].map((sec, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-700">{sec.section}</span>
                      <span className="text-indigo-900">{sec.val}% average score</span>
                    </div>
                    <div className="w-full bg-white border border-slate-200 rounded-full h-3.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${sec.color} transition-all duration-500`}
                        style={{ width: `${sec.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
