import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    hasApiKey: !!ai,
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  });
});

// GENERATE BASELINE ASSESSMENT
app.post('/api/generate-baseline', async (req, res) => {
  const { grade, subject, state, language } = req.body;
  if (!ai) {
    return res.json({ questions: getFallbackBaselineQuestions(grade, subject, state) });
  }
  try {
    const prompt = `Generate exactly 5 baseline assessment questions to test a student's current knowledge before an inquiry mission.
INPUTS:
- Grade/Class: ${grade}
- Subject: ${subject}
- State/Region: ${state}
- Language: ${language}

Strict Rules:
1. Difficulty must be precisely calibrated for ${grade}.
2. Provide a mix of question types: MCQ, True/False (TF), Match the Following (MATCH).
3. The Match the following type must include matchPairs (left items and right items).
4. If language is not English, translate the question text and options/pairs appropriately.
5. Return the correct answer in answerKey.

Respond in this JSON format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "matchPairs": [{"left": "A", "right": "1"}],
      "answerKey": "correct answer or pattern"
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['MCQ', 'TF', 'MATCH', 'IMAGE'] },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  matchPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      },
                      required: ['left', 'right']
                    }
                  },
                  answerKey: { type: Type.STRING }
                },
                required: ['id', 'question', 'type', 'answerKey']
              }
            }
          },
          required: ['questions']
        }
      }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Generate baseline error:', error);
    res.json({ questions: getFallbackBaselineQuestions(grade, subject, state) });
  }
});

// GENERATE PERSONALIZED MISSION
app.post('/api/generate-mission', async (req, res) => {
  const { grade, subject, topic, state, language, baselineScore, category } = req.body;
  if (!ai) {
    return res.json(getFallbackPersonalizedMission(grade, subject, topic, state, baselineScore, category));
  }
  try {
    const prompt = `Generate a personalized Socratic inquiry mission for a student based on their baseline assessment profile.
INPUTS:
- Class: ${grade}
- Subject: ${subject}
- Topic: ${topic}
- State: ${state}
- Language: ${language}
- Student Baseline Score: ${baselineScore}/100 (Category: ${category})

Personalization rules:
- Beginner (0-30): Simpler mission goals, structured tasks, more guided hints.
- Developing (31-60): Interactive, clear scaffold steps.
- Intermediate (61-80): Balanced, requires critical resource mapping.
- Advanced (81-100): High-level system design, complex trade-offs, critical thinking prompts.

Respond in this JSON format:
{
  "missionTitle": "Short catchy mission name",
  "missionGoal": "1-2 sentence core objective calibrated for their category",
  "realWorldTask": "Specific action task they must solve",
  "reflectionQuestions": ["Reflection Q1", "Reflection Q2"],
  "parentActivity": "Home-based discussion or activity for parent involvement",
  "teacherRubric": [
    {
      "criteria": "Name of capability",
      "description": "What is evaluated",
      "levels": {
        "beginner": "Criteria for beginners",
        "intermediate": "Criteria for intermediate",
        "advanced": "Criteria for advanced"
      }
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            missionTitle: { type: Type.STRING },
            missionGoal: { type: Type.STRING },
            realWorldTask: { type: Type.STRING },
            reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            parentActivity: { type: Type.STRING },
            teacherRubric: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criteria: { type: Type.STRING },
                  description: { type: Type.STRING },
                  levels: {
                    type: Type.OBJECT,
                    properties: {
                      beginner: { type: Type.STRING },
                      intermediate: { type: Type.STRING },
                      advanced: { type: Type.STRING }
                    },
                    required: ['beginner', 'intermediate', 'advanced']
                  }
                },
                required: ['criteria', 'description', 'levels']
              }
            }
          },
          required: ['missionTitle', 'missionGoal', 'realWorldTask', 'reflectionQuestions', 'parentActivity', 'teacherRubric']
        }
      }
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Generate personalized mission error:', error);
    res.json(getFallbackPersonalizedMission(grade, subject, topic, state, baselineScore, category));
  }
});

