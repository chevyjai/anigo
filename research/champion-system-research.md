# AniGO Champion System Research Brief
## Pivoting from Spell Draft to Champion-Based Design

**Prepared by:** Agent 13 (Game Researcher)
**Date:** 2026-04-08
**Context:** AniGO is moving from "pick individual spells" to a champion system where players select a champion with 3 unique spells. We need to design 5 champions for MVP.

---

## Executive Summary

- **Riot's champion design philosophy centers on "kit coherence"** -- every ability in a champion's kit should reinforce a single gameplay identity. The best LoL champions have abilities that synergize with each other, creating a playstyle that feels greater than the sum of its parts. For AniGO's 3-spell kits, this means each spell should serve the champion's core Go strategy.
- **Hearthstone's class identity framework is the best model for AniGO** -- each class has defined Strengths, Limitations, and Weaknesses. With only 5 champions, AniGO needs razor-sharp differentiation. Each champion should excel at one Go strategy and struggle with another.
- **Legends of Runeterra's champion level-up mechanic is directly applicable** -- champions that "evolve" by fulfilling in-game conditions (e.g., "capture 5 stones to unlock your third spell") create emergent narratives and reward champion-specific play.
- **Korean mythology provides a rich, underexplored thematic palette** -- Dokkaebi (trickster goblin), Kumiho (shapeshifting fox), Haetae (guardian lion), Imugi (aspiring dragon), and Sanshin (mountain spirit) map perfectly to Go archetypes.
- **TFT and Auto Chess prove that simplified champion kits (1-2 abilities) work on board games** -- AniGO's 3-spell kit is actually generous compared to auto-battlers, giving enough design space for meaningful synergy without overwhelming complexity.

---

## 1. League of Legends Champion Design Principles

### 1.1 How Riot Designs Champion Kits

**The QWER Framework:**
Every LoL champion has 5 abilities: a Passive (always active), Q/W/E (basic abilities), and R (ultimate, high-impact, long cooldown). The key design insight is that these abilities are not independent -- they form a **coherent kit** where each ability enables, amplifies, or extends the others.

**Kit Coherence Examples:**
- **Ahri**: Q pokes, W does burst damage, E charms (CC) to set up the combo, R dashes to reposition. The charm (E) is the "setup" that makes everything else hit harder.
- **Zed**: Passive rewards low-HP targets, Q is ranged poke, W places a shadow clone, E slows, R marks a target for delayed burst. Every ability feeds into the "assassinate a single target" fantasy.

**Design Process (from GDC talks):**
1. Start with a **gameplay hook** -- one unique mechanic or fantasy ("What if a champion could...?")
2. Build the kit around that hook -- every ability should serve the core fantasy
3. Prototype and playtest for "feel" -- does the champion evoke the intended personality?
4. Define **counterplay** -- every strength must have a readable, learnable weakness

**Power Budget:**
Every champion has a finite "power budget." If one ability is extremely strong, others must be weaker. This prevents any single champion from being good at everything. Riot calls this "sharpening" -- accentuating strengths and weaknesses rather than making champions well-rounded.

