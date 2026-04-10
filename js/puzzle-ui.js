// ============================================
// AniGO — Puzzle Mode UI
// Level select + puzzle gameplay + completion
// ============================================

import {
  BOARD_SIZE, BLACK, WHITE, EMPTY,
  posKey, opposite, colorName
} from './data.js';
import { PuzzleEngine } from './puzzle-engine.js';
import { BoardRenderer } from './board.js';
import * as Audio from './audio.js';
import { t, getLang } from './i18n.js';

// Import puzzle data — base + advanced
let PUZZLES = [];
let WORLDS = [];
try {
  const puzzleModule = await import('./puzzles.js');
  PUZZLES = puzzleModule.PUZZLES || [];
  WORLDS = puzzleModule.WORLDS || [];
} catch (e) {
  console.warn('Base puzzle data not available:', e.message);
}
try {
  const advancedModule = await import('./puzzles-advanced.js');
  if (advancedModule.ADVANCED_PUZZLES) PUZZLES = [...PUZZLES, ...advancedModule.ADVANCED_PUZZLES];
  if (advancedModule.ADVANCED_WORLDS) WORLDS = [...WORLDS, ...advancedModule.ADVANCED_WORLDS];
} catch (e) {
  // Advanced puzzles not yet available — that's OK
}

// ── Puzzle State ──
let puzzleEngine = null;
let puzzleRenderer = null;
let currentPuzzleId = null;
let currentWorldIndex = 0;
let hintTokens = 3;

// ── Progress persistence ──
const STORAGE_KEY = 'anigo-puzzle-progress';

function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      completed: data.completed || {},      // { puzzleId: stars }
      hintTokens: data.hintTokens ?? 3,
      unlockedWorlds: data.unlockedWorlds || [0]
    };
  } catch { return { completed: {}, hintTokens: 3, unlockedWorlds: [0] }; }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function completePuzzle(puzzleId, stars) {
  const progress = loadProgress();
  const prev = progress.completed[puzzleId] || 0;
  if (stars > prev) progress.completed[puzzleId] = stars;

  // Check world unlocks
  for (let wi = 0; wi < WORLDS.length; wi++) {
    const world = WORLDS[wi];
    const allCompleted = world.levels.every(lid => (progress.completed[lid] || 0) > 0);
    if (allCompleted && wi + 1 < WORLDS.length && !progress.unlockedWorlds.includes(wi + 1)) {
      progress.unlockedWorlds.push(wi + 1);
    }
  }

  saveProgress(progress);
}

function getWorldStars(worldIndex) {
  const progress = loadProgress();
  if (!WORLDS[worldIndex]) return 0;
  return WORLDS[worldIndex].levels.reduce((sum, lid) => sum + (progress.completed[lid] || 0), 0);
}

// ── Screen management (reuse existing pattern) ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

// ════════════════════════════════════════════
// LEVEL SELECT SCREEN
// ════════════════════════════════════════════

export function showPuzzleSelect() {
  showScreen('puzzle-select');
  renderLevelMap();
}

