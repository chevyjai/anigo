// ============================================
// AniGO — Spell casting logic for Champion system (15 spells)
// ============================================

import {
  BOARD_SIZE, EMPTY, BLACK, WHITE, VOID, WALL,
  MAX_CHI, CHI_PER_CAPTURE, MAX_PHANTOMS_ON_BOARD,
  STONE_SKIN_DURATION, MIRAGE_DURATION, SANCTUARY_DURATION,
  SMOLDER_DURATION, PHASE_SHIFT_DURATION, PHASE_SHIFT_HIDDEN_TURNS,
  THUNDER_VEIL_DURATION, WILDFIRE_BLAST_RADIUS, WILDFIRE_DESTROY_CHANCE,
  INFERNO_RANGE, CHAIN_LIGHTNING_CHANCES,
  posKey, parseKey, opposite, coordLabel, colorName
} from './data.js';
import { getAdjacent } from './game.js';

export function canCastSpell(gs, spellId, caster) {
  const uses = gs.spellUses[caster][spellId];
  if (!uses || uses <= 0) return false;
  if (gs.chi[caster] < gs.getSpellCost(spellId, caster)) return false;
  const opp = opposite(caster);
  switch (spellId) {
    case 'shatter':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++)
        if (gs.board[r][c] === opp && !gs.phantoms.has(posKey(r,c)) && gs.countLiberties(r,c) === 1) return true;
      return false;
    case 'stoneskin':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++)
        if (gs.board[r][c] === caster && !gs.phantoms.has(posKey(r,c)) && !gs.fortified.has(posKey(r,c))) return true;
      return false;
    case 'mirage': {
      let ct = 0; for (const [,p] of gs.phantoms) if (p.owner === caster) ct++;
      if (ct >= MAX_PHANTOMS_ON_BOARD) return false;
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] === EMPTY) return true;
      return false;
    }
    case 'voidrift':
      if (gs.voidCount[caster] >= 2) return false;
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        let rs = gs.board[r][c]; if (gs.phantoms.has(posKey(r,c))) rs = EMPTY;
        if (rs === EMPTY || rs === BLACK || rs === WHITE) return true;
      }
      return false;
    case 'snare': {
      let ct = 0; for (const [,s] of gs.snares) if (s.owner === caster) ct++;
      if (ct >= 2) return false;
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        let rs = gs.board[r][c]; if (gs.phantoms.has(posKey(r,c))) rs = EMPTY;
        if (rs === EMPTY) return true;
      }
      return false;
    }
    case 'sanctuary':
      return BOARD_SIZE >= 3;
    case 'earthenwall':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        if (c+2 < BOARD_SIZE && gs.board[r][c] === EMPTY && gs.board[r][c+1] === EMPTY && gs.board[r][c+2] === EMPTY) return true;
        if (r+2 < BOARD_SIZE && gs.board[r][c] === EMPTY && gs.board[r+1][c] === EMPTY && gs.board[r+2][c] === EMPTY) return true;
      }
      return false;
    case 'smolder':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++)
        if (gs.board[r][c] === opp && !gs.phantoms.has(posKey(r,c)) && !gs.smoldering.has(posKey(r,c))) return true;
      return false;
    case 'inferno': case 'wildfire': case 'thunderveil': return true;
    case 'ninelives': return gs.lastCapturedGroup[caster] !== null && gs.capturedThisTurn.length > 0;
    case 'warpgate': { let ct = 0; for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] === EMPTY) { ct++; if (ct >= 2) return true; } return false; }
    case 'phaseshift':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++)
        if (gs.board[r][c] === caster && !gs.phantoms.has(posKey(r,c)) && !gs.phased.has(posKey(r,c))) return true;
      return false;
    case 'chainlightning':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++)
        if (gs.board[r][c] === opp && !gs.phantoms.has(posKey(r,c))) return true;
      return false;
  }
  return false;
}

