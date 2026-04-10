// ============================================
// AniGO — UI Layer (Entry Point)
// Champion select, spell hand, HUD, scoring
// ============================================

import {
  BOARD_SIZE, BLACK, WHITE, EMPTY, VOID, WALL,
  CHAMPIONS, KOMI, DUAL_ACTION_SURCHARGE,
  posKey, colorName, coordLabel, opposite
} from './data.js';
import { GameState } from './game.js';
import { canCastSpell, getValidTargets, castSpell } from './spells.js';
import { aiTakeTurn, aiSelectChampion } from './ai.js';
import { BoardRenderer } from './board.js';
import * as Audio from './audio.js';
import {
  t, setLang, getLang, getAvailableLangs,
  tSpellName, tSpellDesc, tSpellDescShort, tCategory,
  tChampName, tChampTitle,
  tArchetype, tPassiveName, tPassiveDesc, tChampPitch,
  tColor, renderHowToPlayHTML
} from './i18n.js';
import { getPlayer, recordGame, getWinRate, loginWithKakao } from './auth.js';

// ── App State ──
let gs = null;
let renderer = null;
let selectedSpellId = null;
let selectedChampionId = null;
let championSelectPhase = 1; // 1=Black, 2=White (local mode)
let prevChiValue = -1;

// ── Progressive Complexity ──
function getGamesPlayed() { return parseInt(localStorage.getItem('anigo-games-played') || '0', 10); }
function incrementGamesPlayed() { const c = getGamesPlayed() + 1; localStorage.setItem('anigo-games-played', String(c)); return c; }
function isFirstGame() { return getGamesPlayed() === 0; }

// ── Hint State ──
let hintShown = { turn1: false, turn3capture: false, chiSpell: false, atari: false, firstCapture: false, passPrompt: false };
let activeToast = null;
let toastTimeout = null;
let gameStats = { stonesPlaced: 0, captures: 0, spellsUsed: 0 };

// ── Screen management ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── How to Play Modal ──
function openHowToPlay() { document.getElementById('how-to-play-modal').classList.remove('hidden'); }
function closeHowToPlay() { document.getElementById('how-to-play-modal').classList.add('hidden'); }

// ── Toast system ──
function showToast(message, duration) {
  if (!duration) duration = 5000;
  dismissToast();
  const toast = document.createElement('div');
  toast.className = 'hint-toast';
  toast.innerHTML = `<span>${message}</span><button class="hint-toast-dismiss" aria-label="Dismiss">&times;</button>`;
  const boardArea = document.querySelector('.board-area');
  if (boardArea) boardArea.appendChild(toast);
  void toast.offsetWidth;
  toast.classList.add('visible');
  activeToast = toast;
  toast.querySelector('.hint-toast-dismiss').addEventListener('click', dismissToast);
  toast.addEventListener('click', dismissToast);
  toastTimeout = setTimeout(dismissToast, duration);
}

function dismissToast() {
  if (toastTimeout) { clearTimeout(toastTimeout); toastTimeout = null; }
  if (activeToast) { activeToast.remove(); activeToast = null; }
}

// ── Contextual hints ──
function checkContextualHints() {
  if (getGamesPlayed() > 0 || !gs || gs.gameOver) return;
  if (gs.mode === 'ai' && gs.currentPlayer === WHITE) return;
  const color = gs.currentPlayer;
  if (gs.turnNumber === 0 && !hintShown.turn1) { hintShown.turn1 = true; showToast(t('hintFirstMove')); return; }
  if (gs.captures[color] > 0 && !hintShown.firstCapture) { hintShown.firstCapture = true; showToast(t('hintFirstCapture'), 4000); return; }
  if (!hintShown.chiSpell) {
    const available = gs.getAvailableSpells(color);
    if (available.some(s => gs.chi[color] >= gs.getSpellCost(s.id, color))) {
      hintShown.chiSpell = true; showToast(t('hintCastSpell')); return;
    }
  }
}

// ════════════════════════════════════════════
// FIRST GAME INTRO SLIDESHOW
// ════════════════════════════════════════════

function showIntroSlideshow(onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'intro-slideshow-overlay';
  overlay.id = 'intro-slideshow';
  const slides = [
    { title: t('introSlide1Title'), body: t('introSlide1Body'), diagram: 'territory' },
    { title: t('introSlide2Title'), body: t('introSlide2Body'), diagram: 'capture' },
    { title: t('introSlide3Title'), body: t('introSlide3Body'), diagram: 'spells' },
  ];
  let currentSlide = 0;
  document.body.appendChild(overlay);

  function renderSlide() {
    const slide = slides[currentSlide];
    overlay.innerHTML = `
      <div class="intro-slide-container">
        <div class="intro-slide-progress">${slides.map((_, i) => `<div class="intro-dot ${i === currentSlide ? 'active' : ''}"></div>`).join('')}</div>
        <h2 class="intro-slide-title">${slide.title}</h2>
        <div class="intro-slide-diagram"><canvas id="intro-diagram-canvas" width="160" height="160"></canvas></div>
        <p class="intro-slide-body">${slide.body}</p>
        <button class="btn btn-primary intro-got-it" id="intro-next">${t('introGotIt')}</button>
        <button class="intro-skip-link" id="intro-skip">${t('introSkip')}</button>
      </div>
    `;
    document.getElementById('intro-next').addEventListener('click', () => { currentSlide++; if (currentSlide >= slides.length) { overlay.remove(); onComplete(); } else renderSlide(); });
    document.getElementById('intro-skip').addEventListener('click', () => { overlay.remove(); onComplete(); });
  }
  renderSlide();
}

// ════════════════════════════════════════════
// CHAMPION SELECT SCREEN
// ════════════════════════════════════════════

function startChampionSelect() {
  selectedChampionId = null;
  championSelectPhase = 1;
  showScreen('champion-select');
  renderChampionGrid();
  updateChampionSelectUI();
}

// Difficulty mapping per champion
const CHAMP_DIFFICULTY = {
  seolhwa: 'difficultyEasy',
  ryujin: 'difficultyMedium',
  kumiho: 'difficultyHard',
  musubi: 'difficultyHard',
  raijin: 'difficultyMedium',
};

