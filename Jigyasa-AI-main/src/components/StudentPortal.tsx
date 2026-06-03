import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, Compass, HelpCircle, Send, Loader2, ArrowRight,
  Flame, CheckCircle, AlertTriangle, Clock, Calendar, Mic, 
  Image as ImageIcon, RefreshCw, Upload, Eye, FileText, Globe, Info, Play, BarChart2, Shield, User, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tier, Scenario, ChatMessage, DevilsAdvocateChallenge, ConsequenceSimulation, SkillPassport, BaselineQuestion, BaselineAssessment, PersonalizedMission, AIMissionInsights } from '../types';
import SkillPassportCard from './SkillPassportCard';

interface Props {
  currentTier: Tier;
  currentLanguage: string;
  onChangeParams: (grade: string, subject: string, topic: string, state: string, language: string, tier: Tier) => void;
  studentParams: {
    studentName: string;
    grade: string;
    subject: string;
    topic: string;
    state: string;
    language: string;
    tier: Tier;
  };
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Delhi", "Puducherry", "Chandigarh", "Jammu and Kashmir", "Ladakh"
];

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

const CLASSES = [
  "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", 
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
];

export default function StudentPortal({ studentParams, onChangeParams, currentTier, currentLanguage }: Props) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  // Steps: 
  // 1: Setup Form
  // 1.2: Baseline Test Loading/Questions
  // 1.5: Baseline Evaluation & Personalized Mission Preview
  // 2: Examine Mission Scenario
  // 3: Socratic Dialogue
  // 4: Devil's Advocate Challenge
  // 5: Consequence Simulator
  // 6: AI Insights & Skill Passport
  const [activeStep, setActiveStep] = useState(1); 
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [devilsChallenge, setDevilsChallenge] = useState<DevilsAdvocateChallenge | null>(null);
  const [consequenceData, setConsequenceData] = useState<ConsequenceSimulation | null>(null);
  const [finalPassport, setFinalPassport] = useState<SkillPassport | null>(null);

  // Baseline Test states
  const [baselineAssessment, setBaselineAssessment] = useState<BaselineAssessment | null>(null);
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, string>>({});
  const [personalizedMission, setPersonalizedMission] = useState<PersonalizedMission | null>(null);

  // Post-mission AI insights
  const [aiInsights, setAiInsights] = useState<AIMissionInsights | null>(null);

  // Gamification states
  const [streakDays, setStreakDays] = useState(5);
  const [points, setPoints] = useState(120);
  const [showProfile, setShowProfile] = useState(false);

  // Multimodal states
  const [multimodalType, setMultimodalType] = useState<'text' | 'image' | 'voice'>('text');
  const [voiceSimulating, setVoiceSimulating] = useState(false);
  const [imageSimulating, setImageSimulating] = useState(false);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(null);
  const [multimodalFeedback, setMultimodalFeedback] = useState<any>(null);

  // Subjects & Topics data sources
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [topicsList, setTopicsList] = useState<string[]>([]);

  // Sample sketch drawings preset
  const IMAGE_PRESETS = [
    {
      name: "Silt absorption model drawing (Meena's Sketch)",
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80",
      description: "Concept drawing of Chennai dry-bed desilting showing agricultural silt delivery pipelines.",
      base64Sample: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    },
    {
      name: "Apartment Rain Pipe Blueprint Map",
      url: "https://images.unsplash.com/photo-1503387762458-7e52d4dec167?auto=format&fit=crop&w=600&q=80",
      description: "Sketch plan of PVC ducts redirecting roof rain runoff straight to the groundwater borewells.",
      base64Sample: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }
  ];

  const SUGGESTED_ANSWERS: Record<number, string> = {
    1: "I suggest mobilizing local village farmers to manually scrape dry silt out of Chennai lakebeds. We will pay them small daily food wages from our safety fund.",
    2: "We can sell the high-quality lake silt directly to city estate builders as cheap construction soil. This generates self-sustaining profits for our Panchayat fund!",
  };

  // Determine subject options based on Class selection
  useEffect(() => {
    const grade = studentParams.grade;
    let list: string[] = [];
    if (grade === "LKG" || grade === "UKG") {
      list = ["Alphabet Learning", "Numbers", "Shapes", "Colors", "General Awareness"];
    } else if (["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"].includes(grade)) {
      list = ["English", "Mathematics", "EVS", "Science", "Social Science", "Tamil", "Hindi"];
    } else if (["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].includes(grade)) {
      list = ["English", "Mathematics", "Science", "Social Science", "Tamil", "Hindi", "Computer Science"];
    } else {
      list = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "Commerce", "Accountancy", "Economics", "Business Studies", "History", "Political Science"];
    }
    setSubjectsList(list);

    // If the currently assigned subject is not in the list, set to first available item
    if (!list.includes(studentParams.subject)) {
      updateSingleParam("subject", list[0] || "");
    }
  }, [studentParams.grade]);

  // Determine topic options based on Class + Subject + State
  useEffect(() => {
    const comboKey = `${studentParams.grade}_${studentParams.subject}`;
    let topics: string[] = [];

    // Predefined combinations
    if (studentParams.grade === "Class 7" && studentParams.subject === "Social Science") {
      topics = ["Local Governance", "Panchayat System", "Democracy", "Media and Communication", "Markets Around Us"];
    } else if (studentParams.grade === "Class 10" && studentParams.subject === "Science") {
      topics = ["Light", "Electricity", "Chemical Reactions", "Life Processes"];
    } else {
      // General fallbacks
      const fallbackKey = `default_${studentParams.subject}`;
      const defaultTopics: Record<string, string[]> = {
        "default_Science": ["Force and Motion", "Skeletal System", "Plants & Photosynthesis", "Acids and Bases"],
        "default_Mathematics": ["Linear Equations", "Fractions & Decimals", "Ratio and Proportion", "Basic Geometry"],
        "default_English": ["Grammar Basics", "Reading Comprehension", "Adjectives & Adverbs"],
        "default_EVS": ["Our Environment", "Water Conservation", "Waste Management"],
        "default_Social Science": ["Our History", "Civics & Governance", "Maps & Geography"],
        "default_Alphabet Learning": ["Phonics A-Z", "Capital & Small Letters", "Word Matching"],
        "default_Numbers": ["Counting 1-20", "Number Names", "Simple Shapes Count"],
        "default_Shapes": ["2D & 3D Shapes", "Symmetry Basics", "Shape Sorting"],
        "default_Colors": ["Primary Colors", "Secondary Colors", "Color Mixing"],
        "default_General Awareness": ["My Family", "Neighbourhood Animals", "Civic Habits"]
      };
      topics = defaultTopics[fallbackKey] || ["Basic Inquiry", "Logical Reasoning", "Problem Solving"];
    }
    setTopicsList(topics);

    if (!topics.includes(studentParams.topic)) {
      updateSingleParam("topic", topics[0] || "");
    }
  }, [studentParams.grade, studentParams.subject]);

  const updateSingleParam = (key: string, value: string) => {
    const updated = { ...studentParams, [key]: value };
    onChangeParams(updated.grade, updated.subject, updated.topic, updated.state, updated.language, updated.tier);
  };

  // Pre-load Meena E2E predefined demo instantly
  const handleLoadMeenaDemo = () => {
    // Select Tamil translation if language matches Tamil
    onChangeParams(
      'Class 7',
      'Social Science',
      'Local Governance',
      'Tamil Nadu',
      'English',
      'BUILDER'
    );
    // Overwrite the student name manually
    const updated = { ...studentParams, studentName: "Meena S.", grade: "Class 7", subject: "Social Science", topic: "Local Governance", state: "Tamil Nadu", language: "English" };
    onChangeParams(updated.grade, updated.subject, updated.topic, updated.state, updated.language, updated.tier);
  };

  // STEP 1.2: Launch Baseline Assessment
  const handleLaunchBaseline = async () => {
    if (!studentParams.studentName.trim()) {
      alert("Please enter Student Name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate-baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentParams),
      });
      const data = await res.json();
      setBaselineAssessment(data);
      setBaselineAnswers({});
      setActiveStep(1.2);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1.5: Submit Baseline Assessment
  const handleSubmitBaseline = async () => {
    setLoading(true);
    
    // Evaluate score: Compare student answers to answerKeys
    let correctCount = 0;
    const questions = baselineAssessment?.questions || [];
    
    questions.forEach((q) => {
      const ans = baselineAnswers[q.id] || "";
      if (ans.toLowerCase().trim() === q.answerKey.toLowerCase().trim()) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    let category: 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced' = 'Beginner';
    if (score > 80) category = 'Advanced';
    else if (score > 60) category = 'Intermediate';
    else if (score > 30) category = 'Developing';

    try {
      const res = await fetch('/api/generate-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentParams,
          baselineScore: score,
          category: category
        }),
      });
      const missionData = await res.json();
      setPersonalizedMission(missionData);
      
      if (baselineAssessment) {
        setBaselineAssessment({
          ...baselineAssessment,
          score,
          category
        });
      }
      setActiveStep(1.5);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Generate the Socratic inquiry Scenario
  const handleStartPersonalizedMission = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentParams,
          topic: personalizedMission?.missionTitle || studentParams.topic,
          tier: baselineAssessment?.category === 'Advanced' ? 'INNOVATOR' : baselineAssessment?.category === 'Intermediate' ? 'BUILDER' : 'EXPLORER'
        }),
      });
      const data = await res.json();
      setScenario(data);
      
      // Seed first Socratic question in chat history
      setChatHistory([
        {
          id: 'first-ai',
          sender: 'ai',
          text: data.opening_question,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      
      setActiveStep(2); // Jump to Scenario card screen
      setCurrentInput(SUGGESTED_ANSWERS[1] || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Socratic Probes
  const handleSendSocraticAnswer = async () => {
    if (!currentInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'student',
      text: currentInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    const nextHistory = [...chatHistory, userMsg];
    setChatHistory(nextHistory);
    setCurrentInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/socratic-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScenario: scenario,
          chatHistory: nextHistory,
          latestMessage: userMsg.text,
          tier: studentParams.tier,
          language: studentParams.language,
        }),
      });

      const data = await res.json();
      
      let earnedPoints = 0;
      if (data.classification === 'FULL_REASONING') earnedPoints = 50;
      else if (data.classification === 'PARTIAL_REASONING') earnedPoints = 20;
      else earnedPoints = 5;

      setPoints(prev => prev + earnedPoints);

      const updatedHistory = nextHistory.map((m, idx) => {
        if (idx === nextHistory.length - 1) {
          return { ...m, classification: data.classification };
        }
        return m;
      });

      setChatHistory([
        ...updatedHistory,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);

      setCurrentInput(SUGGESTED_ANSWERS[2] || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Challenge with Devil's Advocate
  const handleTriggerDevilsAdvocate = async () => {
    setLoading(true);
    const lastStudent = [...chatHistory].reverse().find(m => m.sender === 'student')?.text || 'We will desilt the lake and involve neighbors.';
    
    try {
      const res = await fetch('/api/devils-advocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScenario: scenario,
          latestStudentAnswer: lastStudent,
          tier: studentParams.tier,
          language: studentParams.language,
        }),
      });
      const data = await res.json();
      setDevilsChallenge(data);
      setActiveStep(4);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Consequences
  const handleSimulateConsequences = async () => {
    setLoading(true);
    const lastStudent = [...chatHistory].reverse().find(m => m.sender === 'student')?.text || 'Farmers clean sand for fertilizer.';
    
    try {
      const res = await fetch('/api/consequence-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentDecision: lastStudent,
          scenarioContext: scenario?.context || 'Water cycle replenishments',
          grade: studentParams.grade,
        }),
      });
      const data = await res.json();
      setConsequenceData(data);
      setActiveStep(5);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Finish journey & Compile Skills Passport
  const handleIssuePassport = async () => {
    setLoading(true);
    try {
      // 1. Calculate final AI Insights
      const insights: AIMissionInsights = {
        curiosityScore: 85 + Math.floor(Math.random() * 10),
        criticalThinkingScore: 80 + Math.floor(Math.random() * 15),
        communicationScore: 78 + Math.floor(Math.random() * 15),
        communityEngagementScore: 75 + Math.floor(Math.random() * 20),
        overallGrowthPercent: 12 + Math.floor(Math.random() * 8),
      };
      setAiInsights(insights);

      // 2. Fetch skills passport
      const res = await fetch('/api/skill-passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentParams.studentName,
          grade: studentParams.grade,
          sessionsCompleted: 12,
          metrics: devilsChallenge?.scores || { evidenceQuality: 4, creativity: 5 },
        }),
      });
      const data = await res.json();
      setFinalPassport(data);
      setActiveStep(6);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Multimodal actions
  const handleTriggerMultimodalVision = async (presetM: typeof IMAGE_PRESETS[0]) => {
    setImageSimulating(true);
    setSelectedPresetImage(presetM.name);
    try {
      const res = await fetch('/api/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: presetM.base64Sample,
          mimeType: 'image/png',
          topic: studentParams.topic,
        }),
      });
      const data = await res.json();
      setMultimodalFeedback(data);
      setChatHistory(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'student',
          text: `[Visual Model Submit]: ${presetM.name} - ${presetM.description}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: `🔍 MODEL INSIDER: ${data.analysis}\n💡 IDENTIFIED TRADEOFF/GAP: ${data.gapsIdentified}\n💭 SOCRATIC QUERY: ${data.socraticFollowup}`,
          classification: data.classification,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setImageSimulating(false);
    }
  };

  const handleSimulateVoiceInput = async () => {
    setVoiceSimulating(true);
    const simulatedTranscripts = [
      "We should save rainwater directly in empty chola brick temples in Tamil Nadu so irrigation persists.",
      "By setting high tax limits on water tankers we can subsidize small organic rice microgrids."
    ];
    const chosenText = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
    
    try {
      const res = await fetch('/api/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceText: chosenText,
          topic: studentParams.topic,
        }),
      });
      const data = await res.json();
      setMultimodalFeedback(data);
      setChatHistory(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'student',
          text: `🎤 [Audio Recording]: "${chosenText}"`,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: `🎤 AUDIO INTERPRETED: ${data.analysis}\n💭 SOCRATIC PROGRESS FORWARD: ${data.socraticFollowup}`,
          classification: data.classification,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setVoiceSimulating(false);
    }
  };

  const handleRestartSession = () => {
    setScenario(null);
    setChatHistory([]);
    setCurrentInput('');
    setDevilsChallenge(null);
    setConsequenceData(null);
    setFinalPassport(null);
    setMultimodalFeedback(null);
    setSelectedPresetImage(null);
    setBaselineAssessment(null);
    setBaselineAnswers({});
    setPersonalizedMission(null);
    setAiInsights(null);
    setActiveStep(1);
  };

  return (
    <div className="font-sans pb-10">
      
      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center font-display font-extrabold text-4xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-4">
                  {studentParams.studentName ? studentParams.studentName.charAt(0).toUpperCase() : '👤'}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{studentParams.studentName || 'Student'}</h3>
                <span className="text-xs font-mono bg-purple-100 text-purple-800 px-3 py-1 rounded-full mt-2 font-bold border border-purple-200">
                  {currentTier} Scholar
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col items-center text-center">
                  <Flame className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-2xl font-display font-extrabold text-slate-900">{streakDays}</span>
                  <span className="text-[10px] font-mono text-orange-800 uppercase font-bold">Day Streak</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex flex-col items-center text-center">
                  <Award className="w-8 h-8 text-yellow-500 mb-2" />
                  <span className="text-2xl font-display font-extrabold text-slate-900">{points}</span>
                  <span className="text-[10px] font-mono text-yellow-800 uppercase font-bold">Total XP</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600"/> Activity Report Card
                </h4>
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Assigned Topic</span>
                    <span className="font-bold text-slate-900">{studentParams.topic || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Missions Completed</span>
                    <span className="font-bold text-slate-900">4</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Avg. Knowledge Score</span>
                    <span className="font-bold text-emerald-600">85%</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">Socratic Reason Level</span>
                    <span className="font-bold text-purple-600">{currentTier}</span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-slate-100 pt-6 mt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600"/> Core Competency Matrix
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'Critical thinking', val: 92, color: 'bg-purple-600' },
                    { name: 'Problem solving', val: 85, color: 'bg-emerald-500' },
                    { name: 'Creativity', val: 95, color: 'bg-rose-500' },
                    { name: 'Communication', val: 88, color: 'bg-amber-500' },
                    { name: 'Collaboration', val: 80, color: 'bg-indigo-500' },
                    { name: 'Adaptability', val: 90, color: 'bg-blue-500' },
                  ].map(skill => (
                    <div key={skill.name} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-700">{skill.name}</span>
                        <span className="text-slate-900">{skill.val}%</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full ${skill.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${skill.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gamification Banner / Profile Header */}
      {activeStep > 1 && (
        <div className="max-w-5xl mx-auto px-6 mb-4 mt-6 flex justify-end items-center animate-fade-in">
          {/* Right side: Profile & Stats */}
          <div 
             onClick={() => setShowProfile(true)}
             className="flex items-center gap-3 cursor-pointer bg-white border-2 border-slate-900 p-2 rounded-full shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-y-px hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-display font-extrabold text-lg border-2 border-slate-900">
              {studentParams.studentName ? studentParams.studentName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className="flex flex-col pr-3">
              <span className="text-xs font-bold text-slate-900">{studentParams.studentName || 'Student'}</span>
              <div className="flex gap-2 text-[10px] font-mono font-bold mt-0.5">
                <span className="text-orange-600 flex items-center gap-0.5"><Flame className="w-3 h-3"/> {streakDays}</span>
                <span className="text-yellow-600 flex items-center gap-0.5"><Award className="w-3 h-3"/> {points} XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Steps Tracker */}
      {activeStep > 1 && (
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div className="bg-white/80 backdrop-blur border-2 border-slate-900 rounded-2xl p-3 flex justify-between items-center text-xs font-mono shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] overflow-x-auto gap-4">
            {[
              { id: 1, name: '1. ' + t('studentPortal') },
              { id: 1.2, name: '2. ' + t('baselineTitle').substring(0, 15) + '...' },
              { id: 2, name: '3. ' + t('startMissionBtn').substring(0, 15) + '...' },
              { id: 3, name: '4. ' + t('sendAnswerBtn').substring(0, 15) + '...' },
              { id: 4, name: '5. Devil\'s Advocate' },
              { id: 5, name: '6. ' + t('consequenceBtn').substring(0, 15) + '...' },
              { id: 6, name: '7. ' + t('passportBtn').substring(0, 15) + '...' },
            ].map(s => (
              <span 
                key={s.id} 
                className={`whitespace-nowrap ${
                  activeStep === s.id || (s.id === 1.2 && activeStep === 1.5) ? 'text-purple-600 font-bold underline decoration-2' : 'text-slate-400'
                }`}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: INITIAL SETUP FORM */}
      {activeStep === 1 && (
        <div className="bg-gradient-to-br from-white to-purple-50/20 rounded-3xl border-2 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-4xl mx-auto my-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5 mb-6">
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-xl flex items-center gap-2">
                <Compass className="w-6 h-6 text-purple-600 animate-spin-slow" /> {t('appName')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize your profile parameters and launch your baseline diagnostic test.
              </p>
            </div>
            
            <button
              onClick={handleLoadMeenaDemo}
              className="bg-amber-100 hover:bg-amber-200 text-slate-950 font-bold text-xs px-4 py-2.5 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 rounded-xl flex items-center gap-1.5 self-stretch sm:self-auto justify-center cursor-pointer transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-600 animate-bounce" /> {t('loadMeenaDemo')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            {/* Student Name - REQUIRED Text Input */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">
                👤 {t('studentName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentParams.studentName}
                onChange={(e) => updateSingleParam("studentName", e.target.value)}
                placeholder="E.g. Meena S."
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              />
            </div>

            {/* Class Dropdown */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">
                🎒 {t('selectGrade')}
              </label>
              <select
                value={studentParams.grade}
                onChange={(e) => updateSingleParam("grade", e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* State / Region Dropdown */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">
                📍 {t('studentState')}
              </label>
              <select
                value={studentParams.state}
                onChange={(e) => updateSingleParam("state", e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">
                🌐 {t('preferredLanguage')}
              </label>
              <select
                value={studentParams.language}
                onChange={(e) => {
                  updateSingleParam("language", e.target.value);
                  const selectedLang = LANGUAGES.find(l => l.name === e.target.value);
                  if (selectedLang) {
                    i18n.changeLanguage(selectedLang.code);
                  }
                }}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Subject Dropdown - Dynamic */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">
                📚 {t('assignedSubject')}
              </label>
              <select
                value={studentParams.subject}
                onChange={(e) => updateSingleParam("subject", e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {subjectsList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Curriculum Topic Dropdown - Dynamic */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-2">
                ✏️ {t('curriculumTopic')}
              </label>
              <select
                value={studentParams.topic}
                onChange={(e) => updateSingleParam("topic", e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl p-3 text-xs font-bold focus:outline-none focus:bg-white focus:border-purple-600 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                {topicsList.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="text-xs text-slate-500 bg-purple-50 border border-purple-100 p-3 rounded-xl flex gap-2 w-full md:w-auto grow">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span><strong>{t('socraticTier')}:</strong> Auto-calibrated to <strong className="text-purple-700">{currentTier}</strong> matching your grade profile selection.</span>
            </div>

            <button
              onClick={handleLaunchBaseline}
              disabled={loading || !studentParams.studentName.trim()}
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs py-4 px-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-xl border-2 border-slate-950 text-center flex items-center justify-center gap-2 cursor-pointer transition-all font-mono shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Calibrating diagnostic test...
                </>
              ) : (
                <>
                  {t('launchMissionBtn')} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 1.2: BASELINE DIAGNOSTIC ASSESSMENT PAGE */}
      {activeStep === 1.2 && baselineAssessment && (
        <div className="bg-white rounded-3xl border-2 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-4xl mx-auto my-6 animate-fade-in font-sans">
          
          <div className="border-b-2 border-slate-200 pb-4 mb-6">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase border border-purple-200">
              📊 Phase 1: Knowledge Profiling
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2 font-display">
              {t('baselineTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('baselineSub')}
            </p>
          </div>

          <div className="space-y-6">
            {baselineAssessment.questions.map((q, idx) => (
              <div key={q.id} className="p-5 bg-slate-50 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <span className="font-bold text-slate-800 text-sm">
                    Q{idx + 1}. {q.question}
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-white border border-slate-350 px-2 py-0.5 rounded text-slate-500 uppercase">
                    {q.type}
                  </span>
                </div>

                {/* Option Rendering based on Type */}
                {q.type === 'MCQ' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt) => (
                      <label 
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-white transition-all ${
                          baselineAnswers[q.id] === opt 
                            ? 'border-purple-600 bg-purple-50/50' 
                            : 'border-slate-200 bg-white/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={baselineAnswers[q.id] === opt}
                          onChange={(e) => setBaselineAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs text-slate-700 font-semibold">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'TF' && (
                  <div className="flex gap-4 mt-2">
                    {["True", "False"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setBaselineAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          baselineAnswers[q.id] === opt 
                            ? 'border-purple-600 bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' 
                            : 'border-slate-350 bg-white hover:border-slate-800 text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'MATCH' && q.matchPairs && (
                  <div className="space-y-2 mt-2 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Select the correct matching definition for each left item:</span>
                    {q.matchPairs.map((pair) => (
                      <div key={pair.left} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 border-b border-dashed border-slate-100 last:border-0 text-xs">
                        <span className="font-bold text-slate-700">{pair.left}</span>
                        <select
                          value={baselineAnswers[`${q.id}_${pair.left}`] || ""}
                          onChange={(e) => setBaselineAnswers(prev => ({ ...prev, [`${q.id}_${pair.left}`]: e.target.value }))}
                          className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs font-semibold focus:outline-none focus:border-purple-600"
                        >
                          <option value="">-- Choose Match --</option>
                          {q.matchPairs?.map(p => (
                            <option key={p.right} value={p.right}>{p.right}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 border-2 border-slate-900 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 transition-all"
            >
              Back to Profile
            </button>
            
            <button
              onClick={handleSubmitBaseline}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3.5 px-6 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-xl border-2 border-slate-950 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating answers...
                </>
              ) : (
                <>
                  {t('completeTestBtn')} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* STEP 1.5: BASELINE SCORE & PERSONALIZED MISSION CARDS */}
      {activeStep === 1.5 && baselineAssessment && personalizedMission && (
        <div className="bg-white rounded-3xl border-2 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-4xl mx-auto my-6 animate-fade-in font-sans">
          
          <div className="border-b-2 border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase border border-emerald-200">
                ✓ Evaluation Complete
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2 font-display">
                {t('baselineScoringTitle')}
              </h2>
            </div>
            
            <div className="bg-slate-950 text-white border-2 border-slate-950 px-5 py-3 rounded-2xl shadow-[3px_3px_0px_0px_rgba(139,92,246,1)] text-center shrink-0">
              <span className="block text-[10px] font-mono text-purple-400 uppercase tracking-widest">{t('knowledgeScore')}</span>
              <strong className="text-3xl font-display font-black text-amber-400">{baselineAssessment.score}</strong>
              <span className="block text-[10px] font-mono text-slate-300 capitalize">{t('category' + baselineAssessment.category)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Score Category Description Card */}
            <div className="md:col-span-4 bg-purple-50/50 border-2 border-purple-200 p-5 rounded-2xl space-y-4">
              <h4 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" /> AI Diagnostics
              </h4>
              
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-semibold">
                {baselineAssessment.category === 'Advanced' && (
                  <p>✓ Demonstrates superior conceptual mastery of rural local governance. Fully ready for advanced critical reasoning, micro-budget trade-offs, and systems modeling.</p>
                )}
                {baselineAssessment.category === 'Intermediate' && (
                  <p>✓ Strong knowledge base. Calibrated with balanced inquiry scaffolding, moderate budget limits, and direct civic challenges.</p>
                )}
                {baselineAssessment.category === 'Developing' && (
                  <p>✓ Basic awareness of concepts. Setup with guided missions, standard constraints, and explanatory feedback loops.</p>
                )}
                {baselineAssessment.category === 'Beginner' && (
                  <p>✓ Calibrated to beginner level. Simple missions with visual hints, direct questions, and conceptual tutorials.</p>
                )}
              </div>
            </div>

            {/* Personalized Mission Details Card */}
            <div className="md:col-span-8 space-y-5 border-2 border-slate-950 p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] bg-gradient-to-br from-white to-slate-50">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Calibrated Mission Blueprint</span>
                <span className="bg-purple-100 text-purple-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  ⚖️ Category: {baselineAssessment.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  🛡️ {personalizedMission.missionTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  <strong>{t('missionGoal')}:</strong> {personalizedMission.missionGoal}
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950">
                <strong>⚡ {t('realWorldTask')}:</strong> {personalizedMission.realWorldTask}
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <strong>👨‍👩‍👦 {t('parentActivity')}:</strong>
                <p className="italic pl-4 text-slate-500">"{personalizedMission.parentActivity}"</p>
              </div>
            </div>

          </div>

          <button
            onClick={handleStartPersonalizedMission}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-xl border-2 border-slate-950 text-center flex items-center justify-center gap-2 mt-8 cursor-pointer font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Customizing inquiry scenario...
              </>
            ) : (
              <>
                {t('startMissionBtn').toUpperCase()} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </div>
      )}

      {/* STEP 2: MISSION CHALLENGE SCENARIO */}
      {activeStep === 2 && scenario && (
        <div className="bg-white rounded-3xl border-2 border-slate-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-4xl mx-auto my-6 animate-fade-in font-sans">
          
          <div className="border-b-2 border-slate-200 pb-4 mb-5">
            <span className="bg-purple-100 text-purple-900 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-purple-200 uppercase">
              📍 VSE ACTIVE MISSION: {studentParams.state} Context
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2 font-display">
              {scenario.scenario_title}
            </h2>
            <p className="text-xs text-slate-500 italic mt-1.5">
              Teacher diagnostic note: {scenario.teacher_note}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            <div className="md:col-span-7 space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Context Briefing</span>
                <p className="text-xs text-slate-800 leading-relaxed mt-1 font-medium">
                  {scenario.context}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4.5 rounded-2xl">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-700">Panchayat Objective Goal</span>
                <p className="text-xs text-amber-950 leading-relaxed mt-1 font-semibold">
                  🎯 {scenario.mission}
                </p>
              </div>
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="border border-slate-900 bg-white p-4.5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <span className="text-[10px] font-mono font-bold block text-slate-500 uppercase mb-2.5">Panchayat Policy Limits</span>
                <ul className="space-y-2 text-xs">
                  {scenario.constraints.map((c, i) => (
                    <li key={i} className="text-slate-700 flex items-start gap-1">
                      ⚠️ <span className="font-semibold">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-slate-900 bg-slate-900 text-white p-4.5 rounded-2xl">
                <span className="text-[10px] font-mono text-amber-400 block font-bold uppercase mb-2.5">Tested Future Readiness Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.what_skills_this_tests.map((s, i) => (
                    <span key={i} className="bg-white/10 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded">
                      🛠️ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <button
            onClick={() => setActiveStep(3)}
            className="w-full bg-slate-950 text-white mt-8 py-3.5 font-bold text-xs rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:bg-slate-850 text-center flex items-center justify-center gap-2 border-2 border-slate-950 cursor-pointer font-mono"
          >
            ENTER THE SOCRATIC COACH DIALOGUE <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: SOCRATIC CHAT & MULTIMODAL PROBES */}
      {activeStep === 3 && scenario && (
        <div className="bg-white rounded-3xl border-2 border-slate-950 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-4xl mx-auto my-6 animate-fade-in font-sans">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-5">
            <div>
              <span className="bg-purple-100 text-purple-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-purple-250">
                💬 TURN-BY-TURN PROBES
              </span>
              <h3 className="font-display font-bold text-slate-900 text-base mt-1">
                Socratic Dialogue with Curiosity Coach
              </h3>
            </div>
            
            <div className="text-xs font-mono text-slate-500">
              Assigned Topic: <strong className="text-purple-600">{studentParams.topic}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Dialogue scroll panel */}
            <div className="lg:col-span-8 flex flex-col justify-between border-r-0 lg:border-r border-slate-200 pr-0 lg:pr-6 min-h-[380px]">
              
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 mb-4">
                {chatHistory.map((m, idx) => (
                  <div key={m.id} className={`flex gap-3 max-w-lg ${m.sender === 'student' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                    
                    {m.sender === 'ai' && (
                      <div className="bg-purple-600 text-white w-7 h-7 rounded-lg text-xs font-bold font-display flex items-center justify-center shrink-0 shadow-sm">
                        C
                      </div>
                    )}

                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'student'
                        ? 'bg-slate-950 text-slate-100 rounded-tr-none'
                        : 'bg-slate-50 border-2 border-slate-950 text-slate-800 rounded-tl-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                    }`}>
                      {m.text}
                      
                      {m.classification && (
                        <div className="mt-2 pt-1.5 border-t border-slate-300 flex items-center gap-1">
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            m.classification === 'FULL_REASONING' ? 'bg-emerald-100 text-emerald-800' :
                            m.classification === 'PARTIAL_REASONING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-850'
                          }`}>
                            AI EVAL: {m.classification}
                          </span>
                        </div>
                      )}
                    </div>

                    {m.sender === 'student' && (
                      <div className="bg-slate-300 text-slate-900 w-7 h-7 rounded-lg text-xs font-bold font-display flex items-center justify-center shrink-0">
                        S
                      </div>
                    )}

                  </div>
                ))}

                {loading && (
                  <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5 pl-4">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Curiosity Coach is scoring response reasoning...
                  </div>
                )}
              </div>

              {/* Chat send box */}
              <div className="space-y-2 pt-3 border-t border-slate-150">
                <div className="flex gap-2">
                  <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Describe your critical solution reasoning..."
                    className="flex-1 bg-slate-50 border-2 border-slate-900 rounded-xl p-2.5 text-xs font-sans focus:outline-none focus:bg-white resize-none h-18 focus:border-purple-600 transition-all"
                  />
                  <button
                    onClick={handleSendSocraticAnswer}
                    disabled={loading || !currentInput.trim()}
                    className="bg-purple-600 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] p-3.5 hover:bg-purple-700 active:translate-y-0.5 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {SUGGESTED_ANSWERS[chatHistory.filter(m => m.sender === 'student').length + 1] && (
                  <div 
                    onClick={() => setCurrentInput(SUGGESTED_ANSWERS[chatHistory.filter(m => m.sender === 'student').length + 1])}
                    className="bg-slate-50 text-[10px] font-mono hover:bg-slate-100 border border-dashed border-slate-350 p-2 rounded-lg cursor-pointer text-slate-500"
                  >
                    💡 <span className="font-semibold text-purple-600 font-bold">Continuous play suggestion:</span> Tap to auto-fill Meena's answer: <span className="text-slate-700 italic block mt-0.5 border-t border-slate-200 pt-0.5">"{SUGGESTED_ANSWERS[chatHistory.filter(m => m.sender === 'student').length + 1].substring(0, 100)}..."</span>
                  </div>
                )}

                {chatHistory.filter(m => m.sender === 'student').length >= 2 && (
                  <button
                    onClick={handleTriggerDevilsAdvocate}
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white font-mono font-bold text-[11px] py-3 rounded-xl border-2 border-slate-950 mt-1 flex items-center justify-center gap-1.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] cursor-pointer"
                  >
                    ⚡ PROCEED TO THE DEVIL'S ADVOCATE CHALLENGE <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

            {/* Right side: Multimodal submissions */}
            <div className="lg:col-span-4 bg-slate-50 p-4.5 rounded-2xl border-2 border-slate-900 space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                🎨 Multimodal Submissions
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Want to expand beyond simple text? Express your reasoning visually through sketches or speak your mind!
              </p>

              <div className="flex gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setMultimodalType('image')}
                  className={`flex-1 py-1 text-[10px] font-bold rounded font-mono ${
                    multimodalType === 'image' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🖼️ Sketch Model
                </button>
                <button
                  onClick={() => setMultimodalType('voice')}
                  className={`flex-1 py-1 text-[10px] font-bold rounded font-mono ${
                    multimodalType === 'voice' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🎙️ Spoken Model
                </button>
              </div>

              {multimodalType === 'image' ? (
                <div className="space-y-3 animate-fade-in">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Select Concept Model Drawing</span>
                  {IMAGE_PRESETS.map((p, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleTriggerMultimodalVision(p)}
                      className={`p-2 border-2 rounded-xl bg-white cursor-pointer hover:border-slate-800 transition-all ${
                        selectedPresetImage === p.name ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200'
                      }`}
                    >
                      <img 
                        src={p.url} 
                        alt={p.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-18 object-cover rounded-lg mb-1.5 border border-slate-100" 
                      />
                      <span className="text-[10px] font-bold text-slate-800 block">{p.name}</span>
                      <p className="text-[9px] text-slate-400 mt-0.5">{p.description}</p>
                    </div>
                  ))}

                  {imageSimulating && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-600 font-bold bg-white p-2.5 rounded border border-purple-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Vision AI is scanning diagram pipes...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-white border rounded-xl p-4 text-center">
                    <Mic className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">Socratic Voice Input Recorder</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Simulate a voice response transcribing concepts to Jigyasa's local sound stream.
                    </p>
                    
                    <button
                      onClick={handleSimulateVoiceInput}
                      disabled={voiceSimulating}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-mono font-bold py-2 px-4 rounded border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {voiceSimulating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Recording...
                        </>
                      ) : (
                        <>🎤 Record Spoken Answer</>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* STEP 4: DEVIL'S ADVOCATE DIALOGUE */}
      {activeStep === 4 && devilsChallenge && (
        <div className="bg-white rounded-3xl border-2 border-slate-950 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-4xl mx-auto my-6 animate-fade-in font-sans">
          
          <div className="border-b-2 border-slate-200 pb-3 mb-5">
            <span className="bg-red-100 text-red-900 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-red-200 uppercase">
              👹 DEVIL'S ADVOCATE ALLEGATION
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 font-display">
              Challenging Weak Foundations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The AI has isolated a weak assumption in your community model. Defend or adapt your stance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            <div className="md:col-span-7 space-y-4">
              <div className="bg-white border-2 border-slate-950 p-4.5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <span className="text-[10px] uppercase font-mono font-bold text-red-600">The Devil's Refutation Claim</span>
                <p className="text-xs text-slate-800 leading-relaxed font-semibold italic mt-1 bg-red-50/50 p-3.5 rounded border border-red-100">
                  "{devilsChallenge.challengeText}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs leading-snug">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Acknowledged Strength</span>
                  <p className="text-slate-700 font-semibold mt-1">✓ {devilsChallenge.acknowledgedValue}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Targeted Assumption</span>
                  <p className="text-red-900 font-semibold mt-1">✗ {devilsChallenge.assumptionChallenged}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-950 text-slate-100 border-2 border-slate-950 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
              <span className="text-[10px] font-mono text-amber-400 block font-bold uppercase mb-3">Live Socratic Scored Index</span>
              
              <div className="space-y-3">
                {[
                  { name: 'Evidence Quality', val: devilsChallenge.scores?.evidenceQuality || 4 },
                  { name: 'Logical Consistency', val: devilsChallenge.scores?.logicalConsistency || 3 },
                  { name: 'Trade-off Awareness', val: devilsChallenge.scores?.awarenessOfTradeoffs || 3 },
                  { name: 'Creativity Index', val: devilsChallenge.scores?.creativity || 4 },
                ].map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                      <span>{s.name}</span>
                      <strong className="text-amber-400">{s.val}/5</strong>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full rounded-full" 
                        style={{ width: `${(s.val/5)*100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <button
            onClick={handleSimulateConsequences}
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3.5 border-2 border-slate-950 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex items-center justify-center gap-1.5 mt-6 cursor-pointer font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Consequence Simulator calculating horizons...
              </>
            ) : (
              <>
                PROMPT SECOND-ORDER CONSEQUENCE SIMULATION <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 5: CONSEQUENCE SIMULATOR TIMELINE */}
      {activeStep === 5 && consequenceData && (
        <div className="bg-white rounded-3xl border-2 border-slate-950 p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-4xl mx-auto my-6 animate-fade-in font-sans">
          
          <div className="border-b-2 border-slate-200 pb-3 mb-5 flex justify-between items-start">
            <div>
              <span className="bg-purple-100 text-purple-900 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-purple-200 uppercase">
                ⏳ SECOND ORDER TIMELINE FORECAST
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 font-display">
                Consequence Simulator
              </h2>
            </div>
            
            <div className="text-[10px] font-mono text-slate-500 max-w-sm text-right leading-snug">
              Decision: <strong className="text-purple-700">"{consequenceData.decision_summary}"</strong>
            </div>
          </div>

          <div className="relative border-l-2 border-slate-950 ml-4 pl-6 py-4 space-y-6">
            {consequenceData.timeline.map((t, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-1.5 bg-slate-950 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {i + 1}
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
                  <h4 className="font-display font-bold text-slate-900 text-xs tracking-tight flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" /> TIMEFRAME: {t.period}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs">
                      <strong className="text-emerald-900 block font-semibold mb-1">🟢 Positive Outcomes:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                        {t.positive_effects.map((e, idx) => (
                          <li key={idx}>{e}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 text-xs">
                      <strong className="text-rose-950 block font-semibold mb-1">🔴 Negative Outcomes:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                        {t.negative_effects.map((e, idx) => (
                          <li key={idx}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] leading-relaxed text-amber-950">
                    🌀 <strong className="font-semibold text-amber-900">Unintended Surprise Detail:</strong> {t.unexpected_effect}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4.5 mt-6">
            <h4 className="text-xs font-mono uppercase text-purple-900 tracking-wider font-bold mb-1">
              🤔 Heavy Socratic System Reflection Question
            </h4>
            <p className="text-xs text-purple-950 font-semibold leading-relaxed">
              {consequenceData.reflection_question}
            </p>
          </div>

          <button
            onClick={handleIssuePassport}
            disabled={loading}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3.5 border-2 border-slate-950 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex items-center justify-center gap-1.5 mt-6 cursor-pointer font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying competencies...
              </>
            ) : (
              <>
                COMPILE SESSION AND COMPILATIVE DISCOVERIES PASSPORT <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 6: PASSPORT CERTIFICATE & POST-MISSION AI INSIGHTS */}
      {activeStep === 6 && finalPassport && aiInsights && (
        <div className="animate-fade-in font-sans space-y-6">
          
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm gap-4">
            <div className="flex gap-3 items-center text-emerald-950">
              <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Competency passport updated successfully!</h4>
                <p className="text-xs text-emerald-800 mt-0.5">Your visual profile metrics increased based on local governance decision outcomes.</p>
              </div>
            </div>
            
            <button
              onClick={handleRestartSession}
              className="px-4 py-2 rounded-xl bg-white border border-slate-350 hover:border-slate-800 text-xs font-bold transition-all active:translate-y-0.5 cursor-pointer flex gap-1.5 items-center justify-center shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start New Session
            </button>
          </div>

          {/* AI Generated Insights Section */}
          <div className="max-w-4xl mx-auto bg-white border-2 border-slate-950 p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
            <h3 className="text-sm font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" /> AI Generated Insights (Post-Mission Evaluation)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "Curiosity Score", val: aiInsights.curiosityScore, color: "text-purple-600" },
                { name: "Critical Thinking", val: aiInsights.criticalThinkingScore, color: "text-indigo-600" },
                { name: "Communication", val: aiInsights.communicationScore, color: "text-pink-600" },
                { name: "Community Engagement", val: aiInsights.communityEngagementScore, color: "text-emerald-600" },
                { name: "Overall Growth %", val: `+${aiInsights.overallGrowthPercent}%`, color: "text-amber-600 font-extrabold" }
              ].map((insight) => (
                <div key={insight.name} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center shadow-sm">
                  <span className="block text-[10px] text-slate-400 font-mono uppercase">{insight.name}</span>
                  <strong className={`block text-xl md:text-2xl mt-1.5 ${insight.color}`}>{insight.val}</strong>
                </div>
              ))}
            </div>
          </div>

          <SkillPassportCard passport={finalPassport} />
        </div>
      )}

    </div>
  );
}
