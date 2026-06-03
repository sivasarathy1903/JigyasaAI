import React from 'react';
import { Award, ShieldCheck, Sparkles, Compass, GraduationCap, Flame, Terminal, HelpCircle } from 'lucide-react';
import { SkillPassport } from '../types';

interface Props {
  passport: SkillPassport;
}

export default function SkillPassportCard({ passport }: Props) {
  // Convert Skill scores to an array for easy rendering
  const skills = Object.entries(passport.skill_scores).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    ...value,
  }));

  return (
    <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-xl overflow-hidden max-w-4xl mx-auto my-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white p-6 border-b-2 border-slate-900 relatived overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 font-mono text-8xl -mr-6 -mt-6 pointer-events-none select-none">
          JIGYASA
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-mono font-medium tracking-wider uppercase mb-2 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 inline animate-pulse" /> Certified Competency Passport
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
              {passport.student_name}
            </h2>
            <p className="text-slate-400 font-mono text-xs mt-1">
              Passport ID: <span className="text-slate-200">{passport.passport_id}</span> • Issued: {passport.issued_date}
            </p>
          </div>
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,44,34,1)] font-mono text-sm font-bold flex items-center gap-1.5 self-stretch md:self-auto text-center justify-center">
            <Award className="w-4 h-4" /> LEVEL: ADVANCED
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b-2 border-slate-900">
        
        {/* Info Sidebar */}
        <div className="lg:col-span-4 bg-slate-50 p-6 border-r-0 lg:border-r-2 lg:col-span-4 border-slate-900 space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Student Profile</span>
            <div className="mt-2 space-y-3 font-medium text-sm text-slate-700">
              <div className="flex items-center gap-2 text-slate-950 font-display">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Grade: <strong className="text-slate-900">{passport.grade}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Domain: <strong className="text-slate-900">Socratic Inquiry</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Top Skill: <strong className="text-slate-900 font-display">{passport.strongest_skill}</strong></span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Growth Focus</span>
            <p className="mt-1.5 text-sm text-slate-700">
              Aiming toward <span className="font-semibold text-slate-900 underline decoration-indigo-500/40 decoration-2">{passport.growth_area}</span> development through team simulation scenarios.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-xs font-mono uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Signature Accomplishment
            </h4>
            <p className="mt-1.5 text-xs text-indigo-900 leading-relaxed italic">
              "{passport.signature_achievement}"
            </p>
          </div>
        </div>

        {/* Skills Performance */}
        <div className="lg:col-span-8 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Verifiable Learning Evidence</span>
            <span className="text-slate-500 text-xs font-mono">Click bars to reveal reasoning evidence</span>
          </div>

          <div className="space-y-4">
            {skills.map((sk) => (
              <div key={sk.name} className="group relative">
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="font-semibold text-slate-800">{sk.name}</span>
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">{sk.level}</span>
                    <strong className="text-slate-900">{sk.score}%</strong>
                  </span>
                </div>
                
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-slate-100 border border-slate-900 rounded-full h-4.5 overflow-hidden p-0.5 relative cursor-help">
                  <div 
                    className="bg-indigo-600 rounded-full h-full border border-slate-950 transition-all duration-1000 ease-out shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"
                    style={{ width: `${sk.score}%` }}
                  />
                  <div className="absolute inset-0 flex items-center pl-2 pointer-events-none">
                    <span className="text-[9px] font-mono font-medium text-indigo-300 drop-shadow">INDEX: {sk.score}</span>
                  </div>
                </div>

                {/* Hover Evidence Display */}
                <div className="mt-1 opacity-100 max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-300 ease-in-out">
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-200 font-sans shadow-sm">
                    💡 <strong className="text-slate-700">Competency Proof:</strong> {sk.evidence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Credentials */}
      <div className="bg-slate-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-xl">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Future Readiness / Employer Overview</h4>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {passport.employer_summary}
          </p>
        </div>
        <div className="shrink-0 bg-white border border-slate-300 rounded-lg p-3 w-full md:w-auto">
          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-1.5">Next Recommended Roadmap</span>
          <ul className="space-y-1">
            {passport.recommended_next_challenges.map((ch, idx) => (
              <li key={idx} className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                🚀 {ch}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