export function getValidTargets(gs, spellId, caster) {
  const t = [], opp = opposite(caster);
  switch (spellId) {
    case 'shatter': {
      const checked = new Set();
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        const k = posKey(r,c);
        if (gs.board[r][c] === opp && !gs.phantoms.has(k) && !checked.has(k)) {
          const g = gs.findGroup(r,c); for (const gk of g) checked.add(gk);
          if (gs.countLiberties(r,c) === 1) for (const gk of g) t.push(parseKey(gk));
        }
      } break;
    }
    case 'wildfire': case 'inferno':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] !== VOID && gs.board[r][c] !== WALL) t.push({row:r,col:c});
      break;
    case 'stoneskin':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) { const k = posKey(r,c); if (gs.board[r][c] === caster && !gs.phantoms.has(k) && !gs.fortified.has(k)) t.push({row:r,col:c}); }
      break;
    case 'mirage': {
      let ct = 0; for (const [,p] of gs.phantoms) if (p.owner === caster) ct++;
      if (ct < MAX_PHANTOMS_ON_BOARD) for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] === EMPTY) t.push({row:r,col:c});
      break;
    }
    case 'voidrift':
      if (gs.voidCount[caster] < 2) for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        let rs = gs.board[r][c]; if (gs.phantoms.has(posKey(r,c))) rs = EMPTY;
        if (rs === EMPTY || rs === BLACK || rs === WHITE) t.push({row:r,col:c});
      }
      break;
    case 'snare': {
      let ct = 0; for (const [,s] of gs.snares) if (s.owner === caster) ct++;
      if (ct < 2) for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        let rs = gs.board[r][c]; if (gs.phantoms.has(posKey(r,c))) rs = EMPTY;
        if (rs === EMPTY) t.push({row:r,col:c});
      }
      break;
    }
    case 'sanctuary':
      for (let r = 1; r < BOARD_SIZE-1; r++) for (let c = 1; c < BOARD_SIZE-1; c++) t.push({row:r,col:c});
      break;
    case 'earthenwall':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        if (c+2 < BOARD_SIZE && gs.board[r][c] === EMPTY && gs.board[r][c+1] === EMPTY && gs.board[r][c+2] === EMPTY) t.push({row:r,col:c});
        if (r+2 < BOARD_SIZE && gs.board[r][c] === EMPTY && gs.board[r+1][c] === EMPTY && gs.board[r+2][c] === EMPTY) t.push({row:r,col:c});
      }
      break;
    case 'smolder':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) { const k = posKey(r,c); if (gs.board[r][c] === opp && !gs.phantoms.has(k) && !gs.smoldering.has(k)) t.push({row:r,col:c}); }
      break;
    case 'ninelives':
      if (gs.lastCapturedGroup[caster]) for (const e of gs.lastCapturedGroup[caster]) t.push(e.pos);
      break;
    case 'warpgate':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] === EMPTY) t.push({row:r,col:c});
      break;
    case 'phaseshift':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) { const k = posKey(r,c); if (gs.board[r][c] === caster && !gs.phantoms.has(k) && !gs.phased.has(k)) t.push({row:r,col:c}); }
      break;
    case 'chainlightning':
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] === opp && !gs.phantoms.has(posKey(r,c))) t.push({row:r,col:c});
      break;
    case 'thunderveil':
      t.push({row:4,col:4});
      break;
  }
  return t;
}

