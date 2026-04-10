# AniGO Master MVP Plan

**Version**: 1.0
**Date**: 2026-04-08
**Author**: Agent 1 (Project Manager)
**Status**: Approved for execution

---

## 1. Executive Summary

### What is AniGO?

AniGO is a digital strategy game that takes the ancient game of Go and adds a layer of magic spells, hidden information, and resource management to create a fundamentally new competitive experience. Players place stones on a 9x9 Go board while drafting and casting spells that reveal, conceal, destroy, and transform the board state. The hidden spell system introduces bluffing and deception -- mechanics where human intuition consistently outperforms AI -- making AniGO the first Go variant specifically designed so that humans can beat machines. Long-term, AniGO targets the $14.6B Korean gaming market with a crypto-optional competitive layer featuring token wagering and NFT cosmetics.

### Why Now?

Three forces converge in 2026:

1. **AlphaGo 10th Anniversary (March 2026)**: Lee Sedol's match against AlphaGo in March 2016 was a global cultural moment. The 10th anniversary has already renewed public interest -- Lee Sedol returned to the spotlight advocating human-AI collaboration. AniGO's thesis ("the Go game where humans fight back against AI") rides this narrative perfectly.
2. **Korean crypto regulatory shift**: President Lee Jae-myung (elected June 2025) is pro-crypto and pro-gaming deregulation. The regulatory window for blockchain games in Korea is projected to open in 2026-2027. AniGO can launch globally now and enter Korea as regulations ease.
3. **Play-to-earn collapse, play-to-own rise**: The P2E crash cleared the field. The market now rewards fun-first games with optional crypto layers. AniGO's design philosophy (great game first, blockchain enhancement second) matches the winning formula proven by MIR4 and Night Crows.

### What Makes It Special?

Traditional Go is a perfect-information, zero-randomness game -- exactly the class of game where AI dominates (KataGo plays at superhuman level). AniGO breaks every assumption AI relies on:

- **Hidden information** (hidden spells, phantom stones, traps) -- MCTS fundamentally breaks down without perfect information
- **Multi-resource economy** (territory + Chi + spell hand) -- forces multi-objective optimization AI handles poorly
- **Bluffing and deception** (Mirage, Stone Skin, Snare) -- AI has no model of intentional deception
- **Board topology changes** (Void Rift, Ley Line) -- trained neural networks encounter out-of-distribution inputs

Research confirms: Phantom Go AI plays at intermediate amateur level, while standard Go AI plays at superhuman level. AniGO's spell system amplifies this gap further.

### MVP Scope: What's In, What's Out

The MVP is a fully playable, polished single-page web application featuring a 9x9 Go board with 6 spells, a Chi resource system, local 2-player and vs-AI modes, and Hearthstone-level visual polish. It is buildable in a day by our agent team.

---

## 2. MVP Scope Definition

### IN SCOPE (MVP Day 1)

**Core Game**:
- 9x9 Go board with full rules: stone placement, capture (liberty-based), ko rule, suicide prohibition
- Area scoring (Chinese rules) with 5.5 komi for White
- Game end detection: consecutive double pass triggers scoring
- Resignation option
- Prisoner count tracking

**Chi Resource System**:
- Starting Chi: 3 per player
- Per-turn gain: +1 Chi (Upkeep phase)
- Chi from captures: +1 per stone captured
- Chi from passing: +2 (replaces normal action)
- Maximum Chi: 10
- Chi Well bonus: +1 per well per turn (via Ley Line spell)
- Animated Chi counter in HUD

**Turn Structure**:
- Phase 1: Upkeep (gain Chi, draw spell)
- Phase 2: Action (place stone, cast spell(s), dual action, or pass)
- Phase 3: Resolution (captures, spell effects, trap triggers)
- Dual Action tax: +1 Chi surcharge when placing a stone AND casting a spell in the same turn

**Spell System (6 spells -- see Section 5 for selection rationale)**:
- Spell draft UI: each player independently selects 4 spells from the 6 available before match start
- Spell deck: 4 spells shuffled into a personal draw pile
- Starting hand: 2 spells drawn after draft
- Draw 1 spell per turn during Upkeep
- Max hand size: 3 spells
- Card-style spell hand UI with drag-to-cast or click-to-cast