Sources:
- [GDC: Building a Sport -- The Design Philosophy of LoL](https://www.gdcvault.com/play/1021851/Building-a-Sport-The-Design)
- [GDC: How Riot Creates New Champions](https://www.gamedeveloper.com/design/video-how-riot-creates-new-i-league-of-legends-i-champions)
- [/dev: On Champion Prototypes](https://nexus.leagueoflegends.com/en-us/2016/10/dev-on-champion-prototypes/)
- [Resources & Champion Design in LoL (Adam King)](https://adamjmking.medium.com/resources-champion-design-in-league-of-legends-1264d6f223ff)

### 1.2 What Makes a Champion Feel Unique and Fun

Riot identifies several pillars for champion uniqueness:

1. **Fantasy fulfillment** -- The champion should make you feel like you're embodying a specific archetype. Braum feels like a protective shield-bearer. Zed feels like a shadow assassin. The kit must deliver on this promise.

2. **Mastery curve** -- Champions should be easy to pick up but reward deep investment. Simple champions (Garen) have low floors; complex champions (Azir) have high ceilings. Both are needed.

3. **Moment-to-moment decision-making** -- Every ability usage should involve a meaningful choice. "Do I use my dash offensively or save it for escape?" creates tension.

4. **Counterplay readability** -- Opponents must be able to see what the champion is doing and respond. This is essential for competitive integrity.

5. **Personality expression** -- Even prototypes need to "feel" like the champion. Riot found that playtest feedback improves dramatically when the prototype evokes the champion's personality.

**Design Implication for AniGO:** Each champion should embody a specific Go philosophy. When you pick "the territorial champion," every spell should make you feel like a fortress builder. When you pick "the aggressive champion," every spell should make you feel like a predator hunting groups.

### 1.3 Champion Archetypes in LoL

Riot's official class system has 6 primary classes with subclasses:

| Class | Core Identity | Strengths | Weaknesses |
|-------|-------------|-----------|------------|
| **Tank** | Absorb damage, control fights | Toughness, crowd control, gap closing | Low damage output |
| **Fighter** | Durable melee damage | Sustained damage + survivability | Lacks range or burst |
| **Mage** | Area-of-effect magic damage | Burst combos, reach, zone control | Fragile, cooldown-dependent |
| **Assassin** | Eliminate single targets | Burst damage, mobility | Extremely fragile, useless if behind |
| **Marksman** | Sustained ranged damage | Consistent DPS at range | Fragile, item-dependent |
| **Support** | Protect and enable allies | Healing, shielding, vision | Low solo power |

**Key Insight: Mutual Counterability.** The class system works because no class dominates all others. Tanks counter Assassins (too durable to burst), Assassins counter Mages (can dive and kill them), Mages counter Tanks (sustained magic damage melts them). This creates a natural meta-game of composition.

**Design Implication for AniGO:** With only 5 champions, we don't need the full LoL complexity, but we DO need the principle of mutual counterability. Each champion should have at least one natural counter-pick among the other 4, creating a draft meta-game.

Sources:
- [Champion Classes -- LoL Wiki](https://leagueoflegends.fandom.com/wiki/Champion_classes)
- [LoL Balance Framework](https://www.leagueoflegends.com/en-us/news/dev/dev-balance-framework-update/)
- [Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/)

### 1.4 How LoL Balances 150+ Champions

Riot's balance framework addresses the impossible task of balancing 150+ champions across different skill levels:

- **Four player groups**: Average play, Skilled play, Elite play, Professional play. A champion is balanced if it's not overpowered in ANY group and not underpowered in ALL groups.
- **"Impossible to perfectly balance"** -- Riot explicitly acknowledges this. The goal is "interesting imbalance" where the meta shifts and different champions have their time to shine.
- **Sharpening over homogenizing** -- When adjusting, Riot prefers to make a champion more extreme (better at its niche, worse outside it) rather than making it generically good.
- **Counterplay as a balance lever** -- Even a strong champion feels fair if opponents have clear ways to respond.

**What AniGO can learn with only 5 champions:**
1. With 5 champions, perfect balance is actually achievable -- the combinatorial space is tiny compared to LoL
2. Use rock-paper-scissors-lizard-Spock dynamics: each champion should beat 2 others and lose to 2 others in a roughly circular fashion
3. Balance through asymmetry, not symmetry -- make each champion feel broken at its specialty, but clearly weak elsewhere
4. Playtest at multiple skill levels from day 1 -- a champion that's balanced for beginners might be broken for advanced players

### 1.5 Key GDC Talks and Dev Blogs

| Resource | Key Takeaway |
|----------|-------------|
| [Building a Sport: Design Philosophy of LoL (GDC 2015)](https://www.gdcvault.com/play/1021851/Building-a-Sport-The-Design) | Competitive games need strategic diversity, skill expression, entertainment value, and spectator appeal |
| [How Riot Creates New Champions (GDC 2017)](https://www.gamedeveloper.com/design/video-how-riot-creates-new-i-league-of-legends-i-champions) | Champion production pipeline: concept -> prototype -> playtest -> iterate -> ship |
| [/dev: On Champion Prototypes](https://nexus.leagueoflegends.com/en-us/2016/10/dev-on-champion-prototypes/) | Prototypes should evoke character personality; "feel" matters as much as mechanics |
| [Ask Riot: Manaless Champions](https://www.leagueoflegends.com/en-us/news/dev/ask-riot-manaless-champions/) | Resource systems define champion pacing; mana is the default, alternatives need justification |
| [Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/) | Players must understand what's happening and how to respond; critical for competitive integrity |

---

## 2. Champion Systems in Card/Board Games

### 2.1 Legends of Runeterra -- Champions & Level-Up

**How it works:**
- Champions are special unit cards that can **level up** by fulfilling a condition printed on the card
- Level-up conditions are unique per champion and function as "mini-quests" (e.g., "I've seen you deal 12+ damage" for Jinx)
- Upon leveling up, champions gain improved stats and new/enhanced abilities
- Level-up occurs at "burst speed" (instant, can't be responded to)
- Once leveled, all subsequent copies of that champion enter the board already leveled

**Champion Spells:**
- You can only have one copy of a champion on the board at a time
- If you draw a duplicate, it transforms into a **Champion Spell** -- a unique spell associated with that champion
- The champion spell is usually a variant of an existing region spell, but also shuffles the champion back into your deck
- This elegantly prevents dead draws while reinforcing champion identity

**Why this matters for AniGO:**
- The **level-up mechanic** is directly applicable: champions could start with 2 spells and unlock the 3rd by achieving an in-game condition (e.g., "Build 15 points of territory" or "Capture 5 stones")
- This creates a **narrative arc** within each game -- the champion "grows" as you play
- The condition itself reinforces the champion's playstyle -- you earn your power by playing the way your champion wants you to play

Sources:
- [Champion Basics -- LoR Support](https://support-legendsofruneterra.riotgames.com/hc/en-us/articles/360037094213-Champion-Basics)
- [Champion (Legends of Runeterra) -- LoL Wiki](https://leagueoflegends.fandom.com/wiki/Champion_(Legends_of_Runeterra))

### 2.2 Hearthstone -- Hero Powers & Class Identity

**How it works:**
- Each of 10 classes has a unique **Hero Power** (2 mana, always available, defines the class)
- Classes have three tiers: **Strengths** (what they excel at), **Limitations** (things they can do weakly), and **Weaknesses** (things they simply cannot do)
- Class identity is enforced through card design: certain mechanics are restricted to specific classes

**Key Hero Powers and Their Design:**
| Class | Hero Power | Design Purpose |
|-------|-----------|---------------|
| Warrior | Armor Up (gain 2 armor) | Enables control/defensive playstyle |
| Mage | Fireblast (deal 1 damage) | Flexible removal, enables spell synergy |
| Hunter | Steady Shot (deal 2 to enemy hero) | Forces aggression, creates clock |
| Priest | Lesser Heal (restore 2 health) | Enables value/attrition playstyle |
| Warlock | Life Tap (draw card, take 2 damage) | High risk/reward, enables aggressive and control |

**"Class Bleed" Problem:**
When a class starts doing things outside its identity, it feels unfair and homogenizes the game. Hearthstone designers explicitly guard against this.

**Design Implication for AniGO:**
- Each champion should have a **passive ability** (like a Hero Power) that's always active and defines their identity
- The 3 spells are like class cards -- they should reinforce what the champion does well
- Clearly define what each champion CANNOT do, not just what it can do
- With 5 champions, "class bleed" would be fatal -- each must feel completely distinct

Sources:
- [Developer Insights: Class Identity -- Hearthstone](https://hearthstone.blizzard.com/en-us/news/23014810/developer-insights-class-identity-hall-of-fame-and-new-cards)
- [Keeping Hearthstone Unique -- Class Identity Breakdown](https://outof.games/news/148-keeping-hearthstone-unique-class-identity-breakdown/)

### 2.3 Duelyst/Faeria -- Hero Selection on a Board

**Duelyst:**
- Players choose a **General** from one of 6 factions, each with 3 generals
- Generals occupy the board physically and can move + attack
- Each faction has exclusive keywords, abilities, and spells
- Duelyst originally had general-specific abilities (Bloodborn Spells) but removed them in Duelyst II because decks were being built entirely around those abilities, reducing deckbuilding diversity
- The game plays on a 5x9 grid -- positioning is central to strategy

**Faeria:**
- Players build the board itself turn-by-turn (placing land tiles)
- Hero selection is less about unique abilities and more about deck construction
- The "living board" mechanic is notable: the battlefield changes every turn

**Design Implication for AniGO:**
- Duelyst's cautionary tale is important: if champion spells are too powerful, games become "which champion's combo fires first?" rather than "who plays better Go"
- Go should remain the core skill expression; spells should augment, not replace it
- The board-building aspect of Faeria is interesting -- AniGO spells that modify the board (add/remove intersections, create barriers) would be uniquely suited to Go

Sources:
- [Beyond Hearthstone: Duelyst and Faeria (GosuGamers)](https://www.gosugamers.net/hearthstone/features/43295-beyond-hearthstone-on-the-battlegrid-with-duelyst-and-faeria)
- [Duelyst II General Discussions -- Generals Should Have Abilities](https://steamcommunity.com/app/2004320/discussions/0/3726197342914536309/)

### 2.4 TFT/Auto Chess -- Champions on a Board

**How abilities work:**
- Each champion has a **single ability** (simplified from LoL's 4-ability kit)
- Abilities auto-cast when the champion's mana bar fills (mana gained by attacking/taking damage)
- Abilities range from simple (Draven: bonus attack damage) to complex (Azir: summon soldiers)
- Champions also have **traits** (classes/origins) that activate when you field multiple champions sharing a trait

**Key Design Lessons:**
1. **Simplification works**: Reducing 4 abilities to 1 doesn't lose the champion's identity -- it distills it
2. **Auto-casting removes execution skill but keeps strategic skill**: You decide WHICH champions to field and WHERE to place them; the abilities execute automatically
3. **Positioning matters**: Where you place champions on the board affects who they target and how abilities cascade
4. **Star-up system (power scaling)**: Champions get stronger by combining duplicates (1-star -> 2-star -> 3-star), creating a progression arc within each game

**Design Implication for AniGO:**
- 3 spells per champion is the sweet spot between TFT's 1 ability (too simple for a strategy game) and LoL's 5 abilities (too complex for a board game context)
- Consider whether spells should be manually activated (skill expression) or trigger on conditions (strategic planning)
- TFT's trait system could inspire champion synergies if AniGO ever expands to team formats

### 2.5 Champions in Go Variants

**No direct precedent exists.** As established in the previous research brief, no existing Go variant uses a champion or hero system. The closest analogue is:

- **Pair Go**: Two players per team alternate moves, each with different strengths -- loosely resembles "character selection" but without unique abilities
- **Phantom Go**: The referee role could be reimagined as a "neutral champion" with information-asymmetric powers
- **Go quest/variant apps**: BadukPop uses character mascots but they're cosmetic only

**This means AniGO is creating a genuinely new game design pattern.** There is no existing design to copy, which is both an opportunity (blue ocean) and a risk (no proven model).

---

## 3. What Makes a Good 3-Spell Kit

### 3.1 Synergy: How Should 3 Spells Relate?

Drawing from LoL kit design and card game principles, the strongest pattern for a 3-spell kit is:

**The Setup -> Execute -> Capitalize Framework:**

| Spell Role | Purpose | LoL Analogy | Example in Go Context |
|-----------|---------|-------------|----------------------|
| **Spell 1: Setup** | Creates conditions for the champion's strategy | Ahri's Charm (E) | "Reveal a 3x3 area of opponent's hidden stones" |
| **Spell 2: Execute** | The champion's core power move | Ahri's Orb (Q) | "Place 2 stones simultaneously in revealed area" |
| **Spell 3: Capitalize** | Extends advantage or provides safety | Ahri's Spirit Rush (R) | "Captured stones in this area give double Chi" |

**Alternative Synergy Patterns:**

1. **Bread & Butter + Situational + Ultimate**: One spell used every game (core identity), one spell that's situationally powerful, one spell that's game-changing but expensive
2. **Offense + Defense + Utility**: One aggressive spell, one protective spell, one information/resource spell -- gives every champion flexibility
3. **Combo Chain**: Spells that are good alone but spectacular when chained in sequence -- rewards mastery

**Design Recommendation:** The "Bread & Butter + Situational + Ultimate" pattern is best for AniGO because:
- It gives each champion a consistent identity (the bread-and-butter spell)
- It creates decision-making (when to use the situational spell)
- It creates dramatic moments (the ultimate)
- It works well with a Chi resource system (cheap/medium/expensive)

### 3.2 Identity: Each Champion Should Encourage a Distinct Go Playstyle

The 5 champions must map to fundamentally different ways of playing Go. Each champion's spells should:

1. **Reward** playing in the champion's style (e.g., territorial champion gains Chi for building territory)
2. **Enable** plays that would normally be suboptimal (e.g., aggressive champion can make overplays that would normally fail)
3. **Struggle** when forced to play outside their style (e.g., territorial champion has weak tools for fighting)

The Hearthstone Strengths/Limitations/Weaknesses framework is the model here.

### 3.3 Power Curve: Immediate Access vs. Unlock Over Time

**Options:**

| Model | How It Works | Pros | Cons |
|-------|-------------|------|------|
| **All 3 immediately** | Full kit from turn 1 | Simple; full expression from start | No progression arc; decision overload early |
| **Unlock by turn count** | Spell 2 at turn X, Spell 3 at turn Y | Predictable pacing | Feels arbitrary; doesn't reward good play |
| **Unlock by condition (LoR model)** | Earn spells by fulfilling champion-specific quests | Reinforces identity; creates narrative | Complex; may feel punishing if conditions not met |
| **All available, escalating cost** | All spells usable but Spell 3 costs much more Chi | Simple + natural pacing | Least dramatic; no "unlock" moment |
| **Passive + 2 active, 3rd unlocks** | Passive always active, 2 spells available, 3rd unlocks via condition | Best of both worlds; passive defines identity from turn 1 | Most complex to design |

**Recommendation: Passive + 2 Active + Unlockable Ultimate**

This is the strongest model for AniGO:
- **Passive**: Always active, defines the champion's identity (like Hearthstone Hero Power but free). Example: "Your stones in the center count as 1.5x for influence scoring."
- **Spell 1 (Bread & Butter)**: Available from turn 1, moderate Chi cost, core tool
- **Spell 2 (Situational)**: Available from turn 1, higher Chi cost, more specialized
- **Spell 3 (Ultimate)**: Locked until a champion-specific condition is met. Powerful, game-shifting, expensive.

The unlock condition for Spell 3 is critical -- it should:
- Require playing the champion's intended style
- Be achievable in most games (not a rare occurrence)
- Create a visible "power spike" moment that both players recognize
- Happen around the mid-game, creating a clear narrative arc

### 3.4 Resource Interaction: Chi and Champion Kits

**How Chi should work with champions:**

Drawing from LoL's resource design philosophy:
- **Chi generation should be universal** -- all champions gain Chi the same way (from captures, territory claims, or turn-by-turn)
- **Chi costs should vary by champion** -- aggressive champions might have cheap, spammable spells; control champions might have expensive, high-impact spells
- **Champion identity should NOT be gated by resources** -- the passive is free, ensuring identity expression even when Chi-starved
- **Chi creates meaningful decisions** -- "Do I use my cheap spell now or save Chi for my expensive spell?" is the core tension

**LoL Analogy:** Mana-based champions (default) vs. Energy champions (fast regen, low cap) vs. Resourceless champions (cooldown-only). Each resource type creates a different play rhythm. AniGO could have champions with different Chi rhythms:
- Fast champion: Low Chi costs, meant to use spells frequently
- Slow champion: High Chi costs, but each spell is devastating
- Momentum champion: Spells get cheaper as they capture more (like LoL's Fury resource)

---

## 4. Champion Archetypes That Map to Go Strategies

### 4.1 The 5 Archetypes

| Archetype | Go Strategy | Champion Fantasy | Strengths | Weaknesses |
|-----------|-----------|-----------------|-----------|------------|
| **Territorial / Control** | Building solid, efficient territory; thick shapes | Fortress builder, patient strategist | Territory efficiency, defense, endgame | Slow start, weak in fights, punished by aggression |
| **Aggressive / Fighting** | Attacking weak groups, cutting, capturing | Predator, warrior | Combat spells, capturing power, pressure | Poor territory efficiency, loses in peaceful games |
| **Influence / Moyo** | Building large frameworks, center-oriented | Visionary, dreamer | Large-scale influence, center power, flexible | Vulnerable to invasion, influence =/= territory |
| **Sabotage / Trickster** | Disrupting opponent plans, hidden info, traps | Trickster, spy, illusionist | Deception, information warfare, disruption | Reactive (needs opponent to disrupt), inconsistent |
| **Adaptive / Balanced** | Flexible, mirrors and counters opponent | Shapeshifter, strategist | Versatility, counter-play tools, information | Master of none; no explosive power spike |

### 4.2 Counterplay Web (Rock-Paper-Scissors-Lizard-Spock)

For competitive viability, each champion should have favorable and unfavorable matchups:

```
Territorial  beats  Influence  (solid shapes resist moyo invasions)
Influence    beats  Aggressive (framework too large to attack piece by piece)  
Aggressive   beats  Sabotage   (direct fighting ignores traps)
Sabotage     beats  Territorial (disruption breaks careful plans)
Adaptive     beats  anyone slightly (flexibility counters extremes)
             but loses to anyone who commits hard to their strategy
```

This creates a draft meta-game: if you see your opponent pick Territorial, you're incentivized to pick Sabotage. The Adaptive champion is the "safe pick" that never hard-loses but never hard-wins.

### 4.3 Detailed Archetype Breakdowns

#### Territorial / Control Champion
- **Go playstyle encouraged:** Solid corner/side territory, thick shapes, efficient endgame
- **Passive idea:** Stones placed on the 3rd/4th line generate bonus Chi
- **Spell 1 (Bread & Butter):** Reinforce -- Strengthen a group (add liberties or make a stone uncapturable for N turns)
- **Spell 2 (Situational):** Wall -- Place a temporary barrier along an edge that blocks opponent placement for 2 turns
- **Spell 3 (Ultimate, unlocked by "Secure 20+ points of territory"):** Fortress -- A large area (5x5) of your territory becomes permanently immune to invasion
- **Counter-pick against:** Influence (punishes overextension with solid profit)
- **Weak against:** Sabotage (traps break careful structure), Aggressive (if they attack before territory is secure)

#### Aggressive / Fighting Champion
- **Go playstyle encouraged:** Attacking weak groups, cutting connections, capturing stones
- **Passive idea:** Gain bonus Chi whenever you capture enemy stones
- **Spell 1 (Bread & Butter):** Strike -- Remove 1 liberty from an enemy group (like a free atari extension)
- **Spell 2 (Situational):** Sever -- Cut two connected enemy groups apart (remove a connecting stone temporarily)
- **Spell 3 (Ultimate, unlocked by "Capture 8+ enemy stones"):** Death Blow -- Kill a group with 3 or fewer liberties regardless of eyes
- **Counter-pick against:** Sabotage (direct fighting ignores hidden traps)
- **Weak against:** Territorial (solid shapes are hard to attack), Influence (too spread out to target)

#### Influence / Moyo Champion
- **Go playstyle encouraged:** Building large-scale frameworks (moyo), center influence, thickness
- **Passive idea:** Stones in the center 5x5 area count as extra influence for scoring
- **Spell 1 (Bread & Butter):** Expand -- Place a stone on any empty intersection within 2 spaces of an existing stone (like a free extension)
- **Spell 2 (Situational):** Radiance -- All your stones in a 3x3 area project influence 1 extra intersection outward for scoring
- **Spell 3 (Ultimate, unlocked by "Control 30%+ of center area"):** Ascendance -- Convert all influence in your moyo to confirmed territory (opponent cannot invade for remainder of game)
- **Counter-pick against:** Aggressive (framework absorbs attacks into thickness)
- **Weak against:** Territorial (secures profit while moyo is still potential), Adaptive (can invade precisely)

#### Sabotage / Trickster Champion
- **Go playstyle encouraged:** Disrupting opponent plans, creating uncertainty, hidden information
- **Passive idea:** Once per 5 turns, you can see a 3x3 area of opponent's planned territory
- **Spell 1 (Bread & Butter):** Shadow Stone -- Place a hidden stone that opponent cannot see (revealed on contact, like Phantom Go)
- **Spell 2 (Situational):** Trap -- Place a trap on an empty intersection; if opponent plays there, their stone is immediately captured
- **Spell 3 (Ultimate, unlocked by "Opponent triggers 2 traps"):** Mirage -- Swap the positions of 2 enemy stones, potentially breaking connections and creating atari
- **Counter-pick against:** Territorial (traps in territory break careful plans)
- **Weak against:** Aggressive (direct attackers don't walk into traps; they create their own fights)

#### Adaptive / Balanced Champion
- **Go playstyle encouraged:** Reading the opponent, flexible response, efficient play
- **Passive idea:** At the start of the game, see the opponent's champion and spells (information advantage)
- **Spell 1 (Bread & Butter):** Mirror -- Copy the effect of the last spell your opponent used (at increased Chi cost)
- **Spell 2 (Situational):** Nullify -- Cancel the next spell your opponent casts (one-time counter)
- **Spell 3 (Ultimate, unlocked by "Use all 3 spell types at least once" or "Reach move 40 with a lead"):** Equilibrium -- Reset all active spell effects on the board (both players'); in a complex game, this is devastating to the opponent who relied on spells more
- **Counter-pick against:** Any champion that "goes all in" on their strategy
- **Weak against:** Champions that execute their strategy before Adaptive can react; loses to pure Go skill when spells are neutralized

---

## 5. Visual/Thematic Direction

### 5.1 Korean Mythology Archetypes for Champions

Each champion archetype maps naturally to a figure from Korean/East Asian mythology:

| Archetype | Mythological Inspiration | Visual Identity | Personality |
|-----------|------------------------|----------------|-------------|
| **Territorial / Control** | **Haetae** (guardian lion-beast) | Stone/marble lion with scales, horn on forehead, glowing eyes; sits in a protective stance | Stoic, just, patient, immovable |
| **Aggressive / Fighting** | **Imugi** (aspiring dragon/great serpent) | Serpentine dragon without wings, coiled and striking; green/jade scales, fierce eyes | Ambitious, relentless, hungry for power; wants to become a true dragon |
| **Influence / Moyo** | **Sanshin** (Mountain Spirit/Sage) | Elder sage sitting on a tiger, surrounded by pine trees and clouds; ethereal, wise | Visionary, patient, sees the whole board; speaks in proverbs |
| **Sabotage / Trickster** | **Dokkaebi** (Korean goblin) | One-horned goblin with wild hair, carrying a bangmangi (magic club); mischievous grin | Playful, chaotic, loves pranks; rewards cleverness, punishes greed |
| **Adaptive / Balanced** | **Kumiho** (Nine-tailed fox) | Elegant fox spirit that shifts between fox and human form; nine flowing tails | Cunning, adaptive, observant; always watching, always learning |

### 5.2 Why Korean Mythology

1. **Cultural authenticity**: Go (Baduk) is deeply embedded in Korean culture. Korean mythological figures feel natural alongside a Go board.
2. **Underexplored in gaming**: Unlike Greek/Norse/Japanese mythology, Korean mythology is underrepresented in global games. This creates differentiation.
3. **Rich character archetypes**: Korean mythology emphasizes moral duality (Dokkaebi punish the wicked, reward the good), transformation (Kumiho, Imugi), and guardianship (Haetae) -- perfect for champion design.
4. **Market alignment**: AniGO targets the Korean market. Korean players will recognize and connect with these figures (Dokkaebi especially popular due to K-drama "Goblin").
5. **Visual distinctiveness**: Korean mythological creatures have unique visual identities that differ from Japanese/Chinese equivalents, preventing confusion with existing games.

### 5.3 UI Expression of Champion Identity

**How champions should feel in the UI:**

1. **Champion select screen**: Full character portraits with animated idle poses, atmospheric music per champion. Show the 3 spells + passive clearly.

2. **In-game board**: 
   - Each champion could have a small avatar/token at the edge of the board
   - Stones placed by each champion could have subtle visual differences (Dokkaebi's stones might have a faint ghostly shimmer; Haetae's might look like carved marble)
   - Spell effects should have champion-themed VFX (Imugi's Strike could show serpent fangs; Sanshin's Radiance could show mountain mist expanding)

3. **Spell activation**: 
   - Champion portrait reacts (animation + voice line)
   - Board-level VFX corresponding to the spell's effect
   - Sound design unique per champion (Haetae: deep stone grinding; Dokkaebi: mischievous laughter; Kumiho: ethereal chimes)

4. **Level-up moment** (when Spell 3 unlocks):
   - Full-screen brief animation (like LoR's champion level-up cinematics)
   - Champion transforms visually (Imugi could sprout proto-wings; Haetae's horn could glow)
   - This should be a HYPE MOMENT -- it signals to both players that the game's dynamic has shifted

Sources:
- [Korean Mythological Creatures -- Study.com](https://study.com/academy/lesson/korean-mythological-creatures.html)
- [Dokkaebi -- Wikipedia](https://en.wikipedia.org/wiki/Dokkaebi)
- [Kumiho -- Wikipedia](https://en.wikipedia.org/wiki/Kumiho)
- [Korean Mythology: Gods, Spirits, and Legendary Creatures](https://www.hanna-one.com/fan-mythology.html)
- [Korean Myths and Folklore on Game Character Design (Academic Paper)](https://www.academia.edu/110186203/Korean_Myth_and_Folklore_on_Game_Character_Design)

---

## 6. Design Implications and Recommendations

### 6.1 Prioritized Recommendations

1. **Adopt the Passive + 2 Spells + Unlockable Ultimate model.** This gives each champion immediate identity (passive), meaningful early decisions (2 spells), and a dramatic mid-game power spike (ultimate unlock). This is the strongest combination of LoL's kit coherence, LoR's level-up mechanic, and Hearthstone's hero power.

2. **Use the 5 archetypes as designed.** Territorial/Aggressive/Influence/Sabotage/Adaptive maps directly to real Go strategies, ensuring that champion selection is a Go strategy decision, not just a "which spells are strongest?" decision.

3. **Korean mythology theming is a strong differentiator.** Haetae/Imugi/Sanshin/Dokkaebi/Kumiho provides rich, visually distinct, culturally authentic champion identities that align with AniGO's market positioning.

4. **Design the counterplay web before individual spells.** The matchup chart (who beats whom and why) should be established first, then spell designs should serve those matchup dynamics. This prevents the common trap of designing "cool spells" that don't create interesting draft decisions.

5. **Keep Go as the primary skill expression.** Duelyst's cautionary tale shows that if champion abilities are too powerful, the game becomes about abilities rather than the core game. AniGO spells should be impactful but should not override 10+ moves of Go skill. A rough rule: spells should account for ~20-30% of game outcome, Go skill for ~70-80%.

6. **Chi costs should create a natural power curve.** Cheap spells (1-2 Chi) used frequently, expensive spells (4-5 Chi) used once or twice per game. This naturally paces spell usage without arbitrary cooldown timers.

7. **Invest heavily in the ultimate unlock moment.** LoR's champion level-up animations are among the most celebrated features of that game. AniGO's "Spell 3 unlock" should be a visually spectacular, hype-inducing moment. This is a key spectator experience and streaming clip opportunity.

### 6.2 Open Questions for Playtesting

- How much Chi should each champion start with? (0 vs. enough for 1 cheap spell)
- Should Chi generation be identical across champions or champion-specific?
- How do champion spells interact with each other? (Can Nullify cancel a Trap? Can Mirror copy Shadow Stone?)
- Should champions be visible to both players during draft, or should draft be blind?
- What board size works best with champion spells? (9x9 likely, but 13x13 might allow more spell diversity)
- Should there be a ban phase? (With only 5 champions, banning 1 each creates 3 viable picks -- may be too restrictive)

### 6.3 What Could Go Wrong

| Risk | Mitigation |
|------|-----------|
| One champion dominates the meta | Small champion pool makes balance easier; patch quickly |
| Spells feel tacked onto Go rather than integrated | Tie spell effects to Go mechanics (liberties, territory, captures) rather than generic effects |
| Sabotage/Trickster feels unfun to play against | Ensure all hidden info is eventually revealed; limit trap duration |
| Adaptive/Balanced champion has no identity | Give it a clear "counter-spell" identity rather than generic flexibility |
| Players ignore champion system and just play Go | Make spells impactful enough that ignoring them is a clear disadvantage |
| Korean mythology feels unfamiliar to non-Korean players | Provide brief lore snippets; the archetypes (guardian, dragon, trickster, fox, sage) are universally readable |

---

## Sources

### GDC Talks and Dev Blogs
- [GDC 2015: Building a Sport -- The Design Philosophy of LoL](https://www.gdcvault.com/play/1021851/Building-a-Sport-The-Design)
- [GDC 2017: How Riot Creates New Champions](https://www.gamedeveloper.com/design/video-how-riot-creates-new-i-league-of-legends-i-champions)
- [/dev: On Champion Prototypes](https://nexus.leagueoflegends.com/en-us/2016/10/dev-on-champion-prototypes/)
- [/dev: Balance Framework Update](https://www.leagueoflegends.com/en-us/news/dev/dev-balance-framework-update/)
- [Ask Riot: Manaless Champions](https://www.leagueoflegends.com/en-us/news/dev/ask-riot-manaless-champions/)
- [Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/)

### Champion Design References
- [Champion Classes -- LoL Wiki](https://leagueoflegends.fandom.com/wiki/Champion_classes)
- [Champion Ability -- LoL Wiki](https://wiki.leagueoflegends.com/en-us/Champion_ability)
- [Resources & Champion Design in LoL](https://adamjmking.medium.com/resources-champion-design-in-league-of-legends-1264d6f223ff)
- [Riot Discusses Champion Design Philosophy](https://dotesports.com/league-of-legends/news/riot-discusses-leagues-champion-design-philosophy-rates-2020-champs-on-their-complexity)

### Card/Board Game References
- [LoR Champion Basics](https://support-legendsofruneterra.riotgames.com/hc/en-us/articles/360037094213-Champion-Basics)
- [Hearthstone Developer Insights: Class Identity](https://hearthstone.blizzard.com/en-us/news/23014810/developer-insights-class-identity-hall-of-fame-and-new-cards)
- [TFT Design Pillars](https://teamfighttactics.leagueoflegends.com/en-us/news/dev/dev-design-pillars-of-tft/)
- [Duelyst II General Ability Discussions](https://steamcommunity.com/app/2004320/discussions/0/3726197342914536309/)
- [Synergy in Board Game Design (BGG)](https://boardgamegeek.com/thread/2766203/good-examples-of-synergy-outside-tcgsccgs)

### Korean Mythology
- [Dokkaebi -- Wikipedia](https://en.wikipedia.org/wiki/Dokkaebi)
- [Kumiho -- Wikipedia](https://en.wikipedia.org/wiki/Kumiho)
- [Korean Mythological Creatures -- Study.com](https://study.com/academy/lesson/korean-mythological-creatures.html)
- [Korean Myths and Folklore on Game Character Design](https://www.academia.edu/110186203/Korean_Myth_and_Folklore_on_Game_Character_Design)
- [Korean Mythology: Spirit and Technology](https://alexstruever.com/en/korean-myths/)
