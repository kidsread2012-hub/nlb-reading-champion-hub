// Shared assessment configuration and scoring logic
// Used by backend functions for assessment processing

export const ASSESSMENT_SECTIONS = [
  { id: "group1_letters", name: "Group 1 Letters", items: ["s", "a", "t", "i", "p", "n"], order: 1, levelThreshold: 1 },
  { id: "group1_blending", name: "Group 1 Blending", items: ["sit", "pin", "tap", "nap", "pan", "ant"], order: 2, levelThreshold: 1 },
  { id: "group2_letters", name: "Group 2 Letters", items: ["c", "k", "e", "h", "r", "m", "d"], order: 3, levelThreshold: 1 },
  { id: "group2_blending", name: "Group 2 Blending", items: ["cat", "hen", "red", "map", "rat", "kit", "rid"], order: 4, levelThreshold: 2 },
  { id: "group3_letters", name: "Group 3 Letters", items: ["g", "o", "u", "l", "f", "b"], order: 5, levelThreshold: 2 },
  { id: "group3_blending", name: "Group 3 Blending", items: ["bat", "sob", "fog", "lip", "tub", "elk"], order: 6, levelThreshold: 3 },
  { id: "rest_letters", name: "Rest of the Letters", items: ["j", "v", "w", "x", "y", "z"], order: 7, levelThreshold: 3 },
  { id: "rest_blending", name: "Blending", items: ["job", "van", "win", "box", "yap", "zap"], order: 8, levelThreshold: 3 },
  { id: "tricky_words", name: "Tricky Words", items: ["the", "to", "we", "be", "are", "here", "go", "who", "saw", "right", "also", "after"], order: 9, levelThreshold: null },
];

const LEVEL_SECTIONS = ASSESSMENT_SECTIONS.filter(s => s.levelThreshold !== null);

export function calculateAssessmentResults(answers: Record<string, Record<string, boolean>>) {
  const sectionScores: Record<string, { correct: number; total: number; passed: boolean }> = {};
  let totalScore = 0;
  let totalPossible = 0;

  for (const section of ASSESSMENT_SECTIONS) {
    const sectionAnswers = answers[section.id] || {};
    const correct = section.items.filter(item => sectionAnswers[item] === true).length;
    const total = section.items.length;
    const passed = correct === total;
    sectionScores[section.id] = { correct, total, passed };
    totalScore += correct;
    totalPossible += total;
  }

  // Determine proficiency level based on consecutive sections passed from the start
  let consecutivePassed = 0;
  for (const section of LEVEL_SECTIONS) {
    if (sectionScores[section.id].passed) {
      consecutivePassed++;
    } else {
      break;
    }
  }

  let proficiencyLevel: string;
  if (consecutivePassed <= 3) {
    proficiencyLevel = "Level 1";
  } else if (consecutivePassed <= 5) {
    proficiencyLevel = "Level 2";
  } else {
    proficiencyLevel = "Level 3";
  }

  // Identify competencies needing help (sections not passed, up to 3)
  const competenciesNeedingHelp: string[] = [];
  for (const section of LEVEL_SECTIONS) {
    if (!sectionScores[section.id].passed) {
      competenciesNeedingHelp.push(section.name);
    }
    if (competenciesNeedingHelp.length >= 3) break;
  }
  // Include tricky words if not passed and there's room
  if (!sectionScores.tricky_words.passed && competenciesNeedingHelp.length < 3) {
    competenciesNeedingHelp.push("Tricky Words");
  }

  return {
    sectionScores,
    totalScore,
    totalPossible,
    proficiencyLevel,
    competenciesNeedingHelp,
  };
}