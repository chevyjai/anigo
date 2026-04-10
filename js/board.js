// ============================================
// AniGO — Canvas board rendering, stone/spell animations
// Visual polish: premium board, physical stones, magical effects
// ============================================

import {
  BOARD_SIZE, EMPTY, BLACK, WHITE, VOID, WALL, HOSHI,
  posKey, parseKey
} from './data.js';

const ANIM_PLACE_DURATION = 280;
const ANIM_CAPTURE_DURATION = 400;
const ANIM_SPELL_DURATION = 600;
const ANIM_RIPPLE_DURATION = 500;

export class BoardRenderer {
  constructor(canvas, gameState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gs = gameState;
    this.dpr = window.devicePixelRatio || 1;

    // Board sizing
    this.boardPixels = 0;
    this.cellSize = 0;
    this.padding = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    // Interaction state
    this.hoverRow = -1;
    this.hoverCol = -1;
    this.validTargets = null;
    this.selectedSpell = null;
    this.showTerritory = false;
    this.hintMove = null; // { row, col } — beginner hint

    // Animation state
    this.placeAnims = [];
    this.captureAnims = [];
    this.spellAnims = [];
    this.rippleAnims = [];       // Board ripple on stone placement
    this.particleAnims = [];     // Particle bursts on capture
    this.screenShake = { x: 0, y: 0, startTime: 0, duration: 0, intensity: 0 };
    this.ambientParticles = [];  // Ambient floating particles
    this.animFrame = null;

    // Noise texture (generated once)
    this._noiseCanvas = null;

    this.resize();
    this._generateNoise();
    this._initAmbientParticles();
    this._bindEvents();
    this._startLoop();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const size = Math.min(parent.clientWidth, parent.clientHeight, 600);
    this.boardPixels = size;

    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.padding = size * 0.06;
    const innerSize = size - this.padding * 2;
    this.cellSize = innerSize / (BOARD_SIZE - 1);
    this.offsetX = this.padding;
    this.offsetY = this.padding;
  }

  gridToPixel(row, col) {
    return {
      x: this.offsetX + col * this.cellSize,
      y: this.offsetY + row * this.cellSize
    };
  }

  pixelToGrid(px, py) {
    const col = Math.round((px - this.offsetX) / this.cellSize);
    const row = Math.round((py - this.offsetY) / this.cellSize);
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
    return { row, col };
  }

