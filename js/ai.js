// ============================================
// AniGO — AI opponent with Champion awareness
// ============================================

import {
  BOARD_SIZE, BLACK, WHITE, EMPTY, VOID, WALL, CHAMPIONS,
  AI_SPELL_CAST_CHANCE, AI_SAVE_PRIORITY, AI_CAPTURE_PRIORITY,
  AI_CORNER_BIAS_TURNS, AI_MIN_CHI_FOR_BIG_SPELL,
  HOSHI, posKey, parseKey, opposite
} from './data.js';
import { getAdjacent } from './game.js';
import { canCastSpell, getValidTargets, castSpell } from './spells.js';

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// AI Difficulty: 'easy', 'normal', 'hard'
// Easy: picks from top 5, random spell timing, misses atari 40% of time
// Normal: picks from top 3, decent spell timing (current behavior)
// Hard: always picks best move, deterministic spell usage, never misses atari
let aiDifficulty = 'normal';
export function setAIDifficulty(d) { aiDifficulty = d; }
export function getAIDifficulty() { return aiDifficulty; }

function allStonesOfColor(gs, color) {
  const stones = [];
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++)
    if (gs.board[r][c] === color && !gs.phantoms.has(posKey(r, c))) stones.push({ row: r, col: c });
  return stones;
}

function scoreMovePosition(gs, row, col, color) {
  let score = 0;
  const opp = opposite(color);
  const isCorner = (row <= 2 || row >= BOARD_SIZE - 3) && (col <= 2 || col >= BOARD_SIZE - 3);
  const isEdge = row <= 1 || row >= BOARD_SIZE - 2 || col <= 1 || col >= BOARD_SIZE - 2;
  const isCenter = row >= 3 && row <= 5 && col >= 3 && col <= 5;

  if (gs.turnNumber < AI_CORNER_BIAS_TURNS) {
    for (const [hr, hc] of HOSHI) if (row === hr && col === hc) { score += 8; break; }
    if (isCorner) score += 4;
    if (isEdge) score += 2;
    if (isCenter) score -= 2;
  } else {
    if (isCenter) score += 3;
  }

  const ownStones = allStonesOfColor(gs, color);
  let nearOwn = 0;
  for (const s of ownStones) {
    const dist = Math.abs(s.row - row) + Math.abs(s.col - col);
    if (dist === 1) nearOwn += 2;
    else if (dist === 2) nearOwn += 3;
    else if (dist === 3) nearOwn += 1;
  }
  score += Math.min(nearOwn, 8);

  let clusterCount = 0;
  for (const s of ownStones) if (Math.abs(s.row - row) + Math.abs(s.col - col) <= 2) clusterCount++;
  if (clusterCount >= 3) score -= 3;

  for (const [nr, nc] of getAdjacent(row, col, gs.warpGates)) {
    if (gs.board[nr][nc] === color) { const libs = gs.countLiberties(nr, nc); if (libs <= 2) score += 3; }
    if (gs.board[nr][nc] === opp) { const libs = gs.countLiberties(nr, nc); if (libs <= 2) score += 4; if (libs === 2) score += 3; }
  }

  score += Math.random() * 1.5;
  return score;
}

