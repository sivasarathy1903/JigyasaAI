import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, SkipForward, RotateCcw, ShieldAlert, Award, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  studentParams: any;
  onChangeParams: any;
  onSimulateTourAction: (actionType: string, payload?: any) => void;
}

export default function JudgeDemoMode({ studentParams, onChangeParams, onSimulateTourAction }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [tourStep, setTourStep] = useState(0); // 0 to 6
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(10); // 10s per step

  const tourSteps = [
    {
      title: "1. Loads Meena",
      desc: "Simulating student input. Loads Meena S., Class 7, Tamil Nadu, Social Science, Local Governance.",
      route: "/student",
      action: "LOAD_MEENA",
      duration: 8
    },
    {
      title: "2. Shows Baseline Test",
      desc: "Automatically launches diagnostic questions. Evaluates core knowledge and computes a score.",
      route: "/student",
      action: "SUBMIT_BASELINE",
      duration: 12
    },
    {
      title: "3. Shows AI Mission Generation",
      desc: "AI calibrates personalized mission and task roadmap.",
      route: "/student",
      action: "LOAD_MISSION",
      duration: 10
    },
    {
      title: "4. Shows Community Exploration",
      desc: "Navigates to Debate Arena. Simulates community peer discussion and exploration.",
      route: "/debate",
      action: "SHOW_COMMUNITY",
      duration: 14
    },
    {
      title: "5. Shows Parent Dashboard",
      desc: "Navigates to Parent Portal. Reveals growth trends, skill development scores for parents.",
      route: "/parent",
      action: "SHOW_PARENT",
      duration: 10
    },
    {
      title: "6. Shows Teacher Dashboard",
      desc: "Navigates to Teacher Portal. Inspects skill heatmaps, attention alerts for the class.",
      route: "/teacher",
      action: "SHOW_TEACHER",
      duration: 10
    },
    {
      title: "7. Shows Final Analytics",
      desc: "Navigates to Admin Console. Overall analytics, final impact assessment and curriculum updates.",
      route: "/admin",
      action: "SHOW_ANALYTICS",
      duration: 10
    }
  ];

  // Auto playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && isPlaying) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Move to next step
            handleNextStep();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, isPlaying, tourStep]);

  // Execute actions on step change
  useEffect(() => {
    if (!isActive) return;
    const step = tourSteps[tourStep];
    if (step) {
      setCountdown(step.duration);
      navigate(step.route);
      onSimulateTourAction(step.action);
    }
  }, [tourStep, isActive]);

  const startTour = () => {
    setIsActive(true);
    setTourStep(0);
    setIsPlaying(true);
  };

  const handleNextStep = () => {
    setTourStep((prev) => {
      if (prev >= tourSteps.length - 1) {
        setIsPlaying(false);
        setIsActive(false); // Tour completed
        return 0;
      }
      return prev + 1;
    });
  };

  const handlePrevStep = () => {
    setTourStep((prev) => Math.max(0, prev - 1));
  };

  const stopTour = () => {
    setIsActive(false);
    setIsPlaying(false);
    onSimulateTourAction("RESET_STUDENT_PORTAL");
    navigate('/student');
  };

  return (
    <>
      {/* Floating Hackathon Tour Activation Button */}
      {!isActive && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-50 font-sans"
        >
          <button
            onClick={startTour}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-mono font-bold text-xs py-3 px-5 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] cursor-pointer active:translate-y-0.5"
          >
            <Award className="w-5 h-5 text-white animate-bounce shrink-0" />
            <span>🏆 HACKATHON DEMO TOUR (2 MIN)</span>
          </button>
        </motion.div>
      )}

      {/* Presentation Tour Panel Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-950 text-white border-t-4 border-amber-500 p-4.5 z-50 font-sans flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl shadow-slate-950"
          >
            {/* Left Description info */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-amber-500 text-slate-950 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-950">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  🏆 JUDGE TOUR IN PROGRESS • NEXT STEP IN {countdown}S
                </span>
                <h4 className="font-bold text-sm tracking-tight text-white mt-0.5">
                  {tourSteps[tourStep].title}
                </h4>
                <p className="text-[11px] text-slate-350 leading-normal max-w-xl">
                  {tourSteps[tourStep].desc}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-3 shrink-0">
              
              <div className="flex bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={handlePrevStep}
                  disabled={tourStep === 0}
                  className="p-2.5 hover:bg-white/5 text-slate-300 disabled:opacity-30 cursor-pointer"
                >
                  ⏪
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2.5 hover:bg-white/5 border-x border-white/10 text-white cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={handleNextStep}
                  className="p-2.5 hover:bg-white/5 text-slate-300 cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Slider Indicator */}
              <div className="text-center font-mono text-xs text-slate-400 px-2">
                {tourStep + 1} / {tourSteps.length}
              </div>

              <button
                onClick={stopTour}
                className="bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-[10px] uppercase py-2.5 px-4 rounded-xl border border-rose-500 cursor-pointer transition-all"
              >
                Quit Tour
              </button>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
