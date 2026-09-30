const KEY = 'asyk-atu-best-v1';
const PROGRESS_KEY = 'asyk-atu-progress-v1';
const TUTORIAL_KEY = 'asyk-atu-tutorial-v1';
const DAILY_KEY = 'asyk-atu-daily-v1';

export function loadBest() {
  try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; }
}

export function saveBest(score) {
  const best = Math.max(loadBest(), score);
  try { localStorage.setItem(KEY, String(best)); } catch { /* Storage can be disabled. */ }
  return best;
}

export function loadProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return { unlocked: Math.max(0, Math.min(4, Number(value.unlocked) || 0)), completed: Array.isArray(value.completed) ? value.completed : [] };
  } catch { return { unlocked: 0, completed: [] }; }
}

export function saveLevelSuccess(levelIndex) {
  const progress = loadProgress();
  const completed = new Set(progress.completed);
  completed.add(levelIndex);
  progress.completed = [...completed];
  progress.unlocked = Math.max(progress.unlocked, Math.min(4, levelIndex + 1));
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch { /* Storage can be disabled. */ }
  return progress;
}

export function tutorialSeen() {
  try { return localStorage.getItem(TUTORIAL_KEY) === '1'; } catch { return false; }
}

export function markTutorialSeen() {
  try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* Storage can be disabled. */ }
}

export function loadDailyResult(date) {
  try {
    const record = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}');
    return record.date === date ? record : null;
  } catch { return null; }
}

export function saveDailyResult(date, score) {
  const previous = loadDailyResult(date);
  const record = { date, score: Math.max(score, previous?.score || 0) };
  try { localStorage.setItem(DAILY_KEY, JSON.stringify(record)); } catch { /* Storage can be disabled. */ }
  return record;
}