// VERNACULAR SCENARIO ENGINE (VSE)
app.post('/api/generate-scenario', async (req, res) => {
  const { grade, subject, topic, state, language, tier } = req.body;

  if (!ai) {
    // Return high quality local fallback standard to keep user experience perfect
    return res.json(getFallbackScenario(grade, subject, topic, state, language, tier));
  }

  try {
    const prompt = `Generate a hyper-local, age-appropriate, culturally relevant real-world challenge for an Indian student.
INPUTS:
- Grade: ${grade}
- Subject: ${subject}
- Curriculum topic: ${topic}
- Student's state/region: ${state}
- Preferred language: ${language}
- Student Tier: ${tier} (SPROUT: LKG–Class 2, EXPLORER: Class 3–5, BUILDER: Class 6–8, INNOVATOR: Class 9–12)

Strict rules:
1. Be rooted in a real situation from the student's geography/culture (${state}).
2. Require the student to DECIDE and REASON, not recall facts.
3. Frame as a mission, crisis, or community problem — never a textbook question.
4. Have no single correct answer — there should be trade-offs.
5. If the preferred language is not English, translate inputs & outputs gracefully, providing English translations adjacent or inside prompt elements.

Respond strictly in the following JSON format structure:
{
  "scenario_title": "Short catchy title",
  "context": "2-3 sentence real-world setup rooted in the student's local geography",
  "mission": "One clear sentence — what the student must decide or solve",
  "constraints": ["Constraint 1", "Constraint 2", "Constraint 3"],
  "what_skills_this_tests": ["Skill 1", "Skill 2"],
  "opening_question": "The first Socratic question to ask the student about this scenario (incorporate the preferred language if appropriate, e.g. Bilingual or direct translation)",
  "teacher_note": "One sentence explaining what critical thinking this develops"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario_title: { type: Type.STRING },
            context: { type: Type.STRING },
            mission: { type: Type.STRING },
            constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
            what_skills_this_tests: { type: Type.ARRAY, items: { type: Type.STRING } },
            opening_question: { type: Type.STRING },
            teacher_note: { type: Type.STRING },
          },
          required: ['scenario_title', 'context', 'mission', 'constraints', 'what_skills_this_tests', 'opening_question', 'teacher_note'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.error('Error generating scenario:', error);
    res.json(getFallbackScenario(grade, subject, topic, state, language, tier));
  }
});

// SOCRATIC PROBE / CHAT ENGINE
app.post('/api/socratic-probe', async (req, res) => {
  const { currentScenario, chatHistory, latestMessage, tier, language } = req.body;

  if (!ai) {
    return res.json({
      classification: 'PARTIAL_REASONING',
      text: `That is an interesting thought! But what would happen if the local community feels left out of this decision? How would you solve that?`,
    });
  }

  try {
    const formattedHistory = chatHistory
      .map((m: any) => `${m.sender === 'ai' ? 'AI Socratic Coach' : 'Student'}: ${m.text}`)
      .join('\n');

    const prompt = `You are conducting a Socratic questioning session on the following scenario.
SCENARIO: ${JSON.stringify(currentScenario)}
STUDENT TIER: ${tier}
LANGUAGE: ${language}

CHAT CONTEXT:
${formattedHistory}
Student's latest response: "${latestMessage}"

Your tasks:
1. Classify the user response internally as exactly one of: [RECALL], [PARTIAL_REASONING], [FULL_REASONING].
- [RECALL]: Definition/memorized. Probes deeper with a "why" or "what if".
- [PARTIAL_REASONING]: Acknowledges one thing, probes the key remaining gap.
- [FULL_REASONING]: Excellent logic. Takes it one level deeper with a harder follow-up.
2. Formulate your Socratic reply in 2-3 sentences. Do not define terms. Ask an open query that pushes reasoning.
3. Answer back in the same language code or language tone used by the student (including regional mixes).

Return strictly in JSON:
{
  "classification": "RECALL" | "PARTIAL_REASONING" | "FULL_REASONING",
  "text": "Your Socratic follow-up reply"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { type: Type.STRING, enum: ['RECALL', 'PARTIAL_REASONING', 'FULL_REASONING'] },
            text: { type: Type.STRING },
          },
          required: ['classification', 'text'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Socratic Probe error:', error);
    res.json({
      classification: 'PARTIAL_REASONING',
      text: 'How would that option affect the other people living in that village? What could we do to balance both needs?',
    });
  }
});

// DEVIL'S ADVOCATE
app.post('/api/devils-advocate', async (req, res) => {
  const { currentScenario, latestStudentAnswer, tier, language } = req.body;

  if (!ai) {
    return res.json({
      challengeText: `I see where you're coming from. But let's look at the numbers. Who is going to bear the cost of this program? Are the small vendors ready to pay for paper bags?`,
      acknowledgedValue: 'Your strategy is quite environment friendly',
      assumptionChallenged: 'Assuming vendors can afford paper bags',
      scores: {
        evidenceQuality: 4,
        logicalConsistency: 3,
        awarenessOfTradeoffs: 3,
        creativity: 4,
      },
    });
  }

  try {
    const prompt = `You are the Devil's Advocate module of Jigyasa AI.
SCENARIO: ${JSON.stringify(currentScenario)}
STUDENT ANSWER: "${latestStudentAnswer}"
STUDENT TIER: ${tier}
LANGUAGE: ${language}

Your task:
Take the strongest possible opposing position to challenge the student's reasoning to make their thinking stronger.
Rules:
1. Always acknowledge ONE reasonable thing the student said before challenging.
2. Pick the weakest assumption in their argument and challenge it directly.
3. Ask ONE sharp challenge question calibrated to their tier.
4. Rate their answer on 4 parameters (out of 5):
   - Evidence Quality
   - Logical Consistency
   - Awareness of Trade-offs
   - Creativity

Output strictly as JSON:
{
  "challengeText": "Calibrated Devil's Advocate challenge message",
  "acknowledgedValue": "What you agreed was reasonable",
  "assumptionChallenged": "The key weak assumption you are targeting",
  "scores": {
    "evidenceQuality": 4,
    "logicalConsistency": 3,
    "awarenessOfTradeoffs": 3,
    "creativity": 4
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            challengeText: { type: Type.STRING },
            acknowledgedValue: { type: Type.STRING },
            assumptionChallenged: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                evidenceQuality: { type: Type.INTEGER },
                logicalConsistency: { type: Type.INTEGER },
                awarenessOfTradeoffs: { type: Type.INTEGER },
                creativity: { type: Type.INTEGER },
              },
              required: ['evidenceQuality', 'logicalConsistency', 'awarenessOfTradeoffs', 'creativity'],
            },
          },
          required: ['challengeText', 'acknowledgedValue', 'assumptionChallenged', 'scores'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Devils advocate error:', error);
    res.json({
      challengeText: 'Good initial idea, but if funds are halved, how will that work?',
      acknowledgedValue: 'Promoting native crops',
      assumptionChallenged: 'Unlimited resources available',
      scores: { evidenceQuality: 3, logicalConsistency: 3, awarenessOfTradeoffs: 3, creativity: 4 },
    });
  }
});

// CONSEQUENCE SIMULATOR
app.post('/api/consequence-simulator', async (req, res) => {
  const { studentDecision, scenarioContext, grade } = req.body;

  if (!ai) {
    return res.json(getFallbackConsequence(studentDecision));
  }

  try {
    const prompt = `You are the Consequence Simulator of Jigyasa AI.
YOUR JOB: Simulate realistic long-term consequences of this decision across multiple horizons. Show second-order effects.
INPUT DECISION: "${studentDecision}"
SCENARIO CONTEXT: "${scenarioContext}"
GRADE: ${grade}

Output structure strictly in JSON format:
{
  "decision_summary": "One sentence paraphrase of decision",
  "timeline": [
    {
      "period": "Week 1",
      "positive_effects": ["Positive impact 1"],
      "negative_effects": ["Negative impact 1"],
      "unexpected_effect": "Unforeseen scenario"
    },
    {
      "period": "Month 3",
      "positive_effects": ["Positive impact 2"],
      "negative_effects": ["Negative impact 2"],
      "unexpected_effect": "Unforeseen issue/gift"
    },
    {
      "period": "Year 1",
      "positive_effects": ["Positive impact 3"],
      "negative_effects": ["Negative impact 3"],
      "unexpected_effect": "Macro economic/community result"
    },
    {
      "period": "Year 5",
      "positive_effects": ["Future positive 4"],
      "negative_effects": ["Future trade-off 4"],
      "unexpected_effect": "Massive structural change"
    }
  ],
  "reflection_question": "One heavy Socratic reflection query about one trade-off in their system",
  "skills_demonstrated": ["Skill A", "Skill B"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision_summary: { type: Type.STRING },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING },
                  positive_effects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  negative_effects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  unexpected_effect: { type: Type.STRING },
                },
                required: ['period', 'positive_effects', 'negative_effects', 'unexpected_effect'],
              },
            },
            reflection_question: { type: Type.STRING },
            skills_demonstrated: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['decision_summary', 'timeline', 'reflection_question', 'skills_demonstrated'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Consequence simulator error:', error);
    res.json(getFallbackConsequence(studentDecision));
  }
});

