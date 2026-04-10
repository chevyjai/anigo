# AniGO Gameplay Research Brief
## Go + Magic Spells Game -- Comprehensive Research

**Prepared by:** Agent 13 (Game Researcher)
**Date:** 2026-04-08

---

## Executive Summary

- **Phantom Go is the closest existing precedent** to AniGO's core concept -- it adds imperfect information to Go via hidden boards and a referee, and is known to significantly degrade AI performance because MCTS fundamentally breaks down without perfect information.
- **KataGo has proven, exploitable weaknesses** -- adversarial research shows a 96%+ win rate against superhuman KataGo by exploiting cyclic group misevaluation. Imperfect information would compound these weaknesses dramatically.
- **The best spell/ability systems use "input randomness"** -- games like Slay the Spire and Legends of Runeterra give players random options to react to, rather than random outcomes after decisions. This is the gold standard for "fair but exciting."
- **No existing game combines Go with spells/abilities** -- this is genuinely novel design space. The closest precedents are Chess 2: The Sequel (chess + abilities) and Krosmaster Arena (tactical board game + spells).
- **Premium digital board game feel requires "juice"** -- Hearthstone's success proves that animation, sound, physicality simulation, and micro-interactions are essential for making a digital board game feel satisfying.

---

## 1. Go Variants That Add Chaos/Fun

### 1.1 Phantom Go (Blind Go)

**How it works:**
- Each player has their own board and can only see their own stones
- A referee maintains the true game state on a central (hidden) board
- When a player attempts a move, the referee checks legality -- if illegal (e.g., intersection already occupied), the player is told to try again but NOT told why it was illegal
- When a capture occurs, the referee announces the NUMBER of captured stones and removes them from both players' boards
- Typically played on 9x9 boards due to the extreme cognitive load
- Players must infer opponent stone positions from: illegal move rejections, capture announcements, and strategic reasoning

**How it changes strategy:**
- **Information gathering becomes a core mechanic** -- players sometimes make "probe" moves specifically to learn about the board state
- **Bluffing emerges naturally** -- you can build in areas the opponent doesn't know about
- **Territory estimation is vastly harder** -- you can't count what you can't see
- **Opening theory is disrupted** -- standard joseki assumes you can see the opponent's responses
- **Memory and deduction become key skills** alongside traditional Go skills

**Why this matters for AniGO:** Phantom Go proves that adding hidden information to Go creates a fundamentally different (and more human-friendly) game. AniGO's spell system could achieve similar effects with better UX -- spells that reveal, conceal, or transform board state could create Phantom Go-like dynamics without requiring a referee or separate boards.

