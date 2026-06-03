import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Play, Pause, RotateCcw, Maximize, CheckCircle, 
  Compass, Shield, Users, BookOpen, BarChart2, Star, Volume2, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VideoDemo() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStage, setActiveStage] = useState(0); // 0 to 4
  const videoRef = useRef<HTMLDivElement>(null);

  const stages = [
    {
      id: 0,
      name: t('curiosityGeneration'),
      color: "from-purple-500 to-indigo-500",
      description: "Meena fills in her profile and takes the baseline assessment. AI generates curriculum-aligned Socratic challenges.",
      icon: Compass,
      screenTitle: "AI CURRICULUM BASELINE SYSTEM",
      details: [
        "Student Profile: Meena S., Class 7, Tamil Nadu",
        "Subject: Social Science, Topic: Local Governance",
        "Baseline Score: 85 (Advanced Thinking Index)",
        "Calibrating Socratic Probe engine to Tier: BUILDER..."
      ]
    },
    {
      id: 1,
      name: t('communityInvestigation'),
      color: "from-blue-500 to-cyan-500",
      description: "Meena investigates local Chennai water crises. She proposes desilting dry lakebeds with a ₹50L budget constraint.",
      icon: Shield,
      screenTitle: "COMMUNITY INQUIRY & CRITICAL DECISION",
      details: [
        "Goal: Design water conservation roadmap",
        "Constraint Safeguards: No displacement of poor villagers",
        "Student input evaluated: 85% logical consistency",
        "AI Agent response: Pushing Socratic trade-off challenge..."
      ]
    },
    {
      id: 2,
      name: t('reflection'),
      color: "from-emerald-500 to-teal-500",
      description: "AI Devil's Advocate pushes back on her arguments. Consequence Simulator maps 1-year to 5-year outcomes.",
      icon: HelpCircle,
      screenTitle: "DEVIL'S ADVOCATE & CONSEQUENCE HORIZONS",
      details: [
        "Unintended Outcome: Rise in water attracts commercial hotels",
        "Second-Order evaluation: How to protect water rights of small farmers?",
        "Reflection Metric: Highly adaptive systems-level reasoning"
      ]
    },
    {
      id: 3,
      name: t('parentInsights'),
      color: "from-amber-500 to-orange-500",
      description: "Skills Passport compiles with verified badges. Parents receive qualitative growth reports and home tips.",
      icon: Users,
      screenTitle: "PARENTAL GROWTH PORTAL",
      details: [
        "Badge Earned: Civic Water Warden Badge",
        "Parent Advisory: Involve child in kitchen rainwater audit",
        "Developmental Feedback: Growth area identified in leadership"
      ]
    },
    {
      id: 4,
      name: t('teacherAnalytics'),
      color: "from-pink-500 to-rose-500",
      description: "Teacher panel updates with competency metrics, Bloom taxonomy test generator, and attention indicators.",
      icon: BarChart2,
      screenTitle: "TEACHER COGNITIVE CONSOLE",
      details: [
        "Class Weakness: Cost limit constraints (₹50 Lakh budget overrun)",
        "Attention Recommendation: Active intervention with Karthik S.",
        "Syllabus Test generated: 10 assessment items loaded"
      ]
    }
  ];

  // Simulated video playback cycle
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const nextProgress = prev + 0.8;
          // Determine stage based on progress
          const stageIndex = Math.min(4, Math.floor(nextProgress / 20));
          setActiveStage(stageIndex);
          return nextProgress;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    setProgress(0);
    setActiveStage(0);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.log(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-6 p-4">
      
      {/* Demo Header */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <span className="bg-purple-100 text-purple-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase border border-purple-200">
          🎬 Interactive Walkthrough Experience
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2 font-display">
          {t('videoTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Explore Meena's learning path. Watch how Socratic prompts, baseline assessments, and analytics dashboards tie together in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Video Player */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={videoRef}
            className={`relative rounded-2xl border-2 border-slate-900 bg-slate-950 aspect-video shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex flex-col justify-between p-6 ${
              isFullscreen ? 'h-screen w-screen p-12' : ''
            }`}
          >
            {/* Dark grid background pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Video Watermark Header */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-slate-300 tracking-wider">LIVE WALKTHROUGH DEMO</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded">
                STAGE {activeStage + 1}/5
              </span>
            </div>

            {/* Mock Screen Content - updates based on active stage */}
            <div className="flex-1 flex flex-col justify-center items-center py-6 text-center z-10 max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 w-full"
                >
                  <span className="text-[11px] font-mono font-bold text-indigo-400 tracking-widest block">
                    {stages[activeStage].screenTitle}
                  </span>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {stages[activeStage].name}
                  </h3>

                  <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-xl p-4 text-left font-mono text-[10px] md:text-xs text-slate-300 space-y-1.5 shadow-lg max-h-[140px] overflow-y-auto">
                    {stages[activeStage].details.map((detail, index) => (
                      <div key={index} className="flex gap-1.5 items-start">
                        <span className="text-indigo-400 font-bold">▶</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Video Custom Controls Shell */}
            <div className="z-10 bg-slate-900/90 backdrop-blur border border-white/10 p-3 rounded-xl space-y-3 shadow-md mt-auto">
              
              {/* Playback Progress Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400">
                  {Math.floor(progress / 20)}:{(Math.floor((progress % 20) * 3)).toString().padStart(2, '0')}
                </span>
                <div 
                  className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newProgress = (clickX / rect.width) * 100;
                    setProgress(newProgress);
                    setActiveStage(Math.min(4, Math.floor(newProgress / 20)));
                  }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600 transition-all duration-100" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">05:00</span>
              </div>

              {/* Action Buttons & Labels */}
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePlayPause}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 text-indigo-400" />}
                  </button>
                  <button 
                    onClick={handleReplay}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs ml-2 border-l border-white/10 pl-3">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[10px] font-mono hidden sm:inline">STEREO ACTIVE</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">GEMINI 3.5 POWERED</span>
                  <button 
                    onClick={toggleFullscreen}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Side: Progress Stages Tracker */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-4">
              📌 Investigation Phases
            </h3>

            <div className="space-y-3">
              {stages.map((stage, idx) => {
                const IconComponent = stage.icon;
                const isActive = activeStage === idx;
                const isCompleted = activeStage > idx;

                return (
                  <div 
                    key={stage.id}
                    onClick={() => {
                      setActiveStage(idx);
                      setProgress(idx * 20 + 5);
                    }}
                    className={`p-3.5 border-2 rounded-xl text-left cursor-pointer transition-all flex gap-3 items-start relative overflow-hidden ${
                      isActive 
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    {/* Active highlight side tag */}
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}

                    <div className={`p-2 rounded-lg shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {stage.name}
                        </span>
                        {isCompleted && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick summary button to try active mission */}
            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <a 
                href="/student" 
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs py-2.5 px-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
              >
                🚀 TRY MEENA DEMO CORE JOURNEY
              </a>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