// AI DEBATE ARENA
app.post('/api/debate', async (req, res) => {
  const { topic, studentPosition, currentStep, lastResponse, history, language, tier } = req.body;

  if (!ai) {
    return res.json(getFallbackDebateResponse(currentStep));
  }

  try {
    const formattedHistory = (history || [])
      .map((h: any) => `${h.role === 'student' ? 'Student' : 'AI Opponent'}: ${h.text}`)
      .join('\n');

    const prompt = `You are the AI Debate Moderator & Opponent for Jigyasa AI.
Current Step: Turn ${currentStep} of the 8-turn debate framework:
- Turn 1: RESEARCH PHASE (Gather student's 3 stronger arguments).
- Turn 2: OPENING ARGUMENT (Ask student to state opening in 3-4 sentences).
- Turn 3: AI CHALLENGE (AI presents strongest 2 counter-arguments).
- Turn 4: STUDENT REBUTTAL.
- Turn 5: ESCALATION (Introduce fresh complicated real-world detail).
- Turn 6: STUDENT COUNTER.
- Turn 7: REFLECTION (Would they change their mind, why?).
- Turn 8: SKILL ASSESSMENT (JSON with scores and critical analysis).

DEBATE CONTEXT:
Topic: ${topic}
Student Position: ${studentPosition} (FOR or AGAINST)
Tier: ${tier}
Language: ${language}

Chat history so far:
${formattedHistory}

Student's latest reply: "${lastResponse}"

Instructions for your turn:
Formulate the next turn according to the 8-turn sequence.
If currentStep is 8, you MUST output a valid JSON containing 'scoreCard'.
For all other turns, return the AI text directly.

Output strictly as JSON:
{
  "step": ${currentStep},
  "phase": "Phase Description name",
  "message": "AI voice speaking to student in standard text (calibrated to language/tier)",
  "scoreCard": {
    "communication": { "score": "8/10", "feedback": "Detailed feedback..." },
    "critical_thinking": { "score": "9/10", "feedback": "Detailed feedback..." },
    "evidence_use": { "score": "7/10", "feedback": "Detailed feedback..." },
    "persuasion": { "score": "8/10", "feedback": "Detailed feedback..." },
    "overall_summary": "Overall evaluation summary"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.INTEGER },
            phase: { type: Type.STRING },
            message: { type: Type.STRING },
            scoreCard: {
              type: Type.OBJECT,
              properties: {
                communication: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                critical_thinking: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                evidence_use: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                persuasion: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.STRING }, feedback: { type: Type.STRING } },
                  required: ['score', 'feedback'],
                },
                overall_summary: { type: Type.STRING },
              },
              required: ['communication', 'critical_thinking', 'evidence_use', 'persuasion', 'overall_summary'],
            },
          },
          required: ['step', 'phase', 'message'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Debate error:', error);
    res.json(getFallbackDebateResponse(currentStep));
  }
});

// TEACHER API: GENERATE TEST
app.post('/api/teacher/generate-test', async (req, res) => {
  const { topic, grade, subject } = req.body;

  if (!ai) {
    return res.json({
      questions: getFallbackQuestions(topic),
    });
  }

  try {
    const prompt = `You are Today's Test Generator for Jigyasa AI.
Generate exactly 10 questions at 3 Bloom taxonomy levels (Knowledge, Application, Analysis) calibrated for:
Grade: ${grade}
Subject: ${subject}
Topic: ${topic}

Include MCQ option formats (where appropriate) or open answers with key reasoning hints.
Output strictly as JSON structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "level": "Knowledge" | "Application" | "Analysis",
      "options": ["A", "B", "C", "D"],
      "answerKey": "The correct answer or ideal critical answer pattern"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ['Knowledge', 'Application', 'Analysis'] },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answerKey: { type: Type.STRING },
                },
                required: ['question', 'level', 'answerKey'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.json({ questions: getFallbackQuestions(topic) });
  }
});