function renderChampionGrid() {
  const grid = document.getElementById('champ-grid');
  grid.innerHTML = '';

  for (const champ of CHAMPIONS) {
    const card = document.createElement('div');
    card.className = 'champ-card yugioh-frame';
    card.dataset.champId = champ.id;
    card.style.setProperty('--champ-color', champ.color);
    const diffKey = CHAMP_DIFFICULTY[champ.id] || 'difficultyMedium';
    card.innerHTML = `
      <div class="champ-card-inner">
        <div class="champ-card-accent" style="background: ${champ.color}"></div>
        <div class="champ-card-portrait">
          <picture>
            <source srcset="assets/art/champions/${champ.id}.webp" type="image/webp">
            <img class="champ-portrait-img" src="assets/art/champions/${champ.id}.png" alt="${champ.name}" loading="lazy">
          </picture>
        </div>
        <div class="champ-card-name-banner">
          <div class="champ-card-name" style="color: ${champ.color}">${tChampName(champ.id)}</div>
          <div class="champ-card-title">${tChampTitle(champ.id)}</div>
        </div>
        <div class="champ-card-info">
          <div class="champ-card-archetype">${tArchetype(champ.archetype)}</div>
          <div class="champ-card-difficulty">${t(diffKey)}</div>
        </div>
      </div>
    `;
    card.addEventListener('click', () => {
      selectedChampionId = champ.id;
      Audio.cardHover();
      updateChampionSelectUI();
      showChampionDetail(champ);
    });
    card.addEventListener('mouseenter', () => {
      Audio.cardHover();
      // Dim other cards on hover (LoL style)
      if (!selectedChampionId) {
        document.querySelectorAll('.champ-card').forEach(el => {
          el.classList.toggle('hover-dimmed', el !== card);
        });
      }
    });
    card.addEventListener('mouseleave', () => {
      document.querySelectorAll('.champ-card').forEach(el => {
        el.classList.remove('hover-dimmed');
      });
    });
    grid.appendChild(card);
  }
}

function showChampionDetail(champ) {
  const detail = document.getElementById('champ-detail');
  detail.classList.remove('hidden');

  // Map category to display color var
  const catColorMap = {
    offensive: 'var(--spell-offensive)',
    defensive: 'var(--spell-defensive)',
    terrain: 'var(--spell-terrain)',
    info: 'var(--spell-info)',
    trap: 'var(--spell-trap)',
  };

  detail.innerHTML = `
    <div class="champ-detail-portrait-banner">
      <picture>
        <source srcset="assets/art/champions/${champ.id}.webp" type="image/webp">
        <img src="assets/art/champions/${champ.id}.png" alt="${champ.name}" class="champ-detail-portrait-img" loading="lazy">
      </picture>
      <div class="champ-detail-portrait-fade" style="background: linear-gradient(to bottom, transparent 40%, rgba(14,14,24,0.95) 100%)"></div>
    </div>
    <div class="champ-detail-header">
      <div class="champ-detail-name" style="color: ${champ.color}">${tChampName(champ.id)}</div>
      <div class="champ-detail-title">${tChampTitle(champ.id)}</div>
      <div class="champ-detail-pitch">"${tChampPitch(champ.id)}"</div>
    </div>
    <div class="champ-passive-display">
      <div class="passive-header">
        <span class="passive-label">${t('passiveLabel')}</span>
        <span class="passive-name">${tPassiveName(champ.passive.name)}</span>
      </div>
      <span class="passive-desc">${tPassiveDesc(champ.passive.name)}</span>
    </div>
    <div class="champ-detail-spells-label">SPELLS</div>
    <div class="champ-spells-row">
      ${champ.spells.map(s => {
        const catColor = catColorMap[s.category] || 'var(--border)';
        return `
        <div class="champ-spell-card spell-cat-${s.category}">
          <div class="champ-spell-cat-bar" style="background: ${catColor}"></div>
          <div class="champ-spell-cost-badge">${s.cost}</div>
          <div class="champ-spell-art-preview spell-art-${s.id}"></div>
          <div class="champ-spell-body">
            <div class="champ-spell-name">${tSpellName(s.id)}</div>
            <div class="champ-spell-meta">
              <span class="champ-spell-uses">${s.uses}x</span>
              <span class="champ-spell-cat-label">${s.category}</span>
              ${s.hidden ? '<span class="champ-spell-hidden">' + t('catSecret') + '</span>' : ''}
            </div>
            <div class="champ-spell-desc">${tSpellDesc(s.id)}</div>
          </div>
        </div>
      `;}).join('')}
    </div>
    <button id="btn-confirm-champ" class="btn btn-primary btn-lock-in" disabled
      style="--lock-champ-color: ${champ.color}"></button>
  `;
  // Re-bind the lock-in button inside detail panel
  updateChampionSelectUI();
}

function updateChampionSelectUI() {
  document.querySelectorAll('.champ-card').forEach(el => {
    const isSelected = el.dataset.champId === selectedChampionId;
    el.classList.toggle('selected', isSelected);
  });

  // Toggle body class for grid sizing when detail is open
  const body = document.querySelector('.champ-select-body');
  if (body) body.classList.toggle('detail-open', !!selectedChampionId);

  const header = document.getElementById('champ-select-header');
  if (gs.mode === 'local') {
    header.textContent = championSelectPhase === 1 ? t('blackChooseChampion') : t('whiteChooseChampion');
  } else {
    header.textContent = t('chooseYourChampion');
  }
  const sub = document.getElementById('champ-select-sub');
  if (sub) sub.textContent = t('eachChampionHas');

  // Back button text
  const backBtn = document.getElementById('btn-back-title');
  if (backBtn) backBtn.textContent = t('backToTitle');

  // Lock-in button is now inside the detail panel
  const btn = document.getElementById('btn-confirm-champ');
  if (!btn) return;

  btn.disabled = !selectedChampionId;

  if (!selectedChampionId) {
    btn.textContent = t('selectAChampion');
    btn.classList.remove('btn-lock-in-active');
    btn.style.removeProperty('--lock-champ-color');
  } else if (gs.mode === 'local' && championSelectPhase === 1) {
    btn.textContent = t('confirmAndNext');
    btn.classList.add('btn-lock-in-active');
    const champ = CHAMPIONS.find(c => c.id === selectedChampionId);
    if (champ) btn.style.setProperty('--lock-champ-color', champ.color);
  } else {
    const champ = CHAMPIONS.find(c => c.id === selectedChampionId);
    btn.textContent = t('lockInChampion') + (champ ? tChampName(champ.id) : '');
    btn.classList.add('btn-lock-in-active');
    if (champ) btn.style.setProperty('--lock-champ-color', champ.color);
  }
  btn.onclick = confirmChampionSelect;
}

