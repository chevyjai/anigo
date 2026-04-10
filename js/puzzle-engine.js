// ============================================
// AniGO — Puzzle Engine
// Candy Crush-style Go puzzles with spells
// ============================================

import {
  BOARD_SIZE, EMPTY, BLACK, WHITE, VOID, WALL,
  posKey, parseKey, opposite, coordLabel
} from './data.js';
import { GameState } from './game.js';
import { castSpell, getValidTargets } from './spells.js';

export class PuzzleEngine {
  constructor(puzzleDef) {
    this.puzzle = puzzleDef;
    this.gs = new GameState();
    this.moveHistory = [];       // Array of { type, data, boardSnapshot, capturesSnapshot }
    this.moveCount = 0;
    this.completed = false;
    this.stars = 0;
    this.hintUsed = false;

    // Spell tracking
    this.availableSpells = {};   // { spellId: usesRemaining }
    this.selectedSpell = null;

    this._setupBoard();
  }

  // ── Setup board from puzzle definition ──
  _setupBoard() {
    const p = this.puzzle;

    // Clear board
    this.gs.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
    this.gs.phase = 'play';
    this.gs.currentPlayer = p.playerColor || BLACK;
    this.gs.captures = { [BLACK]: 0, [WHITE]: 0 };
    this.gs.turnNumber = 0;
    this.gs.gameOver = false;

    // Parse board state: array of { row, col, color } or 2D array
    if (p.board) {
      if (Array.isArray(p.board) && p.board.length > 0) {
        if (Array.isArray(p.board[0])) {
          // 2D array format: board[row][col] = 0/1/2/3/4
          for (let r = 0; r < BOARD_SIZE && r < p.board.length; r++) {
            for (let c = 0; c < BOARD_SIZE && c < p.board[r].length; c++) {
              this.gs.board[r][c] = p.board[r][c];
            }
          }
        } else {
          // Array of objects: { row, col, color }
          for (const stone of p.board) {
            if (stone.row >= 0 && stone.row < BOARD_SIZE && stone.col >= 0 && stone.col < BOARD_SIZE) {
              this.gs.board[stone.row][stone.col] = stone.color;
            }
          }
        }
      }
    }

    // Setup available spells
    if (p.availableSpells && p.spellUses) {
      for (let i = 0; i < p.availableSpells.length; i++) {
        const spellId = p.availableSpells[i];
        const uses = p.spellUses[i] || 1;
        this.availableSpells[spellId] = uses;
      }
    }

    // Give the player unlimited chi for puzzle spells
    this.gs.chi = { [BLACK]: 99, [WHITE]: 99 };

    // Store initial state for reset
    this._initialBoard = this.gs.cloneBoard();
    this._initialCaptures = { ...this.gs.captures };
    this._initialSpells = { ...this.availableSpells };
  }

  // ── Snapshot for undo ──
  _snapshot() {
    return {
      board: this.gs.cloneBoard(),
      captures: { ...this.gs.captures },
      currentPlayer: this.gs.currentPlayer,
      spells: { ...this.availableSpells },
      moveCount: this.moveCount
    };
  }

  // ── Place a stone ──
  placeStone(row, col) {
    if (this.completed || this.gs.gameOver) return { success: false };
    const color = this.gs.currentPlayer;
    if (!this.gs.isLegalMove(row, col, color)) return { success: false };

    const snapshot = this._snapshot();

    this.gs.previousBoardHash = this.gs.hashBoard();
    const pk = posKey(row, col);
    if (this.gs.phantoms.has(pk)) this.gs.phantoms.delete(pk);
    this.gs.board[row][col] = color;
    const captured = this.gs.resolveCaptures(row, col, color);

    if (captured.length > 0) {
      this.gs.captures[color] += captured.length;
      this.gs.capturedThisTurn = captured.map(k => parseKey(k));
    } else {
      this.gs.capturedThisTurn = [];
    }

    this.gs.lastMove = { row, col };
    this.moveCount++;

    this.moveHistory.push({
      type: 'place',
      data: { row, col, color },
      snapshot
    });

    // Check puzzle completion
    const result = this._checkGoal();

    return {
      success: true,
      captured: this.gs.capturedThisTurn,
      completed: result.completed,
      stars: result.stars
    };
  }

  // ── Cast a spell ──
  useSpell(spellId, target) {
    if (this.completed || this.gs.gameOver) return { success: false };
    if (!this.availableSpells[spellId] || this.availableSpells[spellId] <= 0) return { success: false };

    const color = this.gs.currentPlayer;
    const snapshot = this._snapshot();

    // Override chi cost for puzzles
    const origChi = this.gs.chi[color];
    this.gs.chi[color] = 99;

    const success = castSpell(this.gs, spellId, target, color);

    if (success) {
      this.availableSpells[spellId]--;
      this.moveCount++;
      this.gs.chi[color] = origChi;

      this.moveHistory.push({
        type: 'spell',
        data: { spellId, target, color },
        snapshot
      });

      const result = this._checkGoal();
      return {
        success: true,
        completed: result.completed,
        stars: result.stars
      };
    }

    this.gs.chi[color] = origChi;
    return { success: false };
  }

  // ── Get valid targets for a spell ──
  getSpellTargets(spellId) {
    const color = this.gs.currentPlayer;
    // Override chi for target calculation
    const origChi = this.gs.chi[color];
    this.gs.chi[color] = 99;
    const targets = getValidTargets(this.gs, spellId, color);
    this.gs.chi[color] = origChi;
    return targets;
  }

  // ── Select/deselect spell ──
  selectSpell(spellId) {
    if (this.availableSpells[spellId] && this.availableSpells[spellId] > 0) {
      this.selectedSpell = spellId;
      return true;
    }
    return false;
  }