**Game Modes**:
- Single-player vs AI (simple heuristic AI: weighted random legal moves + basic spell use)
- Local 2-player (hot-seat, same browser)

**Hidden Information**:
- Hidden spells shown only to the caster
- Opponent's spell hand always hidden
- Chi totals are public
- Phantom stones appear as real stones to the opponent
- Fortified stones, Snare locations, and Smolder targets hidden until triggered/revealed

**UI and Polish**:
- Canvas-based board rendering with smooth animations
- Premium stone rendering (gradient spheres with shadow and subtle glow)
- Spell card UI with glassmorphism styling
- Spell casting animations (per-spell visual effects)
- Stone placement animation with board impact feel
- Capture animation (stones removed with particle effect)
- Turn indicator, phase indicator, capture count display
- Scoring screen at game end with territory visualization
- Sound effects: stone placement (wood thump), spell casting (per-spell unique SFX), captures (satisfying click/sweep), game end
- Responsive layout: desktop primary, tablet secondary

### OUT OF SCOPE (Post-MVP)

| Feature | Rationale |
|---------|-----------|
| Online multiplayer / WebSocket server | Requires backend infrastructure; MVP is client-only |
| Matchmaking / ELO rating | Requires server and persistent user accounts |
| Token wagering / smart contracts | Requires blockchain integration and legal review |
| Token economy ($ANIGO) | Post-MVP once gameplay is validated |
| KataGo AI integration | Too complex for day-1; simple AI is sufficient for MVP |
| 13x13 and 19x19 boards | 9x9 is the right scope for fast games and manageable complexity |
| NFT cosmetics | Requires smart contracts and marketplace |
| Tournament system | Requires matchmaking and server |
| Korean localization | Global English launch first per GTM strategy |
| Mobile app (native) | Web-first; responsive design covers tablet |
| Replay system | Nice-to-have; not essential for MVP validation |
| Spectator mode | Requires networking |
| Spell speed tiers (burst/fast/slow) | Simplify for MVP: all spells resolve on cast during your turn |
| Oracle's Eye spell | Cut from MVP 6 (see Section 5) |
| Post-game AI analysis | Requires KataGo integration |
| Seasonal spell rotations | Post-MVP content strategy |

---

## 3. Technical Architecture

### Stack

The MVP must be buildable in a single day by our agent team. No build steps, no frameworks, no server.

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Front-End** | Vanilla HTML/CSS/JS | No React/Vue overhead. Single page, no routing needed. Fast to build. |
| **Board Rendering** | HTML5 Canvas (2D context) | Smooth animations, full control over stone rendering, spell effects, and particles. requestAnimationFrame for 60fps. |
| **Game Engine** | Custom JS game state manager | Board state as 2D array (0=empty, 1=black, 2=white). Move validation, liberty counting, capture detection, ko enforcement, scoring -- all client-side. |
| **Spell Engine** | Custom JS spell system | Spell definitions as data objects. Cast validation, effect resolution, hidden state tracking, duration/trigger management. |
| **AI Opponent** | Simple heuristic AI in JS | Weighted random legal moves (prefer center, avoid self-atari, basic capture/defense). Random spell casting when Chi allows. NOT KataGo. |
| **Audio** | HTML5 Audio elements + Web Audio API | Pre-loaded SFX files for common actions. Web Audio API for generated/layered effects if needed. |
| **Animations** | Canvas 2D + CSS animations | Canvas for board animations (stone placement, captures, spell effects). CSS for UI panel transitions (spell hand, HUD updates). |
| **Fonts** | Google Fonts CDN | Orbitron for headings (tech/mystical feel), Exo 2 for body text (clean readability). |

### File Structure