// TEACHER API: PARENT REPORT
app.post('/api/teacher/parent-report', async (req, res) => {
  const { studentName, topic, dataSummary } = req.body;

  if (!ai) {
    return res.json({
      report: `Parent Report for ${studentName}: Meena showed high socratic curiosity on ${topic}. She argued effectively and shows advanced logical trade-off levels in sustainable village irrigation decisions. Suggested next step is exploring the water conservation systems in neighbouring states.`
    });
  }

  try {
    const prompt = `Write a competency-focused parent report (not marks-based) but based on critical accomplishments, thinking strengths, communication habits, and curiosity benchmarks.
STUDENT NAME: ${studentName}
TOPIC: ${topic}
SUMMARY: ${JSON.stringify(dataSummary || {})}

Write a cohesive, heartwarming, professional, developmental parent report in 3 scannable paragraphs. Use bullet points for key thinking skills shown. Use clear and direct parenting guidance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ report: response.text || '' });
  } catch (error) {
    console.error('Parent report error:', error);
    res.json({
      report: `Competency Report for ${studentName} on ${topic}:
- Demonstrated key systems thinking by evaluating environmental issues before selecting agricultural alternatives.
- Actively questioned standard assumptions to improve civic water conservation.
- Next recommendation: Explore renewable micro-irrigation tools in a hands-on home project.`,
    });
  }
});

// SKILL PASSPORT GENERATION
app.post('/api/skill-passport', async (req, res) => {
  const { studentName, grade, sessionsCompleted, metrics } = req.body;

  if (!ai) {
    return res.json(getFallbackPassport(studentName, grade));
  }

  try {
    const prompt = `Generate a gorgeous Skill Passport competency profile JSON structure based on student logs.
Student Name: ${studentName}
Grade: ${grade}
Sessions: ${sessionsCompleted}
Metrics: ${JSON.stringify(metrics || {})}

Output strictly in JSON:
{
  "passport_id": "JIG-2024-884930",
  "student_name": "${studentName}",
  "grade": "${grade}",
  "issued_date": "June 1, 2026",
  "skill_scores": {
    "critical_thinking": { "score": 85, "level": "Advanced", "evidence": "Defended lake preservation policy successfully" },
    "problem_solving": { "score": 78, "level": "Proficient", "evidence": "Resolved the ₹50L budget constraint problem" },
    "creativity": { "score": 88, "level": "Advanced", "evidence": "Proposed solar evaporation recovery domes" },
    "communication": { "score": 80, "level": "Proficient", "evidence": "Expressed thoughts clearly in regional vernacular" },
    "leadership": { "score": 70, "level": "Developing", "evidence": "Considered village leader roles in Chennai" },
    "collaboration": { "score": 75, "level": "Proficient", "evidence": "Created localized task force divisions" },
    "adaptability": { "score": 82, "level": "Proficient", "evidence": "Adjusted strategy under sudden budget cuts" },
    "innovation": { "score": 84, "level": "Advanced", "evidence": "Devised micro-channel groundwater routing system" }
  },
  "strongest_skill": "Creativity",
  "growth_area": "Leadership",
  "signature_achievement": "Presented a resilient, hyper-localized water restoration roadmap for Chennai council",
  "employer_summary": "Meena is a highly adaptive and analytical young thinker. She excels at combining geographical science constraints with local community realities to drive sustainable, creative civic projects. Ready for realworld environmental action challenges.",
  "recommended_next_challenges": [
    "Drought simulation crisis management",
    "Smart sustainable township design challenge"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passport_id: { type: Type.STRING },
            student_name: { type: Type.STRING },
            grade: { type: Type.STRING },
            issued_date: { type: Type.STRING },
            skill_scores: {
              type: Type.OBJECT,
              properties: {
                critical_thinking: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                problem_solving: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                creativity: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                communication: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                leadership: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                collaboration: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                adaptability: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
                innovation: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, level: { type: Type.STRING }, evidence: { type: Type.STRING } }, required: ['score', 'level', 'evidence'] },
              },
              required: ['critical_thinking', 'problem_solving', 'creativity', 'communication', 'leadership', 'collaboration', 'adaptability', 'innovation'],
            },
            strongest_skill: { type: Type.STRING },
            growth_area: { type: Type.STRING },
            signature_achievement: { type: Type.STRING },
            employer_summary: { type: Type.STRING },
            recommended_next_challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['passport_id', 'student_name', 'grade', 'issued_date', 'skill_scores', 'strongest_skill', 'growth_area', 'signature_achievement', 'employer_summary', 'recommended_next_challenges'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Skill passport error:', error);
    res.json(getFallbackPassport(studentName, grade));
  }
});

// MULTIMODAL DIAGRAM & VOICE ANALYZER
app.post('/api/multimodal', async (req, res) => {
  const { imageBase64, mimeType, voiceText, topic } = req.body;

  if (!ai) {
    return res.json({
      detectedType: imageBase64 ? 'Concept Diagram' : 'Spoken Audio Voice Model',
      analysis: imageBase64
        ? 'Great design choice. The drawing shows a clear representation of water flow through underground aquifers, utilizing evaporation pathways and custom containment wells.'
        : `Your audio recording successfully captured: "${voiceText}". Excellent conversational explanation!`,
      gapsIdentified: imageBase64
        ? 'The diagram would benefit from showing how surface runoff routes during heavy monsoons.'
        : 'You explained evaporation and groundwater well, but forgot to describe how plant transpiration adds to the atmospheric water content.',
      classification: 'PARTIAL_REASONING',
      socraticFollowup: 'How do you think plants in your local garden help in cycling this water back to the sky during a hot dry season?',
    });
  }

  try {
    let contents: any[] = [];
    let promptText = `Analyze this student submission for the topic: "${topic || 'General Science'}". `;

    if (imageBase64) {
      const imgPart = {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: imageBase64,
        },
      };
      contents.push(imgPart);
      promptText += `Evaluate this handwritten answer, sketch, concept map, or diagram.
1. Read any text present.
2. Identify the core concepts explain.
3. Identify what is correct and any important gaps without being discouraging.
4. Classify as RECALL, PARTIAL_REASONING, or FULL_REASONING.
5. Create a follow-up Socratic question helping them discover the gaps themselves.`;
    } else {
      promptText += `Evaluate this captured voice transcript transcript: "${voiceText}".
Evaluate as a spoken answer. Mention if they used clear physical reasoning or simple vocabulary. Classify and offer a Socratic follow-up.`;
    }

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedType: { type: Type.STRING },
            analysis: { type: Type.STRING },
            gapsIdentified: { type: Type.STRING },
            classification: { type: Type.STRING, enum: ['RECALL', 'PARTIAL_REASONING', 'FULL_REASONING'] },
            socraticFollowup: { type: Type.STRING },
          },
          required: ['detectedType', 'analysis', 'gapsIdentified', 'classification', 'socraticFollowup'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Multimodal processor error:', error);
    res.json({
      detectedType: imageBase64 ? 'Handwritten Image Model' : 'Audio Transcript Model',
      analysis: 'Identified relevant concepts about water/energy processes.',
      gapsIdentified: 'Requires slightly more detailed explanations of external inputs.',
      classification: 'PARTIAL_REASONING',
      socraticFollowup: 'What external factor might accelerate this cycle?',
    });
  }
});

