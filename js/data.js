// ============================================
// AniGO — Constants, champion/spell definitions, board config
// ============================================

export const BOARD_SIZE = 9;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;
export const VOID = 3;
export const WALL = 4;

export const MAX_CHI = 10;
export const START_CHI = 3;
export const CHI_PER_TURN = 1;
export const CHI_PER_CAPTURE = 1;
// BALANCE: +2 on pass is strong but double-pass ends game, preventing degenerate pass-wars.
export const CHI_ON_PASS = 2;
export const KOMI = 5.5;

export const DUAL_ACTION_SURCHARGE = 1;

// 0-indexed star points for 9x9 board
export const HOSHI = [[2,2],[2,6],[4,4],[6,2],[6,6]];

// Spell durations
export const STONE_SKIN_DURATION = 5;
export const MIRAGE_DURATION = 6;
export const SANCTUARY_DURATION = 4;
export const SMOLDER_DURATION = 3;
export const PHASE_SHIFT_DURATION = 3;
export const PHASE_SHIFT_HIDDEN_TURNS = 1;
export const THUNDER_VEIL_DURATION = 3;

// Wildfire / Inferno
export const WILDFIRE_BLAST_RADIUS = 2;
export const WILDFIRE_DESTROY_CHANCE = 0.5;
export const INFERNO_RANGE = 2;

// Chain Lightning
export const CHAIN_LIGHTNING_CHANCES = [0.75, 0.50, 0.25];

// Max phantoms on board simultaneously (including free phantom from Fox's Cunning)
export const MAX_PHANTOMS_ON_BOARD = 3;

// AI tuning
export const AI_SPELL_CAST_CHANCE = 0.45;
export const AI_SAVE_PRIORITY = 0.85;
export const AI_CAPTURE_PRIORITY = 0.75;
export const AI_EXTEND_PRIORITY = 0.4;
export const AI_CORNER_BIAS_TURNS = 8;
export const AI_MIN_CHI_FOR_BIG_SPELL = 5;

// Column labels for game log
export const COL_LABELS = ['A','B','C','D','E','F','G','H','J'];