```
anigo/
├── index.html              — Single entry point, all panels/modals defined here
├── css/
│   └── styles.css          — All styling: layout, spell cards, HUD, animations, responsive
├── js/
│   ├── main.js             — Entry point, initialization, event binding, game loop
│   ├── game.js             — Core game state: board array, turn management, phase logic,
│   │                         scoring, Chi tracking, win detection
│   ├── board.js            — Canvas board rendering: grid, stones, territory markers,
│   │                         click detection, placement animations, capture animations
│   ├── rules.js            — Go rules engine: liberty counting, capture detection,
│   │                         ko enforcement, legal move validation, group finding
│   ├── spells.js           — Spell definitions (data), cast validation, effect resolution,
│   │                         hidden state tracking, duration/trigger management
│   ├── draft.js            — Pre-game spell draft UI and logic
│   ├── ai.js               — Simple AI: move selection heuristics, spell casting logic
│   ├── ui.js               — Sidebar, spell hand rendering, HUD updates, scoring screen,
│   │                         turn/phase indicators, modal management
│   ├── audio.js            — Sound effects manager: preload, play, volume control
│   ├── animations.js       — Spell visual effects, particle systems, screen shake,
│   │                         stone placement impact, capture sweep
│   └── constants.js        — Board config, spell data objects, color palette, timing values
├── assets/
│   ├── sounds/
│   │   ├── stone-place.mp3
│   │   ├── capture.mp3
│   │   ├── spell-cast.mp3
│   │   ├── spell-shatter.mp3
│   │   ├── spell-wildfire.mp3
│   │   ├── spell-stoneskin.mp3
│   │   ├── spell-mirage.mp3
│   │   ├── spell-voidrift.mp3
│   │   ├── spell-snare.mp3
│   │   ├── chi-gain.mp3
│   │   ├── turn-change.mp3
│   │   └── game-end.mp3
│   └── images/             — Spell icons (if not generated via Canvas/CSS)
└── README.md               — Setup instructions (open index.html in browser)
```

### Key Technical Decisions

1. **No server**: Everything runs client-side. Local 2-player uses the same browser (hot-seat). AI runs in the browser.
2. **Canvas for the board, DOM for the UI**: The board needs pixel-level control for animations. The sidebar/HUD is standard DOM elements styled with CSS.
3. **Game state is the single source of truth**: A central `gameState` object holds the board array, Chi values, spell decks/hands, hidden state, turn counter, phase, and all active effects. Every UI update reads from this object.
4. **Hidden information via state separation**: Each player's view is computed from the game state. In 2-player mode, the view switches on turn change (with a "pass the device" screen). In AI mode, only the human's view is rendered.
5. **Sound effects can be simple**: Short .mp3 files for MVP. Can upgrade to Web Audio API synthesized sounds post-MVP if needed.

---

## 4. Design Direction

### Visual Style

**Modern minimalist meets mystical Go.** The aesthetic bridges Go's 4,000-year tradition with magical spell effects. Think: a premium wooden Go board in a dimly lit room, where ethereal spell energy shimmers across the surface.

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background (deep) | Near-black charcoal | `#0A0A0F` | Page background, outer frame |
| Board surface | Warm dark wood | `#2A1F14` | Board background with subtle wood grain texture |
| Grid lines | Muted gold | `#8B7355` | Board grid, thin and precise |
| Star points | Bright gold | `#C9A96E` | Traditional Go star point markers |
| Black stones | Rich obsidian | `#1A1A2E` | Gradient sphere with subtle blue highlight |
| White stones | Pearl white | `#E8E0D0` | Gradient sphere with warm shadow |
| Chi resource | Amber/gold | `#F5A623` | Chi counter, Chi gain animations |
| Spell magic (primary) | Electric cyan | `#00D4FF` | Spell card borders, cast effects, magical glow |
| Spell magic (secondary) | Deep violet | `#7B2FBE` | Spell backgrounds, mystical accents |
| Offensive spells | Fiery red-orange | `#FF4444` | Shatter, Wildfire card accents |
| Defensive spells | Emerald green | `#00C853` | Stone Skin card accent |
| Terrain spells | Earth brown/amber | `#D4A847` | Void Rift, Ley Line accents |
| Trap spells | Poison purple | `#9C27B0` | Snare card accent |
| Information spells | Ice blue | `#4FC3F7` | Mirage card accent |
| Text (primary) | Off-white | `#E0DCD0` | Body text, labels |
| Text (secondary) | Muted warm gray | `#8B8680` | Secondary info, disabled states |
| Success/positive | Bright green | `#4CAF50` | Legal move indicators, positive feedback |
| Danger/warning | Warm red | `#E53935` | Atari indicators, warnings |

### Typography

