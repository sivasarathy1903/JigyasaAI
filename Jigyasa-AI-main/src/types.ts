export type Tier = 'SPROUT' | 'EXPLORER' | 'BUILDER' | 'INNOVATOR';

export interface StudentSession {
  studentName: string;
  grade: string;
  subject: string;
  topic: string;
  state: string;
  language: string;
  tier: Tier;
}

export interface Scenario {
  scenario_title: string;
  context: string;
  mission: string;
  constraints: string[];
  what_skills_this_tests: string[];
  opening_question: string;
  teacher_note: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'student';
  text: string;
  classification?: 'RECALL' | 'PARTIAL_REASONING' | 'FULL_REASONING' | 'NONE';
  timestamp: string;
}

export interface DevilsAdvocateChallenge {
  challengeText: string;
  acknowledgedValue: string;
  assumptionChallenged: string;
  scores?: {
    evidenceQuality: number;
    logicalConsistency: number;
    awarenessOfTradeoffs: number;
    creativity: number;
  };
}

export interface ConsequenceTimelineItem {
  period: string;
  positive_effects: string[];
  negative_effects: string[];
  unexpected_effect: string;
}

export interface ConsequenceSimulation {
  decision_summary: string;
  timeline: ConsequenceTimelineItem[];
  reflection_question: string;
  skills_demonstrated: string[];
}

export interface DebateTurn {
  step: number;
  phase: string;
  message: string;
  scoreCard?: {
    communication: { score: string; feedback: string };
    critical_thinking: { score: string; feedback: string };
    evidence_use: { score: string; feedback: string };
    persuasion: { score: string; feedback: string };
    overall_summary: string;
  };
}

export interface TeacherQuizQuestion {
  question: string;
  level: 'Knowledge' | 'Application' | 'Analysis';
  options?: string[];
  answerKey: string;
}

export interface TeacherDashboardData {
  studentsAttention: {
    name: string;
    responseType: 'RECALL' | 'PARTIAL_REASONING' | 'FULL_REASONING';
    engagement: 'high' | 'medium' | 'low';
    sessionsThisWeek: number;
    intervention: string;
  }[];
  classInsight: {
    strength: string;
    struggle: string;
    suggestion: string;
  };
}

export interface SkillPassport {
  passport_id: string;
  student_name: string;
  grade: string;
  issued_date: string;
  skill_scores: {
    critical_thinking: { score: number; level: string; evidence: string };
    problem_solving: { score: number; level: string; evidence: string };
    creativity: { score: number; level: string; evidence: string };
    communication: { score: number; level: string; evidence: string };
    leadership: { score: number; level: string; evidence: string };
    collaboration: { score: number; level: string; evidence: string };
    adaptability: { score: number; level: string; evidence: string };
    innovation: { score: number; level: string; evidence: string };
  };
  strongest_skill: string;
  growth_area: string;
  signature_achievement: string;
  employer_summary: string;
  recommended_next_challenges: string[];
}

export interface BaselineQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'TF' | 'MATCH' | 'IMAGE';
  options?: string[]; // for MCQ
  matchPairs?: { left: string; right: string }[]; // for Match the Following
  imagePrompt?: string; // Optional image-based info
  imageAsset?: string;
  answerKey: string;
}

export interface BaselineAssessment {
  questions: BaselineQuestion[];
  score?: number;
  category?: 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced';
}

export interface PersonalizedMission {
  missionTitle: string;
  missionGoal: string;
  realWorldTask: string;
  reflectionQuestions: string[];
  parentActivity: string;
  teacherRubric: {
    criteria: string;
    description: string;
    levels: { beginner: string; intermediate: string; advanced: string };
  }[];
}

export interface AIMissionInsights {
  curiosityScore: number;
  criticalThinkingScore: number;
  communicationScore: number;
  communityEngagementScore: number;
  overallGrowthPercent: number;
}