// Helper for local high-quality VSE scenarios
function getFallbackScenario(grade: string, subject: string, topic: string, state: string, language: string, tier: string): any {
  if (topic.toLowerCase().includes('water') || !topic) {
    return {
      scenario_title: "Chennai's Disappearing Lakes",
      context: `Three of Chennai's major lakes in ${state || 'Tamil Nadu'} have dried up this summer. Farmers in nearby Kanchipuram cannot irrigate their paddy fields efficiently. The local district collector has requested your student taskforce to present a solution to the municipal city council.`,
      mission: 'Design a community water conservation and lake replenishment roadmap utilizing what you know about the local water cycle, with a ₹50 lakh micro-climate budget.',
      constraints: [
        'Cannot forcibly relocate any village families near lake boundaries',
        'Must utilize green techniques showing impact within 3 months',
        'Budget cap is ₹50 lakhs',
      ],
      what_skills_this_tests: ['Systems thinking', 'Real-world water cycle optimization', 'Resource allocation'],
      opening_question: 'What is the absolute first action your team would initiate, and what climate factor influenced that decision? (ஏன்? - Why?)',
      teacher_note: 'This challenge demands that students apply groundwater infiltration and evaporation concepts to direct community action, rejecting simple textbook recycling advice.',
    };
  }

  return {
    scenario_title: `The ${topic} Community Crisis`,
    context: `A sudden structural change in ${state || 'your region'} is affecting residents and local commerce. Your school group has been asked to advise the panchayat/municipal leaders on a strategy.`,
    mission: `Propose an adaptive concept map and project design dealing with ${topic} with minimal disruption.`,
    constraints: [
      'Must protect low-income stakeholders',
      'No heavy imports; use regional materials',
      'Action plan must work with existing local governance laws',
    ],
    what_skills_this_tests: ['Critical decision-making', 'Civic awareness', 'Trade-off evaluation'],
    opening_question: `What primary factor do you feel needs solving first here, and why?`,
    teacher_note: `Promotes open-ended inquiry and Socratic reasoning directly relating curriculum of ${subject} to localized Indian state dynamics.`,
  };
}