| Role | Font | Weight | Size Range |
|------|------|--------|------------|
| Logo / Title | Orbitron | 700 | 28-48px |
| Section Headings | Orbitron | 600 | 18-24px |
| Body / UI Text | Exo 2 | 400-500 | 14-16px |
| Spell Names | Exo 2 | 600 | 14-16px |
| Chi Counter | Orbitron | 700 | 24-32px (animated) |
| Capture Count | Exo 2 | 600 | 16-20px |

### Board Aesthetic

- Clean 9x9 grid rendered on Canvas with anti-aliased lines
- Subtle wood-grain texture on board surface (can be generated procedurally or via CSS gradient)
- Star points (hoshi) rendered as small gold dots at traditional positions (for 9x9: center + 4 corners at 3-3)
- Stones rendered as gradient spheres: radial gradient from highlight to shadow, with a soft drop shadow beneath
- Stone placement animation: stone drops onto board with slight bounce and a ripple effect on the grid
- Capture animation: captured stones shrink and fade with a particle burst, then slide toward the prisoner count
- Territory visualization at game end: colored overlay on controlled intersections

### Spell Cards

- Glassmorphism cards: semi-transparent background with blur, subtle border glow in the spell's category color
- Card layout (top to bottom): Spell icon (symbolic, rendered in Canvas or CSS), Spell name (Exo 2 600), Chi cost badge (amber circle with cost number), One-line effect description, Category tag (Offensive/Defensive/Information/Terrain/Trap)
- Cards in hand are arrayed in a fan at the bottom of the screen
- Hovering a card enlarges it and shows full description
- Dragging a card onto the board initiates casting (with valid targets highlighted)
- Cast animation: card flies from hand to board center, explodes into particles of the spell's color

### HUD Elements

- **Chi counter**: Amber gem icon with animated number. Pulses on gain. Positioned in the sidebar near the player's info.
- **Turn indicator**: Clear "Black's Turn" / "White's Turn" banner with the active player's stone color. Swipes in on turn change.
- **Phase indicator**: Subtle text below turn indicator showing "Upkeep / Action / Resolution"
- **Capture count**: Prisoner stones displayed as small clusters near each player's info panel
- **Spell deck counter**: Small number showing remaining spells in deck (e.g., "Deck: 2")
- **Timer** (optional for MVP): Simple per-move timer displayed as a progress bar

---

## 5. Which 6 Spells for MVP

### Selection Criteria

From the 10 designed spells, the MVP needs exactly 6 that:

1. Must include at least 1 hidden spell (anti-AI thesis)
2. Must include at least 1 RNG spell (spectator excitement)
3. Must include at least 1 terrain spell (board modification)
4. Must cover offensive, defensive, information, terrain, and trap categories
5. Must be implementable in a day (no overly complex mechanics)
6. Must showcase the game's core thesis: Go + spells + hidden info = humans beat AI

### The 6 MVP Spells

| # | Spell | Cost | Category | Hidden? | RNG? | Why Included |
|---|-------|------|----------|---------|------|-------------|
| 1 | **Shatter** | 4 | Offensive | No | No | Clean offensive spell. Easy to implement (target atari stone, remove it). Teaches players that atari = vulnerability in AniGO. Baseline spell everyone understands. |
| 2 | **Wildfire** | 6 | Offensive | Partial | Heavy | The spectacle spell. 50% per-stone destruction in a radius creates highlight-reel moments. Highest AI vulnerability score (12/20). Expensive cost prevents spam. |
| 3 | **Stone Skin** | 2 | Defensive | **Yes** | No | The quintessential bluff spell. Cheap, hidden, defensive. Even without casting it, opponents must respect its possibility. Teaches the hidden information meta. |
| 4 | **Mirage** | 3 | Information | **Yes** | No | The signature spell of AniGO. Phantom stones are the purest anti-AI mechanic (AI has no model of deception). Creates the bluffing layer that makes the game social. Tied for highest AI vulnerability score (11/20). |
| 5 | **Void Rift** | 4 | Terrain | No | No | Permanent board modification. Changes topology in ways that break AI pattern recognition. Strategically deep (offensive: cut liberties, defensive: block invasion). Easy to implement (mark intersection as void). |
| 6 | **Snare** | 3 | Trap | **Yes** | No | Hidden trap that punishes the opponent for playing on key intersections. Creates paranoia about every empty point. High AI vulnerability (11/20). The "mine" that makes every move a psychological calculation. |