function renderLevelMap() {
  const container = document.getElementById('puzzle-world-map');
  if (!container) return;
  container.innerHTML = '';

  const progress = loadProgress();
  hintTokens = progress.hintTokens;
  const lang = getLang();

  for (let wi = 0; wi < WORLDS.length; wi++) {
    const world = WORLDS[wi];
    const isUnlocked = progress.unlockedWorlds.includes(wi);
    const totalStars = getWorldStars(wi);
    const maxStars = world.levels.length * 3;

    const worldEl = document.createElement('div');
    worldEl.className = `puzzle-world ${isUnlocked ? 'unlocked' : 'locked'}`;

    // World header
    const header = document.createElement('div');
    header.className = 'puzzle-world-header';
    header.innerHTML = `
      <div class="puzzle-world-name">${lang === 'ko' && world.nameKo ? world.nameKo : world.name}</div>
      <div class="puzzle-world-stars">
        <span class="star-icon gold">&#9733;</span> ${totalStars} / ${maxStars}
      </div>
    `;
    worldEl.appendChild(header);

    if (!isUnlocked) {
      const lockOverlay = document.createElement('div');
      lockOverlay.className = 'puzzle-world-lock';
      lockOverlay.innerHTML = `<span class="lock-icon">&#128274;</span><span class="lock-text">${lang === 'ko' ? '이전 월드를 클리어하세요' : 'Complete previous world'}</span>`;
      worldEl.appendChild(lockOverlay);
      container.appendChild(worldEl);
      continue;
    }

    // Level path
    const pathEl = document.createElement('div');
    pathEl.className = 'puzzle-level-path';

    for (let li = 0; li < world.levels.length; li++) {
      const puzzleId = world.levels[li];
      const puzzle = PUZZLES.find(p => p.id === puzzleId);
      if (!puzzle) continue;

      const stars = progress.completed[puzzleId] || 0;
      const prevCompleted = li === 0 || (progress.completed[world.levels[li - 1]] || 0) > 0;
      const isAvailable = prevCompleted;
      const isCurrent = isAvailable && stars === 0;

      // Connector line (not for first)
      if (li > 0) {
        const connector = document.createElement('div');
        connector.className = `puzzle-connector ${prevCompleted ? 'active' : ''}`;
        pathEl.appendChild(connector);
      }

      const levelNode = document.createElement('button');
      levelNode.className = `puzzle-level-node ${stars > 0 ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isAvailable ? 'locked' : ''}`;
      levelNode.disabled = !isAvailable;

      const levelNum = li + 1;
      levelNode.innerHTML = `
        <div class="level-node-circle">
          <span class="level-node-num">${levelNum}</span>
        </div>
        <div class="level-node-stars">
          ${[1,2,3].map(s => `<span class="mini-star ${s <= stars ? 'earned' : ''}">${s <= stars ? '&#9733;' : '&#9734;'}</span>`).join('')}
        </div>
        <div class="level-node-name">${lang === 'ko' && puzzle.nameKo ? puzzle.nameKo : puzzle.name}</div>
      `;

      if (isAvailable) {
        levelNode.addEventListener('click', () => {
          currentPuzzleId = puzzleId;
          startPuzzle(puzzleId);
        });
      }

      pathEl.appendChild(levelNode);
    }

    worldEl.appendChild(pathEl);
    container.appendChild(worldEl);
  }
}

// ════════════════════════════════════════════
// PUZZLE PLAY SCREEN
// ════════════════════════════════════════════

function startPuzzle(puzzleId) {
  const puzzle = PUZZLES.find(p => p.id === puzzleId);
  if (!puzzle) return;

  // Cleanup previous
  if (puzzleRenderer) { puzzleRenderer.destroy(); puzzleRenderer = null; }

  puzzleEngine = new PuzzleEngine(puzzle);
  showScreen('puzzle-play');

  // Setup canvas
  const canvas = document.getElementById('puzzle-board-canvas');
  if (!canvas) return;

  puzzleRenderer = new BoardRenderer(canvas, puzzleEngine.gs);

  // Setup click handler
  canvas.removeEventListener('click', onPuzzleBoardClick);
  canvas.addEventListener('click', onPuzzleBoardClick);

  // Setup control buttons
  setupPuzzleControls();

  // Update UI
  updatePuzzleUI();
  updatePuzzleSpells();
}

function setupPuzzleControls() {
  const btnUndo = document.getElementById('puzzle-btn-undo');
  const btnHint = document.getElementById('puzzle-btn-hint');
  const btnReset = document.getElementById('puzzle-btn-reset');
  const btnBack = document.getElementById('puzzle-btn-back');

  // Remove old listeners by replacing elements
  [btnUndo, btnHint, btnReset, btnBack].forEach(btn => {
    if (!btn) return;
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });

  document.getElementById('puzzle-btn-undo')?.addEventListener('click', onPuzzleUndo);
  document.getElementById('puzzle-btn-hint')?.addEventListener('click', onPuzzleHint);
  document.getElementById('puzzle-btn-reset')?.addEventListener('click', onPuzzleReset);
  document.getElementById('puzzle-btn-back')?.addEventListener('click', () => {
    cleanupPuzzle();
    showPuzzleSelect();
  });
}

function cleanupPuzzle() {
  if (puzzleRenderer) { puzzleRenderer.destroy(); puzzleRenderer = null; }
  const canvas = document.getElementById('puzzle-board-canvas');
  if (canvas) canvas.removeEventListener('click', onPuzzleBoardClick);
  puzzleEngine = null;
}