function getFallbackConsequence(studentDecision: string): any {
  return {
    decision_summary: studentDecision ? `Deploying community rain-catchers and desilting Chennai dry lakebeds: "${studentDecision}"` : 'Decentralizing lakebed desilting with small storage wells',
    timeline: [
      {
        period: 'Week 1',
        positive_effects: ['Desilting starts providing temporary water-truck jobs for 120 village youths.'],
        negative_effects: ['Excavated silt creates dust storms near three local school grounds.'],
        unexpected_effect: 'Silt is discovered to be extremely mineral-rich; small scale home gardens buy it immediately.',
      },
      {
        period: 'Month 3',
        positive_effects: ['Cleared beds increase groundwater absorption speed by 25% just as light monsoon rains begin.'],
        negative_effects: ['Local open irrigation streams clog slightly due to loose dirt blocks.'],
        unexpected_effect: 'Migratory sandpipers and local white herons return 6 weeks earlier than historical patterns.',
      },
      {
        period: 'Year 1',
        positive_effects: ['Aquifer level rises by 1.8 meters; Kanchipuram wells remain wet during dry winter.'],
        negative_effects: ['High water levels spark mosquito pest outbreaks in waterlogged zones.'],
        unexpected_effect: 'Land prices surrounding the lake bed skyrocket, attracting commercial hotel builders.',
      },
      {
        period: 'Year 5',
        positive_effects: ['The village is fully water self-reliant, saving ₹40 lakhs in water tanker imports.'],
        negative_effects: ['Over-extraction of this newly rich groundwater starts among larger commercial farmers.'],
        unexpected_effect: 'Heavy greenery reduces city heat domes in the Kanchipuram corridor by 1.5°C.',
      },
    ],
    reflection_question: 'Since rise in water self-reliance attracted hotels and overwater extraction by wealthy farmers, how will your governance model protect water rights for small farmers?',
    skills_demonstrated: ['Second-order systems evaluation', 'Resource sustainability mapping'],
  };
}

