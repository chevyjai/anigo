// ============================================
// AniGO — Auth Module (Guest + Kakao placeholder)
// Lightweight client-side auth with localStorage persistence
// ============================================

const STORAGE_KEY = 'anigo-player';

// Korean-style guest name prefixes
const GUEST_TITLES = [
  '바둑기사', '수호자', '별의전사', '돌마법사', '기풍달인',
  '묘수장인', '천재기사', '신의한수', '포석왕', '전투사'
];

function generateGuestName() {
  const title = GUEST_TITLES[Math.floor(Math.random() * GUEST_TITLES.length)];
  const number = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `${title} #${number}`;
}

function createGuestPlayer() {
  return {
    id: 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    name: generateGuestName(),
    type: 'guest', // 'guest' | 'kakao'
    kakaoId: null,
    createdAt: Date.now(),
    stats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalCaptures: 0,
      totalStonesPlaced: 0,
      totalSpellsUsed: 0,
      favoriteChampion: null,
      championHistory: {} // { champId: count }
    }
  };
}

function loadPlayer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const player = JSON.parse(raw);
      // Ensure all stat fields exist (migration safety)
      if (!player.stats) player.stats = createGuestPlayer().stats;
      if (!player.stats.championHistory) player.stats.championHistory = {};
      if (player.stats.totalCaptures === undefined) player.stats.totalCaptures = 0;
      if (player.stats.totalStonesPlaced === undefined) player.stats.totalStonesPlaced = 0;
      if (player.stats.totalSpellsUsed === undefined) player.stats.totalSpellsUsed = 0;
      return player;
    }
  } catch (e) {
    console.warn('AniGO Auth: Failed to load player data', e);
  }
  return null;
}

function savePlayer(player) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch (e) {
    console.warn('AniGO Auth: Failed to save player data', e);
  }
}

// Singleton player instance
let _player = null;

/**
 * Get current player. Auto-creates guest on first visit.
 */
export function getPlayer() {
  if (!_player) {
    _player = loadPlayer();
    if (!_player) {
      _player = createGuestPlayer();
      savePlayer(_player);
    }
  }
  return _player;
}

/**
 * Record a completed game result.
 * @param {Object} result
 * @param {boolean} result.won - Did the player win?
 * @param {string} result.championId - Champion used this game
 * @param {number} result.captures - Stones captured this game
 * @param {number} result.stonesPlaced - Stones placed this game
 * @param {number} result.spellsUsed - Spells cast this game
 */
export function recordGame(result) {
  const player = getPlayer();
  const stats = player.stats;

  stats.gamesPlayed++;
  if (result.won) {
    stats.wins++;
  } else {
    stats.losses++;
  }

  stats.totalCaptures += (result.captures || 0);
  stats.totalStonesPlaced += (result.stonesPlaced || 0);
  stats.totalSpellsUsed += (result.spellsUsed || 0);

  // Track champion usage
  if (result.championId) {
    if (!stats.championHistory[result.championId]) {
      stats.championHistory[result.championId] = 0;
    }
    stats.championHistory[result.championId]++;

    // Update favorite champion (most played)
    let maxCount = 0;
    let favorite = null;
    for (const [id, count] of Object.entries(stats.championHistory)) {
      if (count > maxCount) {
        maxCount = count;
        favorite = id;
      }
    }
    stats.favoriteChampion = favorite;
  }

  savePlayer(player);
  return player;
}

/**
 * Get win rate as a percentage string.
 */
export function getWinRate() {
  const player = getPlayer();
  const { gamesPlayed, wins } = player.stats;
  if (gamesPlayed === 0) return '—';
  return Math.round((wins / gamesPlayed) * 100) + '%';
}

/**
 * Placeholder: Kakao Login (Coming Soon)
 */
export function loginWithKakao() {
  return { success: false, message: '카카오 로그인은 곧 출시됩니다! (Coming Soon)' };
}

/**
 * Logout — revert to a new guest session.
 */
export function logout() {
  _player = createGuestPlayer();
  savePlayer(_player);
  return _player;
}

/**
 * Check if player is logged in with a social account.
 */
export function isLoggedIn() {
  const player = getPlayer();
  return player.type !== 'guest';
}
