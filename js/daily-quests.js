// ============================================
// AniGO — Daily Quest & Streak System
// Client-side localStorage persistence, KST daily reset
// ============================================

import { addHintTokens, awardTitle, getProgress } from './progression.js';

const DAILY_STORAGE_KEY = 'anigo-daily';
const STREAK_STORAGE_KEY = 'anigo-streak';

// ---- Quest Definitions ----

const QUEST_TEMPLATES = [
  {
    type: 'complete_n',
    variants: [
      { n: 3, label: '오늘 퍼즐 3개 완료', labelEn: 'Complete 3 puzzles today', reward: { type: 'hint', amount: 1 } },
      { n: 5, label: '오늘 퍼즐 5개 완료', labelEn: 'Complete 5 puzzles today', reward: { type: 'hint', amount: 2 } },
      { n: 7, label: '오늘 퍼즐 7개 완료', labelEn: 'Complete 7 puzzles today', reward: { type: 'xp', amount: 50 } },
    ],
    progressKey: 'puzzlesCompleted',
  },
  {
    type: 'earn_stars',
    variants: [
      { n: 5,  label: '오늘 별 5개 획득',  labelEn: 'Earn 5 stars today',  reward: { type: 'hint', amount: 1 } },
      { n: 8,  label: '오늘 별 8개 획득',  labelEn: 'Earn 8 stars today',  reward: { type: 'hint', amount: 2 } },
      { n: 12, label: '오늘 별 12개 획득', labelEn: 'Earn 12 stars today', reward: { type: 'xp', amount: 60 } },
    ],
    progressKey: 'starsEarned',
  },
  {
    type: 'perfect_clear',
    variants: [
      { n: 1, label: '별 3개로 퍼즐 완료', labelEn: 'Complete a puzzle with 3 stars', reward: { type: 'hint', amount: 1 } },
    ],
    progressKey: 'perfectClears',
  },
  {
    type: 'spell_puzzle',
    variants: [
      { n: 1, label: '주문 퍼즐 완료', labelEn: 'Complete a spell puzzle', reward: { type: 'xp', amount: 30 } },
    ],
    progressKey: 'spellPuzzles',
  },
  {
    type: 'capture_puzzles',
    variants: [
      { n: 2, label: '포획 퍼즐 2개 완료', labelEn: 'Complete 2 capture puzzles', reward: { type: 'hint', amount: 1 } },
      { n: 3, label: '포획 퍼즐 3개 완료', labelEn: 'Complete 3 capture puzzles', reward: { type: 'hint', amount: 2 } },
    ],
    progressKey: 'capturePuzzles',
  },
  {
    type: 'hint_perfect',
    variants: [
      { n: 1, label: '힌트 사용 후 별 3개 달성', labelEn: 'Use a hint and still get 3 stars', reward: { type: 'xp', amount: 40 } },
    ],
    progressKey: 'hintPerfects',
  },
  {
    type: 'no_hint_streak',
    variants: [
      { n: 3, label: '힌트 없이 퍼즐 3개 완료', labelEn: 'Complete 3 puzzles without using hints', reward: { type: 'hint', amount: 3 } },
    ],
    progressKey: 'noHintCompletions',
  },
];

// Streak reward thresholds
const STREAK_REWARDS = [
  { days: 3,  hints: 2, title: null,          label: '3일 연속 보너스: 힌트 +2',              labelEn: '3-day streak bonus: +2 hints' },
  { days: 7,  hints: 5, title: '연속 기사',    label: '7일 연속 보너스: 힌트 +5 & 칭호 획득',   labelEn: '7-day streak bonus: +5 hints & title' },
  { days: 30, hints: 0, title: '불멸의 기사',  label: '30일 연속! 전설 칭호 획득!',             labelEn: '30-day streak! Legendary title!' },
];

// ---- KST Date Helpers ----

/** Returns the current date string in KST as "YYYY-MM-DD". */
function getKSTDateString(timestamp = Date.now()) {
  // KST = UTC+9
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(timestamp + kstOffset);
  const y = kstDate.getUTCFullYear();
  const m = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kstDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns the KST midnight timestamp for the current KST day. */
function getKSTMidnightMs(dateStr) {
  // Parse "YYYY-MM-DD" as midnight KST, return UTC ms
  const [y, m, d] = dateStr.split('-').map(Number);
  // Midnight KST = midnight UTC - 9 hours... wait, midnight KST = 15:00 UTC previous day
  const utcDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  return utcDate.getTime() - 9 * 60 * 60 * 1000;
}

// ---- Persistence ----

function loadDaily() {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[daily-quests] Failed to load daily data:', e);
  }
  return null;
}

