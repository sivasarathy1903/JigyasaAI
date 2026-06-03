import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap, Globe, Languages, Sun, Moon, 
  User, Shield, Users, BarChart2, Video, LogOut, Compass, ShieldAlert, Award
} from 'lucide-react';
import StudentPortal from './components/StudentPortal';
import DebateArena from './components/DebateArena';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import VideoDemo from './components/VideoDemo';
import AdminConsole from './components/AdminConsole';
import LoginPage from './components/auth/LoginPage';
import JudgeDemoMode from './components/JudgeDemoMode';
import { Tier } from './types';

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ta", name: "தமிழ்" },
  { code: "hi", name: "हिन्दी" },
  { code: "te", name: "తెలుగు" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "bn", name: "বাংলা" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia" }
];

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTeacherRoute = location.pathname.includes('/teacher');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Master Student Parameter Settings (Shared)
  const [studentParams, setStudentParams] = useState({
    studentName: 'Meena S.',
    grade: 'Class 7',
    subject: 'Social Science',
    topic: 'Local Governance',
    state: 'Tamil Nadu',
    language: 'English',
    tier: 'BUILDER' as Tier
  });

  const onChangeParams = (updates: any) => {
    setStudentParams(prev => ({ ...prev, ...updates }));
  };

  // HACKATHON AUTOMATED TOUR SIMULATOR STATES
  const [tourAction, setTourAction] = useState<string | null>(null);

  // SHARED DATABASE STATES
  const [classrooms, setClassrooms] = useState([
    { id: "c-1", name: "Class 7", students: ["Meena S.", "Arun Kumar", "Priya K."] },
    { id: "c-2", name: "Class 10", students: ["Karthik S.", "Ravi Raj"] }
  ]);

  const [classChallenges, setClassChallenges] = useState([
    { 
      id: "ch-1", 
      className: "Class 7", 
      title: "Village Pond Restoration Strategy", 
      content: "Design a plan to restore the primary dried pond under a ₹20 Lakh limit.", 
      points: 100 
    }
  ]);

  const [uploadedSyllabus, setUploadedSyllabus] = useState([
    {
      id: "syl-1",
      grade: "Class 7",
      subject: "Social Science",
      topics: ["Local Governance", "Panchayat System", "Democracy"],
      description: "Guidelines detailing Indian rural executive panels and local budget allocations.",
      timestamp: "6/2/2026, 2:00:00 PM"
    }
  ]);

  const [studyPlans, setStudyPlans] = useState([
    {
      id: "sp-1",
      className: "Class 7",
      syllabusId: "syl-1",
      title: "Panchayat Infiltration Systems",
      description: "Analyze the groundwater infiltration guidelines and build a Socratic case.",
      timestamp: "6/2/2026, 2:10:00 PM"
    }
  ]);

  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "n-1",
      className: "Class 7",
      text: "New Class Challenge posted: Village Pond Restoration Strategy",
      read: false
    }
  ]);

  // Methods to manipulate state
  const handleUploadSyllabus = (grade: string, subject: string, topics: string[], description: string) => {
    setUploadedSyllabus(prev => [
      ...prev,
      {
        id: "syl-" + Date.now(),
        grade,
        subject,
        topics,
        description,
        timestamp: new Date().toLocaleString()
      }
    ]);
  };

  const handleDeleteSyllabus = (id: string) => {
    setUploadedSyllabus(prev => prev.filter(s => s.id !== id));
  };

  const handleAddStudent = (className: string, name: string) => {
    setClassrooms(prev => prev.map(c => {
      if (c.name === className) {
        return { ...c, students: [...c.students, name] };
      }
      return c;
    }));
  };

  const handleAddChallenge = (className: string, title: string, content: string, points: number) => {
    const id = "ch-" + Date.now();
    setClassChallenges(prev => [...prev, { id, className, title, content, points }]);
    // Notify students
    setNotifications(prev => [
      ...prev,
      {
        id: "n-" + Date.now(),
        className,
        text: `New Class Challenge posted: ${title}`,
        read: false
      }
    ]);
  };

  const handleAddStudyPlan = (className: string, syllabusId: string, title: string, description: string) => {
    const id = "sp-" + Date.now();
    setStudyPlans(prev => [...prev, { id, className, syllabusId, title, description, timestamp: new Date().toLocaleString() }]);
    // Notify students
    setNotifications(prev => [
      ...prev,
      {
        id: "n-" + Date.now(),
        className,
        text: `New Study Plan posted: ${title}`,
        read: false
      }
    ]);
  };

  const handleReadNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Automated Hackathon Tour simulation callback
  const handleSimulateTourAction = (actionType: string, payload?: any) => {
    setTourAction(actionType);
    if (actionType === "LOAD_MEENA") {
      setStudentParams({
        studentName: 'Meena S.',
        grade: 'Class 7',
        subject: 'Social Science',
        topic: 'Local Governance',
        state: 'Tamil Nadu',
        language: 'English',
        tier: 'BUILDER'
      });
    } else if (actionType === "RESET_STUDENT_PORTAL") {
      setTourAction(null);
    }
  };

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    const matchedLang = LANGUAGES.find(l => l.code === code);
    if (matchedLang) {
      setStudentParams(prev => ({ ...prev, language: matchedLang.name }));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen pb-16 transition-all duration-300 ${
      isDarkMode ? 'bg-[#0f172a] text-slate-100 dark' : 'bg-[#fafafb] text-slate-900'
    }`}>
      
      {/* Navigation Header */}
      <header className={`sticky top-0 transition-all z-40 border-b-2 border-slate-950 font-sans shadow-sm ${
        isDarkMode ? 'bg-slate-900/90 text-white border-slate-800' : 'bg-white/95 text-slate-900'
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-18 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/student" className="flex items-center gap-3 select-none">
            <div className="bg-slate-950 text-white w-9 h-9 rounded-xl flex items-center justify-center border border-slate-900 shadow-sm relative overflow-hidden">
              <span className="font-display font-black text-lg text-purple-400">J</span>
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold tracking-tight flex items-center gap-1">
                {t('appName')} <span className="text-[9px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">PRO</span>
              </h1>
              <span className="text-[9px] font-mono block text-slate-400 tracking-wider uppercase">{t('tagline')}</span>
            </div>
          </Link>

          {/* Quick Active Student Tags */}
          {!isTeacherRoute && (
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 py-1.5 px-3.5 rounded-2xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" /> {t('gradeLabel')}: <strong>{studentParams.grade}</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" /> {t('localeLabel')}: <strong>{studentParams.state}</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-amber-600" /> {t('languageLabel')}: <strong>{studentParams.language}</strong>
              </span>
            </div>
          )}

          {/* Controller Switchers */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Switch */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 cursor-pointer bg-white text-slate-800 shrink-0 hover:bg-slate-50"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Switch */}
            <div className="flex items-center gap-1 border-2 border-slate-950 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] px-2 py-1 rounded-xl">
              <Languages className="w-4 h-4 text-slate-500" />
              <select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            <Link 
              to="/login"
              className="hidden sm:flex items-center justify-center p-2 rounded-xl border-2 border-slate-950 hover:bg-slate-100 bg-white cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
            </Link>

          </div>

        </div>
      </header>

      {/* Main Tab Navigation Bar */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <nav className={`flex flex-wrap gap-2 p-2 border-2 border-slate-950 rounded-2xl shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] bg-white ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'
        }`}>
          {[
            { path: '/student', label: t('studentPortal'), icon: User },
            { path: '/debate', label: t('debateArena'), icon: Compass },
            { path: '/parent', label: t('parentDashboard'), icon: Users },
            { path: '/teacher', label: t('teacherDashboard'), icon: BarChart2 },
            { path: '/admin', label: "Admin Console", icon: ShieldAlert },
            { path: '/demo/meena', label: t('videoDemo'), icon: Video }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path || (tab.path === '/student' && location.pathname === '/');
            return (
              <Link 
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-purple-600 border-slate-950 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Container routes */}
      <main className="max-w-6xl mx-auto px-6 pt-6">
        <div className="transition-all duration-300">
          <Routes>
            <Route path="/student" element={
              <StudentPortal 
                studentParams={studentParams} 
                onChangeParams={onChangeParams} 
                currentTier={studentParams.tier}
                currentLanguage={studentParams.language}
                classChallenges={classChallenges}
                studyPlans={studyPlans}
                notifications={notifications}
                onReadNotification={handleReadNotification}
                tourSimulateAction={tourAction}
                onClearTourAction={() => setTourAction(null)}
              />
            } />
            <Route path="/debate" element={
              <DebateArena 
                currentTier={studentParams.tier}
                currentLanguage={studentParams.language}
              />
            } />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/teacher" element={
              <TeacherDashboard 
                currentTopic={studentParams.topic}
                currentGrade={studentParams.grade}
                currentSubject={studentParams.subject}
                onChangeParams={onChangeParams}
                classrooms={classrooms}
                onAddStudent={handleAddStudent}
                classChallenges={classChallenges}
                onAddChallenge={handleAddChallenge}
                uploadedSyllabus={uploadedSyllabus}
                studyPlans={studyPlans}
                onAddStudyPlan={handleAddStudyPlan}
              />
            } />
            <Route path="/admin" element={
              <AdminConsole 
                uploadedSyllabus={uploadedSyllabus}
                onUploadSyllabus={handleUploadSyllabus}
                onDeleteSyllabus={handleDeleteSyllabus}
              />
            } />
            <Route path="/demo/meena" element={<VideoDemo />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Routes>
        </div>
      </main>

      {/* Global Hackathon Demo Tour Overlay Controller */}
      <JudgeDemoMode 
        studentParams={studentParams}
        onChangeParams={onChangeParams}
        onSimulateTourAction={handleSimulateTourAction}
      />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