  deselectSpell() {
    this.selectedSpell = null;
  }

  // ── Undo last move ──
  undo() {
    if (this.moveHistory.length === 0) return false;
    if (this.completed) {
      this.completed = false;
      this.stars = 0;
    }

    const last = this.moveHistory.pop();
    const snap = last.snapshot;

    this.gs.board = snap.board;
    this.gs.captures = snap.captures;
    this.gs.currentPlayer = snap.currentPlayer;
    this.availableSpells = snap.spells;
    this.moveCount = snap.moveCount;
    this.gs.capturedThisTurn = [];
    this.gs.lastMove = null;

    return true;
  }

  // ── Reset puzzle to initial state ──
  reset() {
    this.gs.board = this._initialBoard.map(row => [...row]);
    this.gs.captures = { ...this._initialCaptures };
    this.gs.currentPlayer = this.puzzle.playerColor || BLACK;
    this.availableSpells = { ...this._initialSpells };
    this.moveHistory = [];
    this.moveCount = 0;
    this.completed = false;
    this.stars = 0;
    this.selectedSpell = null;
    this.gs.capturedThisTurn = [];
    this.gs.lastMove = null;
    this.gs.previousBoardHash = null;
    this.gs.gameOver = false;
    this.hintUsed = false;
  }

  // ── Get hint (returns the next optimal move) ──
  getHint() {
    const p = this.puzzle;
    if (!p.solution || p.solution.length === 0) return null;

    const stepIndex = this.moveCount;
    if (stepIndex >= p.solution.length) return null;

    this.hintUsed = true;
    const step = p.solution[stepIndex];
    // Solution step format: { row, col } or { spell, row, col }
    return step;
  }

  // ── Get hint text ──
  getHintText(lang) {
    const p = this.puzzle;
    if (lang === 'ko' && p.hintKo) return p.hintKo;
    return p.hint || '';
  }

  // ── Check if puzzle goal is met ──
  _checkGoal() {
    const p = this.puzzle;
    const goal = p.goal;
    if (!goal) return { completed: false, stars: 0 };

    let completed = false;
    const color = p.playerColor || BLACK;
    const opp = opposite(color);

    switch (goal.type) {
      case 'capture':
        // Capture N stones
        completed = this.gs.captures[color] >= goal.count;
        break;

      case 'capture_group':
        // Capture a specific group (check if those positions are now empty)
        if (goal.positions) {
          completed = goal.positions.every(pos =>
            this.gs.board[pos.row][pos.col] !== opp
          );
        }
        break;

      case 'territory':
        // Control N territory points
        {
          const scores = this.gs.score();
          const territory = color === BLACK ? scores.blackTerritory : scores.whiteTerritory;
          completed = territory >= goal.count;
        }
        break;

      case 'survive':
        // Keep a group alive (specific positions still have player stones)
        if (goal.positions) {
          completed = goal.positions.every(pos =>
            this.gs.board[pos.row][pos.col] === color
          );
          // Must also use all moves or the puzzle state is "done"
          if (this.moveCount >= (p.maxMoves || 1)) {
            // Verify the group has liberties
            for (const pos of goal.positions) {
              if (this.gs.board[pos.row][pos.col] === color) {
                completed = this.gs.countLiberties(pos.row, pos.col) > 0;
                break;
              }
            }
          } else {
            completed = false; // Need to use all moves first
          }
        }
        break;

      case 'connect':
        // Connect two groups into one
        if (goal.positions && goal.positions.length >= 2) {
          const first = goal.positions[0];
          const group = this.gs.findGroup(first.row, first.col);
          completed = goal.positions.every(pos =>
            group.has(posKey(pos.row, pos.col))
          );
        }
        break;

      case 'kill':
        // Kill all opponent stones in a region
        if (goal.region) {
          completed = goal.region.every(pos =>
            this.gs.board[pos.row][pos.col] !== opp
          );
        } else {
          // Kill any opponent stone
          completed = this.gs.captures[color] >= (goal.count || 1);
        }
        break;

      case 'spell_capture':
        // Use a spell then capture
        completed = this.gs.captures[color] >= (goal.count || 1);
        break;

      default:
        break;
    }

    if (completed) {
      this.completed = true;
      this.stars = this._calculateStars();
      return { completed: true, stars: this.stars };
    }

    // Check if out of moves (failure)
    if (p.maxMoves && this.moveCount >= p.maxMoves && !completed) {
      return { completed: false, stars: 0, failed: true };
    }

    return { completed: false, stars: 0 };
  }

  // ── Calculate star rating ──
  _calculateStars() {
    const p = this.puzzle;
    const optimal = p.optimalMoves || 1;
    const max = p.maxMoves || optimal + 2;

    if (this.hintUsed) {
      // Max 2 stars if hint was used
      if (this.moveCount <= optimal) return 2;
      return 1;
    }

    if (this.moveCount <= optimal) return 3;
    if (this.moveCount <= max - 1) return 2;
    return 1;
  }

  // ── Get remaining moves ──
  get movesRemaining() {
    const max = this.puzzle.maxMoves || 99;
    return Math.max(0, max - this.moveCount);
  }

  // ── Get star preview (how many stars player would get right now) ──
  get starPreview() {
    const p = this.puzzle;
    const optimal = p.optimalMoves || 1;
    const max = p.maxMoves || optimal + 2;
    const movesUsed = this.moveCount;

    if (movesUsed < optimal) return 3;
    if (movesUsed < max - 1) return 2;
    return 1;
  }

  // ── Check if puzzle has available moves (not failed) ──
  get canMove() {
    if (this.completed) return false;
    if (this.puzzle.maxMoves && this.moveCount >= this.puzzle.maxMoves) return false;
    return true;
  }
}
