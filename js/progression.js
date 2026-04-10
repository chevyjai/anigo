// ============================================
// AniGO — Player Progression System
// Client-side localStorage persistence
// ============================================

const STORAGE_KEY = 'anigo-progress';

const RANKS = [
  { minStars: 0,   title: '입문자',     titleEn: 'Beginner' },
  { minStars: 11,  title: '초보 기사',  titleEn: 'Novice Player' },
  { minStars: 31,  title: '중급 기사',  titleEn: 'Intermediate' },
  { minStars: 61,  title: '상급 기사',  titleEn: 'Advanced' },
  { minStars: 101, title: '명인',       titleEn: 'Master' },
  { minStars: 151, title: '국수',       titleEn: 'Grandmaster' },
  { minStars: 201, title: '신선',       titleEn: 'Immortal' },
];

// XP required per level — grows quadratically
function xpForLevel(level) {
  return 50 + (level - 1) * 30;
}

// XP earned from completing a puzzle
function xpFromStars(stars) {
  if (stars === 3) return 30;
  if (stars === 2) return 18;
  if (stars === 1) return 10;
  return 0;
}

// Default progress object
function defaultProgress() {
  return {
    puzzles: {},        // { puzzleId: { bestStars, bestMoves, completions, firstCompleted, lastPlayed } }
    hintTokens: 5,
    xp: 0,
    level: 1,
    totalPuzzlesCompleted: 0,
    titles: [],         // special earned titles
    createdAt: Date.now(),
  };
}

// ---- Persistence ----

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Migrate: ensure all fields exist
      const base = defaultProgress();
      return { ...base, ...data };
    }
  } catch (e) {
    console.warn('[progression] Failed to load progress, resetting:', e);
  }
  return defaultProgress();
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('[progression] Failed to save progress:', e);
  }
}

// ---- Core API ----

/**
 * Returns the full progress object (read-only copy).
 */
export function getProgress() {
  return structuredClone(loadProgress());
}

/**
 * Returns the total best-stars across all puzzles.
 */
export function getTotalStars() {
  const prog = loadProgress();
  let total = 0;
  for (const pid of Object.keys(prog.puzzles)) {
    total += (prog.puzzles[pid].bestStars || 0);
  }
  return total;
}

/**
 * Returns current rank object { title, titleEn, minStars }.
 */
export function getRank() {
  const stars = getTotalStars();
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (stars >= r.minStars) rank = r;
    else break;
  }
  return { ...rank, totalStars: stars };
}

/**
 * Returns true if a world is unlocked.
 * World 1 is always unlocked. World N requires (N-1)*15 total stars.
 */
export function isWorldUnlocked(worldId) {
  if (worldId <= 1) return true;
  const required = (worldId - 1) * 15;
  return getTotalStars() >= required;
}

/**
 * Returns how many stars are needed to unlock a world.
 * Returns 0 if already unlocked.
 */
export function starsToUnlockWorld(worldId) {
  if (worldId <= 1) return 0;
  const required = (worldId - 1) * 15;
  const have = getTotalStars();
  return Math.max(0, required - have);
}

/**
 * Returns true if a puzzle level is unlocked.
 * A puzzle is unlocked if:
 *  - It's puzzle 1 of any unlocked world, OR
 *  - The previous puzzle in the same world has been completed (>=1 star)
 *
 * puzzleId format: "W-L" e.g. "1-1", "2-5" or numeric index
 * For simplicity, we also accept plain numbers (treat as world 1).
 */
export function isLevelUnlocked(puzzleId) {
  const { world, level } = parsePuzzleId(puzzleId);

  // World must be unlocked
  if (!isWorldUnlocked(world)) return false;

  // First level of any unlocked world is always unlocked
  if (level <= 1) return true;

  // Check if previous level in this world has been completed
  const prevId = `${world}-${level - 1}`;
  const prog = loadProgress();
  const prev = prog.puzzles[prevId];
  return prev && prev.bestStars >= 1;
}