// ── Champions ──
export const CHAMPIONS = [
  {
    id: 'seolhwa',
    name: 'Seolhwa',
    title: 'The Territorial Sage',
    archetype: 'Control',
    color: '#67E8F9', // ice blue
    pitch: 'Build an unbreakable fortress.',
    passive: { name: 'Permafrost', description: 'Stones on star points get +1 liberty.' },
    spells: [
      { id: 'stoneskin', name: 'Stone Skin', cost: 2, uses: 2, hidden: true, category: 'defensive',
        description: 'Shield a stone. Secret.', descriptionLong: 'Make your stone uncapturable for 5 turns. Hidden.' },
      { id: 'sanctuary', name: 'Sanctuary', cost: 4, uses: 1, hidden: false, category: 'defensive',
        description: '3x3 no-capture zone, 4 turns.', descriptionLong: 'Protect a 3x3 area from captures for 4 turns.' },
      { id: 'earthenwall', name: 'Earthen Wall', cost: 5, uses: 1, hidden: false, category: 'terrain',
        description: 'Build a 3-point wall.', descriptionLong: 'Block 3 consecutive intersections permanently. Counts as territory border.' }
    ]
  },
  {
    id: 'ryujin',
    name: 'Ryujin',
    title: 'The Flame Warlord',
    archetype: 'Aggro',
    color: '#EF4444', // fire red
    pitch: 'Burn everything down.',
    passive: { name: "Dragon's Hunger", description: '+2 Chi per capture event.' },
    spells: [
      { id: 'shatter', name: 'Shatter', cost: 3, uses: 2, hidden: false, category: 'offensive',
        description: 'Destroy enemy stone in danger.', descriptionLong: 'Destroy one enemy stone with only 1 liberty. Gain Chi.' },
      { id: 'smolder', name: 'Smolder', cost: 4, uses: 1, hidden: true, category: 'offensive',
        description: 'Hidden countdown. Burns liberties.', descriptionLong: 'Attach a hidden effect that removes 1 liberty per turn for 3 turns.' },
      { id: 'inferno', name: 'Inferno', cost: 6, uses: 1, hidden: false, category: 'offensive',
        description: 'Capture all atari stones nearby.', descriptionLong: 'All enemy stones in atari within range 2 are captured instantly.' }
    ]
  },
  {
    id: 'kumiho',
    name: 'Kumiho',
    title: 'The Shadow Trickster',
    archetype: 'Trickster',
    color: '#A855F7', // purple
    pitch: 'Make them question reality.',
    passive: { name: "Fox's Cunning", description: 'Passing also places a free phantom (1/game).' },
    spells: [
      { id: 'mirage', name: 'Mirage', cost: 3, uses: 2, hidden: true, category: 'info',
        description: 'Place a fake stone. Secret.', descriptionLong: 'Place a phantom stone. Looks real to opponent. Vanishes if touched.' },
      { id: 'snare', name: 'Snare', cost: 2, uses: 2, hidden: true, category: 'trap',
        description: 'Hidden trap. Steals a turn.', descriptionLong: 'Hidden trap. Enemy who steps on it loses their next turn.' },
      { id: 'ninelives', name: 'Nine Lives', cost: 5, uses: 1, hidden: true, category: 'defensive',
        description: 'Resurrect a captured group.', descriptionLong: 'Bring back a group captured this turn. Displaces enemy stones.' }
    ]
  },
  {
    id: 'musubi',
    name: 'Musubi',
    title: 'The Void Walker',
    archetype: 'Board Modifier',
    color: '#8B5CF6', // deep violet
    pitch: 'Reshape the board itself.',
    passive: { name: 'Spatial Anomaly', description: 'Game starts with 1 random void point.' },
    spells: [
      { id: 'voidrift', name: 'Void Rift', cost: 3, uses: 2, hidden: false, category: 'terrain',
        description: 'Delete a board intersection.', descriptionLong: 'Permanently remove a point. Can destroy stones. May cascade.' },
      { id: 'warpgate', name: 'Warp Gate', cost: 4, uses: 1, hidden: false, category: 'terrain',
        description: 'Link two distant points.', descriptionLong: 'Two points become adjacent. Groups connect across the board.' },
      { id: 'phaseshift', name: 'Phase Shift', cost: 5, uses: 1, hidden: true, category: 'terrain',
        description: 'Stone becomes intangible.', descriptionLong: 'Your stone ignores enemies for 3 turns. Hidden for 1 turn.' }
    ]
  },
  {
    id: 'raijin',
    name: 'Raijin',
    title: 'The Storm Caller',
    archetype: 'Chaos',
    color: '#3B82F6', // electric blue
    pitch: 'Ride the lightning.',
    passive: { name: 'Eye of the Storm', description: 'At max Chi, next spell costs 2 less.' },
    spells: [
      { id: 'chainlightning', name: 'Chain Lightning', cost: 3, uses: 2, hidden: false, category: 'offensive',
        description: 'Cascading RNG strikes.', descriptionLong: '75%/50%/25% chance to destroy chain of enemy stones.' },
      { id: 'wildfire', name: 'Wildfire', cost: 6, uses: 1, hidden: false, category: 'offensive',
        description: '50/50 destroy all stones nearby.', descriptionLong: 'Every stone within 2 spaces has 50% destroy chance. Hits your own too!' },
      { id: 'thunderveil', name: 'Thunder Veil', cost: 2, uses: 1, hidden: true, category: 'info',
        description: 'Hide all your stones for 3 turns.', descriptionLong: 'Your stones become invisible to opponent for 3 turns. Fog of war!' }
    ]
  }
];

export function getChampion(id) {
  return CHAMPIONS.find(c => c.id === id) || null;
}

export function getSpellFromChampion(champId, spellId) {
  const champ = getChampion(champId);
  if (!champ) return null;
  return champ.spells.find(s => s.id === spellId) || null;
}

export function opposite(color) {
  return color === BLACK ? WHITE : BLACK;
}

export function posKey(row, col) {
  return `${row},${col}`;
}

export function parseKey(key) {
  const [r, c] = key.split(',').map(Number);
  return { row: r, col: c };
}

export function coordLabel(row, col) {
  return `${COL_LABELS[col]}${BOARD_SIZE - row}`;
}

export function colorName(color) {
  return color === BLACK ? 'Black' : 'White';
}