function selectMove(gs, color) {
  const legalMoves = gs.generateLegalMoves(color);
  if (legalMoves.length === 0) return null;
  const opp = opposite(color);

  // Save own groups in atari
  const atariSaves = [];
  const ownStones = allStonesOfColor(gs, color);
  const checkedSave = new Set();
  for (const s of ownStones) {
    const k = posKey(s.row, s.col);
    if (checkedSave.has(k)) continue;
    const group = gs.findGroup(s.row, s.col);
    for (const gk of group) checkedSave.add(gk);
    if (gs.countLiberties(s.row, s.col) === 1) {
      for (const gk of group) {
        const p = parseKey(gk);
        for (const [nr, nc] of getAdjacent(p.row, p.col, gs.warpGates))
          if (legalMoves.some(m => m.row === nr && m.col === nc)) atariSaves.push({ row: nr, col: nc, groupSize: group.size });
      }
    }
  }
  const saveChance = aiDifficulty === 'easy' ? 0.6 : aiDifficulty === 'hard' ? 1.0 : AI_SAVE_PRIORITY;
  if (atariSaves.length > 0 && Math.random() < saveChance) {
    atariSaves.sort((a, b) => b.groupSize - a.groupSize);
    return atariSaves[0];
  }

  // Capture enemy groups in atari
  const atariCaptures = [];
  const oppStones = allStonesOfColor(gs, opp);
  const checkedCapt = new Set();
  for (const s of oppStones) {
    const k = posKey(s.row, s.col);
    if (checkedCapt.has(k)) continue;
    const group = gs.findGroup(s.row, s.col);
    for (const gk of group) checkedCapt.add(gk);
    if (gs.countLiberties(s.row, s.col) === 1) {
      const libs = gs.findLiberties(s.row, s.col);
      for (const lib of libs)
        if (legalMoves.some(m => m.row === lib.row && m.col === lib.col)) atariCaptures.push({ ...lib, groupSize: group.size });
    }
  }
  const captChance = aiDifficulty === 'easy' ? 0.5 : aiDifficulty === 'hard' ? 1.0 : AI_CAPTURE_PRIORITY;
  if (atariCaptures.length > 0 && Math.random() < captChance) {
    atariCaptures.sort((a, b) => b.groupSize - a.groupSize);
    return atariCaptures[0];
  }

  const scoredMoves = legalMoves.map(m => ({ ...m, score: scoreMovePosition(gs, m.row, m.col, color) }));
  scoredMoves.sort((a, b) => b.score - a.score);
  // Difficulty affects move selection pool: easy=top5, normal=top3, hard=best
  const topN = aiDifficulty === 'easy' ? Math.min(5, scoredMoves.length) : aiDifficulty === 'hard' ? 1 : Math.min(3, scoredMoves.length);
  return scoredMoves[Math.floor(Math.random() * topN)];
}

