// Device-local store for the prototype. All volunteer progress lives in
// localStorage on this device — no database writes, no user accounts.

const KEYS = {
  COMPLETIONS: 'nlb_module_completions',
  QUIZ_STATS: 'nlb_quiz_stats',
  ASSESSMENTS: 'nlb_assessments',
  COACH_SESSIONS: 'nlb_coach_sessions',
  COACH_CONVERSATIONS: 'nlb_coach_conversations',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function uid(prefix) {
  return prefix + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

/* ---------- Module completions ---------- */
// { [moduleId]: { status: 'in_progress'|'completed', completed_date } }

export function getModuleCompletions() {
  return read(KEYS.COMPLETIONS, {});
}

export function setModuleStatus(moduleId, status, moduleTitle) {
  const map = getModuleCompletions();
  const existing = map[moduleId] || {};
  map[moduleId] = {
    status,
    module_title: moduleTitle || existing.module_title,
    completed_date: status === 'completed' ? new Date().toISOString().split('T')[0] : existing.completed_date,
  };
  write(KEYS.COMPLETIONS, map);
  return map[moduleId];
}

// Shape compatible with the old LearningProgress records used across the UI.
export function getModuleProgressMap() {
  const map = getModuleCompletions();
  const out = {};
  for (const [id, v] of Object.entries(map)) {
    out[id] = { id, module_id: id, module_title: v.module_title, status: v.status, completed_date: v.completed_date };
  }
  return out;
}

/* ---------- Quiz / gamification stats ---------- */

export function getQuizStats() {
  return read(KEYS.QUIZ_STATS, {
    quiz_correct_total: 0,
    quiz_current_streak: 0,
    quiz_best_streak: 0,
    badges: [],
  });
}

export function setQuizStats(stats) {
  write(KEYS.QUIZ_STATS, stats);
}

/* ---------- Assessments ---------- */

export function getAssessments() {
  return read(KEYS.ASSESSMENTS, []);
}

export function addAssessment(a) {
  const list = getAssessments();
  const record = { ...a, id: uid('a_'), created_date: new Date().toISOString() };
  list.unshift(record);
  write(KEYS.ASSESSMENTS, list);
  return record;
}

/* ---------- Coach sessions & conversations ---------- */

export function getCoachSessions() {
  return read(KEYS.COACH_SESSIONS, []);
}

export function addCoachSession(session) {
  const list = getCoachSessions();
  const now = new Date().toISOString();
  const record = { ...session, id: uid('s_'), created_date: now, updated_date: now };
  list.unshift(record);
  write(KEYS.COACH_SESSIONS, list);
  return record;
}

export function deleteCoachSession(id) {
  let list = getCoachSessions().filter((s) => s.id !== id);
  write(KEYS.COACH_SESSIONS, list);
  const convos = read(KEYS.COACH_CONVERSATIONS, {});
  delete convos[id];
  write(KEYS.COACH_CONVERSATIONS, convos);
}

function touchCoachSession(id) {
  if (!id) return;
  const list = getCoachSessions();
  const idx = list.findIndex((s) => s.id === id);
  if (idx >= 0) {
    list[idx].updated_date = new Date().toISOString();
    write(KEYS.COACH_SESSIONS, list);
  }
}

export function getCoachConversation(sessionId) {
  const convos = read(KEYS.COACH_CONVERSATIONS, {});
  return convos[sessionId] || [];
}

export function addCoachMessage(sessionId, msg) {
  const convos = read(KEYS.COACH_CONVERSATIONS, {});
  const arr = convos[sessionId] || [];
  arr.push({ ...msg, created_date: new Date().toISOString() });
  convos[sessionId] = arr;
  write(KEYS.COACH_CONVERSATIONS, convos);
  touchCoachSession(sessionId);
  return arr;
}

/* ---------- Reset everything ---------- */

export function clearAllProgress() {
  Object.values(KEYS).forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore
    }
  });
  // Also clear per-module quiz state managed by ModuleReader
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('nlb_module_progress_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}