function confirmChampionSelect() {
  if (!selectedChampionId) return;
  Audio.cardDraw();

  if (gs.mode === 'local' && championSelectPhase === 1) {
    gs.initChampion(selectedChampionId, BLACK);
    selectedChampionId = null;
    championSelectPhase = 2;
    document.getElementById('champ-detail').classList.add('hidden');
    updateChampionSelectUI();
    return;
  }

  if (gs.mode === 'local') {
    gs.initChampion(selectedChampionId, WHITE);
  } else {
    gs.initChampion(selectedChampionId, BLACK);
    // AI selects champion
    const aiChampId = aiSelectChampion(selectedChampionId);
    gs.initChampion(aiChampId, WHITE);
  }

  gs.startGame();
  startGame();
}

// ════════════════════════════════════════════
// INITIALIZE
// ════════════════════════════════════════════

// ── Language selector ──
function renderLangSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const langs = getAvailableLangs();
  const current = getLang();
  container.innerHTML = langs.map(l =>
    `<button class="lang-btn ${l === current ? 'active' : ''}" data-lang="${l}">${{ko:'KR',zh:'CN',en:'EN'}[l]||l}</button>`
  ).join('');
  container.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      applyAllText();
    });
  });
}

function applyAllText() {
  // Splash screen translatable text
  const splashTagline = document.getElementById('splash-tagline');
  if (splashTagline) splashTagline.textContent = t('splashTagline');
  const splashPuzzle = document.getElementById('splash-btn-puzzle-title');
  if (splashPuzzle) splashPuzzle.textContent = t('puzzleMode');
  const splashPuzzleSub = document.getElementById('splash-btn-puzzle-sub');
  if (splashPuzzleSub) splashPuzzleSub.textContent = t('puzzleSub');
  const splashLaunch = document.getElementById('splash-btn-launch');
  if (splashLaunch) splashLaunch.textContent = t('playVsAI');
  const splashAISub = document.getElementById('splash-btn-ai-sub');
  if (splashAISub) splashAISub.textContent = t('aiSub');
  const splashLocal = document.getElementById('splash-btn-local');
  if (splashLocal) splashLocal.textContent = t('local2P');
  const splashLocalSub = document.getElementById('splash-btn-local-sub');
  if (splashLocalSub) splashLocalSub.textContent = t('localSub');
  const splashHelp = document.getElementById('splash-btn-help');
  if (splashHelp) splashHelp.textContent = t('howToPlay');

  // Challenge friend button
  const splashChallenge = document.getElementById('splash-btn-challenge');
  if (splashChallenge) splashChallenge.textContent = t('challengeFriend');
  const splashChallengeSub = document.getElementById('splash-btn-challenge-sub');
  if (splashChallengeSub) splashChallengeSub.textContent = t('challengeFriendSub');

  // Web3 teaser text
  const web3NftSkins = document.getElementById('web3-nft-skins');
  if (web3NftSkins) web3NftSkins.textContent = t('web3NftSkins');
  const web3TokenWager = document.getElementById('web3-token-wager');
  if (web3TokenWager) web3TokenWager.textContent = t('web3TokenWager');

  // Scoring social buttons
  const shareKakaoLabel = document.getElementById('share-kakao-label');
  if (shareKakaoLabel) shareKakaoLabel.textContent = t('shareKakao');
  const rematchChallengeLabel = document.getElementById('rematch-challenge-label');
  if (rematchChallengeLabel) rematchChallengeLabel.textContent = t('challengeFriend');

  // Pass button
  const passLabel = document.getElementById('pass-label');
  if (passLabel) passLabel.textContent = t('pass');
  const passHint = document.getElementById('pass-hint');
  if (passHint) passHint.textContent = t('passHint');

  // Static labels
  const logLabel = document.getElementById('log-label');
  if (logLabel) logLabel.textContent = t('logLabel');
  const labelSpells = document.getElementById('label-your-spells');
  if (labelSpells) labelSpells.textContent = t('yourSpells');
  const labelStats = document.getElementById('label-stats');
  if (labelStats) labelStats.textContent = t('stats');
  const labelCaptures = document.getElementById('label-captures');
  if (labelCaptures) labelCaptures.textContent = t('captures');
  const labelOpp = document.getElementById('label-opponent');
  if (labelOpp) labelOpp.textContent = t('opponent');
  const labelOppChi = document.getElementById('label-opp-chi');
  if (labelOppChi) labelOppChi.textContent = t('chi');
  const labelOppCaptures = document.getElementById('label-opp-captures');
  if (labelOppCaptures) labelOppCaptures.textContent = t('captures');

  // Play again
  const playAgainBtn = document.getElementById('btn-play-again');
  if (playAgainBtn) playAgainBtn.textContent = t('playAgain');

  // Scoring labels
  const scoreLabelBlack = document.getElementById('score-label-black');
  if (scoreLabelBlack) scoreLabelBlack.textContent = tColor(BLACK).toUpperCase();
  const scoreLabelWhite = document.getElementById('score-label-white');
  if (scoreLabelWhite) scoreLabelWhite.textContent = tColor(WHITE).toUpperCase();

  // Re-render language selectors
  renderLangSelector('title-lang-selector');
  renderLangSelector('header-lang-selector');

  // Refresh how-to-play content
  populateHowToPlay();

  // Champion select screen text
  const champHeader = document.getElementById('champ-select-header');
  if (champHeader && gs) {
    if (gs.mode === 'local') {
      champHeader.textContent = championSelectPhase === 1 ? t('blackChooseChampion') : t('whiteChooseChampion');
    } else {
      champHeader.textContent = t('chooseYourChampion');
    }
  }
  const champSub = document.getElementById('champ-select-sub');
  if (champSub) champSub.textContent = t('eachChampionHas');
  const backBtn = document.getElementById('btn-back-title');
  if (backBtn) backBtn.textContent = t('backToTitle');

  // If game is active, refresh HUD
  if (gs && gs.phase === 'play') updateGameUI();
  // If champion select is active, refresh it
  if (gs && gs.phase === 'champion-select') {
    renderChampionGrid();
    updateChampionSelectUI();
  }
}