export function castSpell(gs, spellId, target, caster) {
  const uses = gs.spellUses[caster][spellId];
  if (!uses || uses <= 0) return false;
  const cost = gs.getSpellCost(spellId, caster);
  if (gs.chi[caster] < cost) return false;
  gs.chi[caster] -= cost;
  if (gs.eyeOfStormActive[caster]) gs.consumeEyeOfStorm(caster);
  let ok = false;
  switch (spellId) {
    case 'shatter': ok = exShatter(gs,target,caster); break;
    case 'wildfire': ok = exWildfire(gs,target,caster); break;
    case 'stoneskin': ok = exStoneSkin(gs,target,caster); break;
    case 'mirage': ok = exMirage(gs,target,caster); break;
    case 'voidrift': ok = exVoidRift(gs,target,caster); break;
    case 'snare': ok = exSnare(gs,target,caster); break;
    case 'sanctuary': ok = exSanctuary(gs,target,caster); break;
    case 'earthenwall': ok = exEarthenWall(gs,target,caster); break;
    case 'smolder': ok = exSmolder(gs,target,caster); break;
    case 'inferno': ok = exInferno(gs,target,caster); break;
    case 'ninelives': ok = exNineLives(gs,target,caster); break;
    case 'warpgate': ok = exWarpGate(gs,target,caster); break;
    case 'phaseshift': ok = exPhaseShift(gs,target,caster); break;
    case 'chainlightning': ok = exChainLightning(gs,target,caster); break;
    case 'thunderveil': ok = exThunderVeil(gs,target,caster); break;
  }
  if (ok) {
    gs.spellUses[caster][spellId]--;
    const champ = gs.champions[caster];
    const sp = champ ? champ.spells.find(s => s.id === spellId) : null;
    gs.addLog(`${colorName(caster)} cast ${sp ? sp.name : spellId} on ${coordLabel(target.row, target.col)}`);
  } else { gs.chi[caster] += cost; }
  return ok;
}

function exShatter(gs, target, caster) {
  const opp = opposite(caster), k = posKey(target.row, target.col);
  if (gs.board[target.row][target.col] !== opp) return false;
  if (gs.phantoms.has(k)) { gs.phantoms.delete(k); gs.board[target.row][target.col] = EMPTY; return false; }
  if (gs.countLiberties(target.row, target.col) !== 1) return false;
  gs.board[target.row][target.col] = EMPTY;
  gs.fortified.delete(k); gs.phased.delete(k); gs.smoldering.delete(k);
  gs.captures[caster]++;
  let chi = CHI_PER_CAPTURE;
  if (gs.champions[caster] && gs.champions[caster].id === 'ryujin') chi += 2;
  gs.chi[caster] = Math.min(gs.chi[caster] + chi, MAX_CHI);
  gs.recheckLiberties(target);
  return true;
}

function exWildfire(gs, target) {
  let destroyed = 0;
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
    if (Math.abs(r-target.row)+Math.abs(c-target.col) > WILDFIRE_BLAST_RADIUS) continue;
    if (gs.board[r][c] === VOID || gs.board[r][c] === WALL) continue;
    const k = posKey(r,c);
    if (gs.phantoms.has(k)) { if (Math.random() < WILDFIRE_DESTROY_CHANCE) { gs.phantoms.delete(k); gs.board[r][c] = EMPTY; } continue; }
    if (gs.board[r][c] === BLACK || gs.board[r][c] === WHITE) {
      if (Math.random() < WILDFIRE_DESTROY_CHANCE) {
        const dc = gs.board[r][c], cap = opposite(dc);
        gs.board[r][c] = EMPTY; gs.fortified.delete(k); gs.phased.delete(k); gs.smoldering.delete(k);
        gs.captures[cap]++; gs.chi[cap] = Math.min(gs.chi[cap] + CHI_PER_CAPTURE, MAX_CHI);
        destroyed++;
      }
    }
  }
  if (destroyed > 0) gs.addLog(`Wildfire destroyed ${destroyed} stones!`);
  gs.recheckAllLiberties();
  return true;
}

function exStoneSkin(gs, target, caster) {
  const k = posKey(target.row, target.col);
  if (gs.board[target.row][target.col] !== caster || gs.phantoms.has(k) || gs.fortified.has(k)) return false;
  gs.fortified.set(k, { owner: caster, turnsRemaining: STONE_SKIN_DURATION });
  return true;
}