function getFallbackDebateResponse(step: number): any {
  const steps: Record<number, any> = {
    1: {
      step: 1,
      phase: 'RESEARCH PHASE',
      message: "Before we step into the Arena, let's look at your arguments. List the 3 strongest arguments supporting your stance. Do not worry about perfection — just tell me what comes to your mind!",
    },
    2: {
      step: 2,
      phase: 'OPENING ARGUMENT',
      message: 'Excellent points! Now, construct your formal opening argument in 3 to 4 strong, persuasive sentences.',
    },
    3: {
      step: 3,
      phase: 'AI CHALLENGE',
      message: 'Intriguing, but I must contest this! First, banning plastic completely raises the costs of essential packages for poor people. Second, cotton bags take 20,000 times more water to produce. How do you respond to these trade-offs?',
    },
    4: {
      step: 4,
      phase: 'STUDENT REBUTTAL',
      message: 'You argue that reuse compensates for cotton water costs. But let us look at real consumer habits: most people lose or discard bags within 15 uses. How do you address this human reality?',
    },
    5: {
      step: 5,
      phase: 'ESCALATION (NEW CONSTRAINT)',
      message: "Let's escalate: suppose a national emergency blocks imports of paper/craft material. Small sellers have zero budget to switch. If you enforce your plastic ban, small sellers will shut down tomorrow. Do you stick to your policy or alter it? Explain!",
    },
    6: {
      step: 6,
      phase: 'STUDENT COUNTER',
      message: 'That is a strategic modification. Knowing now both sides of this coin, let us zoom out. Do you truly still believe your original standpoint, or has it shifted? Tell me why.',
    },
    7: {
      step: 7,
      phase: 'REFLECTION',
      message: 'Honourable and deeply reflective. Let us compile your debate results now and review your critical scoreboard.',
    },
    8: {
      step: 8,
      phase: 'SKILL ASSESSMENT',
      message: 'The assessment is complete! You argued exceptional points about sustainability and micro-economy safety.',
      scoreCard: {
        communication: { score: '8/10', feedback: 'Your statements were clear and used strong, respectful language.' },
        critical_thinking: { score: '9/10', feedback: 'Adjusted effectively when presented with the shipping crisis constraint.' },
        evidence_use: { score: '7/10', feedback: 'Good grounding arguments, but could quote specific water footprint numbers to strengthen claims.' },
        persuasion: { score: '8/10', feedback: 'Compelling tone. Your defense of low-income merchants was human-centric.' },
        overall_summary: 'You demonstrated an advanced ability to balance high-level environmental ideals with real micro-entrepreneur limitations.',
      },
    },
  };

  return steps[step] || steps[1];
}

function getFallbackQuestions(topic: string): any[] {
  return [
    {
      question: `Define the core phase of ${topic || 'water cycle'} where thermal solar energy causes liquid to vaporize.`,
      level: 'Knowledge',
      options: ['Condensation', 'Atmospheric Runoff', 'Evaporation', 'Infiltration'],
      answerKey: 'Evaporation',
    },
    {
      question: `If a forest is harvested, how will the lack of canopy shade affect soil evaporation rates during monsoons?`,
      level: 'Application',
      options: ['Decreases evaporation', 'Increases soil evaporation and runoff', 'No climate impact', 'Stops ground absorption'],
      answerKey: 'Increases soil evaporation and runoff',
    },
    {
      question: `Analyze the conceptual paradox: why does rapid concrete urban construction in Chennai cause groundwater levels to collapse despite steady rainfall?`,
      level: 'Analysis',
      options: ['Runoff speeds up but concrete prevents infiltration', 'Rain evaporation is too fast over roads', 'Concrete actively drinks rain', 'Less clouds form over cement structures'],
      answerKey: 'Runoff speeds up but concrete prevents infiltration',
    },
  ];
}