function onPuzzleBoardClick(e) {
  if (!puzzleEngine || !puzzleRenderer) return;
  if (puzzleEngine.completed || !puzzleEngine.canMove) return;

  const rect = puzzleRenderer.canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const grid = puzzleRenderer.pixelToGrid(px, py);
  if (!grid) return;

  // If spell is selected, try to cast it
  if (puzzleEngine.selectedSpell) {
    const spellId = puzzleEngine.selectedSpell;
    const k = posKey(grid.row, grid.col);

    if (puzzleRenderer.validTargets && puzzleRenderer.validTargets.has(k)) {
      const result = puzzleEngine.useSpell(spellId, { row: grid.row, col: grid.col });
      if (result.success) {
        try { Audio.spellCast(); } catch {}
        puzzleRenderer.animateSpell(grid.row, grid.col, spellId);
        puzzleEngine.deselectSpell();
        puzzleRenderer.validTargets = null;
        puzzleRenderer.selectedSpell = null;
        updatePuzzleUI();
        updatePuzzleSpells();

        if (result.completed) {
          setTimeout(() => showPuzzleComplete(result.stars), 600);
        } else if (!puzzleEngine.canMove) {
          setTimeout(() => showPuzzleFailed(), 600);
        }
      }
    }
    return;
  }

  // Normal stone placement
  const result = puzzleEngine.placeStone(grid.row, grid.col);
  if (result.success) {
    try { Audio.stonePlace(); } catch {}
    puzzleRenderer.animatePlace(grid.row, grid.col);

    if (result.captured && result.captured.length > 0) {
      try { Audio.stoneCapture(); } catch {}
      puzzleRenderer.animateCapture(
        result.captured.map(p => ({
          row: p.row, col: p.col,
          color: opposite(puzzleEngine.gs.currentPlayer)
        }))
      );
    }

    updatePuzzleUI();

    if (result.completed) {
      setTimeout(() => showPuzzleComplete(result.stars), 600);
    } else if (!puzzleEngine.canMove) {
      setTimeout(() => showPuzzleFailed(), 600);
    }
  }
}

function onPuzzleUndo() {
  if (!puzzleEngine) return;
  const success = puzzleEngine.undo();
  if (success) {
    // Clear hint highlight
    if (puzzleRenderer) {
      puzzleRenderer.hintMove = null;
      puzzleRenderer.validTargets = null;
      puzzleRenderer.selectedSpell = null;
    }
    puzzleEngine.deselectSpell();
    updatePuzzleUI();
    updatePuzzleSpells();
  }
}

function onPuzzleHint() {
  if (!puzzleEngine || !puzzleRenderer) return;

  const progress = loadProgress();
  if (progress.hintTokens <= 0) {
    showPuzzleToast(getLang() === 'ko' ? '힌트 토큰이 없습니다!' : 'No hint tokens left!');
    return;
  }

  const hint = puzzleEngine.getHint();
  if (!hint) {
    showPuzzleToast(puzzleEngine.getHintText(getLang()));
    return;
  }

  // Consume hint token
  progress.hintTokens--;
  hintTokens = progress.hintTokens;
  saveProgress(progress);

  // Show hint highlight on the board
  if (hint.row !== undefined && hint.col !== undefined) {
    puzzleRenderer.hintMove = { row: hint.row, col: hint.col };
    // Clear after 3 seconds
    setTimeout(() => {
      if (puzzleRenderer) puzzleRenderer.hintMove = null;
    }, 3000);
  }

  // Show hint text
  const hintText = puzzleEngine.getHintText(getLang());
  if (hintText) showPuzzleToast(hintText);

  updatePuzzleUI();
}

