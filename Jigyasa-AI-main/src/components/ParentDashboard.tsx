import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Award, TrendingUp, Compass, Calendar, BookOpen, 
  Lightbulb, Shield, CheckCircle, ArrowRight, UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ParentDashboard() {
  const { t } = useTranslation();

  // Mock Parent Dashboard details. Calibrated to Meena S. Panchayat demo.
  const [parentData] = useState({
    studentName: "Meena S.",
    grade: "Class 7",
    completedMissions: [
      {
        id: "m-1",
        title: "Panchayat Water Security Council",
        date: "June 02, 2026",
        skills: ["Systems Thinking", "Civic Action"],
        status: "COMPLETED",
        score: 92
      },
      {
        id: "m-2",
        title: "Balcony Rain Harvesting Blueprint",
        date: "May 28, 2026",
        skills: ["Engineering Design", "Budgeting"],
        status: "COMPLETED",
        score: 88
      }
    ],
    skills: [
      { name: "Critical Thinking", score: 85, color: "bg-purple-500" },
      { name: "Problem Solving", score: 78, color: "bg-indigo-500" },
      { name: "Creativity", score: 88, color: "bg-pink-500" },
      { name: "Communication", score: 80, color: "bg-emerald-500" },
      { name: "Community Engagement", score: 75, color: "bg-amber-500" }
    ],
    recommendations: [
      "Involve Meena in calculating your monthly utility bills to build financial constraint awareness.",
      "Conduct a 'Home Rainwater Audit' together—measure how much roof runoff is currently wasted.",
      "Encourage her to explain local Gram Panchayat laws to the family in bilingual English/Tamil."
    ],
    badges: [
      {
        title: t('demoBadge'),
        desc: t('demoBadgeDesc'),
        icon: Shield,
        color: "text-amber-500 bg-amber-50 border-amber-200"
      },
      {
        title: "Eco Architect Badge",
        desc: "Awarded for designing low-cost PVC roof harvesting layouts.",
        icon: Award,
        color: "text-purple-500 bg-purple-50 border-purple-200"
      }
    ]
  });

  return (
    <div className="font-sans max-w-5xl mx-auto my-6 p-4 space-y-6">
      
      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl border-2 border-slate-950 p-6 text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono font-bold uppercase mb-1">
            <UserCheck className="w-3.5 h-3.5" /> Jigyasa Parent Console
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {parentData.studentName} — {t('learningProgress')}
          </h2>
          <p className="text-xs text-indigo-200/80 mt-0.5">
            Qualitative competency tracking & Socratic development logs for <strong>{parentData.grade}</strong>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-xl text-xs font-mono text-white text-right shrink-0 z-10">
          ⭐ Growth Status: <strong className="text-amber-400">Advanced Explorer</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Skills Developed & Progress */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Progress Tracker Card */}
          <div className="bg-white border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
            <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-600" /> {t('skillsDeveloped')}
            </h3>

            <div className="space-y-3.5">
              {parentData.skills.map((skill, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{skill.name}</span>
                    <strong className="font-mono text-indigo-900">{skill.score}%</strong>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <motion.div 
                      className={`h-full rounded-full ${skill.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Completion List */}
          <div className="bg-white border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
            <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-600" /> {t('missionCompletion')}
            </h3>

            <div className="space-y-3">
              {parentData.completedMissions.map((m) => (
                <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center gap-4 hover:border-slate-400 transition-all">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {m.title}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400 items-center">
                      <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {m.date}</span>
                      <span>•</span>
                      {m.skills.map((s, idx) => (
                        <span key={idx} className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200 block">
                      {m.status}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 block mt-1">Score: {m.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Recommendations & Badges */}
        <div className="space-y-6">
          
          {/* Recommendations Card */}
          <div className="bg-white border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
            <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-purple-600" /> {t('recommendations')}
            </h3>

            <ul className="space-y-3 text-xs leading-relaxed text-slate-600 list-none pl-0">
              {parentData.recommendations.map((tip, idx) => (
                <li key={idx} className="flex gap-2 items-start bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                  <span className="text-purple-600 font-bold shrink-0 mt-0.5">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Badges Earned Card */}
          <div className="bg-white border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
            <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" /> {t('badgeEarned')}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {parentData.badges.map((badge, index) => {
                const IconComponent = badge.icon;
                return (
                  <div key={index} className={`p-3 border rounded-xl flex gap-3 items-center ${badge.color}`}>
                    <div className="p-2 rounded-lg bg-white/80 shrink-0 border border-inherit">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950 text-xs">{badge.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