### What Was Cut and Why

| Spell | Why Cut |
|-------|---------|
| **Sanctuary** (Defensive) | 3x3 area protection for 3 turns is complex to visualize and implement. Stone Skin covers the defensive slot more elegantly. |
| **Oracle's Eye** (Information) | Pro-AI spell (removes hidden info). Contradicts the MVP thesis. Also, with only 6 spells the information landscape is manageable without a reveal mechanic. |
| **Ley Line** (Terrain) | Chi Well economics add significant complexity to balance. Void Rift is a cleaner terrain spell for MVP. Chi economy is already rich enough with base gain + captures + passing. |
| **Smolder** (Trap) | Hidden delayed damage over 3 turns requires careful tick tracking and visual state management. Snare is simpler and creates equally strong psychological pressure. |

### MVP Draft Adjustment

With 6 spells instead of 10:
- Each player picks **4 spells** from the 6 available (instead of 5 from 10)
- Deck size: 4 spells
- Starting hand: 2 spells
- Max hand size: 3 spells
- This means players exclude 2 spells -- enough for meaningful draft strategy
- C(6,4) = 15 possible decks per player -- enough variety for MVP replayability

### Draft Strategy Examples (6-Spell MVP)

- **Aggro**: Shatter + Wildfire + Void Rift + Snare (cut: Stone Skin, Mirage -- all-in on destruction)
- **Bluff-heavy**: Stone Skin + Mirage + Snare + Void Rift (cut: Shatter, Wildfire -- maximize hidden threats)
- **Balanced**: Shatter + Stone Skin + Mirage + Snare (cut: Wildfire, Void Rift -- mix of offense and deception)
- **Territory control**: Stone Skin + Mirage + Void Rift + Snare (cut: Shatter, Wildfire -- board manipulation + defense)

---

## 6. Agent Assignments

### Phase 1: Design and Validation (Parallel)

| Agent | Task | Deliverable | Dependencies |
|-------|------|-------------|--------------|
| **Agent 10** (Game UXUI) | Design system and UI mockup specs. Define exact layouts for: board area, spell hand, HUD, draft screen, scoring screen. Produce a visual spec that Agent 3 can implement directly. | UI specification document with layout dimensions, component specs, color/font application, and interaction patterns | This MVP plan |
| **Agent 8** (Go Mechanics) | Validate Go rules implementation requirements. Document exact algorithms for: liberty counting, capture detection, group finding (flood fill), ko detection, legal move enumeration, area scoring. Provide pseudocode that Agent 3 can translate to JS. | Go rules implementation spec with pseudocode | This MVP plan |

**Phase 1 time**: ~30-45 minutes. Both agents work in parallel.

### Phase 2: Build (Parallel where possible)

| Agent | Task | Deliverable | Dependencies |
|-------|------|-------------|--------------|
| **Agent 3** (Front-End Dev) | Build the complete MVP application. This is the primary build agent. Implements: board renderer (Canvas), Go rules engine, spell system, AI opponent, spell draft UI, spell hand UI, HUD, scoring screen, audio, animations, responsive layout. | Complete working application at `/Users/chevan_tin/anigo/` | Phase 1 outputs (UI spec + rules spec) |
| **Agent 11** (Game Animations) | Define spell animation specifications. For each of the 6 spells, describe: cast animation, effect animation, duration, particle types, colors, easing curves. Provide specs detailed enough for Agent 3 to implement in Canvas. | Animation spec document | Phase 1 UI spec |
| **Agent 9** (Game Designer) | Finalize 6-spell balance for MVP. Review the 6 selected spells, confirm Chi costs are balanced for a 4-spell deck, validate turn structure works with reduced spell count, define AI spell-casting heuristics. | Balance confirmation + AI behavior spec | This MVP plan |

**Phase 2 time**: ~2-3 hours. Agent 3 is the critical path. Agents 11 and 9 produce specs that Agent 3 integrates.

