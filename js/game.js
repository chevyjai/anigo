// ============================================
// AniGO — Core game state, Go rules, turn management
// Champion system: each player picks 1 champion with passive + 3 spells
// ============================================

import {
  BOARD_SIZE, EMPTY, BLACK, WHITE, VOID, WALL,
  MAX_CHI, START_CHI, CHI_PER_TURN, CHI_PER_CAPTURE, CHI_ON_PASS,
  KOMI, HOSHI, getChampion, SMOLDER_DURATION, MIRAGE_DURATION,
  posKey, parseKey, opposite, coordLabel, colorName
} from './data.js';

export function getAdjacent(row, col, warpGates) {
  const neighbors = [];
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const nr = row + dr, nc = col + dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) neighbors.push([nr, nc]);
  }
  if (warpGates) {
    for (const gate of warpGates) {
      if (gate.pos1.row === row && gate.pos1.col === col) neighbors.push([gate.pos2.row, gate.pos2.col]);
      else if (gate.pos2.row === row && gate.pos2.col === col) neighbors.push([gate.pos1.row, gate.pos1.col]);
    }
  }
  return neighbors;
}

export class GameState {
  constructor() {
    this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
    this.currentPlayer = BLACK;
    this.chi = { [BLACK]: START_CHI, [WHITE]: START_CHI };
    this.captures = { [BLACK]: 0, [WHITE]: 0 };
    this.fortified = new Map();
    this.phantoms = new Map();
    this.snares = new Map();
    this.voidCount = { [BLACK]: 0, [WHITE]: 0 };
    this.previousBoardHash = null;
    this.lastActionWasPass = false;
    this.forcedPass = { [BLACK]: false, [WHITE]: false };
    this.turnNumber = 0;
    this.gameOver = false;
    this.log = [];
    this.phase = 'champion-select';
    this.lastMove = null;
    this.capturedThisTurn = [];
    this.mode = 'ai';
    this.winner = null;
    this.scores = null;
    this.champions = { [BLACK]: null, [WHITE]: null };
    this.spellUses = { [BLACK]: {}, [WHITE]: {} };
    this.passiveUsed = { [BLACK]: {}, [WHITE]: {} };
    this.sanctuaries = [];
    this.walls = [];
    this.warpGates = [];
    this.phased = new Map();
    this.smoldering = new Map();
    this.thunderVeil = { [BLACK]: 0, [WHITE]: 0 };
    this.foxPhantomUsed = { [BLACK]: false, [WHITE]: false };
    this.thunderVeilSnapshot = { [BLACK]: null, [WHITE]: null };
    this.lastCapturedGroup = { [BLACK]: null, [WHITE]: null };
    this.eyeOfStormActive = { [BLACK]: false, [WHITE]: false };
  }

  initChampion(championId, color) {
    const champ = getChampion(championId);
    if (!champ) return;
    this.champions[color] = champ;
    champ.spells.forEach(s => { this.spellUses[color][s.id] = s.uses; });
  }

  startGame() {
    this.phase = 'play';
    this.addLog('Game started!');
    for (const color of [BLACK, WHITE]) {
      if (this.champions[color] && this.champions[color].id === 'musubi') this._applyMusubiPassive();
    }
    this.upkeep();
  }