function onPuzzleReset() {
  if (!puzzleEngine) return;
  puzzleEngine.reset();
  if (puzzleRenderer) {
    puzzleRenderer.hintMove = null;
    puzzleRenderer.validTargets = null;
    puzzleRenderer.selectedSpell = null;
  }
  updatePuzzleUI();
  updatePuzzleSpells();

  // Hide any overlay
  const overlay = document.getElementById('puzzle-complete-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function showPuzzleToast(message) {
  const toast = document.getElementById('puzzle-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
}

// ── Update puzzle UI elements ──
function updatePuzzleUI() {
  if (!puzzleEngine) return;
  const p = puzzleEngine.puzzle;
  const lang = getLang();

  // Goal display
  const goalEl = document.getElementById('puzzle-goal-text');
  if (goalEl) {
    goalEl.textContent = lang === 'ko' && p.descriptionKo ? p.descriptionKo : p.description;
  }

  // Title
  const titleEl = document.getElementById('puzzle-title');
  if (titleEl) {
    titleEl.textContent = lang === 'ko' && p.nameKo ? p.nameKo : p.name;
  }

  // Move counter
  const movesEl = document.getElementById('puzzle-moves');
  if (movesEl) {
    const max = p.maxMoves || '?';
    movesEl.textContent = `${puzzleEngine.moveCount} / ${max}`;
  }

  // Star preview
  const previewEl = document.getElementById('puzzle-star-preview');
  if (previewEl) {
    const preview = puzzleEngine.starPreview;
    previewEl.innerHTML = [1,2,3].map(s =>
      `<span class="preview-star ${s <= preview ? 'active' : ''}">${s <= preview ? '&#9733;' : '&#9734;'}</span>`
    ).join('');
  }

  // Hint tokens
  const hintCountEl = document.getElementById('puzzle-hint-count');
  if (hintCountEl) {
    const progress = loadProgress();
    hintCountEl.textContent = progress.hintTokens;
  }

  // Undo button state
  const undoBtn = document.getElementById('puzzle-btn-undo');
  if (undoBtn) {
    undoBtn.disabled = puzzleEngine.moveHistory.length === 0;
  }
}

// ── Render available spell cards ──
function updatePuzzleSpells() {
  const container = document.getElementById('puzzle-spell-bar');
  if (!container || !puzzleEngine) { if (container) container.innerHTML = ''; return; }

  const spells = puzzleEngine.availableSpells;
  const spellIds = Object.keys(spells).filter(id => spells[id] > 0);

  if (spellIds.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = '';

  for (const spellId of spellIds) {
    const uses = spells[spellId];
    const card = document.createElement('button');
    card.className = `puzzle-spell-card ${puzzleEngine.selectedSpell === spellId ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="puzzle-spell-icon">${getSpellEmoji(spellId)}</div>
      <div class="puzzle-spell-name">${spellId}</div>
      <div class="puzzle-spell-uses">${uses}x</div>
    `;
    card.addEventListener('click', () => {
      if (puzzleEngine.selectedSpell === spellId) {
        // Deselect
        puzzleEngine.deselectSpell();
        if (puzzleRenderer) {
          puzzleRenderer.validTargets = null;
          puzzleRenderer.selectedSpell = null;
        }
      } else {
        // Select spell
        puzzleEngine.selectSpell(spellId);
        if (puzzleRenderer) {
          const targets = puzzleEngine.getSpellTargets(spellId);
          puzzleRenderer.validTargets = new Set(targets.map(t => posKey(t.row, t.col)));
          puzzleRenderer.selectedSpell = spellId;
        }
      }
      updatePuzzleSpells();
    });
    container.appendChild(card);
  }
}

function getSpellEmoji(spellId) {
  const map = {
    'stone_skin': '🛡️',
    'mirage': '👻',
    'shatter': '💥',
    'wildfire': '🔥',
    'snare': '🪤',
    'sanctuary': '🏛️',
    'inferno': '☄️',
    'smolder': '🌋',
    'phantom_wall': '🧱',
    'chain_lightning': '⚡',
    'thunder_veil': '🌩️',
    'phase_shift': '🌀',
    'warpgate': '🌐',
    'spatial_rend': '🕳️'
  };
  return map[spellId] || '✨';
}

// ════════════════════════════════════════════
// PUZZLE COMPLETE OVERLAY
// ════════════════════════════════════════════

function showPuzzleComplete(stars) {
  if (!puzzleEngine) return;

  const p = puzzleEngine.puzzle;
  const lang = getLang();

  // Save progress
  completePuzzle(p.id, stars);
  try { Audio.gameEnd(); } catch {}

  const overlay = document.getElementById('puzzle-complete-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');

  const movesUsed = puzzleEngine.moveCount;
  const optimal = p.optimalMoves || 1;

  overlay.innerHTML = `
    <div class="puzzle-complete-content">
      <div class="puzzle-complete-title">${lang === 'ko' ? '퍼즐 클리어!' : 'Puzzle Complete!'}</div>
      <div class="puzzle-complete-stars" id="puzzle-stars-anim">
        ${[1,2,3].map(s => `<span class="complete-star star-${s} ${s <= stars ? 'earned' : ''}" data-delay="${s * 300}">&#9733;</span>`).join('')}
      </div>
      <div class="puzzle-complete-stats">
        <div class="complete-stat">
          <span class="complete-stat-label">${lang === 'ko' ? '사용한 수' : 'Moves Used'}</span>
          <span class="complete-stat-value">${movesUsed}</span>
        </div>
        <div class="complete-stat">
          <span class="complete-stat-label">${lang === 'ko' ? '최적 수' : 'Optimal'}</span>
          <span class="complete-stat-value">${optimal}</span>
        </div>
      </div>
      <div class="puzzle-complete-actions">
        <button class="btn btn-primary puzzle-btn-next" id="puzzle-btn-next">
          ${lang === 'ko' ? '다음 레벨' : 'Next Level'} →
        </button>
        <button class="btn btn-secondary puzzle-btn-retry" id="puzzle-btn-retry">
          ${lang === 'ko' ? '다시 도전' : 'Retry'}
        </button>
        <button class="btn btn-secondary puzzle-btn-levels" id="puzzle-btn-levels">
          ${lang === 'ko' ? '레벨 선택' : 'Level Select'}
        </button>
      </div>
    </div>
  `;

  // Animate stars sequentially
  requestAnimationFrame(() => {
    const starEls = overlay.querySelectorAll('.complete-star.earned');
    starEls.forEach((el, i) => {
      setTimeout(() => el.classList.add('animate'), (i + 1) * 350);
    });
  });

  // Button handlers
  document.getElementById('puzzle-btn-next')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    const nextId = getNextPuzzleId(p.id);
    if (nextId) {
      currentPuzzleId = nextId;
      startPuzzle(nextId);
    } else {
      cleanupPuzzle();
      showPuzzleSelect();
    }
  });

  document.getElementById('puzzle-btn-retry')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    onPuzzleReset();
  });

  document.getElementById('puzzle-btn-levels')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    cleanupPuzzle();
    showPuzzleSelect();
  });
}

function showPuzzleFailed() {
  if (!puzzleEngine) return;
  const lang = getLang();

  const overlay = document.getElementById('puzzle-complete-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');

  overlay.innerHTML = `
    <div class="puzzle-complete-content puzzle-failed">
      <div class="puzzle-complete-title failed-title">${lang === 'ko' ? '실패...' : 'Failed...'}</div>
      <div class="puzzle-failed-icon">&#128532;</div>
      <div class="puzzle-complete-actions">
        <button class="btn btn-primary puzzle-btn-retry" id="puzzle-btn-retry-fail">
          ${lang === 'ko' ? '다시 도전' : 'Retry'}
        </button>
        <button class="btn btn-secondary puzzle-btn-levels" id="puzzle-btn-levels-fail">
          ${lang === 'ko' ? '레벨 선택' : 'Level Select'}
        </button>
      </div>
    </div>
  `;

  document.getElementById('puzzle-btn-retry-fail')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    onPuzzleReset();
  });

  document.getElementById('puzzle-btn-levels-fail')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    cleanupPuzzle();
    showPuzzleSelect();
  });
}

function getNextPuzzleId(currentId) {
  for (const world of WORLDS) {
    const idx = world.levels.indexOf(currentId);
    if (idx !== -1 && idx + 1 < world.levels.length) {
      return world.levels[idx + 1];
    }
  }
  return null;
}

// ════════════════════════════════════════════
// INITIALIZATION — Wire into existing app
// ════════════════════════════════════════════

export function initPuzzleMode() {
  // Add puzzle button to title screen if not already there
  const btnPuzzle = document.getElementById('btn-puzzle');
  if (btnPuzzle) {
    btnPuzzle.addEventListener('click', () => {
      showPuzzleSelect();
    });
  }

  // Back from puzzle select to title
  const btnBackPuzzle = document.getElementById('puzzle-btn-back-title');
  if (btnBackPuzzle) {
    btnBackPuzzle.addEventListener('click', () => {
      showScreen('title-screen');
    });
  }
}

// Expose for ui.js integration
window.initPuzzleSelect = showPuzzleSelect;

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPuzzleMode);
} else {
  initPuzzleMode();
}