Sources:
- [Phantom Go - Chessprogramming Wiki](https://www.chessprogramming.org/Phantom_Go)
- [Go Variants - Wikipedia](https://en.wikipedia.org/wiki/Go_variants)

### 1.2 Other Go Variants

**Toroidal Go:**
- Played on a doughnut-shaped surface where edges wrap around
- Eliminates corners and edges entirely -- the entire board is "center"
- Removes joseki (corner/edge patterns) from the game, forcing pure middle-game thinking
- Has had tournaments at the European Go Congress
- *Design implication:* A spell that temporarily makes a board section toroidal could create wild tactical situations

**One Color Go:**
- Both players use identical stones -- you must remember which stones are yours
- All standard Go rules apply; the only difference is visual
- Extremely challenging memory exercise; requires a referee or tracking system
- *Design implication:* A "confusion" spell that temporarily hides stone colors would create One Color Go dynamics for a limited area

**Capture Go (Atari Go):**
- First player to capture any stone(s) wins
- Eliminates territory scoring entirely -- pure tactical combat
- Invented by Yasutoshi Yasuda as a teaching tool
- Excellent for beginners; teaches the most exciting part of Go (capturing)
- *Design implication:* A game mode or spell that rewards capturing could shift play style from territorial to aggressive

**Atari Go:**
- Variant of Capture Go focused on the "atari" (threat to capture) mechanic
- Game ends on first capture, making every atari decisive
- Fast-paced, tense, beginner-friendly
- *Design implication:* Short-format AniGO modes could use Capture Go scoring for faster games

Sources:
- [Go Variants - Wikipedia](https://en.wikipedia.org/wiki/Go_variants)
- [KGS: One Color Go](https://www.gokgs.com/help/onecolorgo.html)
- [Go Variants to Spice Up Your Game](https://learngo.page/article/Go_Variants_to_Spice_Up_Your_Game.html)

### 1.3 Existing "Go + Abilities" Games

**No direct precedent exists.** No game combines Go with spell/ability mechanics. The closest analogues:

- **Chess 2: The Sequel** -- Adds 6 different armies with unique abilities to chess, plus a "dueling" mechanic for captures. Proved that adding asymmetric powers to a classic abstract game can work commercially.
- **Krosmaster Arena** -- Tactical miniatures game on a grid with spells and abilities. Shows how spell systems work on grid-based tactical boards.
- **Faeria / Duelyst** -- CCGs played on hex/grid boards where board position matters alongside card play. Demonstrate hybrid board-game + card-game design.
- **Summoner Wars** -- Board game where summoned units have unique abilities on a grid. Relevant for how abilities interact with spatial positioning.

**This means AniGO is genuinely novel** -- there is clear blue ocean here.

### 1.4 How Go Apps Handle UX

**OGS (Online Go Server):**
- Modern web-based interface, clean and functional
- Unique feature: correspondence games (asynchronous play over days)
- 30+ AI bots at various levels for practice
- Automated AI game review (post-game analysis)
- Joseki database and tutorials integrated
- *Strength:* Best learning/analysis tools. *Weakness:* Functional but not "premium" feeling

**KGS (Kiseido Go Server):**
- One of the oldest Western Go servers
- Unique review facility where players can discuss games together afterward
- Strong community features (teaching games, lectures)
- Java-based client feels dated
- *Strength:* Community and teaching. *Weakness:* Aging interface

**GoQuest:**
- Specializes in fast 9x9 and 13x13 games
- Optimized for mobile -- quick pick-up-and-play
- "Tsumego Challenge" feature: auto-matched puzzles based on your level
- Level-based ranking system (simpler than ELO)
- *Strength:* Speed and simplicity. *Weakness:* Limited board sizes and features

**BadukPop (Korean Go App):**
- 5,000+ Go problems curated by professional players
- Fun mascot character (Aji -- a golden Go stone with wings)
- AI opponents from 20 Kyu to 7+ Dan
- Interactive tutorial for beginners
- Cheerful music and friendly aesthetic
- Rated mode that auto-adjusts puzzle difficulty
- *Strength:* Best onboarding and personality. *Weakness:* Less competitive focus

**Key UX Takeaways for AniGO:**
1. BadukPop proves personality and charm matter -- Go apps don't have to be austere
2. GoQuest proves fast small-board games work on mobile
3. OGS proves post-game AI analysis is a valued feature
4. None of these apps have "premium" Hearthstone-level polish -- huge opportunity

Sources:
- [Online Go Servers: Top-7 Go Apps](https://gomagic.org/online-go-servers/)
- [BadukPop - Learn & Play Go](https://badukpop.com/)

---

## 2. Spell/Ability Systems in Competitive Games

### 2.1 Hearthstone's Design Wisdom

From the GDC talk "Hearthstone: 10 Bits of Design Wisdom" by Eric Dodds:

**Key principles that apply to AniGO:**

1. **Simple cards, complex interactions** -- Individual spells should be easy to understand, but combining them creates emergent complexity. A spell that "reveals a 3x3 area" is simple; using it to confirm a suspected weakness before attacking is emergent strategy.

2. **Every turn should feel like a puzzle** -- Players should have meaningful choices each turn. Hero Powers give a guaranteed baseline action every turn so you always have something to do.

3. **Avoid feel-bad moments** -- OTK (one-turn-kill) combos remove the "little victories" players experience throughout a game. Spells in AniGO should enhance play, not create unfun instant-win conditions.

4. **Digital-specific design** -- Hearthstone embraced what digital can do that physical can't (random card generation, transformation effects, complex triggered abilities). AniGO should design spells that only work in digital (fog of war, animated reveals, board transformations).

5. **Rapid iteration** -- Hearthstone was paper-prototyped extensively before going digital. AniGO should do the same with spell designs.

**Why Hearthstone is fun:** The mana system creates natural pacing (early game = small spells, late game = big spells). Hero Powers ensure you always have agency. RNG creates memorable moments ("highlight reel" plays) while skill determines long-term win rates.

Sources:
- [GDC Vault - Hearthstone: 10 Bits of Design Wisdom](https://www.gdcvault.com/play/1020775)
- [Hearthstone: 10 Rules of Great Design](https://80.lv/articles/hearthstone-10-rules-of-great-design)

### 2.2 Slay the Spire's Card System -- Input Randomness Done Right

**Core design pattern:**
- **Input randomness:** You are dealt random cards, then make deterministic decisions with them. The randomness happens BEFORE your choice, not after.
- **Correlated randomness:** The game uses anti-streak algorithms -- getting unlucky early increases your chance of getting lucky soon. Card draws aren't purely random; they use a "shuffle" system that guarantees you see your whole deck before reshuffling.
- **Skill absorbs variance:** Top players achieve 90%+ win rates despite heavy RNG, proving skill dominates over time. Research shows higher-skill players handle randomness fundamentally differently than lower-skill players.
- **Deck building as risk management:** Every card you add is a strategic choice about how much variance you're comfortable with. Lean decks = consistent but less powerful. Large decks = more options but less predictable.

**What this means for AniGO:**
- Spell drafting/selection should happen BEFORE placement (input randomness), not after
- Players should choose from random spell options (like Slay the Spire card rewards), not have random spell effects (output randomness)
- Anti-streak mechanics ensure the spell system feels fair over time
- Skill expression comes from WHICH spells you choose and WHEN you use them

Sources:
- [Slay the Spire and Randomness Tolerance](https://thethoughtfulgamer.com/2021/01/28/slay-the-spire-and-randomness-tolerance/)
- [Exploring the Impact of Randomness in Roguelike Deck-Building Games (Springer)](https://link.springer.com/chapter/10.1007/978-3-031-46775-2_9)
- [Are you lucky or skilled in Slay the Spire? (Research Paper)](https://www.diva-portal.org/smash/get/diva2:1563050/FULLTEXT02)

### 2.3 Auto Chess / Teamfight Tactics -- RNG + Strategy Balance

**How TFT handles RNG:**
- Shop offerings are random but follow rules (rarity tiers, anti-duplicate protection)
- Item drops have variance but guaranteed minimums
- Combat positioning is deterministic; unit AI has predictable targeting
- The RNG influences WHICH strategy you pursue, not WHETHER your strategy works
- Top players adapt to what they're offered rather than forcing a single plan

**Community reception:**
- Biggest criticism: "RNG decides games" (casual perception)
- Counter-argument from top players: "RNG creates the decisions; skill is in adapting" 
- The #1 ranked TFT player (Hafu) explicitly stated the game rewards adaptability, not luck
- Tournament formats use multiple games to let skill emerge over variance

**What this means for AniGO:**
- Spell availability should be somewhat random (you don't always get the spell you want)
- But players should always have meaningful choices among available options
- Multiple-game match formats for competitive play to smooth out variance
- The spell system should reward adaptation, not pre-planned combos

Sources:
- [Riot Games Discusses TFT RNG and Future Plans](https://screenrant.com/riots-game-teamfight-tactics-rng/)
- [Hafu explains balance between RNG and skill in TFT](https://dotesports.com/league-of-legends/news/hafu-explains-balance-between-rng-skill-in-tft)

### 2.4 Legends of Runeterra -- Spell Stack and Interaction Design

**The spell speed system (most relevant to AniGO):**
- **Burst spells:** Resolve instantly, opponent cannot react. (Like: small utility effects)
- **Fast spells:** Can be played in response to other spells; opponent can counter. Creates a "spell stack."
- **Slow spells:** Can only be played on your turn, not in combat or in response to other spells. Powerful but telegraphed.
- **Focus spells:** Can only be played outside of combat, resolve instantly.

**The spell stack mechanic:**
- When a slow or fast spell is played, a "stack" opens
- Both players alternate adding fast/burst spells until both pass
- Stack resolves last-in-first-out (like Magic: The Gathering)
- Maximum 9 fast/slow spells on the stack + 1 burst slot
- Creates deep interaction: "I play X, you respond with Y, I counter with Z"

**Why LoR's system is praised:**
- "Almost every single action allows the opponent to answer" -- most dynamic digital CCG
- Skill is the cornerstone -- game design is well-aligned with competitive integrity
- Back-and-forth creates tension and engagement every turn
- Clear visual communication of spell resolution order

**What this means for AniGO:**
- Spells could have "speeds" -- some instant (like placing a stone), some that give the opponent a chance to respond
- A response window for powerful spells creates interaction and counterplay
- The opponent should feel they can always react, never "cheated" by a surprise combo
- Visual clarity in spell resolution order is essential for competitive play

Sources:
- [Spell (Legends of Runeterra) Wiki](https://leagueoflegends.fandom.com/wiki/Spell_(Legends_of_Runeterra))
- [Why I like Legends of Runeterra](https://terrancraft.com/2021/01/11/why-i-like-legends-of-runeterra/)
- [Legends of Runeterra: A Dive Into Its Gameplay](https://javier-barnes-gd.medium.com/legends-of-runeterra-2-a-dive-into-its-gameplay-c8888c32bd0e)

### 2.5 What Makes a Spell System Feel "Fair But Exciting"

Synthesizing across all researched games, the key principles are:

1. **Transparency of rules:** Players must understand exactly what a spell does before they use it. No hidden mechanics.
2. **Counterplay exists:** For every powerful spell, there should be a way to mitigate, counter, or play around it.
3. **Input randomness over output randomness:** Randomize WHICH spells are available, not WHAT they do when cast.
4. **Bounded impact:** No single spell should be able to win the game outright. Spells should be force multipliers, not replacements for skill.
5. **Symmetric access:** Both players should have access to the same spell pool (even if they draft different spells). Asymmetry in options, not in power level.
6. **Clear feedback:** When a spell works, the player should understand why. When a spell fails to win, they should understand what they could have done differently.
7. **Emotional peaks without emotional valleys:** Good RNG creates "highlight reel" moments; bad RNG creates rage-quits. The goal is the former without the latter.

Sources:
- [What Makes a Game Feel "Fair"?](https://gameluster.com/what-makes-a-game-feel-fair-lessons-from-pvp-rng-and-real-money-play/)
- [How to use RNG in Competitive Games](https://www.gamedeveloper.com/design/how-to-use-rng-in-competitive-games)

---

## 3. Hidden Information + RNG in Competitive Games

### 3.1 Poker: Balancing RNG with Skill

**How poker solves the skill-luck balance:**
- **Short-term luck, long-term skill:** In any single hand, luck dominates. Over thousands of hands, the best players consistently profit. This is the fundamental model for competitive RNG games.
- **Position as information advantage:** Later-acting players have more information, creating a positional metagame.
- **Betting as information exchange:** Raises, calls, and folds communicate information about hand strength (truthfully or as bluffs).
- **Bankroll management:** Skilled players manage variance through bet sizing and game selection.
- **Tournament formats:** Multi-table tournaments use large sample sizes to ensure skill emerges.

**Relevance to AniGO with wagering:**
- If AniGO includes wagering/betting mechanics, poker's framework is the gold standard
- Information asymmetry (hidden spells, fog of war) creates natural bluffing opportunities
- The "short-term luck, long-term skill" dynamic keeps casual players engaged while rewarding dedication
- Bet sizing could map to spell investment -- committing more resources to a position signals confidence

Sources:
- [The Role of Luck vs. Skill in Poker](https://anteupmagazine.com/2025/01/22/the-role-of-luck-vs-skill-in-poker/)
- [Skill vs. Luck in Competitive Gaming](https://slopeplay.io/skill-vs-luck-competitive-gaming/)

### 3.2 Mahjong: Hidden Information in Asian Markets

**Why Mahjong is relevant:**
- Mahjong is the world's most popular hidden-information tile game, especially dominant in East Asian markets (China, Japan, Korea, Taiwan)
- Has >10^48 possible hidden states at each decision point -- far more complex than poker
- Combines hidden information with social deduction (reading opponents' discards)

**Key hidden information mechanics:**
- **Wall tiles (draw pile):** Unknown to all players
- **Private hand:** Known only to the holder
- **Discards:** Visible to all -- the primary information source
- **Defensive play:** Choosing safe discards to avoid giving opponents their winning tile
- **Reading opponents:** Inferring hand composition from what they discard and keep

**Market relevance:**
- Mobile Mahjong games dominate Asian app stores
- The social/competitive dynamic of Mahjong maps well to AniGO's target audience
- Mahjong proves that hidden information + skill + social deduction = massive market appeal in Asia

Sources:
- [Suphx: Mastering Mahjong with Deep Reinforcement Learning](https://ar5iv.labs.arxiv.org/html/2003.13590)
- [Mahjong Game Market Trends & Growth Analysis](https://www.wiseguyreports.com/reports/mahjong-game-market)

### 3.3 Input Randomness vs. Output Randomness

**Definitions (per Keith Burgun and game design literature):**

| Type | Definition | Example | Player Feel |
|------|-----------|---------|-------------|
| **Input Randomness** | Random events BEFORE the player's decision | Card draw, map generation, spell offerings | "I got interesting options -- now what do I do?" |
| **Output Randomness** | Random events AFTER the player's decision | Dice roll combat, critical hits, miss chance | "I made the right play but got screwed by RNG" |

**Key findings:**
- Keith Burgun argues output randomness is fundamentally bad for strategy games because it removes the link between good decisions and good outcomes
- Input randomness is widely accepted as good design because it creates decision variety without undermining skill
- The distinction is actually a spectrum: how much time does the player have to respond to the random event?
- Slay the Spire uses primarily input randomness (card draw) with minimal output randomness
- Hearthstone uses both -- praised for input randomness (card draw), criticized for output randomness (random targeting effects)

**Recommendation for AniGO:**
- **Strongly favor input randomness:** Spell draft/selection should be random; spell effects should be deterministic or near-deterministic
- **If using output randomness, telegraph it:** Players should know the probability distribution before committing
- **Give players time to respond:** Random events that resolve slowly are more tolerable than instant random outcomes

Sources:
- [Randomness and Game Design - Keith Burgun](http://keithburgun.net/randomness-and-game-design/)
- [A Defense of Randomness in Competitive Games](https://www.gamedeveloper.com/design/a-defense-of-randomness-in-competitive-games)
- [Input vs Output Randomness (BGG)](https://boardgamegeek.com/thread/1294990/input-vs-output-randomness)

### 3.4 Competitive RNG Games and Esport Integrity

**How competitive games with RNG maintain integrity:**

1. **Longer series formats:** Best-of-7, double elimination, multi-game matches. More games = more signal, less noise.
2. **Symmetric RNG:** Both players draw from the same pool. Asymmetric RNG (one player gets better options) feels unfair.
3. **Transparent probability:** Players and spectators should know the odds. Hidden probability feels arbitrary.
4. **Skill-dominant over time:** The best players should win 60-70% of games, not 51%. If RNG makes the game too coin-flippy, competitive integrity suffers.
5. **Memorable moments:** The best competitive RNG creates highlight-reel plays that spectators love. Poker's "river card" drama is peak entertainment.
6. **Adaptability as skill:** In the best RNG games, adapting to variance IS the skill. This is different from (and better than) executing a pre-planned strategy.

Sources:
- [Are RNG Mechanics Still Useful in Competitive Gaming?](https://www.criticalhit.net/gaming/are-rng-mechanics-still-useful-in-competitive-gaming/)
- [The Role of Luck: Why RNG Isn't the Answer](https://www.gamedeveloper.com/design/the-role-of-luck-why-rng-isn-t-the-answer)

---

## 4. AI Weaknesses in Imperfect Information Games

### 4.1 KataGo/AlphaGo: Known Vulnerabilities

**The Cyclic Group Exploit (2022-2023):**
- Researchers from FAR AI trained adversarial policies that beat KataGo with a >97% win rate
- The exploit: KataGo systematically misevaluates large cyclically connected groups of stones, believing they are nearly indestructible when they are not
- The adversary coaxes KataGo into building circular groups, then slowly surrounds and captures them
- KataGo only realizes the group is in danger when it is too late

**Specific win rates against KataGo:**
- Against professional-level KataGo: **100% win rate**
- Against superhuman KataGo (4,096 simulations): **96% win rate**
- Against strongly superhuman KataGo (10M simulations): **72% win rate**

**The Pass Attack:**
- Simpler exploit that tricks KataGo into passing prematurely, ending the game favorably
- Exploits scoring rule interactions
- Was patched with hand-coded fixes, but the cyclic vulnerability persists

**Human replication:**
- In 2022, amateur player Kellin Pelrine used the cyclic attack strategy to defeat KataGo without algorithmic assistance
- This proves humans can learn and execute anti-AI strategies

**Defense attempts:**
- Three defense strategies tested: positional adversarial training, iterated adversarial training, and vision transformers replacing CNNs
- Adversarial training defends against known attacks but new qualitatively different attacks emerge
- The AlphaZero architecture appears "intrinsically vulnerable" -- two independent teams found distinct exploits

**Key insight for AniGO:** If even perfect-information Go AI has exploitable weaknesses, imperfect-information Go will be dramatically harder for AI. AniGO's spell system adds layers of uncertainty that compound these existing vulnerabilities.

Sources:
- [Even Superhuman Go AIs Have Surprising Failure Modes](https://far.ai/post/2023-07-superhuman-go-ais/)
- [Adversarial Policies Beat Superhuman Go AIs (ICML 2023)](https://arxiv.org/abs/2211.00241)
- [Beyond the Board: Exploring AI Robustness Through Go](https://far.ai/post/2024-06-go-defense/)

### 4.2 Phantom Go AI Research

**Core finding: MCTS fundamentally breaks down with hidden information.**

- Standard MCTS requires knowing the current game state to work. In Phantom Go, the true state is hidden, making MCTS inapplicable without significant modification.
- **Belief-State MCTS (BS-MCTS):** Incorporates probability distributions over possible states. Each node represents a "belief state" rather than a concrete position. Much weaker than standard MCTS in Go.
- **Information Set MCTS (IS-MCTS):** Searches trees of information sets rather than game states. Solves strategy fusion and non-locality problems that plague simpler approaches.
- **Perfect Information Monte Carlo (PIMC):** Samples random possible states and runs standard MCTS on each. Works okay but suffers from strategy fusion.

**Strategy fusion problem:** When the AI averages across all possible hidden states, it can choose moves that are optimal "on average" but terrible in the actual state. This is a fundamental limitation, not just a computational one.

**Performance gap:** Phantom Go AI is dramatically weaker than standard Go AI. While KataGo plays at superhuman levels in standard Go, Phantom Go bots play at intermediate amateur level at best.

**What this means for AniGO:** Every spell that adds hidden information (fog of war, hidden stones, concealed spells) directly attacks the fundamental weakness of MCTS-based AI. This is the most reliable way to ensure humans can compete with AI.

Sources:
- [Belief-State Monte Carlo Tree Search for Phantom Go (IEEE)](https://ieeexplore.ieee.org/document/7997911/)
- [AlphaZero-like baselines for imperfect information games (Frontiers)](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2023.1014561/full)
- [Information Set Monte Carlo Tree Search (IEEE)](https://ieeexplore.ieee.org/document/6203567/)

### 4.3 Game Mechanics That Specifically Degrade MCTS Performance

| Mechanic | Why It Breaks MCTS | AniGO Application |
|----------|-------------------|-------------------|
| **Hidden information** | MCTS needs to know the state; belief states are exponentially harder | Fog of war spells, hidden stone placement |
| **Simultaneous moves** | MCTS assumes alternating play; simultaneous decisions create strategy fusion | Spell casting during opponent's turn |
| **Stochastic outcomes** | Random effects multiply the search space | Spells with variable effects |
| **Large action spaces** | More options per turn = worse MCTS convergence | Spell + stone placement = double the actions |
| **Long-horizon planning under uncertainty** | MCTS strength is deep search; uncertainty makes deep search meaningless | Spells that change board state unpredictably |
| **Opponent modeling** | MCTS assumes rational opponent; humans bluff and play unpredictably | Bluffing about which spells you hold |
| **Non-transitive dynamics** | MCTS struggles when strategy A beats B, B beats C, but C beats A | Rock-paper-scissors spell interactions |

### 4.4 AI vs. Humans in Imperfect Information Games (State of the Art)

**Poker AI -- Pluribus (2019):**
- First AI to beat elite professionals in 6-player no-limit Texas Hold'em
- Uses a limited-lookahead search algorithm (not full game tree search)
- Trained with only $150 of cloud computing
- But: poker has a relatively small action space and short horizons compared to Go

**Mahjong AI -- Suphx (2019):**
- Microsoft's AI surpasses 99.99% of ranked players on Tenhou platform
- Uses deep reinforcement learning with perfect information training + imperfect information adaptation
- But: Mahjong has much simpler board state than Go (no spatial reasoning required)

**Key insight:** AI has achieved superhuman performance in poker and Mahjong, but these games have much simpler state spaces than Go. **Go + hidden information + spells would be uniquely challenging for AI** because it combines Go's massive spatial complexity with poker/Mahjong's information asymmetry. No existing AI can handle both simultaneously at superhuman level.

Sources:
- [Superhuman AI for multiplayer poker (Science)](https://www.science.org/doi/10.1126/science.aay2400)
- [Suphx: The World Best Mahjong AI](https://www.microsoft.com/en-us/research/project/suphx-mastering-mahjong-with-deep-reinforcement-learning/)

---

## 5. Board Game Digital Adaptations That Feel Premium

### 5.1 Chess.com and Lichess UX

**Chess.com:**
- Sub-100ms move acknowledgment -- near-instant feedback
- Gamification: rating system, puzzles, lessons, achievements, daily streaks
- Premium tier with advanced analysis, openings explorer, endgame drills
- Social features: friends, clubs, tournaments
- *What works:* Progression systems keep players coming back. Rating is addictive.

**Lichess:**
- Open-source, completely free, no ads
- Chessground engine: custom DOM diff algorithm, 10K gzipped footprint
- SVG drawing for circles, arrows, custom annotations
- Clean, fast, minimalist design
- *What works:* Speed and purity of experience. No friction between wanting to play and playing.

**Lessons for AniGO:**
- Rating/progression systems are essential for retention
- Fast matchmaking and instant feedback are non-negotiable
- Analysis tools (post-game review) add enormous value
- Both free (Lichess model) and freemium (Chess.com model) can work

Sources:
- [Lichess Chessground (GitHub)](https://github.com/lichess-org/chessground)
- [Design A Chess Game System Design](https://www.systemdesignhandbook.com/guides/design-a-chess-game-system-design/)

### 5.2 BadukPop UX Analysis

**What BadukPop gets right:**
- **Personality:** Aji the mascot (golden winged Go stone) gives the app character
- **Progressive difficulty:** 5,000+ problems curated by pros, auto-adjusting to player level
- **Cheerful aesthetic:** Music, colors, and animations feel welcoming, not intimidating
- **AI range:** 20 Kyu to 7+ Dan opponents -- serves beginners through advanced players
- **Interactive tutorial:** Not just rules -- guided play that teaches through doing

**What BadukPop lacks:**
- No spell/ability system (standard Go only)
- Limited competitive/social features
- No premium visual polish comparable to Hearthstone
- No spectator mode or streaming integration

**Lessons for AniGO:**
- A Go app CAN be fun and approachable -- BadukPop proves it
- Mascots and personality work for Go audiences (not just kids)
- Auto-adjusting difficulty is essential for retention
- The gap between BadukPop's charm and Hearthstone's polish is where AniGO should aim

Sources:
- [BadukPop - Google Play](https://play.google.com/store/apps/details?id=com.coreplane.badukpop.prod)
- [BadukPop official site](https://badukpop.com/)

### 5.3 Hearthstone's Board/Card Feel

**What makes Hearthstone satisfying:**

1. **Everything feels physical:** Cards tilt and swoosh when dragged. Large minions slam into the board with visible cracks. Shadows are cast as cards lift. The board feels like a real table.

2. **Juice everywhere:** Every action has feedback -- sounds, particles, screen shake. A "+1" token doesn't just appear; it's animated, punctuated with sound, tied to a rhythm of success.

3. **The board is interactive:** Players can click background elements while waiting (gem mines, catapults, etc.). This reduces perceived wait time and adds delight.

4. **Visual effects communicate information:** Spell effects tell you what happened through animation, not just text. Freeze spells coat the board in ice. Fire spells leave scorch marks.

5. **Physicality unifies the interface:** Shop rocks and turns as you browse. Announcement banners are wooden signs swinging on chains. Everything uses consistent physics simulation.

6. **Sound design is contextual:** Different surfaces make different sounds. Impactful plays have impactful audio. The volume of feedback scales with the importance of the action.

**Key design philosophy:** "Despite the online focus, making the game feel physical was an early goal, implemented through art, animation, and sound design."

Sources:
- [Crafting an Immersive UI Experience Like Hearthstone's](https://nucanon.com/blog/nucanon-com-blog-uncovering-your-game-s-seed-crafting-an-immersive-ui-experience-like-hearthstone-s)
- [Hearthstone UI Analysis](https://finalbossblues.com/on-hearthstones-ui/)
- [Hearthstone's UI - In An Age](https://inanage.com/2013/08/29/hearthstones-ui/)

### 5.4 UI Patterns That Make Digital Board Games Feel Tactile

From Workinman's 8 tips for digital board games and broader research:

1. **Respect the game's natural rhythm** -- Let players control pacing. Speed up replays, slow down for decisions.
2. **Automate setup, not engagement** -- Remove friction (shuffling, scoring) but keep meaningful interactions (drawing cards, placing stones).
3. **Design with context, not just function** -- Use tooltips, overlays, and adaptive UI. Introduce mechanics gradually.
4. **Make rewards feel like rewards** -- "Numbers don't excite players. Feedback does." Animate gains, celebrate victories.
5. **Bring the world to life** -- Atmospheric audio, environmental animation, thematic consistency.
6. **Don't neglect solo play** -- AI opponents should play strategically, not reactively.
7. **Bridge physical and digital** -- Cross-platform features, complementary experiences.
8. **Keep it fresh** -- Seasonal content, rotating modes, time-limited events.

**Additional patterns from research:**
- **Micro-interactions:** Drawing a card, placing a stone, revealing a spell -- each should have tactile feedback
- **Z-index depth:** Cards/stones should cast shadows and have visible depth layers
- **Physics simulation:** Gentle bouncing, rotation, weight -- objects should obey (exaggerated) physics
- **Contextual audio:** Stone placement on wood sounds different from stone capture. Spell casting has unique audio per spell type.
- **Particle effects:** Subtle particles for ambient mood, dramatic particles for big moments

Sources:
- [Making Digital Board Games Feel Real: 8 Tips](https://workinman.com/digital-board-games/)
- [Game UI Database - Hearthstone](https://www.gameuidatabase.com/gameData.php?id=628)

---

## Design Implications for AniGO

### What This Research Means for Our Game

1. **Hidden information is our strongest anti-AI mechanic.** Every spell that adds fog, concealment, or uncertainty directly attacks MCTS's fundamental weakness. This should be a core design pillar.

2. **Input randomness for spell selection, deterministic spell effects.** Players draft from random spell offerings (like Slay the Spire rewards). Once selected, spells do exactly what they say. This is the formula that feels "fair but exciting."

3. **Spell speeds create interaction.** Borrowing from LoR: some spells are instant (burst), some allow response (fast), some are telegraphed (slow). This creates back-and-forth tension.

4. **The UX bar is Hearthstone, not OGS.** Current Go apps are functional but lack "juice." AniGO should feel physical, satisfying, and alive. Stone placement should thump. Spells should dazzle. The board should react.

5. **BadukPop proves Go can be approachable.** Personality, mascots, cheerful aesthetic -- these work for Go. AniGO should lean into character and charm.

6. **Competitive integrity requires longer match formats.** Best-of-3 or best-of-5 for ranked play. Single games for casual. This lets skill emerge over RNG variance.

7. **The Asian market is primed for this.** Mahjong's dominance proves Asian audiences love hidden information + skill + social deduction. Go's cultural significance in East Asia + modern game mechanics = massive potential.

8. **No direct competitor exists.** "Go + spells" is genuinely novel. The closest precedents (Chess 2, Krosmaster Arena) are in different game categories. This is blue ocean.

---

## Prioritized Recommendations

### Must-Have (Core Design)
1. **Fog of war / hidden information spells** as the primary anti-AI mechanic
2. **Input randomness spell draft system** (choose from random offerings before the game or at intervals)
3. **Deterministic spell effects** (no output randomness on spell resolution)
4. **Spell speed tiers** (instant, responsive, telegraphed) for interaction depth
5. **9x9 board as primary format** for fast games and mobile-friendly play

### Should-Have (Quality)
6. **Hearthstone-level "juice"** -- animation, sound, physics on every interaction
7. **Progressive tutorial** with guided play (not just rules text)
8. **Post-game AI analysis** showing optimal spell usage
9. **Rating system** with ELO-like progression
10. **Best-of-3 ranked format** for competitive integrity

### Nice-to-Have (Expansion)
11. **Seasonal spell rotations** to keep meta fresh
12. **Spectator mode** with spell reveal delays for streaming
13. **Wagering mechanics** inspired by poker's betting framework
14. **Multiple board sizes** (9x9, 13x13, 19x19) with different spell pools
15. **Toroidal/variant board modes** as limited-time events

---

## Key Sources

### Go Variants & AI
- [Go Variants - Wikipedia](https://en.wikipedia.org/wiki/Go_variants)
- [Phantom Go - Chessprogramming Wiki](https://www.chessprogramming.org/Phantom_Go)
- [Even Superhuman Go AIs Have Surprising Failure Modes](https://far.ai/post/2023-07-superhuman-go-ais/)
- [Adversarial Policies Beat Superhuman Go AIs](https://arxiv.org/abs/2211.00241)
- [Belief-State MCTS for Phantom Go (IEEE)](https://ieeexplore.ieee.org/document/7997911/)
- [Information Set Monte Carlo Tree Search (IEEE)](https://ieeexplore.ieee.org/document/6203567/)

### Game Design & RNG
- [GDC Vault - Hearthstone: 10 Bits of Design Wisdom](https://www.gdcvault.com/play/1020775)
- [Slay the Spire and Randomness Tolerance](https://thethoughtfulgamer.com/2021/01/28/slay-the-spire-and-randomness-tolerance/)
- [Randomness and Game Design - Keith Burgun](http://keithburgun.net/randomness-and-game-design/)
- [A Defense of Randomness in Competitive Games](https://www.gamedeveloper.com/design/a-defense-of-randomness-in-competitive-games)
- [How to use RNG in Competitive Games](https://www.gamedeveloper.com/design/how-to-use-rng-in-competitive-games)

### Competitive Games & Hidden Information
- [Superhuman AI for multiplayer poker (Science)](https://www.science.org/doi/10.1126/science.aay2400)
- [Suphx: Mastering Mahjong (Microsoft Research)](https://www.microsoft.com/en-us/research/project/suphx-mastering-mahjong-with-deep-reinforcement-learning/)
- [Legends of Runeterra Spell System](https://leagueoflegends.fandom.com/wiki/Spell_(Legends_of_Runeterra))
- [What Makes a Game Feel "Fair"?](https://gameluster.com/what-makes-a-game-feel-fair-lessons-from-pvp-rng-and-real-money-play/)

### UX & Premium Feel
- [Making Digital Board Games Feel Real: 8 Tips](https://workinman.com/digital-board-games/)
- [Hearthstone UI Analysis](https://finalbossblues.com/on-hearthstones-ui/)
- [BadukPop](https://badukpop.com/)
- [Online Go Servers: Top-7](https://gomagic.org/online-go-servers/)
- [Lichess Chessground (GitHub)](https://github.com/lichess-org/chessground)
