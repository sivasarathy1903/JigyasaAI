import { GoogleGenAI, Type } from '@google/genai';

let ai: GoogleGenAI | null = null;

export function getAiInstance(): GoogleGenAI | null {
  if (ai) return ai;

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== '') {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

export { Type };

// Helper for local high-quality VSE scenarios
export function getFallbackScenario(grade: string, subject: string, topic: string, state: string, language: string, tier: string): any {
  const normalizedTopic = (topic || '').toLowerCase();
  if (normalizedTopic.includes('water') || !topic) {
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

export function getFallbackConsequence(studentDecision: string): any {
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

export function getFallbackDebateResponse(step: number): any {
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

export function getFallbackQuestions(topic: string): any[] {
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

export function getFallbackPassport(name: string, grade: string): any {
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

export function getFallbackBaselineQuestions(grade: string, subject: string, state: string): any[] {
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

export function getFallbackPersonalizedMission(grade: string, subject: string, topic: string, state: string, score: number, category: string): any {
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