function saveDaily(data) {
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[daily-quests] Failed to save daily data:', e);
  }
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[daily-quests] Failed to load streak data:', e);
  }
  return { currentStreak: 0, longestStreak: 0, lastPlayDate: null, streakRewardsClaimed: [] };
}

function saveStreak(data) {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[daily-quests] Failed to save streak data:', e);
  }
}

// ---- Quest Generation ----

/** Deterministic-ish daily seed from date string. */
function dateSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Simple seeded pseudo-random (good enough for quest selection). */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Pick 3 unique quest types for the day, then pick a variant for each. */
function generateQuests(dateStr) {
  const seed = dateSeed(dateStr);
  const rng = seededRandom(seed);

  // Shuffle template indices
  const indices = QUEST_TEMPLATES.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Pick first 3
  const quests = [];
  for (let q = 0; q < 3; q++) {
    const template = QUEST_TEMPLATES[indices[q]];
    const variantIndex = Math.floor(rng() * template.variants.length);
    const variant = template.variants[variantIndex];

    quests.push({
      id: `${dateStr}-${q}`,
      type: template.type,
      progressKey: template.progressKey,
      target: variant.n,
      label: variant.label,
      labelEn: variant.labelEn,
      reward: { ...variant.reward },
      progress: 0,
      completed: false,
      claimed: false,
    });
  }

  return quests;
}

// ---- Daily Tracking Counters ----

function defaultDayCounters() {
  return {
    puzzlesCompleted: 0,
    starsEarned: 0,
    perfectClears: 0,
    spellPuzzles: 0,
    capturePuzzles: 0,
    hintPerfects: 0,
    noHintCompletions: 0,
    noHintCurrentRun: 0,  // consecutive puzzles without hint today
    hintUsedThisPuzzle: false,
  };
}

// ---- Core API ----

/**
 * Checks if quests need refreshing (new KST day) and refreshes if needed.
 * Also updates streak. Call this on app startup and before accessing quests.
 * Returns true if quests were refreshed.
 */
export function checkAndRefreshQuests() {
  const today = getKSTDateString();
  const daily = loadDaily();

  if (daily && daily.date === today) {
    return false; // Still same day, no refresh needed
  }

  // It's a new day — update streak
  updateStreakForNewDay(today, daily?.date);

  // Generate new quests
  const quests = generateQuests(today);
  const newDaily = {
    date: today,
    quests,
    counters: defaultDayCounters(),
  };

  saveDaily(newDaily);
  return true;
}

/**
 * Returns today's 3 quests with current progress.
 * Auto-refreshes if needed.
 */
export function getDailyQuests() {
  checkAndRefreshQuests();
  const daily = loadDaily();
  if (!daily) return [];

  // Sync progress from counters into quest objects
  return daily.quests.map(q => ({
    ...q,
    progress: Math.min(daily.counters[q.progressKey] || 0, q.target),
    completed: (daily.counters[q.progressKey] || 0) >= q.target,
  }));
}

/**
 * Call after each puzzle completion to update quest progress.
 *
 * @param {object} event — puzzle completion details:
 *   { stars, puzzleType, usedHint }
 *   puzzleType: 'capture' | 'spell' | 'territory' | 'life_death' | etc.
 */
export function updateQuestProgress(event) {
  checkAndRefreshQuests();
  const daily = loadDaily();
  if (!daily) return;

  const c = daily.counters;
  const { stars = 0, puzzleType = '', usedHint = false } = event;

  // General completion
  c.puzzlesCompleted += 1;

  // Stars earned
  c.starsEarned += stars;

  // Perfect clear
  if (stars === 3) {
    c.perfectClears += 1;
  }

  // Spell puzzle
  if (puzzleType === 'spell') {
    c.spellPuzzles += 1;
  }

  // Capture puzzle
  if (puzzleType === 'capture') {
    c.capturePuzzles += 1;
  }

  // Hint + perfect
  if (usedHint && stars === 3) {
    c.hintPerfects += 1;
  }

  // No-hint streak
  if (!usedHint) {
    c.noHintCurrentRun += 1;
    // Count how many full completions without hints
    // We track the running count of consecutive no-hint puzzles
    c.noHintCompletions = c.noHintCurrentRun;
  } else {
    c.noHintCurrentRun = 0;
    // Don't reset noHintCompletions — keep the best run
  }

  saveDaily(daily);
}