function populateHowToPlay() {
  const helpContent = document.getElementById('how-to-play-content');
  if (!helpContent) return;
  helpContent.innerHTML = renderHowToPlayHTML(CHAMPIONS);
  const closeBtn = document.getElementById('btn-close-help');
  if (closeBtn) closeBtn.addEventListener('click', closeHowToPlay);
}

// ════════════════════════════════════════════
// PLAYER PROFILE PANEL
// ════════════════════════════════════════════

let globalToastEl = null;
let globalToastTimeout = null;

function showGlobalToast(message, duration) {
  if (!duration) duration = 3000;
  if (globalToastTimeout) { clearTimeout(globalToastTimeout); globalToastTimeout = null; }
  if (globalToastEl) { globalToastEl.remove(); globalToastEl = null; }
  const toast = document.createElement('div');
  toast.className = 'global-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  void toast.offsetWidth;
  toast.classList.add('visible');
  globalToastEl = toast;
  globalToastTimeout = setTimeout(() => {
    if (globalToastEl) { globalToastEl.classList.remove('visible'); setTimeout(() => { if (globalToastEl) { globalToastEl.remove(); globalToastEl = null; } }, 300); }
  }, duration);
}

function updateProfilePanel() {
  const player = getPlayer();
  const nameEl = document.getElementById('profile-name');
  const gamesEl = document.getElementById('profile-games');
  const winrateEl = document.getElementById('profile-winrate');
  const recordEl = document.getElementById('profile-record');
  const capturesEl = document.getElementById('profile-captures');
  const favChampEl = document.getElementById('profile-fav-champ');

  if (nameEl) nameEl.textContent = player.name;
  if (gamesEl) gamesEl.textContent = player.stats.gamesPlayed;
  if (winrateEl) winrateEl.textContent = getWinRate();
  if (recordEl) recordEl.textContent = `${player.stats.wins} / ${player.stats.losses}`;
  if (capturesEl) capturesEl.textContent = player.stats.totalCaptures;

  if (favChampEl) {
    if (player.stats.favoriteChampion) {
      const champ = CHAMPIONS.find(c => c.id === player.stats.favoriteChampion);
      favChampEl.textContent = champ ? tChampName(champ.id) : player.stats.favoriteChampion;
    } else {
      favChampEl.textContent = '—';
    }
  }
}

