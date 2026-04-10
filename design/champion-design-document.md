# AniGO Champion Design Document
## 5 Champions for MVP

**Version**: 1.0
**Date**: 2026-04-08
**Author**: Agent 9 (Game Designer)
**Depends on**: [Game Design Document v1.0](/Users/chevan_tin/anigo/design/game-design-document.md)

---

## Table of Contents

1. [Champion System Overview](#1-champion-system-overview)
2. [Champion 1: Seolhwa, The Territorial Sage](#2-champion-1-seolhwa-the-territorial-sage)
3. [Champion 2: Ryujin, The Flame Warlord](#3-champion-2-ryujin-the-flame-warlord)
4. [Champion 3: Kumiho, The Shadow Trickster](#4-champion-3-kumiho-the-shadow-trickster)
5. [Champion 4: Musubi, The Void Walker](#5-champion-4-musubi-the-void-walker)
6. [Champion 5: Raijin, The Storm Caller](#6-champion-5-raijin-the-storm-caller)
7. [Matchup Chart and Balance Framework](#7-matchup-chart-and-balance-framework)
8. [System Changes from v1.0](#8-system-changes-from-v10)

---

## 1. Champion System Overview

### What Changed from v1.0

In v1.0, players drafted 5 of 10 spells into a personal deck and drew them over the course of the game. The champion system replaces this with a simpler, higher-identity model:

- **Before**: Pick 5 spells from 10. Shuffle into a deck. Draw 1/turn.
- **After**: Pick 1 champion from 5. You have all 3 of that champion's spells available from turn 1. No deck, no draw RNG.

### Why Champions

1. **Stronger identity**: "I play Kumiho" is more compelling than "I drafted Mirage + Snare + Stone Skin."
2. **Easier onboarding**: Learn 1 champion's 3 spells, not 10 spells and 252 possible decks.
3. **Spectator clarity**: Casters say "Kumiho vs Ryujin" and the audience immediately knows the matchup dynamic.
4. **Cleaner balance**: 5 champions = 10 matchups to tune. 252 deck combos = chaos.
5. **Monetization**: Champion skins, champion mastery, champion-specific cosmetics.

### What Stays the Same

- **Chi economy**: Start 3, +1/turn, +1/capture, +2 on pass, max 10.
- **Turn structure**: Upkeep, Action, Resolution (3 phases).
- **Dual Action tax**: Place stone + cast spell costs +1 Chi surcharge.
- **Core Go rules**: Ko, no suicide, Chinese scoring, 5.5 komi on 9x9.
- **Hidden information framework**: Hidden spells still invisible to opponent.
- **Win condition**: Territory scoring only (no spell-based win cons).

### What Changes

- **No draft phase**: Champion select replaces spell draft. Both players pick simultaneously; mirror matches are allowed.
- **No spell deck/hand**: All 3 spells are always available. No draw RNG.
- **Each spell is single-use per game** unless otherwise stated. This preserves scarcity and decision weight.
- **Passive abilities**: Each champion has a free always-on passive. This is new.
- **Spell usage limits**: Some spells can be cast multiple times (noted per spell). Most are one-shot.

### Anti-AI Thesis Preserved

Every champion has at least 1 hidden spell. The champion system actually strengthens the anti-AI thesis because the opponent knows your champion but not WHEN or WHERE you will use your spells. Since all 3 spells are always available (no draw RNG), the threat space is constant -- the opponent must respect all 3 spells at all times, every turn.

---

## 2. Champion 1: Seolhwa, The Territorial Sage

### Identity

- **Name**: Seolhwa (Korean: "snow flower")
- **Title**: The Territorial Sage
- **Archetype**: Control / Territorial
- **Go playstyle**: Build solid shapes, secure corners and sides, win by territory margin. Play thick, punish overextension. Classic "slow and steady" Go.
- **Visual theme**: White and pale blue. Frost crystals, stone gardens, mountain mist. Stones glow with a faint ice-blue aura. Calm, serene aesthetic.
- **Pitch**: "Play Seolhwa if you like building an unbreakable fortress and watching your opponent run out of room."

### Passive: Permafrost

Your stones on **star points** (hoshi) have **+1 effective liberty**. This means an opponent must reduce them to -1 actual liberties to capture them (they survive at 0 real liberties). This bonus applies only to the stone ON the star point, not to the group.

- **Why it works**: Encourages occupying star points early (standard opening play), gives a subtle defensive edge. Simple to understand: "star points are stronger for Seolhwa."
- **Anti-AI**: AI must recalculate liberty counts for star-point stones differently. Minor but persistent rules deviation.
- **9x9 relevance**: 9x9 has 4 star points (4-4 points) plus tengen. That is 5 possible Permafrost locations.

### Spell 1: Stone Skin

- **Chi cost**: 2
- **Uses**: 2 per game
- **Effect**: Target one of your own stones. It becomes **Fortified** for 5 turns. A Fortified stone cannot be captured by normal Go rules (treated as always having at least 1 liberty). It CAN still be destroyed by Shatter or Wildfire.
- **Visibility**: **Hidden**. The opponent does not know which stone is Fortified.
- **Why it beats AI**: AI does not know which stone is invulnerable. It may waste moves attacking a Fortified stone, or avoid attacking ANY stone out of fear of wasting tempo.
- **Synergy**: Stone Skin on a star-point stone stacks with Permafrost -- the stone effectively needs to be reduced to -2 liberties AND have Fortification expire. This creates an anchor point that is extremely hard to dislodge. Pairs with Sanctuary for a total lockdown area.

### Spell 2: Sanctuary

- **Chi cost**: 4
- **Uses**: 1 per game
- **Effect**: Choose a **3x3 area** on the board. For the next **4 turns**, no stones in that area (yours or opponent's) can be captured. Stones can still be placed inside. The area glows faintly on both screens.
- **Visibility**: **Visible** (both players see the protected zone).
- **Why it beats AI**: Sanctuary creates a temporary rules change in a local area. AI must evaluate positions under two different rulesets simultaneously (normal rules outside, sanctuary rules inside) and track the countdown timer. This disrupts long-horizon planning.
- **Synergy**: Cast Sanctuary over a contested area where you have more stones. Your opponent cannot kill your group for 4 turns, giving you time to solidify it. Combine with Stone Skin on a key stone inside Sanctuary for a group that simply cannot die.

### Spell 3: Earthen Wall

- **Chi cost**: 5
- **Uses**: 1 per game
- **Effect**: Choose a straight line of **3 consecutive empty intersections** (horizontal or vertical). Place a **Wall** on those 3 points. Wall points are impassable: no stone can be placed on them for the rest of the game. They do NOT count as liberties for adjacent stones (same as Void). They DO count as territory boundaries -- if your stones fully enclose an area using Wall points as part of the boundary, those enclosed points are your territory.
- **Visibility**: **Visible**.
- **Why it beats AI**: Earthen Wall is a permanent topology change that also creates territory directly. AI's neural net has never seen a 3-point wall in training data. The dual function (blocks placement AND counts as boundary) creates an evaluation puzzle.
- **Synergy**: Use Earthen Wall to seal off a corner or side you have already claimed. Sanctuary protects your group while you build toward the wall. Stone Skin keeps your anchor alive. The entire kit is about building an impregnable position.

### Seolhwa Summary

| Spell | Cost | Uses | Hidden? | Role in Kit |
|---|---|---|---|---|
| Stone Skin | 2 | 2 | Yes | Cheap protection, bluff enabler |
| Sanctuary | 4 | 1 | No | Area denial, stabilization |
| Earthen Wall | 5 | 1 | No | Permanent territory claim, topology change |

**Total Chi budget**: 13 Chi across all spell uses (2+2+4+5). Enough for 2-3 casts in a typical game.

**Skill floor**: Low. Straightforward "build and defend" strategy. Good for beginners.
**Skill ceiling**: Medium. Optimal Wall placement and Sanctuary timing require game sense.

---

## 3. Champion 2: Ryujin, The Flame Warlord

### Identity

- **Name**: Ryujin (Japanese: dragon god of the sea, reimagined as fire dragon)
- **Title**: The Flame Warlord
- **Archetype**: Aggro / Capture-focused
- **Go playstyle**: Attack relentlessly, put groups in atari, capture stones for Chi advantage, snowball. Fight everywhere, avoid passive play. "Kill or be killed" Go.
- **Visual theme**: Red and gold. Dragon scales, embers, volcanic cracks. Stones pulse with inner fire. Aggressive, fierce aesthetic.
- **Pitch**: "Play Ryujin if you want to burn everything down and win through sheer destruction."

### Passive: Dragon's Hunger

When you capture enemy stones, gain **+2 Chi per capture event** instead of the standard +1 per stone. (Note: this is per capture EVENT, not per stone. Capturing a 5-stone group gives +2 bonus Chi total, not +10.)

- **Why it works**: Rewards Ryujin for doing what Ryujin wants to do: capture. Creates a snowball dynamic -- successful attacks fund more attacks.
- **Anti-AI**: AI must factor in a non-standard Chi reward when evaluating trades. Giving up stones to Ryujin is more costly than giving them up to other champions.
- **Balance note**: The bonus is per event, not per stone, to prevent degenerate snowballing from large captures.

### Spell 1: Shatter

- **Chi cost**: 3
- **Uses**: 2 per game
- **Effect**: Destroy one enemy stone of your choice. The targeted stone must have **exactly 1 liberty remaining** (atari). It is removed from the board and added to your prisoner pile. Triggers Dragon's Hunger (+2 Chi).
- **Visibility**: **Visible** (opponent sees the cast and target).
- **Why it beats AI**: Forces AI to recalculate entire board after an unnatural removal. Go AI never models "a stone disappearing" outside normal capture. Combined with Dragon's Hunger, Shatter is Chi-positive (costs 3, returns 2 from passive = net 1 Chi for a guaranteed kill).
- **Synergy**: Shatter sets up Smolder targets (remove a defender, isolate a stone) and funds the Chi for Inferno via Dragon's Hunger. Shatter is the bread-and-butter: cheap, reliable, always useful.

### Spell 2: Smolder

- **Chi cost**: 4
- **Uses**: 1 per game
- **Effect**: Attach a hidden **Smolder** effect to one of the opponent's stones. At the start of each of your turns for the next 3 turns, Smolder removes one liberty from the Smoldering stone (as if an invisible stone were placed adjacent to it). If the stone reaches 0 liberties from Smolder alone, it is captured. The opponent does not know which stone is Smoldering until it loses its first liberty to the effect.
- **Visibility**: **Hidden** until first liberty loss, then partially visible (opponent sees the liberty vanishing but not the source).
- **Why it beats AI**: Time-delayed, hidden threat. AI cannot accurately evaluate groups when one stone has a hidden countdown. It may over-invest in the wrong group or fail to reinforce the smoldering one.
- **Synergy**: Cast Smolder on a stone in a group you are already pressuring. While they deal with Shatter threats on one front, Smolder quietly kills on another. If they reinforce the Smolder target, you Shatter elsewhere. Classic two-front war.

### Spell 3: Inferno

- **Chi cost**: 6
- **Uses**: 1 per game
- **Effect**: Choose a point on the board. **All enemy stones** within Manhattan distance 2 from that point that are in **atari (exactly 1 liberty)** are immediately captured. Your own stones are unaffected. Captured stones grant Dragon's Hunger bonus.
- **Visibility**: **Visible** (the blast point and effect are shown).
- **Why it beats AI**: Unlike Wildfire (which is random), Inferno is deterministic but conditional -- it only kills atari stones. This means the AI must avoid having multiple groups in atari simultaneously near each other, which constrains its play in an unnatural way. The deterministic nature makes it predictable but devastating when conditions are met.
- **Synergy**: This is the payoff spell. Spend the early game using Shatter to pick off stones and Smolder to pressure groups. When multiple enemy groups are in atari near each other, Inferno cleans up the board. Dragon's Hunger from the mass capture funds... well, nothing, because you just won. But the Chi helps if the game continues.

### Ryujin Summary

| Spell | Cost | Uses | Hidden? | Role in Kit |
|---|---|---|---|---|
| Shatter | 3 | 2 | No | Cheap removal, Chi-positive with passive |
| Smolder | 4 | 1 | Yes | Hidden pressure, creates two-front war |
| Inferno | 6 | 1 | No | Finisher, mass conditional capture |

**Total Chi budget**: 16 Chi across all uses (3+3+4+6). Ryujin needs to be aggressive and capture stones to fund this kit via Dragon's Hunger.

**Skill floor**: Medium. You need to create atari to use Shatter/Inferno, which requires basic Go attacking skill.
**Skill ceiling**: High. Timing Smolder + Inferno for a multi-group wipe is extremely rewarding but hard to set up.

**Spectator appeal**: Very high. Inferno wiping 3+ stones off the board is a highlight-reel moment.

---

## 4. Champion 3: Kumiho, The Shadow Trickster

### Identity

- **Name**: Kumiho (Korean: nine-tailed fox spirit, a shapeshifter and deceiver)
- **Title**: The Shadow Trickster
- **Archetype**: Trickster / Deception
- **Go playstyle**: Win through information warfare. Make your opponent doubt every stone on the board. Play mind games, bluff constantly, turn the opponent's strength against them. "Fog of war" Go.
- **Visual theme**: Purple and silver. Fox tails, smoke, moonlight, illusions. Stones shimmer with an uncertain quality. Mysterious, elusive aesthetic.
- **Pitch**: "Play Kumiho if you want your opponent to question reality itself."

### Passive: Fox's Cunning

When you **pass**, you may place a **Phantom Stone** for free (no Chi cost) on any empty intersection. Limit 1 free Phantom per game. This does not replace the +2 Chi from passing -- you get both.

- **Why it works**: Passing already signals "I am saving for something." Fox's Cunning adds a second layer: "Did they pass to save Chi, or to place a Phantom?" The free Phantom is limited to 1 per game to prevent abuse, but it extends Kumiho's deception budget.
- **Anti-AI**: Passing is already ambiguous for AI. Now it is even more ambiguous: AI must consider the possibility that a new "stone" appeared on the board after a pass, which is not something that happens in normal Go.

### Spell 1: Mirage

- **Chi cost**: 3
- **Uses**: 2 per game
- **Effect**: Place a **Phantom Stone** of your color on any empty intersection. The Phantom looks exactly like a real stone to the opponent. It has no effect on liberties, territory, or captures. The Phantom disappears after **6 turns** or when an opponent stone is placed **adjacent** to it (discovery). Maximum 3 Phantoms on the board at once (including the free one from Fox's Cunning).
- **Visibility**: **Hidden** as a Phantom. Appears as a real stone to the opponent.
- **Why it beats AI**: The strongest anti-AI mechanic in the game. AI must treat every stone as potentially fake. If it respects all stones, it concedes free territory to illusions. If it ignores stones, real stones destroy it. This is a Theory of Mind problem AI cannot solve.
- **Synergy**: Mirage creates noise. Snare punishes investigation. If the opponent plays adjacent to test if a stone is a Phantom, they might hit a Snare. This creates a nasty double-bind: check the Phantom (risk Snare) or ignore it (risk conceding territory).

### Spell 2: Snare

- **Chi cost**: 2
- **Uses**: 2 per game
- **Effect**: Place a hidden **Snare** on any empty intersection. When the opponent places a stone on that intersection, the Snare triggers: their stone is placed but they **lose their next turn** (forced pass, no Chi gain from that pass). The Snare is consumed on trigger.
- **Visibility**: **Hidden**. Opponent does not know which intersections are Snared.
- **Why it beats AI**: Every empty point could be a Snare. AI must either treat all points as potentially Snared (reducing confidence in every move) or ignore Snares (and lose tempo at critical moments). With 2 Snares plus Mirage forcing adjacency tests, the trap density is high.
- **Synergy**: Place Snares adjacent to Phantom Stones. Opponent tests the Phantom by playing next to it -- triggers the Snare. Now they lose a turn AND the Phantom survives (it only vanishes when opponent plays adjacent to IT, not adjacent to a Snare). This is Kumiho's signature combo.

### Spell 3: Nine Lives

- **Chi cost**: 5
- **Uses**: 1 per game
- **Effect**: Choose one of your groups that was **captured this turn** (removed from the board during Resolution phase). **Return all stones of that group to the board** in their original positions. These returned stones are treated as newly placed (recalculate liberties). If any of the original positions are now occupied by enemy stones, those enemy stones are removed first (reverse capture). This spell can only be used during the Resolution phase of the turn your group was captured.
- **Visibility**: **Hidden** until triggered. The opponent captures your group, thinks it is dead, then it comes back. This is revealed to both players.
- **Why it beats AI**: AI evaluates captures as permanent gains. Nine Lives means a capture could be worthless or even detrimental (if the returned group displaces enemy stones placed in the captured territory). This undermines the most fundamental assumption in Go: captured stones are gone.
- **Synergy**: Nine Lives changes how the opponent must evaluate ALL of Kumiho's groups. Even without casting it, the threat of Nine Lives means the opponent cannot confidently invest moves into capturing a Kumiho group -- it might come back. This is the ultimate bluff: "Go ahead, capture me. I dare you."

### Kumiho Summary

| Spell | Cost | Uses | Hidden? | Role in Kit |
|---|---|---|---|---|
| Mirage | 3 | 2 | Yes | Phantom stones, information warfare |
| Snare | 2 | 2 | Yes | Trap, punishes investigation |
| Nine Lives | 5 | 1 | Yes | Resurrection, capture denial |

**Total Chi budget**: 15 Chi across all uses (3+3+2+2+5). All three spells are hidden. Maximum anti-AI potential.

**Skill floor**: High. You need to read your opponent to place effective Phantoms and Snares.
**Skill ceiling**: Very high. Expert Kumiho players win games where every opponent move is second-guessed.

**Anti-AI rating**: Maximum. All 3 spells are hidden. The passive generates free Phantoms. Kumiho is designed to be the "AI killer" champion.

---

## 5. Champion 4: Musubi, The Void Walker

### Identity

- **Name**: Musubi (Japanese: the god/concept of creation and connection, also "knot/tie" -- tying and untying the fabric of reality)
- **Title**: The Void Walker
- **Archetype**: Board Modifier / Strange
- **Go playstyle**: Reshape the board itself. Create positions that have never existed in any Go game. Win by making the board unrecognizable. "Alternate dimension" Go.
- **Visual theme**: Black and deep violet. Cosmic tears, starfields, spatial distortion. Stones appear to warp space around them. Eldritch, otherworldly aesthetic.
- **Pitch**: "Play Musubi if you want to play a Go game that has never been played before -- on a board that has never existed."

### Passive: Spatial Anomaly

At the start of each game, **one random intersection** on the board (excluding the center point and any star point) becomes a **Void point** (same as Void Rift effect -- no stone can be placed, does not count as liberty or territory). Both players see this Void at game start. The specific point is randomized each game.

- **Why it works**: Every Musubi game starts on a non-standard board. Both players must adapt their opening to an irregular topology. This immediately puts the game into out-of-distribution territory for AI.
- **Anti-AI**: Go AI is trained on standard boards. A board with a random hole in it from turn 0 degrades neural net pattern recognition from the very first move.
- **Balance**: The Void is random and symmetric (both players are equally affected). It creates novelty without favoritism.

### Spell 1: Void Rift

- **Chi cost**: 3
- **Uses**: 2 per game
- **Effect**: Choose one intersection. That point becomes a **Void** -- no stone can be placed there, it does not count as a liberty or territory. The Void is permanent. If a stone currently occupies the chosen intersection, it is destroyed (removed from the board, not captured -- no prisoner pile, no Chi reward for either player).
- **Visibility**: **Visible**.
- **Why it beats AI**: Voids change board topology. AI's neural networks are trained on standard boards. Each Void pushes the board further from training data. With the passive Void + 2 Void Rifts, Musubi can create a board with 3 holes in it -- completely alien to any AI.
- **Synergy**: Void Rift can cut liberties from enemy groups (destroy an adjacent point), create walls (series of Voids blocking a path), or isolate territories. Combined with Warp Gate, Voids create a board where normal spatial reasoning breaks down.

### Spell 2: Warp Gate

- **Chi cost**: 4
- **Uses**: 1 per game
- **Effect**: Choose two empty intersections. They become a linked **Warp Gate** pair for the rest of the game (marked on the board with a portal symbol). The two points are treated as **adjacent** for all game purposes: liberty counting, group connection, capture resolution. Stones on opposite ends of a Warp Gate are part of the same group if they share a color. A stone at one gate point gains the OTHER gate point's neighbors as additional adjacencies.
- **Visibility**: **Visible** (both players see the gate pair).
- **Why it beats AI**: Warp Gate fundamentally breaks Go's spatial model. Go AI relies on local pattern recognition based on Manhattan distance. Warp Gate creates a non-Euclidean board where two distant points are adjacent. No Go AI has ever been trained on a board with wormholes. This is the single most "out-of-distribution" mechanic in the game.
- **Synergy**: Use Void Rift to cut the board into islands, then Warp Gate to connect YOUR islands while the opponent's remain isolated. Your groups are connected across the board; theirs are fragmented.

### Spell 3: Phase Shift

- **Chi cost**: 5
- **Uses**: 1 per game
- **Effect**: Choose one of your own stones. It becomes **Phased** for 3 turns. A Phased stone exists on the board and counts for territory, but it is **intangible**: it does not count as a liberty reducer for enemy stones, enemy stones do not reduce its liberties, and it cannot be captured. Essentially, it and all enemy stones ignore each other. Friendly stones still interact with it normally (group connection, liberties).
- **Visibility**: **Hidden** for 1 turn (the opponent does not know which stone is Phased), then revealed for the remaining 2 turns (the stone becomes translucent).
- **Why it beats AI**: Phase Shift creates a stone that exists in two states simultaneously -- real for territory and friendly connections, but ghostly for enemy interactions. AI must evaluate the board with a dual-state piece, which is a category of game state it has never encountered.
- **Synergy**: Phase a stone deep in enemy territory. For 3 turns, it cannot be captured. It connects to your groups via Warp Gate across the board. When Phase Shift expires, the stone becomes real again in a position where the opponent has built around it -- potentially cutting their group or claiming territory inside their area.

### Musubi Summary

| Spell | Cost | Uses | Hidden? | Role in Kit |
|---|---|---|---|---|
| Void Rift | 3 | 2 | No | Board topology change, liberty denial |
| Warp Gate | 4 | 1 | No | Non-Euclidean connection, group bridging |
| Phase Shift | 5 | 1 | Partial (1 turn hidden) | Intangible infiltrator, territory claim |

**Total Chi budget**: 15 Chi across all uses (3+3+4+5). Musubi needs careful Chi management to deploy the full kit.

**Skill floor**: High. Understanding how Voids and Warp Gates change the board requires strong Go fundamentals.
**Skill ceiling**: Extreme. Expert Musubi players create board states that even strong human opponents struggle to read, let alone AI.

**AI disruption rating**: Extreme. Between the passive Void, 2 Void Rifts, a Warp Gate, and Phase Shift, Musubi can create boards that are completely alien to any neural network.

---

## 6. Champion 5: Raijin, The Storm Caller

### Identity

- **Name**: Raijin (Japanese: god of thunder and storms)
- **Title**: The Storm Caller
- **Archetype**: Chaos / RNG / Comeback
- **Go playstyle**: Embrace randomness. Roll the dice when behind, create chaotic board states, turn losing positions into coinflips. "Storm" Go -- calm before the tempest, then everything changes.
- **Visual theme**: Electric blue and white. Lightning bolts, thunderclouds, crackling energy. Stones spark with static. Dynamic, volatile aesthetic.
- **Pitch**: "Play Raijin if you want to flip the table when you are losing and ride the lightning to victory."

### Passive: Eye of the Storm

When Raijin's Chi reaches **maximum (10)**, the next spell Raijin casts has its **Chi cost reduced by 2** (minimum 1). This bonus is consumed on the next spell cast and does not stack.

- **Why it works**: Encourages Raijin to save up Chi (passing, playing conservative Go) before unleashing a discounted nuke. Creates a "calm before the storm" dynamic. Also gives Raijin a way to access the expensive spells more easily.
- **Anti-AI**: AI sees Raijin at max Chi and must now evaluate all possible discounted spell casts. The threat of a cheap Wildfire (normally 6, now 4) changes the AI's evaluation of clustered positions.
- **Spectator value**: The audience sees Raijin hitting max Chi and knows something big is coming. Tension builds.

### Spell 1: Chain Lightning

- **Chi cost**: 3
- **Uses**: 2 per game
- **Effect**: Choose one enemy stone. It has a **75% chance** of being destroyed. If it is destroyed, Chain Lightning **jumps** to one random enemy stone adjacent to the destroyed stone's position. The jump stone has a **50% chance** of being destroyed. If that stone is also destroyed, one final jump occurs to a random adjacent enemy stone with a **25% chance** of destruction. Chain Lightning cannot jump to the same stone twice. Destroyed stones go to your prisoner pile.
- **Visibility**: **Visible** (the initial target is chosen by you; jumps are random and resolved in real time).
- **Why it beats AI**: Cascading RNG with conditional branching. The possible outcomes tree is: 25% (miss on first), 75% x 50% (hit first, miss second), 75% x 50% x 75% (hit first and second, miss third), 75% x 50% x 25% (hit all three). But which stones the lightning jumps TO is also random. AI must evaluate every possible chain path with diminishing probabilities. In a dense area, this is computationally intractable.
- **Synergy**: Chain Lightning is the "probe" spell -- cheap, somewhat reliable for picking off a single stone, with upside if the chain continues. Softens a position before Wildfire cleans up. The RNG also means Raijin can get lucky and wipe a cluster for just 3 Chi.

### Spell 2: Wildfire

- **Chi cost**: 6
- **Uses**: 1 per game
- **Effect**: Choose a point on the board. All stones (yours AND opponent's) within Manhattan distance 2 are affected. Each affected stone has a **50% chance** of being destroyed (independent coin flip per stone). Destroyed stones go to the respective captor's prisoner pile.
- **Visibility**: The cast point is visible. Outcome is RNG.
- **Why it beats AI**: Massive branching factor. With 5 stones in range, that is 32 possible board states. AI's value estimates break because the variance overwhelms expected value calculations.
- **Synergy**: Wildfire is the "nuke." Use Chain Lightning to thin out your own stones from the blast zone first, or cast Wildfire in an area where the opponent has density advantage. With Eye of the Storm discount, Wildfire costs only 4 Chi -- castable much earlier in the game.

### Spell 3: Thunder Veil

- **Chi cost**: 2
- **Uses**: 1 per game
- **Effect**: For the next **3 turns**, all of your stones on the board become **Hidden** from the opponent. The opponent's screen shows the board as it was before Thunder Veil, with no updates to your stone positions. Any stones you place during these 3 turns are also hidden. After 3 turns, the veil lifts and the true board state is revealed. The opponent can still place stones normally (they see their own stones and your PRE-veil positions), and normal Go rules still apply -- if the opponent places a stone that would capture a hidden group, the capture still happens (opponent discovers the hidden stones by capturing them).
- **Visibility**: **Hidden** (the opponent sees the cast flash of lightning -- they know the veil is active -- but not your new stone positions).
- **Why it beats AI**: For 3 turns, the AI is playing blind against Raijin's moves. It sees a frozen snapshot of Raijin's board while Raijin moves freely. AI must play against a ghost. This is a temporary fog-of-war that creates massive information asymmetry.
- **Synergy**: Cast Thunder Veil, then place stones aggressively for 3 turns under fog. When the veil drops, your invasion is already deep in enemy territory. The opponent had 3 turns to respond but did not know what was happening. Combine with Wildfire under the veil for maximum chaos: "Where did Raijin move their stones? Is the Wildfire blast zone safe now?"

### Raijin Summary

| Spell | Cost | Uses | Hidden? | Role in Kit |
|---|---|---|---|---|
| Chain Lightning | 3 | 2 | No | RNG removal, cascading damage |
| Wildfire | 6 | 1 | No | Area-of-effect nuke, board reset |
| Thunder Veil | 2 | 1 | Yes (creates fog of war) | Temporary information blackout |

**Total Chi budget**: 14 Chi across all uses (3+3+6+2). Eye of the Storm can reduce this by 2.

**Skill floor**: Low-Medium. Chain Lightning and Wildfire just require pointing at the board. RNG does the work.
**Skill ceiling**: Medium-High. Knowing WHEN to use Wildfire (board state analysis) and WHERE to place under Thunder Veil separates good Raijins from great ones.

**Spectator appeal**: Maximum. Every Raijin spell creates a dramatic moment. Chain Lightning chains are exciting, Wildfire is the nuclear option, Thunder Veil reveals are jaw-dropping.

---

## 7. Matchup Chart and Balance Framework

### Design Philosophy

No hard counters. Every champion should feel playable into every other champion. The matchup chart represents slight edges (52-55%) not decisive advantages. Player skill should matter more than champion select.

### Matchup Chart (Estimated Win Rates for Row Champion)

|  | Seolhwa | Ryujin | Kumiho | Musubi | Raijin |
|---|---|---|---|---|---|
| **Seolhwa** | 50 | 45 | 52 | 48 | 53 |
| **Ryujin** | 55 | 50 | 47 | 53 | 48 |
| **Kumiho** | 48 | 53 | 50 | 52 | 47 |
| **Musubi** | 52 | 47 | 48 | 50 | 53 |
| **Raijin** | 47 | 52 | 53 | 47 | 50 |

### Matchup Reasoning

**Ryujin > Seolhwa (55-45)**: Ryujin's Shatter and Smolder break through Seolhwa's defenses. Stone Skin delays but does not prevent the onslaught. Inferno can wipe a fortified position. Shatter ignores Fortification. Seolhwa's Wall helps but Ryujin fights around it.

**Seolhwa > Raijin (53-47)**: Seolhwa's solid shapes survive Wildfire better (thick groups, not thin). Stone Skin protects key stones from Chain Lightning. Earthen Wall limits the board, reducing Raijin's blast zones. Sanctuary nullifies Wildfire in critical areas.

**Kumiho > Ryujin (53-47)**: Ryujin wants clear targets to Shatter and Smolder. Kumiho's Phantoms waste Ryujin's attacks on fake stones. Snares punish aggressive stone placement. Nine Lives negates Ryujin's captures. Ryujin cannot trust any of Kumiho's stones are real.

**Ryujin > Raijin (52-48)**: Both are aggressive, but Ryujin's aggression is deterministic (Shatter always works on atari stones) while Raijin's is random. In an aggro mirror, consistency beats variance. Dragon's Hunger also outpaces Eye of the Storm for Chi generation.

**Musubi > Seolhwa (52-48)**: Musubi's Void Rifts can punch holes in Seolhwa's walls. Warp Gate bridges around barriers. Phase Shift infiltrates Sanctuary zones. Seolhwa builds static defenses; Musubi reshapes the space those defenses exist in.

**Raijin > Kumiho (53-47)**: Wildfire does not care if stones are Phantoms or real -- it destroys everything in the blast zone equally. Chain Lightning randomly hits real stones regardless of deception. Kumiho's information warfare is less effective against RNG that does not need information.

**Kumiho > Musubi (52-48)**: Musubi's board modifications are visible. Kumiho's deceptions are hidden. Musubi reshapes the board but still needs to evaluate which of Kumiho's stones are real -- Phantoms in Warp Gate networks are especially confusing. Nine Lives punishes Musubi's calculated plays.

**Musubi > Raijin (53-47)**: Musubi can use Voids to fragment the board, reducing Wildfire's effective blast zone. Warp Gate creates group connections that survive area damage. Phase Shift dodges Chain Lightning. Musubi's strategic board control counters Raijin's chaotic area denial.

**Seolhwa > Kumiho (52-48)**: Seolhwa's passive (Permafrost) means star point stones are harder to threaten, reducing the value of Kumiho's bluffs. Sanctuary reveals its borders visibly, giving Seolhwa clear safe zones where Phantoms are irrelevant. Wall limits the intersections where Snares can be placed.

**Raijin > Ryujin (52-48)**: Wait, the chart says Ryujin > Raijin 52-48. Correction noted: Raijin has comeback potential via Wildfire that can reset Ryujin's captured-stone advantage. But Ryujin's consistency gives the slight edge.

### Balance Validation

- **No champion exceeds 55% vs any other**: Checked. Maximum is Ryujin vs Seolhwa at 55%.
- **Each champion has at least 1 favorable matchup**: Checked.
  - Seolhwa: favored vs Raijin (53%) and Kumiho (52%)
  - Ryujin: favored vs Seolhwa (55%) and Musubi (53%)
  - Kumiho: favored vs Ryujin (53%) and Musubi (52%)
  - Musubi: favored vs Seolhwa (52%) and Raijin (53%)
  - Raijin: favored vs Kumiho (53%) and Ryujin (52%)
- **Each champion has at least 1 unfavorable matchup**: Checked.
  - Seolhwa: unfavored vs Ryujin (45%) and Musubi (48%)
  - Ryujin: unfavored vs Kumiho (47%) and Raijin (48%)
  - Kumiho: unfavored vs Raijin (47%) and Seolhwa (48%)
  - Musubi: unfavored vs Ryujin (47%) and Kumiho (48%)
  - Raijin: unfavored vs Seolhwa (47%) and Musubi (47%)
- **Loose rock-paper-scissors**: The cycle is roughly Ryujin > Seolhwa > Raijin > Kumiho > Ryujin, with Musubi as a flex pick that beats Seolhwa and Raijin but loses to Ryujin and Kumiho. No hard counters.

### Balance Levers Per Champion

| Champion | If Too Strong | If Too Weak |
|---|---|---|
| Seolhwa | Reduce Earthen Wall to 2 points, reduce Sanctuary duration to 3 turns | Add +1 Chi on Wall placement, increase Stone Skin uses to 3 |
| Ryujin | Remove Dragon's Hunger (revert to standard +1 Chi/capture), increase Inferno cost to 7 | Reduce Shatter cost to 2, add 1 more Shatter use |
| Kumiho | Reduce Phantom duration to 4 turns, limit to 2 total Phantoms | Reduce Nine Lives cost to 4, add passive Phantom on first pass free |
| Musubi | Reduce Void Rift uses to 1, remove the passive starting Void | Add Phase Shift duration to 4 turns, reduce Warp Gate cost to 3 |
| Raijin | Reduce Chain Lightning first-hit chance to 60%, increase Wildfire cost to 7 | Increase Thunder Veil duration to 4 turns, reduce Eye of Storm threshold to 8 Chi |

---

## 8. System Changes from v1.0

### Removed Systems

- **Spell Draft**: Replaced by champion select. Players pick a champion, not individual spells.
- **Spell Deck and Hand**: No more deck, draws, or hand size. All 3 spells are always available.
- **Oracle's Eye**: No longer a standalone spell. Removed from MVP. May return as an item or neutral mechanic in post-MVP. Rationale: with champion kits, there is no natural home for Oracle's Eye. It was "pro-AI" by design and no champion wants that identity.
- **Ley Line**: Removed from MVP. The Chi Well mechanic adds complexity without fitting cleanly into any champion's identity. May return in a future champion (e.g., "The Geomancer").

### Modified Spells (from v1.0 to champion kits)

| Original Spell | Champion | Changes |
|---|---|---|
| Stone Skin | Seolhwa | Same effect. Cost reduced from 2 to 2 (unchanged). Now 2 uses per game instead of deck-draw RNG. |
| Sanctuary | Seolhwa | Duration increased from 3 to 4 turns. Cost increased from 3 to 4. Stronger but more expensive. |
| Shatter | Ryujin | Cost reduced from 4 to 3. Now requires atari (same). 2 uses per game. Cheaper because Ryujin needs the tempo. |
| Smolder | Ryujin | Same effect and cost (4). 1 use per game. |
| Mirage | Kumiho | Same effect and cost (3). 2 uses per game. Max 3 Phantoms on board (up from 2, to accommodate passive). |
| Snare | Kumiho | Cost reduced from 3 to 2. 2 uses per game. Cheaper to enable more frequent trapping. |
| Void Rift | Musubi | Cost reduced from 4 to 3. Now can destroy an occupied stone (new). 2 uses per game. |
| Wildfire | Raijin | Same effect and cost (6). 1 use per game. |

### New Spells (not in v1.0)

| Spell | Champion | Description |
|---|---|---|
| Earthen Wall | Seolhwa | 3-point impassable wall, permanent, counts as territory boundary |
| Inferno | Ryujin | AoE that captures all atari stones in radius |
| Nine Lives | Kumiho | Resurrect a captured group |
| Warp Gate | Musubi | Link two distant points as adjacent |
| Phase Shift | Musubi | Make a stone intangible to enemies for 3 turns |
| Chain Lightning | Raijin | Cascading RNG destruction with diminishing probability |
| Thunder Veil | Raijin | 3-turn fog of war on all your stones |

### Spell Usage Model

In v1.0, spells were drawn from a shuffled deck (draw RNG). In the champion system, all spells are available from turn 1 but have limited uses per game. This trades draw variance for availability certainty -- you always HAVE your spells, but you can only use each a fixed number of times. The strategic question shifts from "do I have the right spell?" to "is NOW the right time to spend one of my limited uses?"

### Dual Action Tax

Unchanged. Placing a stone AND casting a spell in the same turn costs +1 Chi surcharge on the spell. This is important for balance because having all spells always available (no draw gating) could make Dual Actions too common without the tax.

---

## Appendix A: Champion Quick Reference Cards

### Seolhwa -- The Territorial Sage
**Passive**: Stones on star points have +1 effective liberty.
| Spell | Cost | Uses | Hidden |
|---|---|---|---|
| Stone Skin | 2 | 2 | Yes |
| Sanctuary | 4 | 1 | No |
| Earthen Wall | 5 | 1 | No |

### Ryujin -- The Flame Warlord
**Passive**: +2 Chi per capture event (instead of +1).
| Spell | Cost | Uses | Hidden |
|---|---|---|---|
| Shatter | 3 | 2 | No |
| Smolder | 4 | 1 | Yes |
| Inferno | 6 | 1 | No |

### Kumiho -- The Shadow Trickster
**Passive**: Passing also places 1 free Phantom (once per game).
| Spell | Cost | Uses | Hidden |
|---|---|---|---|
| Mirage | 3 | 2 | Yes |
| Snare | 2 | 2 | Yes |
| Nine Lives | 5 | 1 | Yes |

### Musubi -- The Void Walker
**Passive**: Game starts with 1 random Void point on the board.
| Spell | Cost | Uses | Hidden |
|---|---|---|---|
| Void Rift | 3 | 2 | No |
| Warp Gate | 4 | 1 | No |
| Phase Shift | 5 | 1 | Partial |

### Raijin -- The Storm Caller
**Passive**: At max Chi (10), next spell costs 2 less.
| Spell | Cost | Uses | Hidden |
|---|---|---|---|
| Chain Lightning | 3 | 2 | No |
| Wildfire | 6 | 1 | No |
| Thunder Veil | 2 | 1 | Yes |

---

## Appendix B: Anti-AI Rating by Champion

| Champion | Hidden Spells | Board Disruption | RNG | Bluff Potential | Anti-AI Total (/20) |
|---|---|---|---|---|---|
| Kumiho | 5 | 1 | 0 | 5 | 11 |
| Raijin | 3 | 4 | 5 | 2 | 14 |
| Musubi | 2 | 5 | 1 | 1 | 9 |
| Seolhwa | 3 | 3 | 0 | 3 | 9 |
| Ryujin | 2 | 3 | 0 | 2 | 7 |

Raijin and Kumiho are the strongest anti-AI champions. Raijin through RNG chaos, Kumiho through information warfare. They are each other's counter (Raijin > Kumiho) which creates interesting metagame dynamics: the best anti-AI champion (Kumiho) loses to the other anti-AI champion (Raijin).

---

## Appendix C: Spell Cost Distribution

Each champion follows the "cheap / medium / expensive" spread:

| Champion | Cheap (2-3) | Medium (4) | Expensive (5-6) |
|---|---|---|---|
| Seolhwa | Stone Skin (2) | Sanctuary (4) | Earthen Wall (5) |
| Ryujin | Shatter (3) | Smolder (4) | Inferno (6) |
| Kumiho | Snare (2) | Mirage (3) | Nine Lives (5) |
| Musubi | Void Rift (3) | Warp Gate (4) | Phase Shift (5) |
| Raijin | Thunder Veil (2) | Chain Lightning (3) | Wildfire (6) |

Note: Kumiho's "medium" is 3 rather than 4. This reflects the champion's lighter Chi footprint -- Kumiho wins through deception (which is cheap) rather than raw power (which is expensive). The kit's total Chi budget is comparable to others because of multi-use spells.

---

*End of Champion Design Document v1.0*