/**
 * Records puzzle completion. Returns a rewards summary.
 *
 * @param {string} puzzleId — e.g. "1-3" or "2-7"
 * @param {number} stars — 1, 2, or 3
 * @param {number} moves — number of moves taken
 * @returns {{ xpEarned, levelsGained, newRank, hintEarned, isNewBest, previousBest, rewards[] }}
 */
export function completePuzzle(puzzleId, stars, moves) {
  const pid = normalizePuzzleId(puzzleId);
  const prog = loadProgress();
  const now = Date.now();

  // Get or create puzzle record
  const existing = prog.puzzles[pid] || {
    bestStars: 0,
    bestMoves: Infinity,
    completions: 0,
    firstCompleted: null,
    lastPlayed: null,
  };

  const isNewBest = stars > existing.bestStars;
  const previousBest = existing.bestStars;
  const isFirstCompletion = existing.completions === 0;

  // Update puzzle record
  existing.bestStars = Math.max(existing.bestStars, stars);
  if (moves < (existing.bestMoves || Infinity)) {
    existing.bestMoves = moves;
  }
  existing.completions += 1;
  if (!existing.firstCompleted) existing.firstCompleted = now;
  existing.lastPlayed = now;
  prog.puzzles[pid] = existing;

  // Calculate XP — full XP for new best, reduced for replay
  let xpEarned;
  if (isFirstCompletion) {
    xpEarned = xpFromStars(stars);
  } else if (isNewBest) {
    // Only earn the difference for improved stars
    xpEarned = xpFromStars(stars) - xpFromStars(previousBest);
  } else {
    // Replay bonus: small amount
    xpEarned = Math.floor(xpFromStars(stars) * 0.2);
  }

  prog.xp += xpEarned;
  if (isFirstCompletion) {
    prog.totalPuzzlesCompleted += 1;
  }

  // Level up check
  let levelsGained = 0;
  let levelUpRewards = [];
  while (prog.xp >= xpForLevel(prog.level)) {
    prog.xp -= xpForLevel(prog.level);
    prog.level += 1;
    levelsGained += 1;
    // Every 5 levels, earn a hint token as level-up reward
    if (prog.level % 5 === 0) {
      prog.hintTokens += 1;
      levelUpRewards.push({ type: 'hint', amount: 1, reason: `레벨 ${prog.level} 달성 보상 (Level ${prog.level} reward)` });
    }
  }

  // Hint token for 3-star completion (only on first 3-star)
  let hintEarned = false;
  if (stars === 3 && previousBest < 3) {
    prog.hintTokens += 1;
    hintEarned = true;
  }

  // Check rank change
  const totalStars = calcTotalStars(prog);
  const newRank = getRankForStars(totalStars);

  saveProgress(prog);

  // Build rewards array for UI display
  const rewards = [];
  if (xpEarned > 0) {
    rewards.push({ type: 'xp', amount: xpEarned, label: `경험치 +${xpEarned} (XP +${xpEarned})` });
  }
  if (hintEarned) {
    rewards.push({ type: 'hint', amount: 1, label: '힌트 토큰 +1 (Hint Token +1)' });
  }
  if (levelsGained > 0) {
    rewards.push({ type: 'levelup', amount: levelsGained, label: `레벨 업! Lv.${prog.level} (Level Up!)` });
    rewards.push(...levelUpRewards);
  }

  return {
    xpEarned,
    levelsGained,
    newLevel: prog.level,
    currentXp: prog.xp,
    xpToNext: xpForLevel(prog.level),
    newRank,
    hintEarned,
    isNewBest,
    previousBest,
    rewards,
  };
}

// ---- Hint Token Economy ----

/**
 * Returns current hint token count.
 */
export function getHintTokens() {
  return loadProgress().hintTokens;
}

/**
 * Attempts to use a hint token. Returns true if successful.
 */