function initProfilePanel() {
  const profileBtn = document.getElementById('btn-player-profile');
  const profilePanel = document.getElementById('player-profile-panel');
  const kakaoBtn = document.getElementById('btn-kakao-login');

  if (!profileBtn || !profilePanel) return;

  // Initialize player on load (auto-creates guest)
  getPlayer();
  updateProfilePanel();

  // Toggle panel
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    updateProfilePanel();
    profilePanel.classList.toggle('hidden');
  });

  // Close panel on outside click
  document.addEventListener('click', (e) => {
    if (!profilePanel.classList.contains('hidden') && !profilePanel.contains(e.target) && e.target !== profileBtn) {
      profilePanel.classList.add('hidden');
    }
  });

  // Kakao login button
  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', async () => {
      const result = await loginWithKakao();
      showGlobalToast(result.message, 3000);
      if (result.success) updateProfilePanel();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Splash screen particles — mix of rising and floating types
  const particleContainer = document.getElementById('splash-particles');
  if (particleContainer) {
    const colors = [
      'rgba(212,160,23,0.6)',   // gold
      'rgba(0,212,212,0.45)',   // cyan
      'rgba(139,92,246,0.4)',   // purple
      'rgba(255,230,150,0.5)',  // warm gold
      'rgba(100,200,255,0.35)', // light cyan
    ];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const isFloat = i >= Math.floor(count * 0.65); // ~35% float, ~65% rise
      const size = 2 + Math.random() * 3; // 2px to 5px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const glowColor = color.replace(/[\d.]+\)$/, '0.8)');

      p.className = 'splash-particle ' + (isFloat ? 'splash-particle--float' : 'splash-particle--rise');
      p.style.left = Math.random() * 100 + '%';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.background = color;
      p.style.boxShadow = '0 0 ' + (size * 2) + 'px ' + glowColor;
      p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
      p.style.setProperty('--particle-peak-opacity', (0.4 + Math.random() * 0.3).toFixed(2));

      if (isFloat) {
        // Floating particles: positioned across the scene, gentle orbit
        p.style.top = (20 + Math.random() * 60) + '%';
        p.style.setProperty('--float-y', (-20 - Math.random() * 40) + 'px');
        p.style.animationDuration = (6 + Math.random() * 8) + 's';
        p.style.animationDelay = (Math.random() * 6) + 's';
      } else {
        // Rising particles: start from bottom
        p.style.bottom = '-10px';
        p.style.animationDuration = (10 + Math.random() * 15) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
      }

      particleContainer.appendChild(p);
    }
  }

  // Back button on champion select
  const btnBack = document.getElementById('btn-back-title');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      showScreen('title-screen');
    });
  }

  // Title buttons
  const btnAI = document.getElementById('btn-vs-ai');
  const btnLocal = document.getElementById('btn-local');
  const btnHelp = document.getElementById('btn-how-to-play');

  function launchGame(mode) {
    gs = new GameState();
    gs.mode = mode;
    hintShown = { turn1: false, turn3capture: false, chiSpell: false, atari: false, firstCapture: false, passPrompt: false };
    gameStats = { stonesPlaced: 0, captures: 0, spellsUsed: 0 };

    startChampionSelect();
  }

  // Puzzle mode button — lazy loads puzzle module on first click
  const btnPuzzle = document.getElementById('btn-puzzle');
  let puzzleModuleLoaded = false;
  if (btnPuzzle) {
    btnPuzzle.addEventListener('click', async () => {
      showScreen('puzzle-select');
      if (!puzzleModuleLoaded) {
        try {
          await import('./puzzle-ui.js');
          puzzleModuleLoaded = true;
        } catch (e) {
          console.warn('Failed to load puzzle module:', e);
        }
      }
      if (window.initPuzzleSelect) window.initPuzzleSelect();
    });
  }

  // Main button goes to champion select (AI mode)
  btnAI.addEventListener('click', () => launchGame('ai'));

  // Second button — local 2P
  btnLocal.addEventListener('click', () => launchGame('local'));

  // Challenge friend button — shares invite via KakaoTalk or Web Share API
  const btnChallenge = document.getElementById('btn-challenge-friend');
  if (btnChallenge) {
    btnChallenge.addEventListener('click', () => {
      const text = `AniGO - ${t('challengeFriendSub')}\n${t('splashTagline')}`;
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: 'AniGO', text, url }).catch(() => {});
      } else if (typeof Kakao !== 'undefined' && Kakao.isInitialized && Kakao.isInitialized()) {
        try {
          Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: 'AniGO - ' + t('challengeFriend'),
              description: t('splashTagline'),
              imageUrl: '',
              link: { mobileWebUrl: url, webUrl: url }
            },
            buttons: [
              { title: t('playVsAI'), link: { mobileWebUrl: url, webUrl: url } }
            ]
          });
        } catch (e) { console.warn('Kakao challenge share failed:', e); }
      } else {
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
          showGlobalToast(t('shareCopied'), 2000);
        }).catch(() => {});
      }
    });
  }

  // Rematch challenge button (scoring screen)
  const btnRematchChallenge = document.getElementById('btn-rematch-challenge');
  if (btnRematchChallenge) {
    btnRematchChallenge.addEventListener('click', () => {
      const text = `AniGO - ${t('challengeFriend')}\n${t('splashTagline')}`;
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: 'AniGO', text, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
          showGlobalToast(t('shareCopied'), 2000);
        }).catch(() => {});
      }
    });
  }

  // KakaoTalk share button (scoring screen)
  const btnShareKakao = document.getElementById('btn-share-kakao');
  if (btnShareKakao) {
    btnShareKakao.addEventListener('click', () => {
      const url = window.location.href;
      if (typeof Kakao !== 'undefined') {
        try {
          if (!Kakao.isInitialized()) Kakao.init('YOUR_KAKAO_APP_KEY');
          Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: 'AniGO',
              description: t('splashTagline'),
              imageUrl: '',
              link: { mobileWebUrl: url, webUrl: url }
            },
            buttons: [
              { title: t('playVsAI'), link: { mobileWebUrl: url, webUrl: url } }
            ]
          });
        } catch (e) { console.warn('Kakao share failed:', e); }
      } else if (navigator.share) {
        navigator.share({ title: 'AniGO', text: t('splashTagline'), url }).catch(() => {});
      }
    });
  }

  btnHelp.addEventListener('click', openHowToPlay);
  document.getElementById('btn-help-ingame').addEventListener('click', openHowToPlay);
  const helpModal = document.getElementById('how-to-play-modal');
  helpModal.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeHowToPlay(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeHowToPlay(); if (selectedSpellId) clearSpellSelection(); }
  });

  // Populate how-to-play content via i18n
  populateHowToPlay();

  // ── Player Profile Panel ──
  initProfilePanel();

  // Apply all text on initial load (buttons start blank because HTML has no static text)
  applyAllText();
});

// ════════════════════════════════════════════
// GAME SCREEN
// ════════════════════════════════════════════

let resizeHandler = null;
let contextMenuHandler = null;

function cleanupGame() {
  if (renderer) { renderer.destroy(); renderer = null; }
  const canvas = document.getElementById('board-canvas');
  if (canvas) {
    canvas.removeEventListener('click', onBoardClick);
    if (contextMenuHandler) canvas.removeEventListener('contextmenu', contextMenuHandler);
  }
  contextMenuHandler = null;
  document.getElementById('btn-pass').removeEventListener('click', onPass);
  if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null; }
  selectedSpellId = null;
  document.querySelectorAll('.hint-glow-dot').forEach(el => el.remove());
  dismissToast();
}

function startGame() {
  cleanupGame();
  showScreen('game-screen');

  const canvas = document.getElementById('board-canvas');
  renderer = new BoardRenderer(canvas, gs);

  canvas.addEventListener('click', onBoardClick);
  contextMenuHandler = (e) => { e.preventDefault(); if (selectedSpellId) clearSpellSelection(); };
  canvas.addEventListener('contextmenu', contextMenuHandler);
  document.getElementById('btn-pass').addEventListener('click', onPass);

  resizeHandler = () => { if (renderer) renderer.resize(); };
  window.addEventListener('resize', resizeHandler);

  // Show champion name and passive
  const champ = gs.champions[BLACK];
  if (champ) {
    const nameEl = document.getElementById('label-champion-name');
    if (nameEl) nameEl.textContent = tChampName(champ.id).toUpperCase();
    const passEl = document.getElementById('passive-display');
    if (passEl) passEl.innerHTML = `<span class="passive-tag">${tPassiveName(champ.passive.name)}</span>: ${tPassiveDesc(champ.passive.name)}`;
  }

  // ── Mobile: game log tap-to-expand ──
  const gameLog = document.querySelector('.game-log');
  if (gameLog && !gameLog._mobileLogHandler) {
    gameLog._mobileLogHandler = () => {
      if (window.innerWidth <= 768) {
        gameLog.classList.toggle('log-expanded');
      }
    };
    gameLog.addEventListener('click', gameLog._mobileLogHandler);
  }

  updateGameUI();
  Audio.turnStart();
}