  _applyMusubiPassive() {
    const excluded = new Set();
    excluded.add(posKey(4, 4));
    for (const [r, c] of HOSHI) excluded.add(posKey(r, c));
    const candidates = [];
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
      if (this.board[r][c] === EMPTY && !excluded.has(posKey(r, c))) candidates.push({ row: r, col: c });
    }
    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      this.board[pick.row][pick.col] = VOID;
      this.addLog(`Spatial Anomaly: void at ${coordLabel(pick.row, pick.col)}`);
    }
  }

  cloneBoard() { return this.board.map(row => [...row]); }

  cloneForSimulation() {
    const gs = new GameState();
    gs.board = this.cloneBoard();
    gs.fortified = new Map(this.fortified);
    gs.phantoms = new Map(this.phantoms);
    gs.snares = new Map(this.snares);
    gs.phased = new Map(this.phased);
    gs.previousBoardHash = this.previousBoardHash;
    gs.warpGates = [...this.warpGates];
    gs.sanctuaries = [...this.sanctuaries];
    gs.champions = { ...this.champions };
    gs.smoldering = new Map(this.smoldering);
    return gs;
  }

  findGroup(row, col) {
    const color = this.board[row][col];
    if (color !== BLACK && color !== WHITE) return new Set();
    const group = new Set(), queue = [[row, col]], visited = new Set();
    visited.add(posKey(row, col));
    while (queue.length > 0) {
      const [r, c] = queue.shift();
      group.add(posKey(r, c));
      for (const [nr, nc] of getAdjacent(r, c, this.warpGates)) {
        const k = posKey(nr, nc);
        if (!visited.has(k) && this.board[nr][nc] === color) { visited.add(k); queue.push([nr, nc]); }
      }
    }
    return group;
  }

  countLiberties(row, col) {
    const group = this.findGroup(row, col);
    if (group.size === 0) return 0;
    const color = this.board[row][col];
    const liberties = new Set();
    for (const k of group) {
      const { row: r, col: c } = parseKey(k);
      for (const [nr, nc] of getAdjacent(r, c, this.warpGates)) {
        let cellState = this.board[nr][nc];
        if (this.phantoms.has(posKey(nr, nc))) cellState = EMPTY;
        const nk = posKey(nr, nc);
        if (this.phased.has(nk) && this.phased.get(nk).owner !== color) cellState = EMPTY;
        if (cellState === EMPTY) liberties.add(nk);
      }
    }
    let smolderPenalty = 0;
    for (const k of group) {
      if (this.smoldering.has(k)) {
        smolderPenalty += (SMOLDER_DURATION - this.smoldering.get(k).turnsRemaining + 1);
      }
    }
    return Math.max(0, liberties.size - smolderPenalty);
  }

  findLiberties(row, col) {
    const group = this.findGroup(row, col);
    if (group.size === 0) return [];
    const color = this.board[row][col];
    const liberties = new Set();
    for (const k of group) {
      const { row: r, col: c } = parseKey(k);
      for (const [nr, nc] of getAdjacent(r, c, this.warpGates)) {
        let cellState = this.board[nr][nc];
        if (this.phantoms.has(posKey(nr, nc))) cellState = EMPTY;
        const nk = posKey(nr, nc);
        if (this.phased.has(nk) && this.phased.get(nk).owner !== color) cellState = EMPTY;
        if (cellState === EMPTY) liberties.add(nk);
      }
    }
    return [...liberties].map(k => parseKey(k));
  }

  getEffectiveLiberties(row, col) {
    const group = this.findGroup(row, col);
    const base = this.countLiberties(row, col);
    const color = this.board[row][col];
    for (const k of group) { if (this.phased.has(k) && this.phased.get(k).owner === color) return Math.max(base, 1); }
    if (this._isGroupInSanctuary(group)) return Math.max(base, 1);
    for (const k of group) { const f = this.fortified.get(k); if (f && f.turnsRemaining > 0) return Math.max(base, 1); }
    if (color && this.champions[color] && this.champions[color].id === 'seolhwa') {
      for (const k of group) {
        const { row: sr, col: sc } = parseKey(k);
        for (const [hr, hc] of HOSHI) { if (sr === hr && sc === hc) return base + 1; }
      }
    }
    return base;
  }

  _isGroupInSanctuary(group) {
    for (const s of this.sanctuaries) {
      if (s.turnsRemaining <= 0) continue;
      let ok = true;
      for (const k of group) {
        const { row: r, col: c } = parseKey(k);
        if (Math.abs(r - s.row) > 1 || Math.abs(c - s.col) > 1) { ok = false; break; }
      }
      if (ok) return true;
    }
    return false;
  }

  resolveCaptures(row, col, placedColor) {
    const opp = opposite(placedColor), captured = [], checked = new Set();
    for (const [nr, nc] of getAdjacent(row, col, this.warpGates)) {
      const k = posKey(nr, nc);
      if (this.board[nr][nc] === opp && !checked.has(k)) {
        const group = this.findGroup(nr, nc);
        for (const gk of group) checked.add(gk);
        if (this.getEffectiveLiberties(nr, nc) === 0) { for (const gk of group) captured.push(gk); }
      }
    }
    if (captured.length > 0) this.lastCapturedGroup[opp] = captured.map(k => ({ key: k, pos: parseKey(k) }));
    for (const k of captured) {
      const { row: r, col: c } = parseKey(k);
      this.board[r][c] = EMPTY;
      this.fortified.delete(k); this.phantoms.delete(k); this.phased.delete(k); this.smoldering.delete(k);
    }
    return captured;
  }

  isLegalMove(row, col, color) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
    let rs = this.board[row][col];
    if (this.phantoms.has(posKey(row, col))) rs = EMPTY;
    if (rs !== EMPTY) return false;
    return !this.isKo(row, col, color) && !this.isSuicide(row, col, color);
  }

  isSuicide(row, col, color) {
    const sim = this.cloneForSimulation();
    sim.phantoms.delete(posKey(row, col));
    sim.board[row][col] = color;
    sim.resolveCaptures(row, col, color);
    return sim.getEffectiveLiberties(row, col) === 0;
  }

  isKo(row, col, color) {
    if (!this.previousBoardHash) return false;
    const sim = this.cloneForSimulation();
    sim.phantoms.delete(posKey(row, col));
    sim.board[row][col] = color;
    sim.resolveCaptures(row, col, color);
    return sim.hashBoard() === this.previousBoardHash;
  }

  hashBoard() { return this.board.map(r => r.join('')).join('|'); }

  placeStone(row, col) {
    const color = this.currentPlayer;
    if (!this.isLegalMove(row, col, color)) return false;
    this.previousBoardHash = this.hashBoard();
    const pk = posKey(row, col);
    if (this.phantoms.has(pk)) this.phantoms.delete(pk);
    this.board[row][col] = color;
    const captured = this.resolveCaptures(row, col, color);
    if (captured.length > 0) {
      let chiGain = captured.length * CHI_PER_CAPTURE;
      if (this.champions[color] && this.champions[color].id === 'ryujin') chiGain += 2;
      this.chi[color] = Math.min(this.chi[color] + chiGain, MAX_CHI);
      this.captures[color] += captured.length;
      const n = captured.length;
      this.addLog(`${colorName(color)} captured ${n} stone${n > 1 ? 's' : ''}!${n >= 3 ? ' Huge capture!' : n >= 2 ? ' Nice!' : ''}`);
    }
    this.capturedThisTurn = captured.map(k => parseKey(k));
    if (this.snares.has(pk)) {
      const snare = this.snares.get(pk);
      if (snare.owner !== color) { this.forcedPass[color] = true; this.snares.delete(pk); this.addLog(`${colorName(color)} triggered a Snare!`); }
    }
    for (const [nr, nc] of getAdjacent(row, col, this.warpGates)) {
      const nk = posKey(nr, nc);
      if (this.phantoms.has(nk) && this.phantoms.get(nk).owner !== color) {
        this.phantoms.delete(nk); this.board[nr][nc] = EMPTY;
        this.addLog(`A Mirage at ${coordLabel(nr, nc)} was revealed!`);
      }
    }
    this._checkEyeOfStorm(color);
    this.lastMove = { row, col };
    this.lastActionWasPass = false;
    this.addLog(`${colorName(color)} placed at ${coordLabel(row, col)}`);
    return true;
  }

  pass() {
    const color = this.currentPlayer;
    this.chi[color] = Math.min(this.chi[color] + CHI_ON_PASS, MAX_CHI);
    this.addLog(`${colorName(color)} passed (+${CHI_ON_PASS} Chi)`);
    this._checkEyeOfStorm(color);
    if (this.lastActionWasPass) { this.endGame(); return; }
    this.lastActionWasPass = true;
    this.capturedThisTurn = [];
    this.switchTurn();
  }

  placeFoxPhantom(row, col, color) {
    if (this.foxPhantomUsed[color] || this.board[row][col] !== EMPTY) return false;
    this.board[row][col] = color;
    this.phantoms.set(posKey(row, col), { owner: color, turnsRemaining: MIRAGE_DURATION });
    this.foxPhantomUsed[color] = true;
    this.addLog(`${colorName(color)}: Fox's Cunning phantom`);
    return true;
  }

  _checkEyeOfStorm(color) {
    if (this.champions[color] && this.champions[color].id === 'raijin' && this.chi[color] >= MAX_CHI)
      this.eyeOfStormActive[color] = true;
  }

  getSpellCost(spellId, color) {
    const champ = this.champions[color];
    if (!champ) return 0;
    const spell = champ.spells.find(s => s.id === spellId);
    if (!spell) return 0;
    return this.eyeOfStormActive[color] ? Math.max(1, spell.cost - 2) : spell.cost;
  }

  consumeEyeOfStorm(color) { this.eyeOfStormActive[color] = false; }

  endGame() {
    this.gameOver = true; this.phase = 'scoring'; this.revealAll();
    this.scores = this.score(); this.winner = this.scores.winner;
    this.addLog(`Game Over! ${colorName(this.winner)} wins. B:${this.scores.blackScore} W:${this.scores.whiteScore}`);
  }

  revealAll() {
    for (const [k] of this.phantoms) { const { row, col } = parseKey(k); this.board[row][col] = EMPTY; }
    this.phantoms.clear(); this.snares.clear(); this.fortified.clear(); this.phased.clear(); this.smoldering.clear();
    this.thunderVeil[BLACK] = 0; this.thunderVeil[WHITE] = 0;
  }

  score() {
    for (const [k] of this.phantoms) { const { row, col } = parseKey(k); this.board[row][col] = EMPTY; }
    this.phantoms.clear();
    let bS = 0, wS = 0;
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
      if (this.board[r][c] === BLACK) bS++; if (this.board[r][c] === WHITE) wS++;
    }
    let bT = 0, wT = 0; const visited = new Set();
    const tMap = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
      const k = posKey(r, c);
      if (this.board[r][c] === EMPTY && !visited.has(k)) {
        const region = [], borders = new Set(), queue = [[r, c]];
        visited.add(k);
        while (queue.length > 0) {
          const [qr, qc] = queue.shift(); region.push([qr, qc]);
          for (const [nr, nc] of getAdjacent(qr, qc, this.warpGates)) {
            const nk = posKey(nr, nc), cell = this.board[nr][nc];
            if (cell === EMPTY && !visited.has(nk)) { visited.add(nk); queue.push([nr, nc]); }
            else if (cell === BLACK) borders.add(BLACK);
            else if (cell === WHITE) borders.add(WHITE);
          }
        }
        for (const wall of this.walls) for (const wp of wall.positions) {
          for (const [rr, rc] of region) if (Math.abs(rr - wp.row) + Math.abs(rc - wp.col) === 1) borders.add(wall.owner);
        }
        if (borders.size === 1) {
          const owner = [...borders][0];
          if (owner === BLACK) { bT += region.length; for (const [rr, rc] of region) tMap[rr][rc] = BLACK; }
          else { wT += region.length; for (const [rr, rc] of region) tMap[rr][rc] = WHITE; }
        }
      }
    }
    const blackScore = bS + bT, whiteScore = wS + wT + KOMI;
    return { blackScore, whiteScore, winner: blackScore > whiteScore ? BLACK : WHITE, territoryMap: tMap, blackStones: bS, whiteStones: wS, blackTerritory: bT, whiteTerritory: wT };
  }

  upkeep() {
    const color = this.currentPlayer;
    this.chi[color] = Math.min(this.chi[color] + CHI_PER_TURN, MAX_CHI);
    const fDel = [];
    for (const [k, f] of this.fortified) if (f.owner === color) { f.turnsRemaining--; if (f.turnsRemaining <= 0) fDel.push(k); }
    for (const k of fDel) { this.fortified.delete(k); this.recheckLiberties(parseKey(k)); }
    const pDel = [];
    for (const [k, p] of this.phantoms) if (p.owner === color) { p.turnsRemaining--; if (p.turnsRemaining <= 0) pDel.push(k); }
    for (const k of pDel) { const { row, col } = parseKey(k); this.phantoms.delete(k); this.board[row][col] = EMPTY; this.addLog(`Mirage at ${coordLabel(row, col)} faded`); }
    this.sanctuaries = this.sanctuaries.filter(s => { if (s.owner === color) { s.turnsRemaining--; if (s.turnsRemaining <= 0) { this.addLog('Sanctuary expired'); return false; } } return true; });
    const sDel = [];
    for (const [k, sm] of this.smoldering) if (sm.owner === color) { sm.turnsRemaining--; if (sm.turnsRemaining <= 0) sDel.push(k); const p = parseKey(k); if (this.board[p.row][p.col] !== EMPTY) this.recheckLiberties(p); }
    for (const k of sDel) this.smoldering.delete(k);
    const phDel = [];
    for (const [k, ph] of this.phased) if (ph.owner === color) { if (ph.hiddenTurns > 0) ph.hiddenTurns--; ph.turnsRemaining--; if (ph.turnsRemaining <= 0) phDel.push(k); }
    for (const k of phDel) { this.phased.delete(k); this.recheckLiberties(parseKey(k)); }
    if (this.thunderVeil[color] > 0) { this.thunderVeil[color]--; if (this.thunderVeil[color] <= 0) { this.thunderVeilSnapshot[color] = null; this.addLog(`Thunder Veil lifted`); } }
    this._checkEyeOfStorm(color);
  }

  recheckLiberties(pos) {
    const checked = new Set();
    for (const [nr, nc] of getAdjacent(pos.row, pos.col, this.warpGates)) {
      const k = posKey(nr, nc);
      if ((this.board[nr][nc] === BLACK || this.board[nr][nc] === WHITE) && !checked.has(k)) {
        const group = this.findGroup(nr, nc);
        for (const gk of group) checked.add(gk);
        if (this.getEffectiveLiberties(nr, nc) === 0) {
          const cc = this.board[nr][nc], cap = opposite(cc); let chi = 0;
          for (const gk of group) { const p = parseKey(gk); this.board[p.row][p.col] = EMPTY; this.fortified.delete(gk); this.phased.delete(gk); this.smoldering.delete(gk); this.captures[cap]++; chi += CHI_PER_CAPTURE; }
          if (this.champions[cap] && this.champions[cap].id === 'ryujin') chi += 2;
          this.chi[cap] = Math.min(this.chi[cap] + chi, MAX_CHI);
          this.addLog(`${colorName(cap)} captured ${group.size} stone${group.size > 1 ? 's' : ''} (spell)`);
        }
      }
    }
  }

  recheckAllLiberties() {
    let changed = true;
    while (changed) {
      changed = false; const checked = new Set();
      for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
        const k = posKey(r, c);
        if ((this.board[r][c] === BLACK || this.board[r][c] === WHITE) && !checked.has(k)) {
          const group = this.findGroup(r, c);
          for (const gk of group) checked.add(gk);
          if (this.getEffectiveLiberties(r, c) === 0) {
            const cc = this.board[r][c], cap = opposite(cc); let chi = 0;
            for (const gk of group) { const p = parseKey(gk); this.board[p.row][p.col] = EMPTY; this.fortified.delete(gk); this.phased.delete(gk); this.smoldering.delete(gk); this.captures[cap]++; chi += CHI_PER_CAPTURE; }
            if (this.champions[cap] && this.champions[cap].id === 'ryujin') chi += 2;
            this.chi[cap] = Math.min(this.chi[cap] + chi, MAX_CHI);
            this.addLog(`${colorName(cap)} captured ${group.size} (cascade)`);
            changed = true;
          }
        }
      }
    }
  }

  switchTurn() {
    this.currentPlayer = opposite(this.currentPlayer);
    this.turnNumber++;
    this.capturedThisTurn = [];
    if (this.forcedPass[this.currentPlayer]) {
      this.forcedPass[this.currentPlayer] = false;
      this.addLog(`${colorName(this.currentPlayer)} forced pass (Snare)`);
      this.upkeep(); this.lastActionWasPass = false; this.switchTurn(); return;
    }
    this.upkeep();
  }

  generateLegalMoves(color) {
    const moves = [];
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (this.isLegalMove(r, c, color)) moves.push({ row: r, col: c });
    return moves;
  }

  addLog(msg) { this.log.push({ turn: this.turnNumber, msg }); }

  getAvailableSpells(color) {
    const champ = this.champions[color];
    if (!champ) return [];
    return champ.spells.filter(s => (this.spellUses[color][s.id] || 0) > 0);
  }

  hasSpellsRemaining(color) { return this.getAvailableSpells(color).length > 0; }
}