**Execution note**: Agent 3 should begin building the board, rules engine, and core game loop immediately (these don't depend on animation specs or balance tweaks). Animation and spell balance specs feed in as Agent 3 reaches those layers.

### Phase 3: Integration and Polish

| Agent | Task | Deliverable | Dependencies |
|-------|------|-------------|--------------|
| **Agent 3** (Front-End Dev) | Integrate animation specs from Agent 11 and balance numbers from Agent 9. Polish transitions, ensure all SFX trigger correctly, verify responsive layout. Final assembly. | Complete, polished MVP | Phase 2 outputs |

**Phase 3 time**: ~30-60 minutes.

### Phase 4: QA

| Agent | Task | Deliverable | Dependencies |
|-------|------|-------------|--------------|
| **Agent 6** (QA) | Full playtest and validation against acceptance criteria (Section 8). Test all 6 spells, both game modes, scoring, edge cases (ko, seki, empty board, full board). File bugs. Verify visual quality meets Hearthstone-level target. | QA report with pass/fail per acceptance criterion | Phase 3 output |

**Phase 4 time**: ~30-45 minutes.

### Critical Path

```
Phase 1 (parallel: Agent 10 + Agent 8)
    |
    v
Phase 2 (Agent 3 builds; Agents 11 + 9 spec in parallel)
    |
    v
Phase 3 (Agent 3 integrates)
    |
    v
Phase 4 (Agent 6 QA)
```

Total estimated time: ~4-5 hours from start to QA-passed MVP.

---

## 7. GTM Preview

Based on Agent 5's Korean market research, the following GTM strategy applies post-MVP:

### Launch Strategy: Global First, Korea Second

**Why not Korea first?** Blockchain/P2E/NFT games are effectively banned domestically in South Korea. Korea's Game Rating Committee (GRAC) refuses to rate games with blockchain elements. Major Korean studios (Wemade, Netmarble) already launch blockchain games outside Korea first. AniGO follows this proven pattern.

### Phase 1: Global Launch

- English-language web release (MVP scope)
- Position around the AlphaGo 10th anniversary narrative: "Ten years after AI conquered Go, AniGO lets humans fight back"
- Lee Sedol's 2026 pivot to human-AI collaboration aligns perfectly with AniGO's thesis
- Build community via Discord, Twitter/X, Go-focused subreddits
- Partner with Go streamers on YouTube and Twitch for early content
- Target the intersection of Go players + gamers + crypto-curious audiences

### Phase 2: Korean Community Building

- Korean localization as top priority after global launch
- Build Korean community via KakaoTalk open chat rooms and Naver Cafe
- Engage Korean professional Go players as ambassadors (targets: Choi Jeong, Shin Min-jun, and Lee Sedol himself)
- Partner with Baduk TV for content and tournament coverage
- Streaming presence on SOOP (formerly AfreecaTV) and CHZZK (Naver)
- Monitor President Lee Jae-myung's regulatory deregulation timeline (expected 2026-2027)

### Phase 3: Korean Market Entry (When Regulations Allow)

- Full KakaoTalk integration (48.9M MAU, 97% of Korean internet users)
- Naver SEO + Naver Blog content marketing campaign
- PC bang partnerships for competitive visibility
- Partnership with Korea Baduk Association for legitimacy and pro player access
- Tournament series with Korean pro player involvement
- Crypto features enabled: token wagering via Upbit/Bithumb integration (16M+ Korean crypto users)

### Key Marketing Channels (Korea)

| Channel | Reach | Best For |
|---------|-------|----------|
| KakaoTalk | 48.9M MAU | Community, notifications, in-app purchases |
| Naver | 48.4% search market share | SEO, Blog content, Naver Cafe community |
| YouTube Korea | Dominant video | Influencer content, tutorials, tournament broadcasts |
| SOOP (AfreecaTV) | Leading Korean streaming | Live game streaming, esports community |
| CHZZK (Naver) | Rising streaming platform | Younger demographic |
| TikTok Korea | Growing | Short-form viral game clips |

### Partnership Targets

| Partner | Value |
|---------|-------|
| Korea Baduk Association | Official endorsement, pro player access, legitimacy |
| Lee Sedol | Celebrity endorsement, AI narrative alignment |
| Choi Jeong (women's champion) | Visibility into growing female Go audience |
| Baduk TV | Broadcasting, tournament coverage, existing Go audience |
| T1 / Gen.G / DRX (esports orgs) | Competitive gaming credibility, crossover audience |
| Upbit / Bithumb communities | Early adopter crypto-native audience |

### Key Market Data Points

- Korean gaming market: $14.56B (2025), growing at 6.59% CAGR
- Korean gamers: 52% paying users, $450+/year per-capita spend
- Go players in Korea: ~5M (~10% of population)
- Korean crypto users: 16M+ (more than stock investors)
- Tygem Go server: 4M+ users worldwide
- Current Go apps lack premium polish -- massive UX gap for AniGO to fill

---

## 8. Acceptance Criteria

The MVP is "done" when all of the following pass QA validation:

### 8.1 Core Go Rules

- [ ] Stones can be placed on any empty, legal intersection
- [ ] Captured groups (0 liberties) are removed from the board immediately
- [ ] Ko rule prevents immediate recapture of a single stone
- [ ] Suicide moves are rejected (illegal)
- [ ] Game ends on consecutive double pass
- [ ] Area scoring (Chinese rules) correctly counts territory for both players
- [ ] Komi of 5.5 is applied to White's score
- [ ] Correct winner is declared on scoring screen
- [ ] Resignation works at any point during the game

### 8.2 Chi Resource System

- [ ] Both players start with 3 Chi
- [ ] +1 Chi gained per turn during Upkeep
- [ ] +1 Chi gained per stone captured
- [ ] Passing grants +2 Chi (replaces normal action)
- [ ] Chi cannot exceed 10 (capped)
- [ ] Chi display updates correctly and animates on change
- [ ] Spells cannot be cast without sufficient Chi
- [ ] Chi is correctly deducted on spell cast
- [ ] Dual Action surcharge (+1 Chi) is applied when placing stone + casting spell

### 8.3 Turn Structure

- [ ] Turn alternates between Black and White
- [ ] Each turn has three visible phases: Upkeep, Action, Resolution
- [ ] During Action phase, player can: place stone, cast spell(s), dual action, or pass
- [ ] Only one stone can be placed per turn
- [ ] Maximum two spells can be cast per turn (if no stone placed)
- [ ] Dual Action allows one stone + one spell (with surcharge)
- [ ] Passing is always available as an action

### 8.4 Spell System (All 6 Spells)

**Shatter (4 Chi)**:
- [ ] Can only target enemy stones with exactly 1 liberty (atari)
- [ ] Targeted stone is removed and added to caster's prisoner count
- [ ] Cannot target stones with 2+ liberties (spell fizzles / target invalid)
- [ ] Effect is visible to both players

**Wildfire (6 Chi)**:
- [ ] Player selects a target point on the board
- [ ] All stones within Manhattan distance 2 are affected
- [ ] Each affected stone has independent 50% chance of destruction
- [ ] Destroyed stones go to appropriate prisoner piles
- [ ] Affects both player's own stones and opponent's stones
- [ ] Cast point and destruction results are visible to both players
- [ ] RNG results are visually animated (each stone resolves individually)

**Stone Skin (2 Chi)**:
- [ ] Can only target caster's own stones
- [ ] Fortified stone cannot be captured by normal Go rules for 5 turns
- [ ] Fortified stone CAN be destroyed by Shatter or Wildfire
- [ ] Fortification is HIDDEN from opponent (stone looks normal on opponent's view)
- [ ] Duration counter decrements correctly; effect ends after 5 turns
- [ ] Fortified stone shows a subtle indicator on caster's view only

**Mirage (3 Chi)**:
- [ ] Places a Phantom Stone of caster's color on any empty intersection
- [ ] Phantom appears as a real stone on opponent's screen
- [ ] Phantom has NO effect on liberties, territory, or captures
- [ ] Phantom disappears when opponent places a stone adjacent to it
- [ ] Phantom disappears after 6 turns
- [ ] Maximum 2 Phantoms per player on board at once
- [ ] Phantoms are revealed and removed before scoring at game end

**Void Rift (4 Chi)**:
- [ ] Target intersection becomes permanently void (removed from play)
- [ ] No stone can be placed on a void intersection
- [ ] Void does not count as a liberty for adjacent stones
- [ ] Void does not count as territory for either player
- [ ] Void is visible to both players (distinct visual marker)
- [ ] Maximum 2 Voids per player per game
- [ ] Cannot target an occupied intersection

**Snare (3 Chi)**:
- [ ] Places a hidden trap on any empty intersection
- [ ] Snare is HIDDEN from opponent
- [ ] When opponent places a stone on the Snare: stone is placed, Snare triggers, opponent loses their next turn (forced pass, no Chi gain from that forced pass)
- [ ] Snare is consumed on trigger
- [ ] Maximum 2 active Snares per player
- [ ] Snare shows a subtle indicator on caster's view only

### 8.5 Spell Draft

- [ ] Before each match, draft screen shows all 6 spells with descriptions
- [ ] Each player independently selects 4 of the 6 spells
- [ ] Selected spells are shuffled into a personal deck
- [ ] 2 spells are drawn into opening hand
- [ ] In 2-player mode, draft is sequential with a "pass device" screen between players
- [ ] In AI mode, AI drafts automatically (random or heuristic selection)

### 8.6 Spell Hand UI

- [ ] Spell cards are displayed at the bottom of the screen in a fan layout
- [ ] Cards show: spell name, Chi cost, brief description
- [ ] Cards are color-coded by category
- [ ] Hovering a card shows expanded description
- [ ] Clicking/dragging a card initiates casting mode
- [ ] Valid targets are highlighted during casting mode
- [ ] Insufficient Chi grays out uncastable cards
- [ ] Cards are removed from hand after casting

### 8.7 AI Opponent

- [ ] AI makes legal Go moves
- [ ] AI does not pass excessively (plays stones when good moves exist)
- [ ] AI casts spells when it has sufficient Chi (not optimal, but not never)
- [ ] AI avoids obvious self-atari when possible
- [ ] AI provides a reasonable game experience (not trivially easy, not impossibly hard)
- [ ] AI responds within 1 second

### 8.8 Game Modes

- [ ] "vs AI" mode works end-to-end (draft -> play -> scoring)
- [ ] "2 Player" mode works end-to-end with hot-seat turn passing
- [ ] Mode selection is available from a main menu / start screen
- [ ] "New Game" option is available from the game screen

### 8.9 Visual Quality

- [ ] Board grid is clean and legible
- [ ] Stones have gradient rendering with shadows (not flat circles)
- [ ] Stone placement has animation (drop/bounce or fade-in)
- [ ] Capture has animation (stones removed with visual effect)
- [ ] Each spell has a distinct cast animation
- [ ] Chi counter animates on change
- [ ] Turn change has visual transition
- [ ] Scoring screen clearly shows territory, prisoners, komi, and winner
- [ ] Overall aesthetic is dark, warm, and premium (not sterile/clinical)
- [ ] No visual glitches, overlapping elements, or clipped text at 1920x1080

### 8.10 Audio

- [ ] Stone placement sound plays on every stone placed
- [ ] Capture sound plays when stones are removed
- [ ] Spell cast sound plays on spell use (at least one generic SFX; ideally per-spell)
- [ ] Game end sound plays
- [ ] Audio does not overlap awkwardly or cause distortion
- [ ] Audio can be muted (nice-to-have for MVP)

### 8.11 Responsive Design

- [ ] Desktop (1920x1080): full layout with sidebar, board, and spell hand
- [ ] Laptop (1440x900): readable and playable without horizontal scroll
- [ ] Tablet (1024x768): playable in landscape orientation
- [ ] No critical UI elements are cut off or inaccessible at supported sizes

### 8.12 Edge Cases

- [ ] Empty board scoring works correctly
- [ ] Game handles a board filled with stones (no crash)
- [ ] Spell targeting an invalid location is rejected gracefully (no crash, Chi refunded)
- [ ] Ko rule is enforced even when spells modify the board nearby
- [ ] Phantom stones near a ko situation do not break ko detection
- [ ] Void Rift adjacent to groups correctly affects liberty counting
- [ ] Fortified stone's "always has 1 liberty" does not break group capture logic for the rest of its group
- [ ] Game end scoring correctly ignores Phantom stones and Void intersections

---

*End of AniGO Master MVP Plan v1.0*