function getFallbackPassport(name: string, grade: string): any {
  return {
    passport_id: 'JIG-2024-482910',
    student_name: name || 'Meena S.',
    grade: grade || 'Class 7',
    issued_date: 'June 1, 2026',
    skill_scores: {
      critical_thinking: { score: 85, level: 'Advanced', evidence: 'Engaged and refuted the resource cut and shipping crisis devil claims' },
      problem_solving: { score: 78, level: 'Proficient', evidence: 'Optimized water budgets on a Chennai lake map' },
      creativity: { score: 88, level: 'Advanced', evidence: 'Drafted bilingual micro-catchers for apartment balconies' },
      communication: { score: 80, level: 'Proficient', evidence: 'Spoke clearly with high empathy on village merchant livelihoods' },
      leadership: { score: 70, level: 'Developing', evidence: 'Managed stakeholder opinions during local water debates' },
      collaboration: { score: 75, level: 'Proficient', evidence: 'Suggested clear divisions of labor for well restoration teams' },
      adaptability: { score: 82, level: 'Proficient', evidence: 'Switched plans smoothly under sudden budget and climate constraints' },
      innovation: { score: 84, level: 'Advanced', evidence: 'Utilized solar vapor recovery models for dry lake beds' },
    },
    strongest_skill: 'Creativity',
    growth_area: 'Leadership',
    signature_achievement: 'Formulated a multi-tier ecological model protecting both village aquifers and poor retailers',
    employer_summary: `${name || 'Meena'} showcases marvelous systemic reasoning. She doesn't just read textbooks; she connects chemical/geological frameworks with micro-economic constraints. Highly capable of self-directed research.`,
    recommended_next_challenges: [
      'Microfinance agrarian solar grid deployment simulation',
      'Tamil Nadu sustainable temple tank restoration model',
    ],
  };
}

function getFallbackBaselineQuestions(grade: string, subject: string, state: string): any[] {
  return [
    {
      id: "q-1",
      question: "Who heads a Gram Panchayat?",
      type: "MCQ",
      options: ["Collector", "President (Sarpanch)", "Governor", "MLA"],
      answerKey: "President (Sarpanch)"
    },
    {
      id: "q-2",
      question: "True or False: Panchayat members are elected directly by the village electorate.",
      type: "TF",
      answerKey: "True"
    },
    {
      id: "q-3",
      question: "Match the local governance roles to their descriptions:",
      type: "MATCH",
      matchPairs: [
        { left: "Gram Sabha", right: "All adult voters in the village" },
        { left: "Ward Member (Panch)", right: "Representative of a specific ward" },
        { left: "Panchayat Secretary", right: "Government-appointed officer who calls meetings" }
      ],
      answerKey: "Gram Sabha -> All adult voters, Ward Member -> Representative of a ward, Secretary -> Government officer"
    },
    {
      id: "q-4",
      question: "Which Indian Constitutional Amendment gave official status to rural local self-governments?",
      type: "MCQ",
      options: ["42nd Amendment", "44th Amendment", "73rd Amendment", "86th Amendment"],
      answerKey: "73rd Amendment"
    },
    {
      id: "q-5",
      question: "True or False: The Gram Panchayat has no power to collect local taxes or duties.",
      type: "TF",
      answerKey: "False"
    }
  ];
}

function getFallbackPersonalizedMission(grade: string, subject: string, topic: string, state: string, score: number, category: string): any {
  const complexityLevel = score > 80 ? 'Advanced Systems' : score > 60 ? 'Intermediate' : score > 30 ? 'Developing' : 'Guided Beginner';
  return {
    missionTitle: `Panchayat Water Security Council (${complexityLevel})`,
    missionGoal: `Design a community water conservation and lake replenishment roadmap utilizing what you know about the local water cycle, with a ₹50 lakh micro-climate budget.`,
    realWorldTask: score > 80 
      ? `Draft a high-fidelity policy recommendation for the local Gram Panchayat to desilt lakes and clean catchment areas while safeguarding surrounding farm budgets under strict fiscal limits.`
      : `Create a simple map and sequence plan showing where to dig recharge wells in the village without damaging local crops.`,
    reflectionQuestions: [
      "How do we prevent wealthier commercial farmers from over-extracting the restored groundwater?",
      "If we cut the budget to ₹25 lakhs, what green technique would you prioritize first?"
    ],
    parentActivity: "Discuss with your parents how village water management has changed in their lifetime.",
    teacherRubric: [
      {
        criteria: "Systems Thinking",
        description: "Evaluates second-order effects of lake desilting (e.g. dust, crop runoff, groundwater levels)",
        levels: {
          beginner: "Lists basic water cycle terms with guidance",
          intermediate: "Identifies direct water cycle outcomes in the village",
          advanced: "Maps multi-stage ecological and economic consequences under budget constraints"
        }
      },
      {
        criteria: "Resource Allocation",
        description: "Utilizes the ₹50L budget constraint efficiently",
        levels: {
          beginner: "Exceeds budget or ignores cost constraints",
          intermediate: "Stays within budget but ignores operational trade-offs",
          advanced: "Balances desilting costs, daily food wages, and commercial silt sale margins"
        }
      }
    ]
  };
}

// Vite and static production assets handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback handling
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jigyasa AI Core] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