/**
 * Claims the reward for a completed quest.
 * Returns the reward object or null if not claimable.
 */
export function claimReward(questId) {
  checkAndRefreshQuests();
  const daily = loadDaily();
  if (!daily) return null;

  const quest = daily.quests.find(q => q.id === questId);
  if (!quest) return null;

  // Check completion
  const progress = daily.counters[quest.progressKey] || 0;
  if (progress < quest.target) return null;
  if (quest.claimed) return null;

  // Mark as claimed
  quest.claimed = true;
  saveDaily(daily);

  // Grant reward
  const reward = quest.reward;
  if (reward.type === 'hint') {
    addHintTokens(reward.amount);
  }
  // XP rewards are handled by the caller through progression.js
  // (we return the reward so the caller can apply it)

  return {
    ...reward,
    questLabel: quest.label,
    questLabelEn: quest.labelEn,
    label: reward.type === 'hint'
      ? `힌트 토큰 +${reward.amount} (Hint Token +${reward.amount})`
      : `보너스 경험치 +${reward.amount} (Bonus XP +${reward.amount})`,
  };
}

// ---- Streak System ----

/**
 * Updates streak when a new day is detected.
 */
function updateStreakForNewDay(today, lastDate) {
  const streak = loadStreak();

  if (!lastDate) {
    // First ever play
    streak.currentStreak = 1;
    streak.lastPlayDate = today;
    streak.longestStreak = Math.max(streak.longestStreak, 1);
    saveStreak(streak);
    return;
  }

  // Check if lastDate was yesterday (in KST)
  const lastDateObj = new Date(lastDate + 'T00:00:00+09:00');
  const todayObj = new Date(today + 'T00:00:00+09:00');
  const diffDays = Math.round((todayObj - lastDateObj) / (24 * 60 * 60 * 1000));

  if (diffDays === 1) {
    // Consecutive day
    streak.currentStreak += 1;
  } else if (diffDays > 1) {
    // Streak broken
    streak.currentStreak = 1;
    streak.streakRewardsClaimed = [];
  }
  // diffDays === 0 shouldn't happen (same day), but just in case, don't change

  streak.lastPlayDate = today;
  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);

  // Check and grant streak rewards
  for (const sr of STREAK_REWARDS) {
    if (streak.currentStreak >= sr.days && !streak.streakRewardsClaimed.includes(sr.days)) {
      streak.streakRewardsClaimed.push(sr.days);

      if (sr.hints > 0) {
        addHintTokens(sr.hints);
      }
      if (sr.title) {
        awardTitle(sr.title);
      }
    }
  }

  saveStreak(streak);
}

/**
 * Returns current streak info.
 */
export function getStreak() {
  // Make sure we've checked for new day
  checkAndRefreshQuests();

  const streak = loadStreak();
  const nextReward = STREAK_REWARDS.find(sr => sr.days > streak.currentStreak)
    || STREAK_REWARDS[STREAK_REWARDS.length - 1];

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastPlayDate: streak.lastPlayDate,
    daysToNextReward: Math.max(0, (nextReward?.days || 0) - streak.currentStreak),
    nextReward: nextReward ? { ...nextReward } : null,
    claimedRewards: [...(streak.streakRewardsClaimed || [])],
  };
}

/**
 * Marks a hint as used for the current puzzle session (call before puzzle completes).
 * This is so daily quest tracking knows if a hint was used.
 */
export function markHintUsed() {
  const daily = loadDaily();
  if (daily) {
    daily.counters.hintUsedThisPuzzle = true;
    saveDaily(daily);
  }
}

/**
 * Returns whether a hint was used for the current puzzle session.
 */
export function wasHintUsed() {
  const daily = loadDaily();
  return daily?.counters?.hintUsedThisPuzzle || false;
}

/**
 * Resets the hint-used flag for the start of a new puzzle.
 */
export function resetHintFlag() {
  const daily = loadDaily();
  if (daily) {
    daily.counters.hintUsedThisPuzzle = false;
    saveDaily(daily);
  }
}

// ---- Reset (for testing/debug) ----

export function resetDaily() {
  localStorage.removeItem(DAILY_STORAGE_KEY);
  localStorage.removeItem(STREAK_STORAGE_KEY);
}