function aiConsiderSpell(gs, color) {
  const available = gs.getAvailableSpells(color);
  if (available.length === 0) return null;

  // Don't waste spells in the first few turns — build up position first
  if (gs.turnNumber < 4 && Math.random() > 0.15) return null;

  // Check if we're in danger — prioritize defensive spells
  const ownStones = allStonesOfColor(gs, color);
  const opp = opposite(color);
  let inDanger = false;
  for (const s of ownStones) {
    if (gs.countLiberties(s.row, s.col) <= 1) { inDanger = true; break; }
  }

  // Higher spell cast chance when in danger or when we have lots of chi
  let castChance = AI_SPELL_CAST_CHANCE;
  if (inDanger) castChance = 0.8;
  else if (gs.chi[color] >= 8) castChance = 0.7;
  else if (gs.turnNumber > 20) castChance = 0.6; // Late game: use them or lose them

  const hasExpensive = available.some(s => s.cost >= 5);
  if (hasExpensive && gs.chi[color] < AI_MIN_CHI_FOR_BIG_SPELL && !inDanger) {
    const cheap = available.filter(s => s.cost <= 3);
    if (cheap.length === 0) return null;
  }

  if (Math.random() > castChance) return null;

  // Sort spells by priority: defensive when in danger, offensive otherwise
  const sorted = [...available].sort((a, b) => {
    const aDefensive = ['stoneskin', 'sanctuary', 'phaseshift', 'ninelives'].includes(a.id);
    const bDefensive = ['stoneskin', 'sanctuary', 'phaseshift', 'ninelives'].includes(b.id);
    if (inDanger) return (bDefensive ? 1 : 0) - (aDefensive ? 1 : 0);
    return (aDefensive ? 1 : 0) - (bDefensive ? 1 : 0);
  });

  for (const spell of sorted) {
    const cost = gs.getSpellCost(spell.id, color);
    if (gs.chi[color] < cost) continue;
    if (!canCastSpell(gs, spell.id, color)) continue;

    const validTargets = getValidTargets(gs, spell.id, color);
    if (validTargets.length === 0) continue;

    let bestTarget = null;

    switch (spell.id) {
      case 'shatter': case 'chainlightning': {
        let bestSize = 0;
        const checked = new Set();
        for (const t of validTargets) {
          const k = posKey(t.row, t.col);
          if (checked.has(k)) continue;
          if (gs.board[t.row][t.col] !== opp) continue;
          const group = gs.findGroup(t.row, t.col);
          for (const gk of group) checked.add(gk);
          if (group.size > bestSize) { bestSize = group.size; bestTarget = t; }
        }
        break;
      }
      case 'wildfire': case 'inferno': {
        let bestScore = -Infinity;
        for (const t of validTargets) {
          let eInRange = 0, oInRange = 0;
          for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
            if (Math.abs(r - t.row) + Math.abs(c - t.col) <= 2) {
              if (gs.board[r][c] === opp && !gs.phantoms.has(posKey(r, c))) eInRange++;
              if (gs.board[r][c] === color && !gs.phantoms.has(posKey(r, c))) oInRange++;
            }
          }
          const s = eInRange * 2 - oInRange * 3;
          if (s > bestScore && eInRange >= 2) { bestScore = s; bestTarget = t; }
        }
        break;
      }
      case 'stoneskin': case 'phaseshift': {
        let bestValue = -1;
        for (const t of validTargets) {
          const group = gs.findGroup(t.row, t.col);
          const libs = gs.countLiberties(t.row, t.col);
          const value = group.size * 3 + (libs <= 2 ? 10 : 0) + (libs === 1 ? 15 : 0);
          if (value > bestValue) { bestValue = value; bestTarget = t; }
        }
        break;
      }
      case 'mirage': {
        let bestScore = -1;
        for (const t of validTargets) {
          let s = 0;
          for (const [nr, nc] of getAdjacent(t.row, t.col, gs.warpGates)) {
            if (gs.board[nr][nc] === opp) s += 3;
            if (gs.board[nr][nc] === color) s += 1;
          }
          s += Math.random();
          if (s > bestScore) { bestScore = s; bestTarget = t; }
        }
        break;
      }
      case 'voidrift': {
        let bestScore = -1;
        for (const t of validTargets) {
          let s = 0;
          for (const [nr, nc] of getAdjacent(t.row, t.col, gs.warpGates)) {
            if (gs.board[nr][nc] === opp) s += (5 - Math.min(gs.countLiberties(nr, nc), 4)) * 3;
          }
          s += Math.random();
          if (s > bestScore) { bestScore = s; bestTarget = t; }
        }
        break;
      }
      case 'snare': {
        let bestScore = -1;
        for (const t of validTargets) {
          let s = 0;
          for (const [hr, hc] of HOSHI) if (t.row === hr && t.col === hc) { s += 5; break; }
          for (const [nr, nc] of getAdjacent(t.row, t.col, gs.warpGates)) {
            if (gs.board[nr][nc] === opp) s += 3;
            if (gs.board[nr][nc] === color) s += 1;
          }
          s += Math.random();
          if (s > bestScore) { bestScore = s; bestTarget = t; }
        }
        break;
      }
      case 'smolder': {
        let bestScore = -1;
        for (const t of validTargets) {
          const libs = gs.countLiberties(t.row, t.col);
          const s = (4 - Math.min(libs, 4)) * 5 + Math.random();
          if (s > bestScore) { bestScore = s; bestTarget = t; }
        }
        break;
      }
      case 'sanctuary': case 'earthenwall': {
        bestTarget = randomChoice(validTargets);
        break;
      }
      case 'warpgate': {
        if (validTargets.length >= 2) {
          const t1 = randomChoice(validTargets);
          const remaining = validTargets.filter(t => t.row !== t1.row || t.col !== t1.col);
          if (remaining.length > 0) {
            bestTarget = { first: t1, second: randomChoice(remaining) };
          }
        }
        break;
      }
      case 'thunderveil': {
        bestTarget = validTargets[0];
        break;
      }
      default:
        bestTarget = randomChoice(validTargets);
    }

    if (bestTarget) return { spell, target: bestTarget };
  }
  return null;
}

export function aiTakeTurn(gs, color) {
  const spellAction = aiConsiderSpell(gs, color);
  const legalMoves = gs.generateLegalMoves(color);

  if (spellAction && legalMoves.length > 0 && Math.random() < 0.35) {
    if (gs.chi[color] >= gs.getSpellCost(spellAction.spell.id, color) + 2) {
      const move = selectMove(gs, color);
      if (move) return { type: 'place_and_spell', move, spell: spellAction.spell, spellTarget: spellAction.target };
    }
  }

  if (spellAction) return { type: 'cast_spell', spell: spellAction.spell, spellTarget: spellAction.target };

  if (legalMoves.length > 0) {
    const move = selectMove(gs, color);
    if (move) return { type: 'place', move };
  }

  return { type: 'pass' };
}

// ── AI champion selection ──
export function aiSelectChampion(excludeId) {
  // Weighted selection: prefer aggressive/chaos champions
  const weights = { seolhwa: 2, ryujin: 3, kumiho: 2, musubi: 2, raijin: 3 };
  const available = CHAMPIONS.filter(c => c.id !== excludeId);
  const totalWeight = available.reduce((sum, c) => sum + (weights[c.id] || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const c of available) {
    roll -= (weights[c.id] || 1);
    if (roll <= 0) return c.id;
  }
  return available[available.length - 1].id;
}