  // Generate a cool-toned noise texture for stone/slate grain
  _generateNoise() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const nctx = c.getContext('2d');
    const imgData = nctx.createImageData(size, size);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.random() * 200;
      imgData.data[i] = v * 0.7;       // Less red — cool tone
      imgData.data[i + 1] = v * 0.8;   // Slightly more green
      imgData.data[i + 2] = v;         // Full blue channel
      imgData.data[i + 3] = 10;        // Very subtle
    }
    nctx.putImageData(imgData, 0, 0);
    this._noiseCanvas = c;
  }

  // Initialize ambient floating particles (alternating cyan and gold)
  _initAmbientParticles() {
    this.ambientParticles = [];
    for (let i = 0; i < 15; i++) {
      this.ambientParticles.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 2,
        speed: 0.0002 + Math.random() * 0.0004,
        drift: Math.random() * Math.PI * 2,
        alpha: 0.1 + Math.random() * 0.15,
        isCyan: i % 2 === 0  // Alternate cyan and gold
      });
    }
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const grid = this.pixelToGrid(px, py);
      if (grid) {
        this.hoverRow = grid.row;
        this.hoverCol = grid.col;
      } else {
        this.hoverRow = -1;
        this.hoverCol = -1;
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverRow = -1;
      this.hoverCol = -1;
    });
  }

  _startLoop() {
    const loop = () => {
      this.render();
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  // ── Trigger placement animation + ripple ──
  animatePlace(row, col) {
    this.placeAnims.push({ row, col, startTime: performance.now() });
    this.rippleAnims.push({ row, col, startTime: performance.now() });
  }

  // ── Trigger capture animation + particle burst ──
  animateCapture(positions) {
    const now = performance.now();
    for (const { row, col, color } of positions) {
      this.captureAnims.push({ row, col, color, startTime: now });
      // Create particle burst
      const particles = [];
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 0.8 + Math.random() * 1.2;
        particles.push({ angle, speed, size: 1.5 + Math.random() * 2.5, alpha: 1 });
      }
      this.particleAnims.push({ row, col, color, startTime: now, particles, duration: 500 });
    }
    // Screen shake for mass captures
    if (positions.length >= 3) {
      this.screenShake = { startTime: now, duration: 200, intensity: 2 + positions.length * 0.5 };
    }
  }

  // ── Trigger spell effect animation ──
  animateSpell(row, col, type) {
    const now = performance.now();
    this.spellAnims.push({ row, col, type, startTime: now });
    // Screen shake for big spells
    if (type === 'wildfire') {
      this.screenShake = { startTime: now, duration: 300, intensity: 4 };
    } else if (type === 'shatter') {
      this.screenShake = { startTime: now, duration: 150, intensity: 2 };
    }
  }

  // ── Main render ──
  render() {
    const ctx = this.ctx;
    const now = performance.now();

    // Apply screen shake
    ctx.save();
    if (this.screenShake.duration > 0) {
      const elapsed = now - this.screenShake.startTime;
      if (elapsed < this.screenShake.duration) {
        const progress = elapsed / this.screenShake.duration;
        const decay = 1 - progress;
        const intensity = this.screenShake.intensity * decay;
        const sx = (Math.random() - 0.5) * 2 * intensity;
        const sy = (Math.random() - 0.5) * 2 * intensity;
        ctx.translate(sx, sy);
      } else {
        this.screenShake.duration = 0;
      }
    }

    // 1. Board background — dark slate/stone base with radial gradient
    const boardGrad = ctx.createRadialGradient(
      this.boardPixels * 0.4, this.boardPixels * 0.35, 0,
      this.boardPixels * 0.5, this.boardPixels * 0.5, this.boardPixels * 0.7
    );
    boardGrad.addColorStop(0, '#1e2235');
    boardGrad.addColorStop(0.5, '#171b2a');
    boardGrad.addColorStop(1, '#12141f');
    ctx.fillStyle = boardGrad;
    ctx.fillRect(0, 0, this.boardPixels, this.boardPixels);

    // Subtle stone/slate texture lines (cool-toned, replacing wood grain)
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < this.boardPixels; i += 8) {
      const offset = Math.sin(i * 0.015) * 2;
      ctx.strokeStyle = i % 24 === 0 ? '#4a5568' : '#2d3748';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(0, i + offset);
      ctx.lineTo(this.boardPixels, i + offset + Math.sin(i * 0.008) * 1.5);
      ctx.stroke();
    }
    // Vertical cracks for stone feel
    for (let i = 0; i < this.boardPixels; i += 12) {
      const offset = Math.sin(i * 0.01) * 2;
      ctx.strokeStyle = '#3a4556';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(i + offset, 0);
      ctx.lineTo(i + offset + Math.sin(i * 0.012) * 1, this.boardPixels);
      ctx.stroke();
    }
    ctx.restore();

    // Mystical rune pattern in center (faint arcane circle)
    this._drawRunePattern(ctx);

    // Noise texture overlay
    if (this._noiseCanvas) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      const pattern = ctx.createPattern(this._noiseCanvas, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, this.boardPixels, this.boardPixels);
      ctx.restore();
    }

    // Edge vignette — gives depth around board edges
    const vignetteGrad = ctx.createRadialGradient(
      this.boardPixels / 2, this.boardPixels / 2, this.boardPixels * 0.25,
      this.boardPixels / 2, this.boardPixels / 2, this.boardPixels * 0.55
    );
    vignetteGrad.addColorStop(0, 'transparent');
    vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, this.boardPixels, this.boardPixels);

    // 2. Grid lines — glowing cyan, thicker at edges
    for (let i = 0; i < BOARD_SIZE; i++) {
      const isEdge = i === 0 || i === BOARD_SIZE - 1;
      const lineWidth = isEdge ? 1.5 : 0.8;
      const alpha = isEdge ? 0.35 : 0.25;
      ctx.save();
      ctx.shadowColor = '#00d4d4';
      ctx.shadowBlur = 2;
      ctx.strokeStyle = `rgba(0,212,212,${alpha})`;
      ctx.lineWidth = lineWidth;

      const { x: x0, y: y0 } = this.gridToPixel(i, 0);
      const { x: x1, y: y1 } = this.gridToPixel(i, BOARD_SIZE - 1);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      const { x: cx0, y: cy0 } = this.gridToPixel(0, i);
      const { x: cx1, y: cy1 } = this.gridToPixel(BOARD_SIZE - 1, i);
      ctx.beginPath();
      ctx.moveTo(cx0, cy0);
      ctx.lineTo(cx1, cy1);
      ctx.stroke();
      ctx.restore();
    }

    // Grid intersection dots — tiny cyan dots at each intersection
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const { x, y } = this.gridToPixel(r, c);
        ctx.fillStyle = 'rgba(0,212,212,0.1)';
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Star points (hoshi) — with cyan glow
    for (const [r, c] of HOSHI) {
      const { x, y } = this.gridToPixel(r, c);
      ctx.save();
      ctx.shadowColor = 'rgba(0,212,212,0.4)';
      ctx.shadowBlur = 5;
      ctx.fillStyle = 'rgba(0,212,212,0.55)';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw void cells and walls
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.gs.board[r][c] === VOID) {
          this._drawVoid(ctx, r, c, now);
        } else if (this.gs.board[r][c] === WALL) {
          this._drawWall(ctx, r, c, now);
        }
      }
    }

    // 4b. Draw sanctuary zones
    if (this.gs.sanctuaries) {
      for (const sanc of this.gs.sanctuaries) {
        if (sanc.turnsRemaining > 0) this._drawSanctuary(ctx, sanc, now);
      }
    }

    // 4c. Draw warp gates
    if (this.gs.warpGates) {
      for (const gate of this.gs.warpGates) this._drawWarpGate(ctx, gate, now);
    }

    // 4d. Draw smoldering stones
    if (this.gs.smoldering) {
      for (const [k, sm] of this.gs.smoldering) {
        const { row, col } = parseKey(k);
        if (this.gs.mode === 'local' || sm.owner === BLACK) this._drawSmolder(ctx, row, col, sm, now);
      }
    }

    // 4e. Draw phased stones
    if (this.gs.phased) {
      for (const [k, ph] of this.gs.phased) {
        const { row, col } = parseKey(k);
        if (ph.hiddenTurns <= 0 || this.gs.mode === 'local' || ph.owner === BLACK) this._drawPhaseGlow(ctx, row, col, now);
      }
    }

    // 5. Spell targeting highlights (pulsing cyan)
    if (this.validTargets) {
      for (const k of this.validTargets) {
        const { row, col } = parseKey(k);
        const { x, y } = this.gridToPixel(row, col);
        const radius = this.cellSize * 0.35;
        const pulse = 0.12 + Math.sin(now * 0.004) * 0.04;
        ctx.fillStyle = `rgba(0,212,212,${pulse})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(0,212,212,${pulse * 2.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // 6. Spell effect animations
    this.spellAnims = this.spellAnims.filter(a => {
      const elapsed = now - a.startTime;
      if (elapsed > ANIM_SPELL_DURATION) return false;
      const progress = elapsed / ANIM_SPELL_DURATION;
      this._drawSpellEffect(ctx, a.row, a.col, a.type, progress, now);
      return true;
    });

    // 7. Ripple animations
    this.rippleAnims = this.rippleAnims.filter(a => {
      const elapsed = now - a.startTime;
      if (elapsed > ANIM_RIPPLE_DURATION) return false;
      const progress = elapsed / ANIM_RIPPLE_DURATION;
      this._drawRipple(ctx, a.row, a.col, progress);
      return true;
    });

    // 8. Draw stones
    const capturingKeys = new Set(this.captureAnims.map(a => posKey(a.row, a.col)));
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = this.gs.board[r][c];
        if ((cell === BLACK || cell === WHITE) && !capturingKeys.has(posKey(r, c))) {
          const placeAnim = this.placeAnims.find(a => a.row === r && a.col === c);
          let scale = 1;
          if (placeAnim) {
            const elapsed = now - placeAnim.startTime;
            if (elapsed < ANIM_PLACE_DURATION) {
              const t = elapsed / ANIM_PLACE_DURATION;
              // Elastic overshoot: 0 -> 1.08 -> 0.97 -> 1.0
              if (t < 0.45) {
                scale = (t / 0.45) * 1.08;
              } else if (t < 0.7) {
                scale = 1.08 - ((t - 0.45) / 0.25) * 0.11;
              } else {
                scale = 0.97 + ((t - 0.7) / 0.3) * 0.03;
              }
            }
          }
          this._drawStone(ctx, r, c, cell, scale);

          // Fortification glow
          const k = posKey(r, c);
          if (this.gs.fortified.has(k)) {
            const fort = this.gs.fortified.get(k);
            if (this.gs.mode === 'local' || fort.owner === BLACK) {
              this._drawFortGlow(ctx, r, c, now);
            }
          }
        }
      }
    }

    this.placeAnims = this.placeAnims.filter(a => now - a.startTime < ANIM_PLACE_DURATION);

    // 9. Capture animations (accelerating shrink + fade)
    this.captureAnims = this.captureAnims.filter(a => {
      const elapsed = now - a.startTime;
      if (elapsed > ANIM_CAPTURE_DURATION) return false;
      const progress = elapsed / ANIM_CAPTURE_DURATION;
      const scale = 1 - progress * progress;
      const alpha = 1 - progress;
      ctx.globalAlpha = alpha;
      this._drawStone(ctx, a.row, a.col, a.color, scale);
      ctx.globalAlpha = 1;
      return true;
    });

    // 10. Particle burst animations
    this.particleAnims = this.particleAnims.filter(a => {
      const elapsed = now - a.startTime;
      if (elapsed > a.duration) return false;
      const progress = elapsed / a.duration;
      this._drawParticleBurst(ctx, a, progress);
      return true;
    });

    // 11. Last-move indicator — animated gentle pulse
    if (this.gs.lastMove) {
      const { x, y } = this.gridToPixel(this.gs.lastMove.row, this.gs.lastMove.col);
      const pulse = 0.38 + Math.sin(now * 0.005) * 0.06;
      const radius = this.cellSize * pulse;
      const alpha = 0.6 + Math.sin(now * 0.005) * 0.2;

      ctx.save();
      ctx.strokeStyle = `rgba(0,212,212,${alpha})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      // Outer glow ring
      ctx.strokeStyle = `rgba(0,212,212,${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 11b. Beginner hint indicator
    if (this.hintMove && !this.validTargets && !this.gs.gameOver) {
      const { x: hx, y: hy } = this.gridToPixel(this.hintMove.row, this.hintMove.col);
      const hintRadius = this.cellSize * 0.25;
      const time = now / 1000;
      const hPulse = 0.12 + Math.sin(time * 3) * 0.06;
      ctx.fillStyle = `rgba(0,212,212,${hPulse})`;
      ctx.beginPath();
      ctx.arc(hx, hy, hintRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 12. Hover indicator
    if (this.hoverRow >= 0 && this.hoverCol >= 0 && !this.gs.gameOver) {
      const k = posKey(this.hoverRow, this.hoverCol);

      if (this.validTargets) {
        // Spell targeting mode — animated rotating reticle
        if (this.validTargets.has(k)) {
          const { x, y } = this.gridToPixel(this.hoverRow, this.hoverCol);
          const radius = this.cellSize * 0.35;
          const rot = now * 0.003;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rot);
          ctx.strokeStyle = 'rgba(0,212,212,0.8)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, radius, (Math.PI / 2) * i + 0.15, (Math.PI / 2) * (i + 1) - 0.15);
            ctx.stroke();
          }
          ctx.restore();
          // Center dot
          ctx.fillStyle = 'rgba(0,212,212,0.6)';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Stone placement — ghostly stone preview with pulsing ring
        if (this.gs.isLegalMove(this.hoverRow, this.hoverCol, this.gs.currentPlayer)) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          this._drawStone(ctx, this.hoverRow, this.hoverCol, this.gs.currentPlayer, 0.95);
          ctx.globalAlpha = 1;
          // Subtle pulsing ring around preview
          const { x, y } = this.gridToPixel(this.hoverRow, this.hoverCol);
          const pAlpha = 0.15 + Math.sin(now * 0.006) * 0.08;
          ctx.strokeStyle = `rgba(0,212,212,${pAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, this.cellSize * 0.48, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 13. Territory markers (during scoring — pulsing fill)
    if (this.showTerritory && this.gs.scores) {
      const tMap = this.gs.scores.territoryMap;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (tMap[r][c] === BLACK || tMap[r][c] === WHITE) {
            this._drawTerritoryMarker(ctx, r, c, tMap[r][c], now);
          }
        }
      }
    }

    // 14. Snare indicators (animated dashes)
    for (const [k, snare] of this.gs.snares) {
      const { row, col } = parseKey(k);
      if (this.gs.mode === 'local' || snare.owner === BLACK) {
        this._drawSnareIndicator(ctx, row, col, snare.owner, now);
      }
    }

    // 15. Phantom indicators (wavering)
    for (const [k, phantom] of this.gs.phantoms) {
      const { row, col } = parseKey(k);
      if (this.gs.mode === 'local' || phantom.owner === BLACK) {
        this._drawPhantomIndicator(ctx, row, col, now);
      }
    }

    // 16. Ambient particles (floating golden motes)
    this._drawAmbientParticles(ctx, now);

    ctx.restore(); // End screen shake transform
  }

  // ── Draw a single stone — premium with specular highlight ──
  _drawStone(ctx, row, col, color, scale) {
    const { x, y } = this.gridToPixel(row, col);
    const baseRadius = this.cellSize * 0.42;
    const radius = baseRadius * scale;
    if (radius <= 0) return;

    ctx.save();

    // Drop shadow — deeper for "floating above board" feel
    ctx.shadowColor = color === BLACK ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 4;

    if (color === BLACK) {
      const grad = ctx.createRadialGradient(
        x - radius * 0.35, y - radius * 0.35, radius * 0.05,
        x + radius * 0.1, y + radius * 0.1, radius
      );
      grad.addColorStop(0, '#35354a');
      grad.addColorStop(0.4, '#1e1e2a');
      grad.addColorStop(0.85, '#0d0d14');
      grad.addColorStop(1, '#080810');
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createRadialGradient(
        x - radius * 0.35, y - radius * 0.35, radius * 0.05,
        x + radius * 0.1, y + radius * 0.1, radius
      );
      grad.addColorStop(0, '#fffff8');
      grad.addColorStop(0.3, '#faf4e0');
      grad.addColorStop(0.7, '#f0ead6');
      grad.addColorStop(1, '#e0d8c0');
      ctx.fillStyle = grad;
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Specular highlight (top-left bright spot)
    const specGrad = ctx.createRadialGradient(
      x - radius * 0.3, y - radius * 0.35, 0,
      x - radius * 0.3, y - radius * 0.35, radius * 0.5
    );
    if (color === BLACK) {
      specGrad.addColorStop(0, 'rgba(100,220,190,0.3)');
      specGrad.addColorStop(0.5, 'rgba(45,212,168,0.12)');
      specGrad.addColorStop(1, 'transparent');
    } else {
      specGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
      specGrad.addColorStop(0.3, 'rgba(240,248,255,0.3)');
      specGrad.addColorStop(0.6, 'rgba(255,255,255,0.1)');
      specGrad.addColorStop(1, 'transparent');
    }
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Edge rim light (subtle bottom-right for 3D)
    if (color === BLACK) {
      const rimGrad = ctx.createRadialGradient(
        x + radius * 0.4, y + radius * 0.4, 0,
        x, y, radius
      );
      rimGrad.addColorStop(0, 'rgba(45,212,168,0.22)');
      rimGrad.addColorStop(0.6, 'transparent');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // White stone — cool-white outer glow (pearlescent)
      ctx.save();
      ctx.shadowColor = 'rgba(220,240,255,0.2)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'rgba(220,240,255,0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // ── Board ripple effect on stone placement ──
  _drawRipple(ctx, row, col, progress) {
    const { x, y } = this.gridToPixel(row, col);
    const maxRadius = this.cellSize * 1.8;
    const radius = maxRadius * progress;
    const alpha = 0.2 * (1 - progress);

    ctx.save();
    ctx.strokeStyle = `rgba(0,212,212,${alpha})`;
    ctx.lineWidth = 1.5 * (1 - progress);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Second delayed ripple ring
    if (progress > 0.2) {
      const p2 = (progress - 0.2) / 0.8;
      const r2 = maxRadius * 0.7 * p2;
      const a2 = 0.12 * (1 - p2);
      ctx.strokeStyle = `rgba(0,212,212,${a2})`;
      ctx.lineWidth = 1 * (1 - p2);
      ctx.beginPath();
      ctx.arc(x, y, r2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Particle burst on capture ──
  _drawParticleBurst(ctx, anim, progress) {
    const { x, y } = this.gridToPixel(anim.row, anim.col);
    const baseColor = anim.color === BLACK ? [30, 40, 80] : [240, 234, 214];

    ctx.save();
    for (const p of anim.particles) {
      const dist = this.cellSize * p.speed * progress * 2;
      const px = x + Math.cos(p.angle) * dist;
      const py = y + Math.sin(p.angle) * dist - progress * 10;
      const alpha = (1 - progress * progress) * p.alpha;
      const size = p.size * (1 - progress * 0.6);

      ctx.fillStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Ambient floating particles (cyan + gold mix) ──
  _drawAmbientParticles(ctx, now) {
    ctx.save();
    for (const p of this.ambientParticles) {
      p.y -= p.speed;
      p.x += Math.sin(now * 0.001 + p.drift) * 0.0002;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      const px = p.x * this.boardPixels;
      const py = p.y * this.boardPixels;
      const flicker = p.alpha + Math.sin(now * 0.002 + p.drift) * 0.05;

      if (p.isCyan) {
        ctx.fillStyle = `rgba(0,212,212,${Math.max(0, flicker)})`;
      } else {
        ctx.fillStyle = `rgba(212,160,23,${Math.max(0, flicker)})`;
      }
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Mystical rune pattern in board center ──
  _drawRunePattern(ctx) {
    const cx = this.boardPixels / 2;
    const cy = this.boardPixels / 2;
    const outerR = this.boardPixels * 0.28;
    const innerR = this.boardPixels * 0.18;

    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#4a90b0';
    ctx.lineWidth = 0.8;

    // Outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.stroke();

    // Arcane marks — small arcs and lines around the circle
    const numMarks = 12;
    for (let i = 0; i < numMarks; i++) {
      const angle = (Math.PI * 2 * i) / numMarks;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      // Radial lines connecting circles
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Small arcs between radial lines (rune-like marks)
      if (i % 3 === 0) {
        const midR = (innerR + outerR) / 2;
        const arcAngle = angle + Math.PI / numMarks;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(arcAngle) * midR,
          cy + Math.sin(arcAngle) * midR,
          outerR * 0.06, 0, Math.PI * 1.5
        );
        ctx.stroke();
      }
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#4a90b0';
    ctx.fill();

    ctx.restore();
  }

  // ── Draw void cell — dramatic starburst crack (hole in the board) ──
  _drawVoid(ctx, row, col, now) {
    const { x, y } = this.gridToPixel(row, col);
    const s = this.cellSize * 0.4;
    const pulse = 0.8 + Math.sin(now * 0.003) * 0.15;

    ctx.save();

    // Ambient purple glow on surrounding area
    const ambientGrad = ctx.createRadialGradient(x, y, 0, x, y, this.cellSize * 1.2);
    ambientGrad.addColorStop(0, `rgba(107,33,168,${0.08 * pulse})`);
    ambientGrad.addColorStop(0.5, `rgba(107,33,168,${0.04 * pulse})`);
    ambientGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = ambientGrad;
    ctx.beginPath();
    ctx.arc(x, y, this.cellSize * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Dark hole center — looks like the board cracked open
    const holeGrad = ctx.createRadialGradient(x, y, 0, x, y, s * 0.8);
    holeGrad.addColorStop(0, 'rgba(5,0,15,0.9)');
    holeGrad.addColorStop(0.5, 'rgba(30,5,60,0.6)');
    holeGrad.addColorStop(1, 'rgba(107,33,168,0.2)');
    ctx.fillStyle = holeGrad;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Starburst crack pattern — 10 jagged lines radiating from center
    const numRays = 10;
    const slowRot = now * 0.0003; // Very slow rotation
    ctx.translate(x, y);
    ctx.rotate(slowRot);
    for (let i = 0; i < numRays; i++) {
      const angle = (Math.PI * 2 * i) / numRays;
      const length = s * (0.7 + Math.sin(now * 0.002 + i * 1.3) * 0.3);
      const midJag = s * 0.3;
      const jagAngle = angle + (Math.sin(i * 2.7) * 0.3);

      ctx.strokeStyle = `rgba(107,33,168,${0.5 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Jagged midpoint
      ctx.lineTo(
        Math.cos(jagAngle) * midJag + Math.sin(i * 1.7) * 2,
        Math.sin(jagAngle) * midJag + Math.cos(i * 2.1) * 2
      );
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.stroke();
    }
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Inner glow — purple radial from center
    const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, s);
    innerGrad.addColorStop(0, `rgba(168,85,247,${0.25 * pulse})`);
    innerGrad.addColorStop(0.4, `rgba(107,33,168,${0.12 * pulse})`);
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ── Draw territory marker — pulsing fill ──
  _drawTerritoryMarker(ctx, row, col, color, now) {
    const { x, y } = this.gridToPixel(row, col);
    const s = this.cellSize * 0.15;
    const pulse = 0.45 + Math.sin(now * 0.003 + row * 0.5 + col * 0.3) * 0.15;

    if (color === BLACK) {
      ctx.fillStyle = `rgba(45,212,168,${pulse})`;
    } else {
      ctx.fillStyle = `rgba(240,234,214,${pulse})`;
    }
    ctx.fillRect(x - s, y - s, s * 2, s * 2);
  }

  // ── Draw fortification glow — with outer glow ring ──
  _drawFortGlow(ctx, row, col, now) {
    const { x, y } = this.gridToPixel(row, col);
    const radius = this.cellSize * 0.48;
    const time = now / 1000;
    const pulse = 0.4 + Math.sin(time * 2) * 0.15;

    ctx.save();
    const glowGrad = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.2);
    glowGrad.addColorStop(0, `rgba(212,160,23,${pulse * 0.3})`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(212,160,23,${pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Draw snare indicator — animated dashes ──
  _drawSnareIndicator(ctx, row, col, owner, now) {
    const { x, y } = this.gridToPixel(row, col);
    const s = this.cellSize * 0.2;
    const offset = (now * 0.01) % 12;

    ctx.strokeStyle = 'rgba(217,119,6,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = -offset;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }

  // ── Draw phantom indicator — wavering ──
  _drawPhantomIndicator(ctx, row, col, now) {
    const { x, y } = this.gridToPixel(row, col);
    const wave = Math.sin(now * 0.005 + col) * 2;

    ctx.save();
    ctx.fillStyle = `rgba(139,92,246,${0.5 + Math.sin(now * 0.003) * 0.15})`;
    ctx.font = `${this.cellSize * 0.25}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', x + wave * 0.3, y);
    ctx.restore();
  }

  // ── Draw spell effect animation — with anticipation + payoff ──
  _drawSpellEffect(ctx, row, col, type, progress, now) {
    const { x, y } = this.gridToPixel(row, col);

    switch (type) {
      case 'wildfire': {
        const maxRadius = this.cellSize * 2.5;
        if (progress < 0.3) {
          // Anticipation: gathering energy — contracting ring + center glow
          const p = progress / 0.3;
          const gatherR = maxRadius * 0.5 * (1 - p);
          const alpha = 0.3 * p;
          ctx.strokeStyle = `rgba(220,38,38,${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, gatherR, 0, Math.PI * 2);
          ctx.stroke();
          const cGrad = ctx.createRadialGradient(x, y, 0, x, y, this.cellSize * 0.5 * p);
          cGrad.addColorStop(0, `rgba(255,100,0,${0.4 * p})`);
          cGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(x, y, this.cellSize * 0.5 * p, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Payoff: blast outward
          const p = (progress - 0.3) / 0.7;
          const radius = maxRadius * p;
          const alpha = 0.5 * (1 - p);
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, `rgba(255,80,0,${alpha})`);
          grad.addColorStop(0.3, `rgba(220,38,38,${alpha * 0.8})`);
          grad.addColorStop(0.6, `rgba(217,119,6,${alpha * 0.5})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          // Ember particles
          const embers = 12;
          for (let i = 0; i < embers; i++) {
            const angle = (Math.PI * 2 * i) / embers + p * 1.5;
            const dist = radius * (0.3 + Math.random() * 0.7);
            const ex = x + Math.cos(angle) * dist;
            const ey = y + Math.sin(angle) * dist;
            ctx.fillStyle = `rgba(255,160,0,${alpha * (0.5 + Math.random() * 0.5)})`;
            ctx.beginPath();
            ctx.arc(ex, ey, 1.5 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case 'shatter': {
        // Impact flash + scattering shards
        if (progress < 0.2) {
          const p = progress / 0.2;
          ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - p)})`;
          ctx.beginPath();
          ctx.arc(x, y, this.cellSize * 0.5 * (1 + p), 0, Math.PI * 2);
          ctx.fill();
        }
        const p2 = Math.max(0, (progress - 0.15) / 0.85);
        const count = 10;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + p2 * 2;
          const dist = this.cellSize * p2 * 1.8;
          const px = x + Math.cos(angle) * dist;
          const py = y + Math.sin(angle) * dist - p2 * 8;
          const size = this.cellSize * 0.1 * (1 - p2);
          const alpha = 1 - p2;
          ctx.fillStyle = i % 2 === 0
            ? `rgba(220,38,38,${alpha})`
            : `rgba(255,120,50,${alpha})`;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle + p2 * 4);
          ctx.fillRect(-size, -size * 0.5, size * 2, size);
          ctx.restore();
        }
        break;
      }
      case 'voidrift': {
        // Dark purple vortex collapse
        const maxR = this.cellSize * 0.8;
        if (progress < 0.4) {
          // Vortex opens with spinning arcs
          const p = progress / 0.4;
          const radius = maxR * p;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(now * 0.008);
          for (let i = 0; i < 4; i++) {
            const sAngle = (Math.PI * 2 * i) / 4;
            ctx.strokeStyle = `rgba(168,85,247,${0.6 * p})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.5, sAngle, sAngle + Math.PI * 0.4);
            ctx.stroke();
          }
          ctx.restore();
          // Center darkness
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, `rgba(20,0,40,${0.7 * p})`);
          grad.addColorStop(0.6, `rgba(168,85,247,${0.3 * p})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Collapse inward
          const p = (progress - 0.4) / 0.6;
          const radius = maxR * (1 - p * p);
          const alpha = 0.7 * (1 - p);
          const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, radius));
          grad.addColorStop(0, `rgba(20,0,40,${alpha})`);
          grad.addColorStop(0.5, `rgba(168,85,247,${alpha * 0.5})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'stoneskin': {
        // Rotating shield segments + inner glow
        const alpha = 0.6 * (1 - progress);
        const radius = this.cellSize * 0.5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(now * 0.003);
        ctx.strokeStyle = `rgba(13,148,136,${alpha})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const arcStart = (Math.PI * 2 * i) / 3;
          ctx.beginPath();
          ctx.arc(0, 0, radius * (1 + progress * 0.3), arcStart, arcStart + Math.PI * 0.5);
          ctx.stroke();
        }
        ctx.restore();
        const shieldGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        shieldGrad.addColorStop(0, `rgba(13,148,136,${alpha * 0.3})`);
        shieldGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'mirage': {
        // Shimmer/ethereal waviness — multiple wavering ellipses
        const alpha = 0.5 * (1 - progress);
        const radius = this.cellSize * 0.4;
        for (let i = 0; i < 3; i++) {
          const wave = Math.sin(now * 0.008 + i * 2) * 3;
          const wAlpha = alpha * (1 - i * 0.25);
          ctx.strokeStyle = `rgba(139,92,246,${wAlpha})`;
          ctx.lineWidth = 1.5 - i * 0.3;
          ctx.beginPath();
          ctx.ellipse(x + wave, y, radius * (1 - progress * 0.3), radius * (1 + progress * 0.1), 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(139,92,246,${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, radius * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'snare': {
        // Flash on trigger + jaw-snap animation
        if (progress < 0.15) {
          const p = progress / 0.15;
          ctx.fillStyle = `rgba(217,119,6,${0.5 * (1 - p)})`;
          ctx.beginPath();
          ctx.arc(x, y, this.cellSize * 0.6 * p, 0, Math.PI * 2);
          ctx.fill();
        }
        const alpha = 0.5 * (1 - progress);
        ctx.strokeStyle = `rgba(217,119,6,${alpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x, y, this.cellSize * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Jaw-snap lines
        if (progress > 0.3 && progress < 0.7) {
          const p = (progress - 0.3) / 0.4;
          const jawAlpha = 0.6 * (1 - Math.abs(p - 0.5) * 2);
          const s = this.cellSize * 0.3;
          ctx.strokeStyle = `rgba(217,119,6,${jawAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - s, y - s * (1 - p));
          ctx.lineTo(x, y - s * 0.3 * (1 - p));
          ctx.lineTo(x + s, y - s * (1 - p));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - s, y + s * (1 - p));
          ctx.lineTo(x, y + s * 0.3 * (1 - p));
          ctx.lineTo(x + s, y + s * (1 - p));
          ctx.stroke();
        }
        break;
      }
      case 'sanctuary': case 'earthenwall': case 'smolder': case 'inferno':
      case 'ninelives': case 'warpgate': case 'phaseshift':
      case 'chainlightning': case 'thunderveil': {
        // Generic flash effect
        const alpha = 0.4 * (1 - progress);
        const radius = this.cellSize * (0.5 + progress * 2);
        const champ = this.gs.champions[this.gs.currentPlayer];
        const color = champ ? champ.color : '#00d4d4';
        ctx.save();
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2,'0')}`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
    }
  }

  // ── Draw wall cell ──
  _drawWall(ctx, row, col, now) {
    const { x, y } = this.gridToPixel(row, col);
    const s = this.cellSize * 0.42;
    ctx.save();
    const grad = ctx.createLinearGradient(x - s, y - s, x + s, y + s);
    grad.addColorStop(0, '#3a3a4a');
    grad.addColorStop(0.5, '#4a4a5a');
    grad.addColorStop(1, '#2a2a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(x - s, y - s, s * 2, s * 2);
    ctx.strokeStyle = 'rgba(100,100,120,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - s, y - s, s * 2, s * 2);
    // Crack lines
    ctx.strokeStyle = 'rgba(60,60,80,0.5)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y - s);
    ctx.lineTo(x + s * 0.3, y + s);
    ctx.stroke();
    ctx.restore();
  }

  // ── Draw sanctuary zone ──
  _drawSanctuary(ctx, sanc, now) {
    const { x: cx, y: cy } = this.gridToPixel(sanc.row, sanc.col);
    const halfSize = this.cellSize * 1.5;
    const pulse = 0.15 + Math.sin(now * 0.003) * 0.05;
    ctx.save();
    ctx.strokeStyle = `rgba(13,148,136,${pulse * 2})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.lineDashOffset = -(now * 0.02) % 9;
    ctx.strokeRect(cx - halfSize, cy - halfSize, halfSize * 2, halfSize * 2);
    ctx.setLineDash([]);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, halfSize);
    grad.addColorStop(0, `rgba(13,148,136,${pulse * 0.3})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - halfSize, cy - halfSize, halfSize * 2, halfSize * 2);
    ctx.restore();
  }

  // ── Draw warp gate ──
  _drawWarpGate(ctx, gate, now) {
    const p1 = this.gridToPixel(gate.pos1.row, gate.pos1.col);
    const p2 = this.gridToPixel(gate.pos2.row, gate.pos2.col);
    const pulse = 0.4 + Math.sin(now * 0.004) * 0.2;
    const r = this.cellSize * 0.3;

    ctx.save();
    // Portal markers
    for (const p of [p1, p2]) {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      grad.addColorStop(0, `rgba(139,92,246,${pulse})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(139,92,246,${pulse * 1.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // Connecting line
    ctx.strokeStyle = `rgba(139,92,246,${pulse * 0.5})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -(now * 0.03) % 8;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── Draw smolder glow ──
  _drawSmolder(ctx, row, col, sm, now) {
    const { x, y } = this.gridToPixel(row, col);
    const intensity = (3 - sm.turnsRemaining + 1) / 3;
    const pulse = intensity * (0.3 + Math.sin(now * 0.006) * 0.1);
    const r = this.cellSize * 0.5;
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(220,38,38,${pulse})`);
    grad.addColorStop(0.6, `rgba(220,100,38,${pulse * 0.5})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Draw phase shift glow ──
  _drawPhaseGlow(ctx, row, col, now) {
    const { x, y } = this.gridToPixel(row, col);
    const r = this.cellSize * 0.45;
    const pulse = 0.25 + Math.sin(now * 0.005) * 0.1;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = 'rgba(139,92,246,0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = (now * 0.02) % 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