function exMirage(gs, target, caster) {
  if (gs.board[target.row][target.col] !== EMPTY) return false;
  let ct = 0; for (const [,p] of gs.phantoms) if (p.owner === caster) ct++;
  if (ct >= MAX_PHANTOMS_ON_BOARD) return false;
  gs.board[target.row][target.col] = caster;
  gs.phantoms.set(posKey(target.row, target.col), { owner: caster, turnsRemaining: MIRAGE_DURATION });
  return true;
}

function exVoidRift(gs, target, caster) {
  if (gs.voidCount[caster] >= 2) return false;
  const k = posKey(target.row, target.col);
  const cell = gs.board[target.row][target.col];
  if (cell === VOID || cell === WALL) return false;
  if (gs.phantoms.has(k)) gs.phantoms.delete(k);
  gs.snares.delete(k); gs.fortified.delete(k); gs.phased.delete(k); gs.smoldering.delete(k);
  gs.board[target.row][target.col] = VOID;
  gs.voidCount[caster]++;
  gs.recheckLiberties(target);
  return true;
}

function exSnare(gs, target, caster) {
  const k = posKey(target.row, target.col);
  let rs = gs.board[target.row][target.col];
  if (gs.phantoms.has(k)) rs = EMPTY;
  if (rs !== EMPTY) return false;
  let ct = 0; for (const [,s] of gs.snares) if (s.owner === caster) ct++;
  if (ct >= 2) return false;
  gs.snares.set(k, { owner: caster });
  return true;
}

function exSanctuary(gs, target, caster) {
  if (target.row < 1 || target.row >= BOARD_SIZE-1 || target.col < 1 || target.col >= BOARD_SIZE-1) return false;
  gs.sanctuaries.push({ row: target.row, col: target.col, turnsRemaining: SANCTUARY_DURATION, owner: caster });
  return true;
}

function exEarthenWall(gs, target, caster) {
  const {row, col} = target;
  let positions = null;
  if (col+2 < BOARD_SIZE && gs.board[row][col] === EMPTY && gs.board[row][col+1] === EMPTY && gs.board[row][col+2] === EMPTY)
    positions = [{row,col},{row,col:col+1},{row,col:col+2}];
  else if (row+2 < BOARD_SIZE && gs.board[row][col] === EMPTY && gs.board[row+1][col] === EMPTY && gs.board[row+2][col] === EMPTY)
    positions = [{row,col},{row:row+1,col},{row:row+2,col}];
  if (!positions) return false;
  for (const p of positions) { gs.board[p.row][p.col] = WALL; gs.snares.delete(posKey(p.row,p.col)); gs.phantoms.delete(posKey(p.row,p.col)); }
  gs.walls.push({ positions, owner: caster });
  for (const p of positions) gs.recheckLiberties(p);
  return true;
}

function exSmolder(gs, target, caster) {
  const opp = opposite(caster), k = posKey(target.row, target.col);
  if (gs.board[target.row][target.col] !== opp || gs.phantoms.has(k) || gs.smoldering.has(k)) return false;
  gs.smoldering.set(k, { owner: caster, turnsRemaining: SMOLDER_DURATION });
  return true;
}

function exInferno(gs, target, caster) {
  const opp = opposite(caster), captured = [];
  for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
    if (Math.abs(r-target.row)+Math.abs(c-target.col) > INFERNO_RANGE) continue;
    const k = posKey(r,c);
    if (gs.board[r][c] === opp && !gs.phantoms.has(k) && gs.countLiberties(r,c) === 1) captured.push(k);
  }
  for (const k of captured) { const p = parseKey(k); gs.board[p.row][p.col] = EMPTY; gs.fortified.delete(k); gs.phased.delete(k); gs.smoldering.delete(k); gs.captures[caster]++; }
  if (captured.length > 0) {
    let chi = captured.length * CHI_PER_CAPTURE;
    if (gs.champions[caster] && gs.champions[caster].id === 'ryujin') chi += 2;
    gs.chi[caster] = Math.min(gs.chi[caster] + chi, MAX_CHI);
    gs.addLog(`Inferno captured ${captured.length} atari stones!`);
  }
  gs.recheckAllLiberties();
  return true;
}