function onBoardClick(e) {
  if (gs.gameOver) return;
  if (gs.mode === 'ai' && gs.currentPlayer === WHITE) return;

  const rect = renderer.canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  const grid = renderer.pixelToGrid(px, py);
  if (!grid) return;

  dismissToast();

  if (selectedSpellId) {
    const k = posKey(grid.row, grid.col);
    if (renderer.validTargets && renderer.validTargets.has(k)) {
      Audio.spellCast();
      gameStats.spellsUsed++;
      const spellId = selectedSpellId;
      const success = castSpell(gs, spellId, { row: grid.row, col: grid.col }, gs.currentPlayer);
      if (success) {
        renderer.animateSpell(grid.row, grid.col, spellId);
        gs.lastActionWasPass = false;
        clearSpellSelection();
        endPlayerTurn();
      } else if (spellId === 'warpgate' && gs._warpGateFirst) {
        // Warp Gate step 1 done — keep spell selected, update targets for step 2
        renderer.animateSpell(grid.row, grid.col, spellId);
        const targets = getValidTargets(gs, spellId, gs.currentPlayer);
        renderer.validTargets = new Set(targets.map(t => posKey(t.row, t.col)));
        updateGameUI();
      } else {
        clearSpellSelection();
        updateGameUI();
      }
    }
    return;
  }

  if (gs.isLegalMove(grid.row, grid.col, gs.currentPlayer)) {
    const success = gs.placeStone(grid.row, grid.col);
    if (success) {
      gameStats.stonesPlaced++;
      Audio.stonePlace();
      renderer.animatePlace(grid.row, grid.col);
      if (gs.capturedThisTurn.length > 0) {
        Audio.stoneCapture();
        gameStats.captures += gs.capturedThisTurn.length;
        renderer.animateCapture(gs.capturedThisTurn.map(p => ({ row: p.row, col: p.col, color: opposite(gs.currentPlayer) })));
      }
      endPlayerTurn();
    }
  }
}

function onPass() {
  if (gs.gameOver) return;
  if (gs.mode === 'ai' && gs.currentPlayer === WHITE) return;

  // Kumiho passive: offer phantom placement on pass
  const color = gs.currentPlayer;
  if (gs.champions[color] && gs.champions[color].id === 'kumiho' && !gs.foxPhantomUsed[color]) {
    // Auto-place phantom at a random empty spot for simplicity
    const empties = [];
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] === EMPTY) empties.push({ row: r, col: c });
    if (empties.length > 0) {
      const pick = empties[Math.floor(Math.random() * empties.length)];
      gs.placeFoxPhantom(pick.row, pick.col, color);
    }
  }

  gs.pass();
  if (gs.gameOver) { Audio.gameEnd(); showScoringScreen(); return; }
  updateGameUI();
  if (gs.mode === 'ai' && gs.currentPlayer === WHITE) scheduleAITurn();
}

function endPlayerTurn() {
  gs.switchTurn();
  if (gs.gameOver) { Audio.gameEnd(); showScoringScreen(); return; }
  updateGameUI();
  Audio.turnStart();
  if (gs.mode === 'ai' && gs.currentPlayer === WHITE) scheduleAITurn();
}

function scheduleAITurn() {
  const stoneCount = gs.board.flat().filter(c => c === BLACK || c === WHITE).length;
  const thinkTime = 500 + Math.min(stoneCount * 30, 600) + Math.random() * 400;
  document.getElementById('turn-indicator').textContent = t('aiThinking');
  setTimeout(() => { if (!gs.gameOver) executeAITurn(); }, thinkTime);
}

function executeAITurn() {
  const action = aiTakeTurn(gs, WHITE);
  switch (action.type) {
    case 'place': {
      const success = gs.placeStone(action.move.row, action.move.col);
      if (success) {
        Audio.stonePlace();
        renderer.animatePlace(action.move.row, action.move.col);
        if (gs.capturedThisTurn.length > 0) {
          Audio.stoneCapture();
          renderer.animateCapture(gs.capturedThisTurn.map(p => ({ row: p.row, col: p.col, color: BLACK })));
        }
        gs.switchTurn();
      } else { gs.pass(); }
      break;
    }
    case 'cast_spell': {
      Audio.spellCast();
      if (action.spell.id === 'warpgate' && action.spellTarget.first) {
        castSpell(gs, 'warpgate', action.spellTarget.first, WHITE);
        const success = castSpell(gs, 'warpgate', action.spellTarget.second, WHITE);
        if (success) { renderer.animateSpell(action.spellTarget.second.row, action.spellTarget.second.col, 'warpgate'); gs.lastActionWasPass = false; }
      } else {
        const success = castSpell(gs, action.spell.id, action.spellTarget, WHITE);
        if (success) { renderer.animateSpell(action.spellTarget.row, action.spellTarget.col, action.spell.id); gs.lastActionWasPass = false; }
      }
      gs.switchTurn();
      break;
    }
    case 'place_and_spell': {
      const placed = gs.placeStone(action.move.row, action.move.col);
      if (placed) {
        Audio.stonePlace();
        renderer.animatePlace(action.move.row, action.move.col);
        if (gs.capturedThisTurn.length > 0) {
          Audio.stoneCapture();
          renderer.animateCapture(gs.capturedThisTurn.map(p => ({ row: p.row, col: p.col, color: BLACK })));
        }
        // Warp Gate requires two steps — skip dual action for it
        if (action.spell.id === 'warpgate') { /* skip — too complex for dual action */ }
        else {
          const spellCost = gs.getSpellCost(action.spell.id, WHITE);
          if (gs.chi[WHITE] >= spellCost + DUAL_ACTION_SURCHARGE) {
            gs.chi[WHITE] -= DUAL_ACTION_SURCHARGE;
            Audio.spellCast();
            castSpell(gs, action.spell.id, action.spellTarget, WHITE);
            renderer.animateSpell(action.spellTarget.row, action.spellTarget.col, action.spell.id);
          }
        }
      }
      gs.switchTurn();
      break;
    }
    case 'pass':
    default:
      // AI Kumiho phantom on pass
      if (gs.champions[WHITE] && gs.champions[WHITE].id === 'kumiho' && !gs.foxPhantomUsed[WHITE]) {
        const empties = [];
        for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) if (gs.board[r][c] === EMPTY) empties.push({ row: r, col: c });
        if (empties.length > 0) {
          const pick = empties[Math.floor(Math.random() * empties.length)];
          gs.placeFoxPhantom(pick.row, pick.col, WHITE);
        }
      }
      gs.pass();
      break;
  }
  if (gs.gameOver) { Audio.gameEnd(); showScoringScreen(); return; }
  updateGameUI();
  Audio.turnStart();
}

