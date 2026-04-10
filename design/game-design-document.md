# AniGO Game Design Document
## Go + Magic Spells -- Complete Gameplay System

**Version**: 1.0 (MVP)
**Date**: 2026-04-08
**Author**: Agent 9 (Game Designer)
**Board**: 9x9 (MVP), expandable to 13x13 and 19x19
**Target match length**: 12-18 minutes

---

## Table of Contents

1. [Design Thesis: Why Humans Beat AI](#1-design-thesis-why-humans-beat-ai)
2. [Turn Structure](#2-turn-structure)
3. [Resource System (Chi)](#3-resource-system-chi)
4. [Spell System (10 Spells for MVP)](#4-spell-system-10-spells-for-mvp)
5. [Hidden Information Mechanics](#5-hidden-information-mechanics)
6. [Draft System](#6-draft-system)
7. [Win Conditions](#7-win-conditions)
8. [Wagering and Tournament Design](#8-wagering-and-tournament-design)
9. [Balance Framework](#9-balance-framework)
10. [Glossary](#10-glossary)

---

## 1. Design Thesis: Why Humans Beat AI

Modern Go AI (KataGo, Leela Zero) plays near-perfectly because Go is a perfect-information, zero-randomness, two-player game -- exactly the class of game where tree search + neural nets dominate. AniGO breaks every one of those assumptions.

| AI Assumption | AniGO Violation | Human Advantage |
|---|---|---|
| Perfect information | Hidden spells, traps, fog | Humans read social cues, AI cannot |
| Deterministic outcomes | RNG on certain spell effects | Humans adapt to chaos; AI's value estimates break |
| Fixed board topology | Terrain spells change the board | AI's pattern library becomes unreliable |
| Single optimization axis (territory) | Multi-resource economy (territory + Chi + spell hand) | Humans handle multi-objective tradeoffs more flexibly |
| Opponent plays optimally | Bluffing and deception | AI has no model of human intentional sub-optimality |
| Stable game tree | Trap spells branch the tree unpredictably | Exponential blowup in states AI must evaluate |

**Core insight**: We do not need to make Go "random." We need to make Go *social*. Hidden information and bluffing are the domains where human cognition still outperforms machine search.

---

## 2. Turn Structure

Each turn follows three phases. The active player completes all three before play passes.

### Phase 1: Upkeep
- Gain **+1 Chi** (base income).
- Gain **+1 Chi** per **Chi Well** you control (see Terrain spells).
- Draw the top card from your **Spell Deck** into your hand (if hand is not full).
- Any start-of-turn triggers resolve (e.g., Smolder damage ticks).

### Phase 2: Action
The player takes **exactly one** of the following:
- **Place a Stone** on any legal intersection (standard Go placement rules apply, including ko).
- **Place a Stone AND cast one spell** (costs an extra 1 Chi surcharge on the spell, called "Dual Action tax").
- **Cast up to two spells** (no stone placed this turn).
- **Pass** (gain +2 Chi instead of acting).

Design rationale: Forcing a choice between stone placement and spellcasting creates tension. Dual Action is powerful but expensive, rewarding strong resource management. Passing for Chi creates a bluffing opportunity -- "Are they saving for something big?"

### Phase 3: Resolution
1. Standard Go capture rules apply. Any group with zero liberties is removed.
2. Spell effects resolve in cast order.
3. Trap spells check their trigger conditions against moves made this turn.
4. Captured stones go to the capturing player's **prisoner pile** (used for scoring) AND grant the capturer **+1 Chi per stone captured**.
5. If a Smolder effect is active, its damage resolves.

### Special Rules
- **Ko**: Standard ko rule applies. Spells cannot be used to circumvent ko (a spell that would recreate a ko-banned position fizzles and the Chi is refunded).
- **Suicide**: Suicide is illegal (standard Japanese rules), even via spell.
- **Seki**: Seki groups are immune to area-of-effect spells (living groups in mutual life are considered "stabilized").

---

## 3. Resource System (Chi)

Chi is the universal resource for casting spells. It is deliberately scarce to force hard choices.

| Parameter | Value | Rationale |
|---|---|---|
| Starting Chi | 3 | Enough for one cheap spell on turn 1, not enough for anything game-warping |
| Per-turn gain | +1 | Slow baseline; encourages territorial play for Chi Wells |
| Chi from captures | +1 per stone captured | Rewards aggressive play, creates risk/reward -- overextending for captures can backfire |
| Chi from passing | +2 (replaces normal action) | Enables strategic buildup, creates bluff tension |
| Maximum Chi | 10 | Prevents hoarding; forces use-it-or-lose-it decisions |
| Chi Well bonus | +1 per well per turn | See "Ley Line" spell below |

### Why a Single Resource?

Multiple resource types (e.g., separate mana colors) add complexity without depth for the MVP. Chi is simple to track, simple to display on-screen, and creates clean tradeoffs. Post-MVP, we can introduce a second resource type tied to territory control if the meta demands it.

### Chi Economy Anti-AI Properties

- AI must now evaluate every board state across two dimensions (territory value + Chi value).
- The optimal moment to spend Chi depends on the opponent's hidden hand -- information AI lacks.
- Passing for Chi is a deliberately deceptive action: it reveals nothing about intent.

---

## 4. Spell System (10 Spells for MVP)

Each spell has: Name, Cost, Effect, Visibility (Hidden/Visible), RNG Element, AI Weakness Exploited, and Counter-play.

Spells are organized into five categories with two spells each.

---

### Category A: Offensive Spells

#### Spell 1: Shatter
- **Cost**: 4 Chi
- **Effect**: Destroy one enemy stone of your choice. It is removed from the board and added to your prisoner pile. The targeted stone must have exactly 1 liberty remaining (atari).
- **Visibility**: Visible (opponent sees the cast and target).
- **RNG**: None.
- **AI Weakness**: Forces AI to recalculate entire board after an unnatural removal. Standard Go AI never models "a stone disappearing" outside of capture.
- **Counter-play**: Keep groups with 2+ liberties. Use defensive spells to protect atari groups. Since Shatter only works on atari stones, good shape naturally defends against it.
- **Design Note**: This is the "training wheels" offensive spell. It teaches players that atari = vulnerability in AniGO, more so than in regular Go.

#### Spell 2: Wildfire
- **Cost**: 6 Chi
- **Effect**: Choose a point on the board. Wildfire affects all stones (yours AND opponent's) within a Manhattan distance of 2 from that point. Each affected stone has a **50% chance** of being destroyed (flip per stone, independently). Destroyed stones go to the respective captor's prisoner pile.
- **Visibility**: The cast point is visible. Which stones survive is resolved by RNG at resolution.
- **RNG**: Heavy. Each stone in the blast zone survives or dies with a coin flip.
- **AI Weakness**: Massive. AI cannot evaluate this position because the branching factor for outcomes is 2^n where n = number of stones in the blast radius. With 5 stones in range, that is 32 possible board states. Expected value calculations are unreliable because the variance is enormous.
- **Counter-play**: Spread stones out (avoid clustering). If opponent is saving lots of Chi, anticipate Wildfire and play thin. Also: Wildfire hurts the caster's own stones, so it is best used when you have fewer stones in the area.
- **Design Note**: This is the "nuke" -- dramatic, chaotic, great for spectators. High cost prevents spam.

---

### Category B: Defensive Spells

#### Spell 3: Stone Skin
- **Cost**: 2 Chi
- **Effect**: Target one of your own stones. It becomes **Fortified** for 5 turns. A Fortified stone cannot be captured by normal Go rules (it is treated as always having at least 1 liberty). It CAN still be destroyed by Shatter or Wildfire.
- **Visibility**: **Hidden**. The opponent does not know which stone is Fortified. The fortified stone looks identical to a normal stone on the opponent's screen.
- **RNG**: None.
- **AI Weakness**: The AI does not know which stone is invulnerable. It may waste moves attempting to capture a Fortified stone, or it may avoid capturing any stone for fear of wasting tempo -- both are exploitable.
- **Counter-play**: If you suspect a stone is Fortified, probe with a cheap move nearby. If the opponent does not respond to atari on that stone, it is likely Fortified. Also: Shatter and Wildfire ignore Fortification.
- **Design Note**: Cheap, hidden, defensive. The quintessential "bluff enabler." Even if you don't have Stone Skin, playing as if you do can alter opponent behavior.

#### Spell 4: Sanctuary
- **Cost**: 3 Chi
- **Effect**: Choose a 3x3 area on the board. For the next 3 turns, no stones in that area (yours or opponent's) can be captured. Stones can still be placed in the area. The area glows faintly on both players' screens.
- **Visibility**: **Visible** (both players see the protected zone).
- **RNG**: None.
- **AI Weakness**: Sanctuary changes the rules of the local position temporarily. AI must switch between two rulesets (normal and sanctuary-modified) depending on timing. The temporary nature means the AI's long-horizon evaluation (which is its strength) is disrupted by a short-horizon rule change.
- **Counter-play**: Wait out the Sanctuary (3 turns). Use those 3 turns to build elsewhere. Alternatively, place stones inside the Sanctuary to establish position for when protection expires.

---

### Category C: Information Spells

#### Spell 5: Oracle's Eye
- **Cost**: 2 Chi
- **Effect**: Reveal all hidden spells currently affecting a 5x5 area of your choice. This shows: any Fortified stones, any Trap Stones, any hidden spell effects. Information is revealed for both players.
- **Visibility**: The cast is visible. Revealed information is visible.
- **RNG**: None.
- **AI Weakness**: This spell is actually *pro-AI* in that it removes hidden information. But it costs Chi, creating a dilemma: spend resources to gain information, or save resources for action? Humans can often "read" opponents without Oracle's Eye; AI cannot.
- **Counter-play**: Place traps and hidden effects spread across different board areas so a single Oracle's Eye cannot reveal everything.

#### Spell 6: Mirage
- **Cost**: 3 Chi
- **Effect**: Place a **Phantom Stone** of your color on any empty intersection. The Phantom Stone looks exactly like a real stone to your opponent. It has no actual effect on liberties, territory, or captures -- it is purely visual deception. The Phantom Stone disappears after 6 turns or when an opponent stone is placed adjacent to it (the opponent "discovers" it is fake). You may have at most 2 Phantoms on the board at once.
- **Visibility**: **Hidden** as a Phantom. Appears as a real stone to the opponent.
- **RNG**: None.
- **AI Weakness**: This is the strongest anti-AI spell in the game. The AI must now treat every stone as potentially fake. If it respects all stones as real, it concedes free territory to illusions. If it ignores stones, it gets destroyed by real stones it treated as fake. This is fundamentally a Theory of Mind problem -- AI has no model of deception.
- **Counter-play**: Oracle's Eye reveals Phantoms. Also, play adjacent to suspicious stones to test them (Phantoms vanish on adjacency). Experienced players learn to read "Phantom patterns" -- placements that are positionally odd are more likely to be mirages.
- **Design Note**: This is the signature spell of AniGO. It creates the bluffing layer that makes the game social.

---

### Category D: Terrain Spells

#### Spell 7: Ley Line
- **Cost**: 5 Chi
- **Effect**: Place a **Chi Well** marker on any empty intersection. The Chi Well is permanent and cannot be moved. The player whose stone occupies the Chi Well intersection (or whose territory surrounds it) gains +1 Chi per turn. If contested or unoccupied, it grants Chi to neither player. Chi Wells are neutral -- either player can claim them.
- **Visibility**: Visible (both players see the Well).
- **RNG**: None.
- **AI Weakness**: Chi Wells create a secondary objective on the board. AI must now balance territory acquisition with resource point control -- a multi-objective optimization problem that is harder than pure territory maximization.
- **Counter-play**: Contest or claim opponent's Chi Wells. Since Chi Wells are visible, both players can fight over them. The 5 Chi cost means placing one is a significant investment.

#### Spell 8: Void Rift
- **Cost**: 4 Chi
- **Effect**: Choose one intersection. That point becomes a **Void** -- it is treated as if it does not exist. No stone can be placed there. It does not count as a liberty for adjacent stones. It does not count as territory for either player. The Void is permanent for the rest of the game.
- **Visibility**: Visible.
- **RNG**: None.
- **AI Weakness**: Voids change board topology. Go AI's neural networks are trained on standard 9x9/13x13/19x19 boards. A board with Void points is an out-of-distribution input. The AI's pattern recognition (built on millions of standard games) becomes unreliable around Void points.
- **Counter-play**: Void Rift can be used defensively (block an invasion path) or offensively (cut opponent's liberties). Since the caster chooses where, counter-play is about anticipating where a Void would hurt you and keeping groups flexible.
- **Design Note**: Permanent board modification is dramatic and strategic. Limit to 2 Voids per player per game to prevent degenerate states.

---

### Category E: Trap Spells

#### Spell 9: Snare
- **Cost**: 3 Chi
- **Effect**: Place a hidden **Snare** on any empty intersection. When the opponent places a stone on that intersection, the Snare triggers: the opponent's stone is immediately placed, but they **lose their next turn** (forced pass, no Chi gain from that pass). The Snare is consumed on trigger. Maximum 2 active Snares per player.
- **Visibility**: **Hidden**. Opponent does not know which intersections are Snared.
- **RNG**: None.
- **AI Weakness**: Snares make the game tree branch based on hidden state. Every empty intersection could be a Snare. AI must either (a) assume any point could be Snared, massively reducing its confidence in any move, or (b) ignore Snares and occasionally lose a turn at a critical moment. Both options degrade AI play.
- **Counter-play**: Oracle's Eye reveals Snares. Play on less "obvious" points (Snares are usually placed on high-value intersections). The tempo loss is painful but not game-ending.

#### Spell 10: Smolder
- **Cost**: 4 Chi
- **Effect**: Attach a hidden **Smolder** effect to one of the opponent's stones. At the start of each of your turns for the next 3 turns, Smolder removes one liberty from the Smoldering stone (as if an invisible stone were placed adjacent to it). If the stone reaches 0 liberties from Smolder alone, it is captured. The opponent does not know which stone is Smoldering until it loses its first liberty to the effect (at which point a visual indicator appears).
- **Visibility**: **Hidden** until first liberty loss, then visible.
- **RNG**: None.
- **AI Weakness**: Smolder is a time-delayed, hidden threat. The AI cannot accurately evaluate groups when one of its stones has a hidden countdown. It may over-invest in protecting the wrong group or fail to reinforce the smoldering one.
- **Counter-play**: When you see a liberty disappear without cause (Smolder reveal), immediately reinforce that stone's liberties. Also: groups with 4+ liberties can usually survive a full 3-turn Smolder. Good shape is the best defense.

---

### Spell Summary Table

| # | Name | Cost | Category | Hidden? | RNG? | AI Weakness |
|---|---|---|---|---|---|---|
| 1 | Shatter | 4 | Offensive | No | No | Unnatural board state |
| 2 | Wildfire | 6 | Offensive | Partial | Heavy | Branching explosion |
| 3 | Stone Skin | 2 | Defensive | Yes | No | Unknown invulnerability |
| 4 | Sanctuary | 3 | Defensive | No | No | Temporary rule change |
| 5 | Oracle's Eye | 2 | Information | No | No | Resource vs. info tradeoff |
| 6 | Mirage | 3 | Information | Yes | No | Theory of Mind / bluffing |
| 7 | Ley Line | 5 | Terrain | No | No | Multi-objective optimization |
| 8 | Void Rift | 4 | Terrain | No | No | Out-of-distribution board |
| 9 | Snare | 3 | Trap | Yes | No | Hidden game tree branches |
| 10 | Smolder | 4 | Trap | Yes (initially) | No | Delayed hidden threat |

---

## 5. Hidden Information Mechanics

Hidden information is the single most important anti-AI feature in AniGO. This section defines exactly what is hidden from whom and when.

### What Is Hidden

| Element | Hidden From | Revealed When |
|---|---|---|
| Opponent's spell hand | Always hidden | Never (unless Oracle's Eye targets a trap) |
| Opponent's Chi total | Always visible | N/A -- Chi is public info |
| Fortified stones (Stone Skin) | Hidden from opponent | Oracle's Eye, or when 5-turn duration expires |
| Phantom stones (Mirage) | Hidden identity from opponent | Opponent places adjacent stone, or Oracle's Eye, or 6-turn expiry |
| Snare locations | Hidden from opponent | Triggered by opponent stepping on them, or Oracle's Eye |
| Smolder target | Hidden from opponent | First liberty loss from Smolder, or Oracle's Eye |
| Spell deck contents | Hidden from opponent | Never directly; opponent infers from drafted spells pool |
| Spell deck order | Hidden from both players | Drawn one at a time |

### Bluffing Framework

Bluffing is built into the system at multiple levels:

1. **Passive bluff (free)**: You might have Stone Skin, Snare, or Mirage active. The opponent must respect the possibility even if you have none.
2. **Action bluff (free)**: Passing to gain Chi signals "I am saving for something big." You might just be passing.
3. **Placement bluff (free)**: Playing a stone on an odd intersection could be Mirage, or it could be a real strategic play the opponent does not understand yet.
4. **Chi bluff (free)**: Having high Chi signals potential for expensive spells, even if your hand is empty.

Key design insight: Bluffing costs nothing. The mere existence of hidden spells changes opponent behavior even when no spells are in play. This is why hidden information is more powerful than RNG -- it works even when unused.

### Information Asymmetry and Spectators

For spectator mode (streaming, tournaments), spectators see ALL hidden information from both sides. This creates "dramatic irony" -- spectators know the Snare is there, they watch the opponent walk into it. This is the same design that makes poker streams compelling.

---

## 6. Draft System

Before each match, both players draft their spell loadout.

### Draft Procedure

1. Both players are shown all 10 spells.
2. **Alternating picks**: Black picks 1, White picks 1, Black picks 1, White picks 1, Black picks 1, White picks 1. (3 picks each, total 6 spells selected between both players. Spells are NOT exclusive -- both players can pick the same spell.)
3. Wait -- re-read: spells are **not exclusive**. Both players choose from the full pool of 10 independently. Each player picks **5 spells** to form their deck.
4. Simplified for MVP: each player independently selects 5 of the 10 spells. No alternating draft, no exclusivity. Picks are simultaneous and hidden.
5. The 5 selected spells are shuffled into a personal **Spell Deck**.
6. Each player draws 2 spells into their opening hand.

### Hand Mechanics

| Parameter | Value |
|---|---|
| Deck size | 5 spells |
| Starting hand | 2 spells (drawn from deck after draft) |
| Draw per turn | 1 spell (Phase 1: Upkeep) |
| Max hand size | 4 spells |
| If hand full, draw is skipped | Yes (no discard mechanic in MVP) |
| Deck reshuffled when empty | No. Once all 5 spells are drawn, no more draws. Plan accordingly. |

### Why 5 Spells?

- With 5 spells total and ~30-40 turns per 9x9 game, players cast roughly 3-4 spells per game (some Chi goes to Dual Actions). This means 1-2 spells are held in reserve or never drawn.
- The opponent knows your deck has 5 spells but not which ones. They know the pool of 10. This creates "possible hand" calculations similar to poker.
- With 10 spells and each player picking 5, there are C(10,5) = 252 possible decks. Enough variety for replayability, small enough that players can learn all matchups.

### Draft Strategy Depth

- **Aggro draft**: Shatter + Wildfire + Smolder + Snare + Void Rift. All-in on disruption.
- **Control draft**: Stone Skin + Sanctuary + Ley Line + Oracle's Eye + Mirage. Play for territory and information advantage.
- **Bluff-heavy draft**: Mirage + Snare + Stone Skin + Smolder + Oracle's Eye. Maximize hidden threats.
- **Anti-AI draft**: Mirage + Wildfire + Snare + Smolder + Void Rift. Maximum information asymmetry and RNG.

---

## 7. Win Conditions

### Primary: Territory Scoring (Modified Chinese Rules)

At game end (both players pass consecutively, or one player resigns):
1. Count territory using **area scoring** (Chinese rules): each intersection occupied by your stone or surrounded by your stones = 1 point.
2. **Phantom stones do not count as territory.** If any Phantoms remain on the board at game end, they are revealed and removed before scoring.
3. **Void points** are not territory for either player.
4. **Chi Wells** count as territory for whoever controls them (stone on the intersection or territory surrounding it).
5. Standard komi applies: White receives **5.5 komi** on 9x9 (adjusted during beta based on spell balance data). The 0.5 prevents draws.

### Secondary: Concession

A player may resign at any time. In wagered matches, resignation forfeits the wager.

### No Alternative Win Conditions (MVP)

For the MVP, there are no "spell-based win conditions" (e.g., "destroy 10 stones to win"). Territory remains king. This preserves Go's strategic core and avoids degenerate spell-spam strategies.

Post-MVP consideration: a "Domination" mode where capturing all of an opponent's stones on the board wins instantly. This would favor aggressive spell use and create a distinct game mode.

---

## 8. Wagering and Tournament Design

### Ranked Play

- **Rank system**: Elo-based rating, displayed as a tier name (Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster).
- **Matchmaking**: Players are matched within +/- 150 Elo. Queue time target: <60 seconds.
- **Rank rewards**: Cosmetic spell effects, board skins, stone skins. No gameplay advantage from rank.

### Token Wagering

- **Opt-in**: Both players must agree to wager before the match.
- **Symmetric stakes**: Both players wager the same amount of $ANIGO tokens.
- **Winner takes**: Winner receives both stakes minus a **5% platform fee** (funds prize pools and development).
- **Minimum wager**: 10 $ANIGO.
- **Maximum wager**: Tiered by rank. Bronze: 100, Silver: 500, Gold: 2000, Platinum: 10000, Diamond+: uncapped.
- **Escrow**: Wagers are locked in a smart contract at match start. Released to winner at match end. If a player disconnects for >2 minutes, they forfeit.

### Tournament Formats

#### Weekly Open (Automated)
- **Format**: Swiss, 5 rounds.
- **Entry**: 50 $ANIGO.
- **Prize pool**: All entries pooled. Top 8 split: 35%, 20%, 12%, 8%, 6%, 6%, 6%, 6%. Remaining 1% platform fee.
- **Time control**: 10 minutes per player + 15 seconds per move (byo-yomi style).
- **Best-of-1 per round** (Swiss handles variance over multiple rounds).

#### Monthly Championship (Curated)
- **Format**: Double elimination, best-of-3 each round.
- **Entry**: Qualification through weekly top-8 finishes.
- **Prize pool**: Sponsored by $ANIGO treasury.
- **Time control**: 15 minutes per player + 20 seconds per move.

#### Showmatch / Exhibition
- **Format**: Best-of-5.
- **Entry**: Invitation only.
- **Spectator wagering**: Spectators can wager on match outcomes (separate pool, pari-mutuel style).

### Anti-Collusion and Match Fixing

1. **Anonymous matchmaking**: In ranked and Swiss, players do not know their opponent's identity until the match ends. Only Elo range is shown.
2. **Statistical analysis**: Backend monitors for suspicious patterns (repeated matching between same wallets, improbable resignation timing, Chi spending patterns inconsistent with actual play).
3. **Wager limits by rank**: Prevents smurf accounts from wagering large amounts.
4. **Replay review**: All matches are recorded on-chain (move history + spell casts). Community can flag suspicious matches. Flagged matches are reviewed by a committee.
5. **Sybil resistance**: Wallet must hold a minimum amount of $ANIGO (staked, not just held) to enter wagered matches. This makes creating throwaway accounts costly.

### Spell NFTs

- **Cosmetic NFTs**: Spell visual effects (e.g., "Golden Wildfire," "Frost Shatter") that change the animation but not the gameplay.
- **No pay-to-win**: All 10 spells are available to all players for free. NFTs are purely cosmetic.
- **Seasonal spells (post-MVP)**: New spells released each season. Free to play, but premium cosmetic variants available as NFTs. Old season spells remain in the pool.

---

## 9. Balance Framework

### Balance Goals

1. No single spell should have a win rate above 55% when included in a deck.
2. No draft combination should have a win rate above 58%.
3. Hidden spells should be cast in at least 40% of games (if they are never used, the bluff layer is not working).
4. Average game length should be 30-40 turns (if spells are too powerful, games end too fast).

### Balance Levers

| Lever | Effect |
|---|---|
| Chi cost | Higher cost = less frequent use. Primary balance tool. |
| Duration | Shorter duration = weaker. Affects Stone Skin, Sanctuary, Smolder. |
| Radius/range | Smaller area = more targeted. Affects Wildfire, Oracle's Eye, Sanctuary. |
| Chi economy (base gain) | Increasing base gain makes all spells more accessible; decreasing makes Go fundamentals dominate. |
| Max hand size | Smaller hand = fewer options, more predictable. |
| Deck size | Fewer spells = more focused strategy, less variance. |

### Playtesting Protocol

1. **AI vs AI** (baseline): Run 1000 games with random spell drafts. Measure win rates per spell inclusion.
2. **Human vs Human** (closed alpha): Invite 50 Go players (mixed skill levels). Collect match data and surveys.
3. **Human vs AI** (the test that matters): Measure human win rate against KataGo with spell integration. Target: 40-50% human win rate for players 5+ ranks below AI's "true" Go strength. If humans are winning too easily, reduce spell power. If AI still dominates, increase hidden information mechanics.

---

## 10. Glossary

| Term | Definition |
|---|---|
| **Chi** | The resource used to cast spells. Gained each turn and from captures. |
| **Chi Well** | A board marker created by Ley Line that grants +1 Chi/turn to its controller. |
| **Dual Action** | Placing a stone AND casting a spell in the same turn (costs +1 Chi surcharge). |
| **Fortified** | A stone protected by Stone Skin. Cannot be captured by normal Go rules for 5 turns. |
| **Phantom Stone** | A fake stone created by Mirage. Looks real to the opponent but has no game effect. |
| **Smolder** | A hidden debuff on an enemy stone that removes 1 liberty per turn for 3 turns. |
| **Snare** | A hidden trap on an intersection. When opponent plays there, they lose their next turn. |
| **Spell Deck** | The 5 spells a player drafted, shuffled into a draw pile. |
| **Void** | An intersection removed from play by Void Rift. Permanent, no stones or territory. |
| **Sanctuary** | A 3x3 protected zone where no captures can occur for 3 turns. |
| **Komi** | Points given to White to compensate for Black's first-move advantage. 5.5 for 9x9. |

---

## Appendix A: Example Turn Sequence

**Situation**: Turn 12. Black has 5 Chi, 2 spells in hand (Stone Skin, Mirage). White's group in the top-right has 2 liberties.

**Black's turn**:
1. **Upkeep**: +1 Chi (now 6). Draw Snare from deck (hand: Stone Skin, Mirage, Snare).
2. **Action**: Black chooses Dual Action. Places a stone that puts White's group into atari (1 liberty). Casts Stone Skin on the stone just placed (2 Chi + 1 Chi surcharge = 3 Chi spent, now has 3 Chi remaining). The newly placed stone is now Fortified (hidden from White).
3. **Resolution**: White's group is in atari. No captures yet (1 liberty remains). Stone Skin is secretly active.

**White's turn**:
White sees their group is in atari. They try to capture Black's attacking stone to save their group, but the stone is Fortified -- the capture fails silently (the stone simply remains, confusing White). White realizes the stone must be Fortified and pivots to extending their group's liberties elsewhere.

This interaction demonstrates: hidden information (Stone Skin), the Dual Action mechanic, and how Go fundamentals (atari, liberties) still drive the action while spells add a deception layer.

---

## Appendix B: AI Vulnerability Scoring

Each spell rated 1-5 on how much it degrades AI performance:

| Spell | Info Hiding | Board Disruption | Branching Factor | Multi-Objective | Total (out of 20) |
|---|---|---|---|---|---|
| Mirage | 5 | 1 | 3 | 2 | 11 |
| Snare | 4 | 2 | 4 | 1 | 11 |
| Smolder | 4 | 3 | 2 | 1 | 10 |
| Stone Skin | 4 | 2 | 2 | 1 | 9 |
| Wildfire | 1 | 5 | 5 | 1 | 12 |
| Void Rift | 0 | 5 | 1 | 2 | 8 |
| Ley Line | 0 | 1 | 1 | 5 | 7 |
| Sanctuary | 0 | 3 | 2 | 1 | 6 |
| Oracle's Eye | -2 | 0 | 0 | 1 | -1 |
| Shatter | 0 | 3 | 1 | 1 | 5 |

Top anti-AI spells: Wildfire (chaos), Mirage (deception), Snare (hidden traps).
Oracle's Eye is the only pro-AI spell (removes hidden info), which is by design -- it gives humans a tool to level the information playing field when they need it, while costing them resources.

---

*End of Game Design Document v1.0*