function exNineLives(gs, target, caster) {
  const last = gs.lastCapturedGroup[caster];
  if (!last || last.length === 0) return false;
  for (const e of last) {
    const {row, col} = e.pos, k = posKey(row, col);
    if (gs.board[row][col] === opposite(caster)) { gs.board[row][col] = EMPTY; gs.captures[caster]++; gs.fortified.delete(k); gs.phased.delete(k); }
    gs.board[row][col] = caster;
  }
  gs.lastCapturedGroup[caster] = null;
  gs.addLog(`Nine Lives! ${last.length} stones resurrected!`);
  gs.recheckAllLiberties();
  return true;
}

function exWarpGate(gs, target, caster) {
  if (gs._warpGateFirst && gs._warpGateFirst.caster === caster) {
    const p1 = gs._warpGateFirst.pos, p2 = target;
    if (p1.row === p2.row && p1.col === p2.col) return false;
    gs.warpGates.push({ pos1: p1, pos2: p2, owner: caster });
    gs._warpGateFirst = null;
    gs.addLog(`Warp Gate linked!`);
    gs.recheckAllLiberties();
    return true;
  }
  gs._warpGateFirst = { pos: target, caster };
  return false;
}

export function setWarpGateFirst(gs, target, caster) {
  gs._warpGateFirst = { pos: target, caster };
}

function exPhaseShift(gs, target, caster) {
  const k = posKey(target.row, target.col);
  if (gs.board[target.row][target.col] !== caster || gs.phantoms.has(k) || gs.phased.has(k)) return false;
  gs.phased.set(k, { owner: caster, turnsRemaining: PHASE_SHIFT_DURATION, hiddenTurns: PHASE_SHIFT_HIDDEN_TURNS });
  return true;
}

function exChainLightning(gs, target, caster) {
  const opp = opposite(caster), hit = [], hitSet = new Set();
  let cur = target;
  for (let i = 0; i < CHAIN_LIGHTNING_CHANCES.length; i++) {
    const k = posKey(cur.row, cur.col);
    if (hitSet.has(k) || gs.board[cur.row][cur.col] !== opp) break;
    if (Math.random() < CHAIN_LIGHTNING_CHANCES[i]) {
      hitSet.add(k); hit.push(cur);
      gs.board[cur.row][cur.col] = EMPTY;
      gs.fortified.delete(k); gs.phased.delete(k); gs.smoldering.delete(k);
      gs.captures[caster]++;
      const adj = getAdjacent(cur.row, cur.col, gs.warpGates).filter(([nr,nc]) => gs.board[nr][nc] === opp && !hitSet.has(posKey(nr,nc)) && !gs.phantoms.has(posKey(nr,nc)));
      if (adj.length === 0) break;
      const [nr,nc] = adj[Math.floor(Math.random() * adj.length)];
      cur = {row:nr,col:nc};
    } else break;
  }
  if (hit.length > 0) {
    let chi = hit.length * CHI_PER_CAPTURE;
    gs.chi[caster] = Math.min(gs.chi[caster] + chi, MAX_CHI);
    gs.addLog(`Chain Lightning hit ${hit.length}!`);
    gs.recheckAllLiberties();
  } else gs.addLog('Chain Lightning missed!');
  return true;
}

function exThunderVeil(gs, target, caster) {
  gs.thunderVeilSnapshot[caster] = gs.cloneBoard();
  gs.thunderVeil[caster] = THUNDER_VEIL_DURATION;
  gs.addLog(`Thunder Veil active for ${THUNDER_VEIL_DURATION} turns!`);
  return true;
}