// ════════════════════════════════════════════
// SPELL HAND UI
// ════════════════════════════════════════════

function selectSpell(spellId) {
  if (gs.gameOver) return;
  if (gs.mode === 'ai' && gs.currentPlayer === WHITE) return;
  if (selectedSpellId === spellId) { clearSpellSelection(); return; }
  if (!canCastSpell(gs, spellId, gs.currentPlayer)) return;

  selectedSpellId = spellId;
  const targets = getValidTargets(gs, spellId, gs.currentPlayer);
  renderer.validTargets = new Set(targets.map(t => posKey(t.row, t.col)));
  renderer.selectedSpell = spellId;
  updateGameUI();
}

function clearSpellSelection() {
  selectedSpellId = null;
  if (renderer) { renderer.validTargets = null; renderer.selectedSpell = null; }
  updateGameUI();
}

// ════════════════════════════════════════════
// UPDATE UI
// ════════════════════════════════════════════

function updateGameUI() {
  const turnEl = document.getElementById('turn-indicator');
  if (gs.mode === 'ai') {
    turnEl.textContent = gs.currentPlayer === BLACK ? t('yourTurn') : t('opponentTurn');
  } else {
    turnEl.textContent = gs.currentPlayer === BLACK ? t('blackTurn') : t('whiteTurn');
  }
  turnEl.className = `turn-pill ${gs.currentPlayer === BLACK ? 'turn-black' : 'turn-white'}`;

  const currentChi = gs.chi[gs.currentPlayer];
  const chiEl = document.getElementById('chi-display');
  chiEl.innerHTML = `<span class="chi-icon"><span class="chi-gem"></span><span class="chi-gem-shine"></span></span> <span class="chi-count">${currentChi}</span>`;
  if (prevChiValue >= 0 && currentChi !== prevChiValue) {
    chiEl.classList.remove('chi-changed');
    void chiEl.offsetWidth;
    chiEl.classList.add('chi-changed');
  }
  prevChiValue = currentChi;

  document.getElementById('turn-number').textContent = `${t('turnN')} ${gs.turnNumber + 1}`;

  const opp = opposite(gs.currentPlayer);
  document.getElementById('opp-chi').textContent = gs.chi[opp];
  document.getElementById('opp-captures').textContent = gs.captures[opp];
  document.getElementById('player-captures').textContent = gs.captures[gs.currentPlayer];

  // Champion name in sidebar
  const color = gs.currentPlayer;
  const champ = gs.champions[color];
  const nameEl = document.getElementById('label-champion-name');
  if (nameEl && champ) nameEl.textContent = tChampName(champ.id).toUpperCase();
  const passEl = document.getElementById('passive-display');
  if (passEl && champ) passEl.innerHTML = `<span class="passive-tag">${tPassiveName(champ.passive.name)}</span>: ${tPassiveDesc(champ.passive.name)}`;

  // Eye of Storm indicator
  if (gs.eyeOfStormActive[color]) {
    if (passEl) passEl.innerHTML += ' <span class="eye-active">DISCOUNT ACTIVE!</span>';
  }

  renderSpellHand();
  renderGameLog();

  const phaseEl = document.getElementById('phase-label');
  if (selectedSpellId) {
    const spell = champ ? champ.spells.find(s => s.id === selectedSpellId) : null;
    phaseEl.textContent = t('phaseTarget', { name: spell ? tSpellName(spell.id) : '' });
  } else {
    phaseEl.textContent = t('placeStone');
  }

  const isPlayerTurn = gs.mode !== 'ai' || gs.currentPlayer === BLACK;
  turnEl.classList.toggle('your-turn-pulse', isPlayerTurn);

  const promptEl = document.getElementById('action-prompt');
  if (promptEl) {
    if (isPlayerTurn && !gs.gameOver) {
      if (selectedSpellId) {
        const sp = champ ? champ.spells.find(s => s.id === selectedSpellId) : null;
        promptEl.textContent = t('actionPromptTarget', { name: sp ? tSpellName(sp.id) : '' });
      } else {
        promptEl.textContent = t('actionPromptPlace');
      }
      promptEl.classList.add('visible');
    } else {
      promptEl.classList.remove('visible');
    }
  }

  if (getGamesPlayed() === 0) setTimeout(() => checkContextualHints(), 300);
}