export function useHintToken() {
  const prog = loadProgress();
  if (prog.hintTokens <= 0) return false;
  prog.hintTokens -= 1;
  saveProgress(prog);
  return true;
}

/**
 * Adds hint tokens (from quest rewards, etc.)
 */
export function addHintTokens(amount) {
  const prog = loadProgress();
  prog.hintTokens += amount;
  saveProgress(prog);
  return prog.hintTokens;
}

// ---- Player Level / XP ----

/**
 * Returns current level info.
 */
export function getLevelInfo() {
  const prog = loadProgress();
  return {
    level: prog.level,
    currentXp: prog.xp,
    xpToNext: xpForLevel(prog.level),
    xpPercent: Math.floor((prog.xp / xpForLevel(prog.level)) * 100),
  };
}

// ---- Puzzle Data Queries ----

/**
 * Returns best stars for a given puzzle, or 0.
 */
export function getPuzzleStars(puzzleId) {
  const pid = normalizePuzzleId(puzzleId);
  const prog = loadProgress();
  return prog.puzzles[pid]?.bestStars || 0;
}

/**
 * Returns full puzzle record or null.
 */
export function getPuzzleRecord(puzzleId) {
  const pid = normalizePuzzleId(puzzleId);
  const prog = loadProgress();
  return prog.puzzles[pid] || null;
}

/**
 * Returns a summary of stars per world.
 * { worldId: { earned, total, puzzleCount } }
 */
export function getWorldStarSummary() {
  const prog = loadProgress();
  const worlds = {};
  for (const [pid, record] of Object.entries(prog.puzzles)) {
    const { world } = parsePuzzleId(pid);
    if (!worlds[world]) worlds[world] = { earned: 0, puzzleCount: 0 };
    worlds[world].earned += record.bestStars;
    worlds[world].puzzleCount += 1;
  }
  return worlds;
}

/**
 * Returns the highest unlocked puzzle in a world.
 */
export function getHighestUnlockedLevel(worldId) {
  if (!isWorldUnlocked(worldId)) return 0;
  const prog = loadProgress();
  let highest = 1; // first level is always unlocked
  for (let lvl = 2; lvl <= 100; lvl++) {
    const pid = `${worldId}-${lvl - 1}`;
    const prev = prog.puzzles[pid];
    if (prev && prev.bestStars >= 1) {
      highest = lvl;
    } else {
      break;
    }
  }
  return highest;
}

// ---- Titles ----

/**
 * Awards a special title. Returns true if newly awarded.
 */
export function awardTitle(titleKey) {
  const prog = loadProgress();
  if (prog.titles.includes(titleKey)) return false;
  prog.titles.push(titleKey);
  saveProgress(prog);
  return true;
}

/**
 * Returns all earned titles.
 */
export function getTitles() {
  return loadProgress().titles;
}

// ---- Reset (for testing/debug) ----

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Internal Helpers ----

function parsePuzzleId(puzzleId) {
  // Handle formats: "p1-1", "p2-5", "1-1", "pd-3", etc.
  const str = String(puzzleId).replace(/^p/, ''); // Strip "p" prefix
  if (str.includes('-')) {
    const parts = str.split('-');
    const w = parseInt(parts[0], 10) || 1;
    const l = parseInt(parts[1], 10) || 1;
    return { world: w, level: l };
  }
  // Plain number — treat as world 1
  return { world: 1, level: parseInt(str, 10) || 1 };
}

function normalizePuzzleId(puzzleId) {
  const { world, level } = parsePuzzleId(puzzleId);
  return `${world}-${level}`;
}

function calcTotalStars(prog) {
  let total = 0;
  for (const pid of Object.keys(prog.puzzles)) {
    total += (prog.puzzles[pid].bestStars || 0);
  }
  return total;
}

function getRankForStars(stars) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (stars >= r.minStars) rank = r;
    else break;
  }
  return { ...rank, totalStars: stars };
}
