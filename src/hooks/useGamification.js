import { useState, useEffect, useCallback, useRef } from 'react';
import { getQuizStats, setQuizStats as persistQuizStats } from '@/lib/localStore';

export const BADGE_DEFS = [
  { id: 'first_pop_quiz', name: 'First Pop Quiz', icon: 'Star', description: 'Answer your first pop quiz correctly' },
  { id: 'streak_3', name: '3-Streak', icon: 'Flame', description: 'Get 3 pop quizzes right in a row' },
  { id: 'streak_5', name: '5-Streak', icon: 'Flame', description: 'Get 5 pop quizzes right in a row' },
  { id: 'perfect_module', name: 'Perfect Module', icon: 'Award', description: 'Answer every pop quiz in a module correctly, first try' },
  { id: 'module_master', name: 'Module Master', icon: 'Trophy', description: 'Complete every module' },
];

const DEFAULT_STATS = {
  quiz_correct_total: 0,
  quiz_current_streak: 0,
  quiz_best_streak: 0,
  badges: [],
};

function computeBadges(stats) {
  const badges = new Set(stats.badges || []);
  if (stats.quiz_correct_total >= 1) badges.add('first_pop_quiz');
  if (stats.quiz_best_streak >= 3) badges.add('streak_3');
  if (stats.quiz_best_streak >= 5) badges.add('streak_5');
  return Array.from(badges);
}

export function useGamification() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);
  const statsRef = useRef(DEFAULT_STATS);

  const load = useCallback(() => {
    const s = getQuizStats();
    const next = {
      quiz_correct_total: s.quiz_correct_total || 0,
      quiz_current_streak: s.quiz_current_streak || 0,
      quiz_best_streak: s.quiz_best_streak || 0,
      badges: s.badges || [],
    };
    statsRef.current = next;
    setStats(next);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const recordAnswer = useCallback((isCorrect) => {
    const prev = statsRef.current;
    const next = { ...prev };
    if (isCorrect) {
      next.quiz_correct_total = prev.quiz_correct_total + 1;
      next.quiz_current_streak = prev.quiz_current_streak + 1;
      next.quiz_best_streak = Math.max(prev.quiz_best_streak, next.quiz_current_streak);
    } else {
      next.quiz_current_streak = 0;
    }
    next.badges = computeBadges(next);
    const awarded = next.badges.filter((b) => !prev.badges.includes(b));
    statsRef.current = next;
    setStats(next);
    persistQuizStats(next);
    return awarded;
  }, []);

  const awardBadge = useCallback((badgeId) => {
    const prev = statsRef.current;
    if (prev.badges.includes(badgeId)) return false;
    const next = { ...prev, badges: [...prev.badges, badgeId] };
    statsRef.current = next;
    setStats(next);
    persistQuizStats(next);
    return true;
  }, []);

  return { stats, loaded, recordAnswer, awardBadge, reload: load };
}