function renderSpellHand() {
  const container = document.getElementById('spell-hand');
  container.innerHTML = '';
  const color = gs.currentPlayer;

  if (gs.mode === 'ai' && color === WHITE) {
    container.innerHTML = `<div class="spell-hand-empty">${t('aiIsThinking')}</div>`;
    return;
  }

  const champ = gs.champions[color];
  if (!champ) { container.innerHTML = `<div class="spell-hand-empty">${t('noChampion')}</div>`; return; }

  for (const spell of champ.spells) {
    const uses = gs.spellUses[color][spell.id] || 0;
    const cost = gs.getSpellCost(spell.id, color);
    const canCast = uses > 0 && canCastSpell(gs, spell.id, color);
    const isSelected = selectedSpellId === spell.id;

    const card = document.createElement('div');
    card.className = `spell-card tcg-card spell-cat-${spell.category}`;
    if (!canCast) card.classList.add('spell-disabled');
    if (isSelected) card.classList.add('spell-selected');
    if (uses === 0) card.classList.add('spell-exhausted');

    card.innerHTML = `
      <div class="tcg-card-inner">
        <div class="tcg-card-accent"></div>
        <div class="tcg-card-art spell-art-${spell.id}"></div>
        <div class="tcg-card-name-banner">
          <div class="card-name">${tSpellName(spell.id)}</div>
        </div>
        <div class="tcg-card-text"></div>
      </div>
      <div class="tcg-chi-badge"><span>${cost}</span></div>
      <div class="spell-uses-badge">${uses}/${spell.uses}</div>
      ${spell.hidden ? '<div class="spell-card-hidden-tag">' + t('catSecret') + '</div>' : ''}
      <div class="spell-card-tooltip">
        <div class="tooltip-name">${tSpellName(spell.id)}</div>
        <div class="tooltip-desc">${tSpellDesc(spell.id)}</div>
        <div class="tooltip-uses">${uses}/${spell.uses}</div>
      </div>
    `;

    card.addEventListener('click', (e) => { e.stopPropagation(); selectSpell(spell.id); });
    card.addEventListener('mouseenter', () => { if (!card.classList.contains('spell-disabled')) Audio.cardHover(); });
    container.appendChild(card);
  }
}

function renderGameLog() {
  const logEl = document.getElementById('game-log-text');
  const recent = gs.log.slice(-8);
  logEl.textContent = recent.map(e => e.msg).join(' | ');
  logEl.scrollLeft = logEl.scrollWidth;
}

// ════════════════════════════════════════════
// SCORING SCREEN
// ════════════════════════════════════════════

function showScoringScreen() {
  cleanupGame();
  dismissToast();
  incrementGamesPlayed();
  showScreen('scoring-screen');

  const scoringCanvas = document.getElementById('scoring-canvas');
  const scoringRenderer = new BoardRenderer(scoringCanvas, gs);
  scoringRenderer.showTerritory = true;

  const scores = gs.scores;
  document.getElementById('score-black').textContent = scores.blackScore;
  document.getElementById('score-white').textContent = scores.whiteScore;
  document.getElementById('score-black-detail').textContent = `${scores.blackStones} ${t('stones')} + ${scores.blackTerritory} ${t('territory')}`;
  document.getElementById('score-white-detail').textContent = `${scores.whiteStones} ${t('stones')} + ${scores.whiteTerritory} ${t('territory')} + ${KOMI} ${t('komi')}`;
  document.getElementById('winner-text').textContent = `${tColor(scores.winner)} ${t('wins')}`;

  // Record game in player auth stats
  const playerColor = gs.mode === 'ai' ? BLACK : BLACK; // player is always Black in AI mode
  const playerWon = scores.winner === playerColor;
  const playerChampion = gs.champions[playerColor] ? gs.champions[playerColor].id : null;
  const updatedPlayer = recordGame({
    won: playerWon,
    championId: playerChampion,
    captures: gameStats.captures,
    stonesPlaced: gameStats.stonesPlaced,
    spellsUsed: gameStats.spellsUsed
  });

  const learningCard = document.getElementById('post-game-learning');
  if (learningCard) {
    learningCard.classList.remove('hidden');
    const tip = gameStats.spellsUsed === 0 ? t('tipUseSpells') : t('tipKeepPlaying');
    const pStats = updatedPlayer.stats;
    const winRate = getWinRate();
    learningCard.innerHTML = `
      <div class="learning-card-title">${t('whatYouLearned')}</div>
      <div class="learning-card-stats">
        ${t('youPlacedStones', { stones: String(gameStats.stonesPlaced), captures: String(gameStats.captures), spells: String(gameStats.spellsUsed), pluralSpells: gameStats.spellsUsed !== 1 ? 's' : '' })}
      </div>
      <div class="learning-card-tip"><strong>${t('tipForNextGame')}</strong> ${tip}</div>
      <div class="learning-card-cumulative">
        통산 전적: <strong>${pStats.wins}승 ${pStats.losses}패</strong> (승률 <strong>${winRate}</strong>)
        &middot; 총 ${pStats.gamesPlayed}국
      </div>
    `;
  }

  document.getElementById('btn-play-again').textContent = t('playAgain');
  document.getElementById('btn-play-again').onclick = () => {
    scoringRenderer.destroy();
    showScreen('title-screen');
    updateProfilePanel();
    applyAllText();
  };

  // Share button
  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) {
    shareBtn.onclick = () => shareResult(scores);
  }
}

// ── Share Result ──
function shareResult(scores) {
  const winner = tColor(scores.winner);
  const text = `${winner} ${t('wins')}! ` +
    `Black ${scores.blackScore} vs White ${scores.whiteScore}\n` +
    `AniGO - ${t('tagline') || '인간의 직관이 반격하는 바둑 게임'}`;
  const url = window.location.href;

  // Try Web Share API first (works on most mobile browsers)
  if (navigator.share) {
    navigator.share({ title: 'AniGO', text, url }).catch(() => {});
    return;
  }

  // Fallback: KakaoTalk sharing
  if (typeof Kakao !== 'undefined') {
    try {
      if (!Kakao.isInitialized()) {
        // Replace YOUR_KAKAO_APP_KEY with your actual Kakao app key
        Kakao.init('YOUR_KAKAO_APP_KEY');
      }
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: 'AniGO',
          description: text,
          imageUrl: '', // Add a hosted image URL for rich preview
          link: { mobileWebUrl: url, webUrl: url }
        },
        buttons: [
          { title: '게임 하기', link: { mobileWebUrl: url, webUrl: url } }
        ]
      });
      return;
    } catch (e) {
      console.warn('Kakao share failed:', e);
    }
  }

  // Final fallback: copy to clipboard
  navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
    const label = document.getElementById('share-label');
    if (label) {
      const orig = label.textContent;
      label.textContent = '복사됨!';
      setTimeout(() => { label.textContent = orig; }, 2000);
    }
  }).catch(() => {});
}
