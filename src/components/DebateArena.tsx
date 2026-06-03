import React, { useState } from 'react';
import { 
  Flame, Sparkles, AlertCircle, RefreshCw, Send, Loader2, Award, Plus, Compass 
} from 'lucide-react';
import { DebateTurn, Tier } from '../types';

interface Props {
  currentTier: Tier;
  currentLanguage: string;
}

const TOPICS_BY_TIER = {
  SPROUT: { topic: "Should everyone share their lunch at school?", position: "FOR" },
  EXPLORER: { topic: "Should mobile phones be allowed in schools?", position: "AGAINST" },
  BUILDER: { topic: "Should India stop building coal power plants?", position: "FOR" },
  INNOVATOR: { topic: "Should AI be allowed to grade student exams?", position: "AGAINST" },
};

export default function DebateArena({ currentTier, currentLanguage }: Props) {
  const [topic, setTopic] = useState(TOPICS_BY_TIER[currentTier]?.topic || TOPICS_BY_TIER.BUILDER.topic);
  const [position, setPosition] = useState<'FOR' | 'AGAINST'>('FOR');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0 corresponds to "Setup Stage"
  const [history, setHistory] = useState<{ role: 'student' | 'ai'; text: string; phase?: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [scoreCard, setScoreCard] = useState<any>(null);

  // Auto-fill template answers instantly during E2E play to ease testing
  const SUGGESTED_ANSWERS: Record<number, string> = {
    1: "1. Coal causes high soot pollution. 2. Solar is getting cheaper in Tamil Nadu. 3. Climate change causes extreme heatwaves.",
    2: "We must stop building coal plants immediately because clean solar protects the health of kids. India should lead the world in green energy.",
    3: "Although storage is expensive, localized hydro and lithium battery corridors can maintain microgrids when the sun sets.",
    4: "We can transition slowly over 5 years. This gives time to train coal miners in solar panel manufacturing and local installation skills.",
    5: "Even in grid locks, temporary solar storage reservoirs can take emergency load, prioritizing clean hospitals and municipal grids.",
    6: "After arguing, I still stay mostly FOR, but I am now much more aware of grid stability and poverty issues.",
    7: "I believe sustainable transitions are hard but absolutely vital.",
  };

  const handleStartDebate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          studentPosition: position,
          currentStep: 1,
          lastResponse: '',
          history: [],
          language: currentLanguage,
          tier: currentTier,
        }),
      });
      const data = await res.json();
      setStep(1);
      setHistory([{ role: 'ai', text: data.message, phase: data.phase }]);
      setInputValue(SUGGESTED_ANSWERS[1] || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTurn = async () => {
    if (!inputValue.trim()) return;
    
    const nextStep = step + 1;
    const newHistory = [...history, { role: 'student' as const, text: inputValue }];
    setHistory(newHistory);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          studentPosition: position,
          currentStep: nextStep,
          lastResponse: inputValue,
          history: newHistory,
          language: currentLanguage,
          tier: currentTier,
        }),
      });
      const data = await res.json();
      
      setStep(nextStep);
      setHistory(prev => [...prev, { role: 'ai', text: data.message, phase: data.phase }]);
      
      if (data.scoreCard) {
        setScoreCard(data.scoreCard);
      } else {
        setInputValue(SUGGESTED_ANSWERS[nextStep] || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setHistory([]);
    setInputValue('');
    setScoreCard(null);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-950 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] font-sans max-w-4xl mx-auto my-8">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4 mb-4">
        <div>
          <span className="bg-rose-100 text-rose-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
            ⚔️ AI CORRIDOR DEBATE
          </span>
          <h2 className="text-xl font-display font-bold text-slate-900 mt-1">
            Debate Arena
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross swords with the oppositional critic to hone objective advocacy.
          </p>
        </div>
        {step > 0 && (
          <button
            onClick={handleReset}
            className="text-xs font-mono font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 p-2 border border-slate-350 rounded-lg active:translate-y-0.5"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {step === 0 ? (
        /* SETUP MODE */
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-bold text-xs text-orange-950 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" /> Challenge Rule: Dialectics
            </h4>
            <p className="text-xs text-orange-900 leading-relaxed mt-1">
              Select your topic and position. The opponent engine will purposefully take the opposing position and throw complex constraints, demanding that you integrate and defend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Debate Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g. Should India ban plastics?"
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:bg-white"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span 
                  onClick={() => setTopic(TOPICS_BY_TIER[currentTier]?.topic || "Should lunch be shared?")}
                  className="bg-slate-100 hover:bg-indigo-150 cursor-pointer border border-slate-200 text-[10px] font-sans font-medium px-2 py-1 rounded"
                >
                  ⚡ Fill Tier Default Topic
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Your Position Stance</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPosition('FOR')}
                  className={`flex-1 font-bold text-xs py-2.5 rounded-lg border-2 border-slate-900 transition-all ${
                    position === 'FOR' ? 'bg-indigo-100 text-indigo-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' : 'bg-white hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  🟢 FOR Topic
                </button>
                <button
                  onClick={() => setPosition('AGAINST')}
                  className={`flex-1 font-bold text-xs py-2.5 rounded-lg border-2 border-slate-900 transition-all ${
                    position === 'AGAINST' ? 'bg-indigo-100 text-indigo-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' : 'bg-white hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  🔴 AGAINST Topic
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartDebate}
            disabled={loading}
            className="w-full bg-slate-900 text-slate-100 text-xs font-bold py-3 rounded-lg border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ENTER THE DEBATE ARENA ⚔️"}
          </button>
        </div>
      ) : (
        /* ACTIVE DEBATE CHAT LAYOUT */
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <span>TOPIK: <strong className="text-slate-900">{topic}</strong></span>
            <span>STAGE: <strong className="text-indigo-600">{step}/8 ({history[history.length - 1]?.phase || 'IN PROGRESS'})</strong></span>
          </div>

          {/* Discussion feed */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 bg-slate-50/50 border border-slate-200 rounded-xl p-4">
            {history.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-3 max-w-2xl ${msg.role === 'student' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {msg.role !== 'student' && (
                  <div className="bg-indigo-600 text-white w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 shadow">
                    AI
                  </div>
                )}
                
                <div className={`p-4 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'student' 
                    ? 'bg-slate-900 text-slate-100 rounded-tr-none border border-slate-900 shadow-sm'
                    : 'bg-white text-slate-800 rounded-tl-none border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                }`}>
                  {msg.phase && (
                    <span className="block text-[8px] font-mono text-indigo-500 uppercase tracking-widest font-bold mb-1">
                      {msg.phase}
                    </span>
                  )}
                  {msg.text}
                </div>

                {msg.role === 'student' && (
                  <div className="bg-slate-300 text-slate-800 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border border-slate-400">
                    S
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-500 font-mono text-xs pl-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Jigyasa AI is analyzing counterarguments...
              </div>
            )}
          </div>

          {/* ScoreCard Display when Step 8 completed */}
          {scoreCard && (
            <div className="mt-6 border-2 border-slate-900 rounded-xl p-5 bg-indigo-50/60 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] animate-fade-in">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-indigo-200 pb-2 mb-3">
                <Award className="w-5 h-5 text-indigo-600" /> Debate Scorecard Assessment
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { name: 'Communication', ...scoreCard.communication },
                  { name: 'Critical Thinking', ...scoreCard.critical_thinking },
                  { name: 'Evidence Use', ...scoreCard.evidence_use },
                  { name: 'Persuasion', ...scoreCard.persuasion },
                ].map((s) => (
                  <div key={s.name} className="bg-white border border-slate-300 p-3 rounded-lg text-center shadow-sm">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">{s.name}</span>
                    <strong className="text-lg font-display text-slate-900 block mt-1">{s.score}</strong>
                    <p className="text-[10px] text-slate-500 italic mt-1 leading-snug">{s.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 border border-slate-350 rounded-lg text-xs mt-2">
                <strong className="font-semibold text-slate-800">Review Summary:</strong>
                <p className="text-slate-700 italic mt-1">{scoreCard.overall_summary}</p>
              </div>
            </div>
          )}

          {/* User Response box */}
          {step < 8 && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter your argument or answer standard probe..."
                  className="flex-1 bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-sans focus:outline-none focus:bg-white resize-none h-18"
                />
                <button
                  onClick={handleSubmitTurn}
                  disabled={loading || !inputValue.trim()}
                  className="bg-indigo-600 text-white border-2 border-slate-900 p-3 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-indigo-700 rounded-xl w-14 flex items-center justify-center shrink-0 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Assistive Copy helper box */}
              {SUGGESTED_ANSWERS[step] && (
                <div onClick={() => setInputValue(SUGGESTED_ANSWERS[step])} className="bg-slate-50 text-[10px] font-mono hover:bg-slate-100 border border-dashed border-slate-300 p-2.5 rounded-lg cursor-pointer text-slate-500 leading-tight">
                  💡 <span className="font-semibold text-indigo-600">Continuous play suggestion:</span> Tap to auto-fill Meena's high-fidelity answer: <span className="text-slate-700 italic block mt-1 border-t border-slate-200 pt-1">"{SUGGESTED_ANSWERS[step].substring(0, 85)}..."</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
