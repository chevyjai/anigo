# AniGO: Go Rules Implementation Spec

**Version**: 1.0 (MVP)
**Date**: 2026-04-08
**Author**: Agent 8 (Go Chess Mechanics Specialist)
**Board**: 9x9
**Ruleset**: Modified Chinese (Area) Scoring with Spell Extensions

This document is the authoritative reference for front-end developers implementing AniGO's Go engine. Every algorithm is specified as pseudocode that maps directly to code. Every edge case is enumerated.

---

## Table of Contents

1. [Board State Representation](#1-board-state-representation)
2. [Core Go Algorithms](#2-core-go-algorithms)
3. [Turn Flow and Phase Logic](#3-turn-flow-and-phase-logic)
4. [Spell Integration Rules](#4-spell-integration-rules)
5. [Edge Cases](#5-edge-cases)
6. [AI Implementation Notes](#6-ai-implementation-notes)
7. [Constants and Configuration](#7-constants-and-configuration)

---

## 1. Board State Representation

### Cell States

```
enum CellState {
  EMPTY,          // No stone, no effect
  BLACK,          // Black stone
  WHITE,          // White stone
  VOID            // Permanently removed from play (Void Rift)
}
```

### Hidden Spell Overlays

Hidden spell effects are stored in separate data structures, NOT in the cell state enum. This is because a cell can have a stone AND a spell effect (e.g., a Fortified black stone), and hidden effects must not leak to the opponent's view layer.

```
struct BoardState {
  cells: CellState[9][9]               // The visible board
  previousBoardHash: string             // For ko detection (hash of cells array after last move)
  
  // Spell overlays (server-authoritative, hidden from opponent)
  fortified: Map<Position, {owner: Color, turnsRemaining: int}>
  phantoms: Map<Position, {owner: Color, turnsRemaining: int}>
  snares: Map<Position, {owner: Color}>
  voidCount: {BLACK: int, WHITE: int}   // Track per-player Void usage (max 2 each)
}
```

### Coordinate System

```
Position = {row: int, col: int}  // (0,0) is top-left, (8,8) is bottom-right
```

### Adjacency

```
function getAdjacent(row, col):
  neighbors = []
  for (dr, dc) in [(-1,0), (1,0), (0,-1), (0,1)]:
    nr = row + dr
    nc = col + dc
    if 0 <= nr < 9 AND 0 <= nc < 9:
      neighbors.append((nr, nc))
  return neighbors
```

Diagonal cells are NEVER adjacent in Go. All algorithms use 4-directional adjacency only.

---

## 2. Core Go Algorithms

### 2.1 Group Finding (Flood Fill)

This is the foundational algorithm. Every other algorithm depends on it.

```
function findGroup(board, row, col) -> Set<Position>:
  /**
   * Returns the set of all positions in the connected group containing (row, col).
   * A group is a maximal set of same-color stones connected by horizontal/vertical adjacency.
   * Returns empty set if (row, col) is EMPTY or VOID.
   */
  color = board.cells[row][col]
  if color != BLACK and color != WHITE:
    return {}
  
  group = {}
  queue = [(row, col)]
  visited = Set containing (row, col)
  
  while queue is not empty:
    (r, c) = queue.dequeue()
    group.add((r, c))
    
    for (nr, nc) in getAdjacent(r, c):
      if (nr, nc) not in visited AND board.cells[nr][nc] == color:
        visited.add((nr, nc))
        queue.enqueue((nr, nc))
  
  return group
```

### 2.2 Liberty Counting

```
function countLiberties(board, row, col) -> int:
  /**
   * Count the number of liberties of the group containing (row, col).
   * A liberty is an EMPTY cell adjacent to any stone in the group.
   * VOID cells do NOT count as liberties.
   * Phantom stones do NOT block liberties (they are not real stones).
   */
  group = findGroup(board, row, col)
  if group is empty:
    return 0
  
  liberties = Set()
  for (r, c) in group:
    for (nr, nc) in getAdjacent(r, c):
      cellState = board.cells[nr][nc]
      // Check if this is actually a Phantom (not a real stone)
      if (nr, nc) in board.phantoms:
        cellState = EMPTY  // Phantom doesn't really exist
      if cellState == EMPTY:
        liberties.add((nr, nc))
      // VOID and occupied cells are NOT liberties
  
  return liberties.size()
```

**IMPORTANT**: Liberty counting must see through Phantoms. A Phantom stone does not reduce liberties of adjacent groups. The server must resolve this correctly even though the opponent sees a Phantom as a real stone.

### 2.3 Liberty Counting with Fortification

```
function getEffectiveLiberties(board, row, col) -> int:
  /**
   * Same as countLiberties, but if ANY stone in the group is Fortified (Stone Skin),
   * the group always has at least 1 liberty.
   */
  group = findGroup(board, row, col)
  baseLiberties = countLiberties(board, row, col)
  
  for (r, c) in group:
    if (r, c) in board.fortified AND board.fortified[(r,c)].turnsRemaining > 0:
      return max(baseLiberties, 1)
  
  return baseLiberties
```

**Note**: Fortification protects the ENTIRE GROUP, not just the single stone. If any stone in a connected group is Fortified, the whole group cannot reach 0 effective liberties through normal capture. This follows from Go's rule that capture applies to groups, not individual stones.

### 2.4 Capture Detection

```
function resolveCaptures(board, row, col, placedColor) -> List<Position>:
  /**
   * After placing a stone of `placedColor` at (row, col), check for captures.
   * ORDER MATTERS:
   *   1. First check all adjacent ENEMY groups for 0 liberties -> capture them
   *   2. Then check the placed stone's own group for 0 liberties -> suicide (illegal, should be pre-checked)
   * Returns list of all captured stone positions.
   */
  opponentColor = opposite(placedColor)
  captured = []
  
  // Step 1: Check enemy groups adjacent to the placed stone
  checkedGroups = Set()  // Avoid re-checking the same group
  for (nr, nc) in getAdjacent(row, col):
    if board.cells[nr][nc] == opponentColor AND (nr, nc) not in checkedGroups:
      group = findGroup(board, nr, nc)
      checkedGroups.addAll(group)
      if getEffectiveLiberties(board, nr, nc) == 0:
        captured.addAll(group)
  
  // Step 2: Remove captured stones from board
  for (r, c) in captured:
    board.cells[r][c] = EMPTY
    // Also remove any spell effects on captured stones
    board.fortified.remove((r, c))
    // Note: Phantoms cannot be captured (they aren't real stones)
  
  return captured
```

### 2.5 Legal Move Validation

```
function isLegalMove(board, row, col, color) -> bool:
  /**
   * Determines if placing a stone of `color` at (row, col) is legal.
   * Checks in order:
   *   1. Bounds check
   *   2. Cell is EMPTY (not VOID, not occupied by a real stone)
   *   3. Not a ko-banned move
   *   4. Not suicide
   */
  
  // 1. Bounds
  if row < 0 OR row >= 9 OR col < 0 OR col >= 9:
    return false
  
  // 2. Cell must be EMPTY
  //    Phantoms occupy a cell visually but the cell state is still tracked as the phantom owner's color
  //    Server-side: check the REAL cell state, ignoring phantoms
  realCellState = board.cells[row][col]
  if (row, col) in board.phantoms:
    realCellState = EMPTY  // Phantom isn't really there
  if realCellState != EMPTY:
    return false
  
  // 3. Ko check
  if isKo(board, row, col, color):
    return false
  
  // 4. Suicide check
  if isSuicide(board, row, col, color):
    return false
  
  return true
```

### 2.6 Suicide Detection

```
function isSuicide(board, row, col, color) -> bool:
  /**
   * A move is suicide if, after placing the stone and performing enemy captures,
   * the placed stone's group has 0 effective liberties.
   * 
   * Suicide is ILLEGAL in AniGO (Japanese-style suicide rule).
   */
  // Simulate placement
  boardCopy = deepCopy(board)
  boardCopy.cells[row][col] = color
  
  // Resolve enemy captures first (this may free up liberties)
  captured = resolveCaptures(boardCopy, row, col, color)
  
  // Now check if our own group has liberties
  if getEffectiveLiberties(boardCopy, row, col) == 0:
    return true  // This would be suicide
  
  return false
```

### 2.7 Ko Detection

```
function isKo(board, row, col, color) -> bool:
  /**
   * Simple ko rule: a move is illegal if it would recreate the exact board position
   * that existed immediately before the opponent's last move.
   * 
   * Implementation: after simulating the move + captures, hash the resulting board.
   * Compare to board.previousBoardHash.
   * If identical -> ko violation.
   */
  boardCopy = deepCopy(board)
  boardCopy.cells[row][col] = color
  resolveCaptures(boardCopy, row, col, color)
  
  resultHash = hashBoard(boardCopy.cells)
  return resultHash == board.previousBoardHash
```

```
function hashBoard(cells) -> string:
  /**
   * Produce a unique hash of the board state.
   * Only hash the cells array (not spell overlays).
   * Use a fast hash (e.g., Zobrist hashing for performance, or JSON stringify + SHA for correctness).
   */
  // Simple approach: serialize the 9x9 grid to a string
  // Production approach: Zobrist hashing with pre-generated random bitstrings per (position, color)
  return hash(serialize(cells))
```

**Note on Superko**: For MVP, we use simple ko (compare to one previous state). Full positional superko (compare to ALL previous states) is not required for 9x9 with spells, as the spell system makes long cycles extremely unlikely. If needed post-MVP, store a Set of all previous board hashes and check membership.

### 2.8 Scoring (Chinese Area Scoring)

```
function score(board) -> {blackScore: float, whiteScore: float, winner: Color}:
  /**
   * Chinese area scoring:
   *   - Each stone on the board counts as 1 point for its color
   *   - Each empty intersection surrounded entirely by one color counts as 1 point for that color
   *   - VOID cells count for nobody
   *   - Phantom stones are removed before scoring
   *   - White receives +5.5 komi
   */
  
  // Step 0: Remove all Phantom stones
  for (pos, phantom) in board.phantoms:
    board.cells[pos.row][pos.col] = EMPTY
  board.phantoms.clear()
  
  // Step 1: Count stones
  blackStones = 0
  whiteStones = 0
  for row in 0..8:
    for col in 0..8:
      if board.cells[row][col] == BLACK: blackStones++
      if board.cells[row][col] == WHITE: whiteStones++
  
  // Step 2: Determine territory for each empty region
  blackTerritory = 0
  whiteTerritory = 0
  visited = Set()
  
  for row in 0..8:
    for col in 0..8:
      if board.cells[row][col] == EMPTY AND (row, col) not in visited:
        // Flood fill to find connected empty region
        region = Set()
        borderColors = Set()
        queue = [(row, col)]
        visited.add((row, col))
        
        while queue is not empty:
          (r, c) = queue.dequeue()
          region.add((r, c))
          
          for (nr, nc) in getAdjacent(r, c):
            cell = board.cells[nr][nc]
            if cell == EMPTY AND (nr, nc) not in visited:
              visited.add((nr, nc))
              queue.enqueue((nr, nc))
            elif cell == BLACK:
              borderColors.add(BLACK)
            elif cell == WHITE:
              borderColors.add(WHITE)
            // VOID cells: do not add to borderColors, do not traverse
        
        // Assign territory
        if borderColors == {BLACK}:
          blackTerritory += region.size()
        elif borderColors == {WHITE}:
          whiteTerritory += region.size()
        // else: dame (neutral) or bordered by both colors -> counts for nobody
  
  // Step 3: Final scores
  blackScore = blackStones + blackTerritory
  whiteScore = whiteStones + whiteTerritory + 5.5  // komi
  
  winner = blackScore > whiteScore ? BLACK : WHITE
  // Tie is impossible due to 0.5 komi
  
  return {blackScore, whiteScore, winner}
```

### 2.9 Pass and Game End

```
function handlePass(gameState, color):
  /**
   * When a player passes:
   *   1. No stone is placed
   *   2. No spell is required (passing is a standalone action)
   *   3. The passing player gains +2 Chi
   *   4. Check for consecutive passes -> game end
   */
  gameState.chi[color] = min(gameState.chi[color] + 2, 10)  // Cap at 10
  
  if gameState.lastActionWasPass:
    // Two consecutive passes -> game ends
    revealAllHiddenSpells(gameState)  // Reveal everything before scoring
    return score(gameState.board)
  else:
    gameState.lastActionWasPass = true
  
  // Note: any non-pass action resets lastActionWasPass to false
```

---

## 3. Turn Flow and Phase Logic

### 3.1 Complete Turn Sequence

```
function executeTurn(gameState, action):
  /**
   * action is one of:
   *   { type: "PLACE", row, col }
   *   { type: "PLACE_AND_SPELL", row, col, spell, spellTarget }
   *   { type: "CAST_SPELLS", spells: [{spell, target}, {spell, target}?] }
   *   { type: "PASS" }
   */
  
  currentColor = gameState.activePlayer
  
  // ===== PHASE 1: UPKEEP =====
  // 1a. Gain base Chi
  gameState.chi[currentColor] = min(gameState.chi[currentColor] + 1, 10)
  
  // 1b. Gain Chi Well income
  for each chiWell in gameState.chiWells:
    controller = getChiWellController(gameState.board, chiWell.position)
    if controller == currentColor:
      gameState.chi[currentColor] = min(gameState.chi[currentColor] + 1, 10)
  
  // 1c. Draw a spell card (if hand not full and deck not empty)
  if gameState.hand[currentColor].size() < 4 AND gameState.deck[currentColor].size() > 0:
    drawnSpell = gameState.deck[currentColor].pop()
    gameState.hand[currentColor].add(drawnSpell)
  
  // 1d. Decrement spell durations and resolve start-of-turn effects
  decrementSpellDurations(gameState, currentColor)
  resolveSmolderTicks(gameState, currentColor)
  
  // ===== PHASE 2: ACTION =====
  // Check for forced pass (Snare effect from previous turn)
  if gameState.forcedPass[currentColor]:
    gameState.forcedPass[currentColor] = false
    // Forced pass grants NO Chi (unlike voluntary pass)
    gameState.lastActionWasPass = false  // Forced pass does NOT count toward consecutive passes
    advanceTurn(gameState)
    return
  
  switch action.type:
    case "PLACE":
      executeStonePlacement(gameState, action.row, action.col, currentColor)
      gameState.lastActionWasPass = false
      
    case "PLACE_AND_SPELL":
      // Dual Action: costs spell.cost + 1 Chi surcharge
      totalCost = action.spell.cost + 1
      if gameState.chi[currentColor] < totalCost:
        return ERROR("Insufficient Chi for Dual Action")
      executeStonePlacement(gameState, action.row, action.col, currentColor)
      gameState.chi[currentColor] -= totalCost
      executeSpell(gameState, action.spell, action.spellTarget, currentColor)
      gameState.lastActionWasPass = false
      
    case "CAST_SPELLS":
      // Up to 2 spells, no stone placed
      for each {spell, target} in action.spells:
        if gameState.chi[currentColor] < spell.cost:
          return ERROR("Insufficient Chi")
        gameState.chi[currentColor] -= spell.cost
        executeSpell(gameState, spell, target, currentColor)
      gameState.lastActionWasPass = false
      
    case "PASS":
      handlePass(gameState, currentColor)
      advanceTurn(gameState)
      return
  
  // ===== PHASE 3: RESOLUTION =====
  // 3a. Standard Go captures (already handled in executeStonePlacement)
  // 3b. Spell effects resolved in executeSpell
  // 3c. Check Snare triggers (handled in executeStonePlacement)
  // 3d. Award Chi for captures: +1 per stone captured this turn
  //     (already handled inline during capture resolution)
  
  advanceTurn(gameState)
```

### 3.2 Stone Placement

```
function executeStonePlacement(gameState, row, col, color):
  board = gameState.board
  
  // Validate
  if not isLegalMove(board, row, col, color):
    return ERROR("Illegal move")
  
  // Save previous board hash for ko (BEFORE placing)
  gameState.board.previousBoardHash = hashBoard(board.cells)
  
  // Check if a Phantom occupies this intersection
  if (row, col) in board.phantoms:
    // Placing a real stone on a Phantom: Phantom is destroyed
    phantom = board.phantoms[(row, col)]
    board.phantoms.remove((row, col))
    // The real stone placement proceeds normally
  
  // Place stone
  board.cells[row][col] = color
  
  // Resolve captures
  captured = resolveCaptures(board, row, col, color)
  
  // Award capture Chi
  captureCount = captured.size()
  gameState.chi[color] = min(gameState.chi[color] + captureCount, 10)
  gameState.prisoners[color] += captureCount
  
  // Check Snare trigger
  if (row, col) in board.snares:
    snare = board.snares[(row, col)]
    if snare.owner != color:
      // Enemy Snare triggered: opponent loses next turn
      gameState.forcedPass[color] = true
      board.snares.remove((row, col))
    // Friendly Snare: nothing happens (Snare remains active)
  
  // Check if placing adjacent to a Phantom reveals it
  for (nr, nc) in getAdjacent(row, col):
    if (nr, nc) in board.phantoms:
      phantom = board.phantoms[(nr, nc)]
      if phantom.owner != color:
        // Opponent discovered the Phantom by playing adjacent
        board.phantoms.remove((nr, nc))
        board.cells[nr][nc] = EMPTY  // Remove the visual fake stone
```

### 3.3 Spell Duration Decrement

```
function decrementSpellDurations(gameState, currentColor):
  /**
   * Called at the START of currentColor's Upkeep phase.
   * Decrement all spell durations owned by currentColor.
   * Expired effects are removed.
   */
  board = gameState.board
  
  // Stone Skin (Fortified)
  toRemove = []
  for (pos, fort) in board.fortified:
    if fort.owner == currentColor:
      fort.turnsRemaining -= 1
      if fort.turnsRemaining <= 0:
        toRemove.append(pos)
  for pos in toRemove:
    board.fortified.remove(pos)
    // After Fortification expires, re-check liberties of that group
    recheckLiberties(gameState, pos)
  
  // Mirage (Phantom) duration
  toRemove = []
  for (pos, phantom) in board.phantoms:
    if phantom.owner == currentColor:
      phantom.turnsRemaining -= 1
      if phantom.turnsRemaining <= 0:
        toRemove.append(pos)
  for pos in toRemove:
    board.phantoms.remove(pos)
    board.cells[pos.row][pos.col] = EMPTY
```

### 3.4 Recheck Liberties (Post-Spell)

```
function recheckLiberties(gameState, position):
  /**
   * After a spell effect changes the board, re-check all groups adjacent to
   * the affected position. If any group now has 0 effective liberties, capture it.
   */
  board = gameState.board
  checked = Set()
  
  for (nr, nc) in getAdjacent(position.row, position.col):
    if board.cells[nr][nc] in [BLACK, WHITE] AND (nr, nc) not in checked:
      group = findGroup(board, nr, nc)
      checked.addAll(group)
      if getEffectiveLiberties(board, nr, nc) == 0:
        // Capture this group
        capturedColor = board.cells[nr][nc]
        capturingColor = opposite(capturedColor)
        for (r, c) in group:
          board.cells[r][c] = EMPTY
          board.fortified.remove((r, c))
          gameState.prisoners[capturingColor] += 1
          gameState.chi[capturingColor] = min(gameState.chi[capturingColor] + 1, 10)
```

---

## 4. Spell Integration Rules

Each of the 6 MVP spells is defined with exact implementation logic.

**MVP Spell Set**: Shatter, Wildfire, Stone Skin, Mirage, Void Rift, Snare

(Sanctuary, Oracle's Eye, Ley Line, and Smolder are in the full 10-spell set but not in the initial 6-spell MVP.)

---

### 4.1 Shatter (4 Chi) -- Offensive

```
function executeShatter(gameState, target, casterColor):
  /**
   * Preconditions:
   *   - target must contain an enemy stone
   *   - target stone's group must have exactly 1 liberty (atari)
   *   - Shatter cannot target a Phantom (Phantoms have no real liberties)
   * 
   * Effect:
   *   - Remove the target stone from the board
   *   - Add to caster's prisoner count
   *   - Award +1 Chi to caster for the capture
   * 
   * Ko interaction:
   *   - If removing this stone would recreate a ko-banned board state, the spell fizzles
   *   - Chi is refunded
   * 
   * Post-effect:
   *   - Re-check liberties of all groups adjacent to the removed stone's position
   *   - This may cause cascading captures if the removed stone was providing a liberty
   *     to an adjacent group
   */
  board = gameState.board
  opponentColor = opposite(casterColor)
  
  // Validate target
  if board.cells[target.row][target.col] != opponentColor:
    return ERROR("Shatter: target must be an enemy stone")
  
  // Cannot target Phantoms
  if target in board.phantoms:
    return ERROR("Shatter: cannot target a Phantom stone")
  
  // Check atari condition
  liberties = countLiberties(board, target.row, target.col)
  if liberties != 1:
    return ERROR("Shatter: target group must have exactly 1 liberty")
  
  // Ko check: simulate removal and compare board hash
  boardCopy = deepCopy(board)
  boardCopy.cells[target.row][target.col] = EMPTY
  if hashBoard(boardCopy.cells) == board.previousBoardHash:
    // Ko violation: fizzle and refund
    gameState.chi[casterColor] += 4  // Refund (spell cost was already deducted)
    return FIZZLE("Shatter: would violate ko rule, Chi refunded")
  
  // Execute removal
  board.cells[target.row][target.col] = EMPTY
  board.fortified.remove(target)  // Shatter destroys through Fortification
  gameState.prisoners[casterColor] += 1
  gameState.chi[casterColor] = min(gameState.chi[casterColor] + 1, 10)
  
  // Re-check adjacent groups
  recheckLiberties(gameState, target)
```

**Important clarification on Shatter and Fortified stones**: The GDD states Stone Skin stones "CAN still be destroyed by Shatter." However, the atari precondition uses `countLiberties` (not `getEffectiveLiberties`). A Fortified stone's group always has effective liberties >= 1, so it can never truly be in atari for the purpose of normal capture. But Shatter checks the RAW liberty count. If the group's raw liberties == 1 (ignoring Fortification), Shatter can target and destroy the stone. This means Fortification does NOT protect against Shatter.

---

### 4.2 Wildfire (6 Chi) -- Offensive

```
function executeWildfire(gameState, target, casterColor):
  /**
   * Preconditions:
   *   - target can be any intersection (occupied or empty), but must be on-board
   *   - target cannot be VOID
   * 
   * Blast zone: all cells within Manhattan distance <= 2 from target
   *   Manhattan distance = |row1 - row2| + |col1 - col2|
   * 
   * Effect:
   *   - Each real stone (not Phantom) in the blast zone has an independent 50% chance
   *     of being destroyed
   *   - Destroyed stones count as captures for the OPPONENT of the stone's color
   *     (i.e., if Black's stone is destroyed, White gets the prisoner)
   *   - Self-damage: YES, caster's own stones are at risk
   *   - Fortified stones (Stone Skin) CAN be destroyed by Wildfire
   *   - Phantoms in the blast zone: 50% chance of being revealed and removed
   *     (a destroyed Phantom simply vanishes, no prisoner awarded)
   * 
   * Post-effect:
   *   - After all destructions, re-check liberties of ALL groups on the board
   *   - This may cause cascading captures
   * 
   * Ko interaction:
   *   - Wildfire is RNG-based. If the resulting board state happens to match a
   *     ko-banned state, the result stands (ko rule only applies to stone placement).
   *     Rationale: ko is a placement rule, not a board-state-restoration rule in the
   *     context of spell effects. Spells that have deterministic output (like Shatter)
   *     check ko. RNG spells do not, because the player did not choose the outcome.
   */
  board = gameState.board
  
  // Calculate blast zone
  blastZone = []
  for row in 0..8:
    for col in 0..8:
      if abs(row - target.row) + abs(col - target.col) <= 2:
        blastZone.append((row, col))
  
  // Resolve per-stone destruction
  destroyedPositions = []
  for (r, c) in blastZone:
    if board.cells[r][c] == VOID:
      continue  // Skip Void cells
    
    // Check for Phantom
    if (r, c) in board.phantoms:
      if random() < 0.5:
        board.phantoms.remove((r, c))
        board.cells[r][c] = EMPTY
      continue
    
    // Check for real stone
    if board.cells[r][c] in [BLACK, WHITE]:
      if random() < 0.5:
        destroyedColor = board.cells[r][c]
        capturingColor = opposite(destroyedColor)
        board.cells[r][c] = EMPTY
        board.fortified.remove((r, c))
        gameState.prisoners[capturingColor] += 1
        gameState.chi[capturingColor] = min(gameState.chi[capturingColor] + 1, 10)
        destroyedPositions.append((r, c))
  
  // Re-check all groups on the board for liberty-based captures
  recheckAllLiberties(gameState)
```

```
function recheckAllLiberties(gameState):
  /**
   * Scan the entire board. If any group has 0 effective liberties, capture it.
   * Repeat until no more captures occur (cascading captures are possible).
   */
  board = gameState.board
  changed = true
  
  while changed:
    changed = false
    checked = Set()
    
    for row in 0..8:
      for col in 0..8:
        if board.cells[row][col] in [BLACK, WHITE] AND (row, col) not in checked:
          group = findGroup(board, row, col)
          checked.addAll(group)
          
          if getEffectiveLiberties(board, row, col) == 0:
            capturedColor = board.cells[row][col]
            capturingColor = opposite(capturedColor)
            for (r, c) in group:
              board.cells[r][c] = EMPTY
              board.fortified.remove((r, c))
              gameState.prisoners[capturingColor] += 1
              gameState.chi[capturingColor] = min(gameState.chi[capturingColor] + 1, 10)
            changed = true  // Board changed, need to re-scan
```

---

### 4.3 Stone Skin (2 Chi) -- Defensive

```
function executeStoneSkin(gameState, target, casterColor):
  /**
   * Preconditions:
   *   - target must contain one of caster's own stones
   *   - target must NOT already be Fortified
   *   - target must not be a Phantom
   * 
   * Effect:
   *   - Stone becomes Fortified for 5 turns (caster's turns)
   *   - Fortified stone's group always has at least 1 effective liberty
   *   - HIDDEN from opponent: opponent's view shows a normal stone
   * 
   * Duration tracking:
   *   - turnsRemaining decrements at the START of the caster's Upkeep phase
   *   - So "5 turns" means it lasts through 5 of the caster's turns
   *   - On the 6th Upkeep, turnsRemaining reaches 0 and Fortification expires
   * 
   * Destruction:
   *   - Shatter ignores Fortification (checks raw liberties, removes the stone)
   *   - Wildfire ignores Fortification (50% destruction chance applies)
   *   - Normal capture rules cannot remove a Fortified group
   */
  board = gameState.board
  
  if board.cells[target.row][target.col] != casterColor:
    return ERROR("Stone Skin: must target own stone")
  
  if target in board.phantoms:
    return ERROR("Stone Skin: cannot fortify a Phantom")
  
  if target in board.fortified:
    return ERROR("Stone Skin: stone is already Fortified")
  
  board.fortified[target] = {owner: casterColor, turnsRemaining: 5}
```

---

### 4.4 Mirage (3 Chi) -- Information

```
function executeMirage(gameState, target, casterColor):
  /**
   * Preconditions:
   *   - target must be EMPTY (not VOID, not occupied by a real stone)
   *   - caster must have fewer than 2 active Phantoms
   *   - Snare on the target intersection: Snare does NOT trigger (Phantom is not a real stone)
   * 
   * Effect:
   *   - Place a Phantom stone that LOOKS like a real stone of casterColor to the opponent
   *   - Phantom has NO effect on: liberties, captures, territory, or any game mechanic
   *   - The server tracks it as a Phantom; the opponent's client renders it as a real stone
   * 
   * Reveal conditions (Phantom is removed when any of these occur):
   *   - Opponent places a stone adjacent to the Phantom
   *   - Oracle's Eye targets the area containing the Phantom
   *   - 6 turns expire (caster's turns, decremented in Upkeep)
   *   - Game ends (all Phantoms removed before scoring)
   * 
   * Max active Phantoms: 2 per player
   */
  board = gameState.board
  
  // Count active phantoms for this player
  activePhantomCount = 0
  for (pos, phantom) in board.phantoms:
    if phantom.owner == casterColor:
      activePhantomCount += 1
  
  if activePhantomCount >= 2:
    return ERROR("Mirage: maximum 2 active Phantoms reached")
  
  // Check target is truly empty
  if board.cells[target.row][target.col] != EMPTY:
    return ERROR("Mirage: target must be empty")
  
  // Place Phantom
  board.cells[target.row][target.col] = casterColor  // Visually appears as caster's stone
  board.phantoms[target] = {owner: casterColor, turnsRemaining: 6}
  
  // Note: Snare at this position does NOT trigger
```

**Client-side rendering**: The opponent's client receives the board state as if the Phantom is a real stone. The server must ONLY send Phantom identity to the owning player's client. The opponent's client has no way to distinguish a Phantom from a real stone.

---

### 4.5 Void Rift (4 Chi) -- Terrain

```
function executeVoidRift(gameState, target, casterColor):
  /**
   * Preconditions:
   *   - target must be EMPTY (not occupied by a real stone)
   *   - target cannot already be VOID
   *   - caster must have used fewer than 2 Voids this game
   *   - If target has a Snare, the Snare is destroyed (Void takes priority)
   *   - If target has a Phantom, the Phantom is destroyed (Void takes priority)
   * 
   * Effect:
   *   - Intersection becomes VOID permanently
   *   - VOID does not count as a liberty for adjacent stones
   *   - No stone can ever be placed on a VOID cell
   *   - VOID does not count as territory for either player in scoring
   * 
   * Post-effect:
   *   - Re-check liberties of all groups adjacent to the new Void
   *   - If any group now has 0 effective liberties, capture it
   *   - This can cause cascading captures
   * 
   * Ko interaction:
   *   - Void Rift is a spell (not a stone placement), so ko rule does not directly apply
   *   - However, if the resulting captures would recreate a ko-banned state... 
   *     the GDD says spells that would recreate ko-banned positions fizzle.
   *     For Void Rift: check the board state after Void placement + resulting captures.
   *     If it matches previousBoardHash, fizzle and refund.
   */
  board = gameState.board
  
  // Check Void limit
  if gameState.board.voidCount[casterColor] >= 2:
    return ERROR("Void Rift: maximum 2 Voids per player per game")
  
  // Check target is empty (allow Snare/Phantom occupied cells since those aren't real stones)
  realState = board.cells[target.row][target.col]
  if target in board.phantoms:
    realState = EMPTY
  if realState != EMPTY:
    return ERROR("Void Rift: target must be an empty intersection")
  
  // Destroy any Snare at this position
  board.snares.remove(target)
  
  // Destroy any Phantom at this position
  board.phantoms.remove(target)
  
  // Place Void
  board.cells[target.row][target.col] = VOID
  gameState.board.voidCount[casterColor] += 1
  
  // Ko check on resulting state
  // (Simulate captures, then check)
  boardCopy = deepCopy(board)
  recheckLibertiesSimulated(boardCopy, target)
  if hashBoard(boardCopy.cells) == board.previousBoardHash:
    // Undo and fizzle
    board.cells[target.row][target.col] = EMPTY
    gameState.board.voidCount[casterColor] -= 1
    gameState.chi[casterColor] += 4  // Refund
    return FIZZLE("Void Rift: would violate ko rule, Chi refunded")
  
  // Re-check liberties of adjacent groups (real execution)
  recheckLiberties(gameState, target)
```

---

### 4.6 Snare (3 Chi) -- Trap

```
function executeSnare(gameState, target, casterColor):
  /**
   * Preconditions:
   *   - target must be EMPTY (not VOID, not occupied by a real stone)
   *   - caster must have fewer than 2 active Snares
   *   - target can have a Phantom on it (Snare and Phantom can coexist;
   *     the Phantom doesn't trigger the Snare because it's not a real stone)
   * 
   * Effect:
   *   - Place a hidden Snare at the target intersection
   *   - When OPPONENT places a stone on that intersection:
   *     a. The stone IS placed normally (all Go rules apply)
   *     b. Captures resolve normally
   *     c. The opponent loses their NEXT turn (forced pass)
   *     d. The forced pass grants NO Chi (unlike voluntary pass)
   *     e. A forced pass does NOT count toward consecutive passes for game-end
   *     f. The Snare is consumed (removed from board)
   *   - If the CASTER places a stone on their own Snare: nothing happens, Snare remains
   * 
   * Visibility:
   *   - HIDDEN from opponent until triggered or revealed by Oracle's Eye
   */
  board = gameState.board
  
  // Count active snares for this player
  activeSnareCount = 0
  for (pos, snare) in board.snares:
    if snare.owner == casterColor:
      activeSnareCount += 1
  
  if activeSnareCount >= 2:
    return ERROR("Snare: maximum 2 active Snares reached")
  
  // Check target is empty (or Phantom-occupied)
  realState = board.cells[target.row][target.col]
  if target in board.phantoms:
    realState = EMPTY
  if realState != EMPTY:
    return ERROR("Snare: target must be an empty intersection")
  
  board.snares[target] = {owner: casterColor}
```

---

## 5. Edge Cases

This section enumerates every edge case the developer must handle. Each is stated as a question with a definitive answer.

### 5.1 Void Rift Edge Cases

**Q: What happens if Void Rift removes the last liberty of a group?**
A: The group is captured immediately. `recheckLiberties` runs after Void placement and captures any group with 0 effective liberties. The capturing player gets prisoners and Chi as usual.

**Q: Can Void Rift cause cascading captures?**
A: Yes. If removing stones from a captured group exposes another group that now has 0 liberties, that group is also captured. `recheckAllLiberties` loops until stable.

**Q: Can Void Rift target an intersection with a Snare?**
A: Yes. The Snare is destroyed. Void takes priority. No refund for the Snare's Chi cost.

**Q: Can Void Rift target an intersection with a Phantom?**
A: Yes. The Phantom is destroyed. Void takes priority.

**Q: Can Void Rift target an occupied intersection?**
A: No. The target must be empty (no real stone). A Phantom-occupied cell counts as empty for this purpose.

### 5.2 Wildfire Edge Cases

**Q: What if Wildfire destroys stones that were the only liberties for other groups?**
A: After Wildfire resolves all its 50% rolls, `recheckAllLiberties` runs. Any group now at 0 liberties is captured. This can cascade.

**Q: Does Wildfire affect Fortified stones?**
A: Yes. Wildfire ignores Fortification. The 50% destruction roll applies normally.

**Q: Does Wildfire affect Seki groups?**
A: Per the GDD, "Seki groups are immune to area-of-effect spells." Stones in mutual-life seki are not affected by Wildfire. Implementation: before applying Wildfire, identify all seki groups (groups in mutual life). Stones belonging to seki groups in the blast zone are skipped.

**Q: How to detect Seki?**
A: Seki detection is complex. For MVP, use a simplified rule: a group is in seki if it has exactly 1 liberty AND the adjacent enemy group sharing that liberty also has exactly 1 liberty AND capturing either group would give the other group more liberties. Full seki detection can be deferred to post-MVP; for now, this heuristic covers the most common case.

**Q: Does Wildfire affect VOID cells?**
A: No. VOID cells are skipped entirely.

### 5.3 Shatter Edge Cases

**Q: Can Shatter target a Phantom stone?**
A: No. A Phantom has no real liberties (it's not a real stone). Shatter requires the target to be a real enemy stone in atari. From the caster's perspective, if they target a Phantom they control, it's already their own stone (invalid target). If the opponent targets a position that turns out to be a Phantom, the server rejects the cast because there is no real enemy stone there. In practice, the caster doesn't know which stones are Phantoms unless revealed.

**Wait -- refinement**: The caster sees enemy Phantoms as real enemy stones. If they try to Shatter what they think is an enemy stone in atari, but it's a Phantom, the server should reveal the Phantom and fizzle the spell. Chi is refunded. This is a reveal event.

**Q: Can Shatter target a Fortified stone?**
A: Yes. Shatter checks raw liberties (not effective liberties). If the group's raw liberty count is 1, Shatter can destroy the stone, regardless of Fortification. Shatter explicitly bypasses Stone Skin.

**Q: Can Shatter cause cascading captures?**
A: Yes. After Shatter removes a stone, `recheckLiberties` runs on adjacent groups. If any group loses its last liberty due to the removal, it is captured normally.

### 5.4 Mirage Edge Cases

**Q: What if Mirage is placed on a Snare intersection?**
A: The Snare does NOT trigger. A Phantom is not a real stone. Both Phantom and Snare coexist on the same intersection. The Snare triggers only when a real stone is placed there.

**Q: What if an opponent places a stone on a Phantom's intersection?**
A: The Phantom is destroyed (revealed). The opponent's stone is placed normally. If a Snare is also on that intersection, the Snare triggers against the opponent.

**Q: Does a Phantom block stone placement?**
A: For the OPPONENT: they see the Phantom as a real stone, so their client should prevent them from clicking that intersection. For the CASTER: they know it's a Phantom, so their client allows placement there (which would destroy the Phantom and place a real stone). On the server side, `isLegalMove` checks real cell state, which treats Phantom positions as EMPTY.

**Q: Does a Phantom count as territory during the game?**
A: No. Phantoms have no mechanical effect. They are removed before scoring.

**Q: What if a Phantom's owner places a real stone on the Phantom?**
A: The Phantom is replaced by the real stone. The Phantom is consumed.

### 5.5 Stone Skin Edge Cases

**Q: Does Fortification protect the entire group or just the one stone?**
A: The entire group. If any stone in a connected group is Fortified, the group's effective liberties are always >= 1. This is because Go captures groups, not individual stones.

**Q: What if a Fortified stone's group merges with an un-Fortified group?**
A: The merged group is now Fortified (since it contains a Fortified stone). This is automatic -- no special handling needed beyond the `getEffectiveLiberties` function checking if ANY stone in the group is Fortified.

**Q: What if the Fortified stone is destroyed by Shatter/Wildfire, but other stones in the group remain?**
A: The Fortification is removed (it was on that specific stone). The remaining group loses Fortification unless another stone in the group is independently Fortified.

### 5.6 Snare Edge Cases

**Q: What if a forced-pass player has a Snare triggered on them again (stacking)?**
A: The player already has `forcedPass = true`. A second Snare trigger during the same turn has no additional effect (the player only loses one turn). However, in practice, a player can only step on one Snare per turn (they place one stone per turn).

**Q: Does a forced pass count toward consecutive passes for game end?**
A: NO. Only voluntary passes count. A forced pass does not advance the game-end condition.

**Q: Does the forced-pass player gain Upkeep Chi on their skipped turn?**
A: YES. Upkeep still occurs (Chi gain, spell draw, duration ticks). Only the Action phase is skipped.

**Q: Can a player cast spells during a forced pass?**
A: NO. The forced pass skips the entire Action phase. The player cannot place stones or cast spells.

### 5.7 Game End Edge Cases

**Q: What if both players pass and there are active hidden spells?**
A: All hidden information is revealed before scoring. This includes: Fortified stones (revealed but Fortification no longer matters for scoring), Phantoms (removed from board), Snares (revealed and removed), and Smolder (revealed and removed). Then scoring proceeds.

**Q: What if a player passes and the opponent was going to be forced to pass (Snare)?**
A: The forced pass happens on the opponent's turn. It does NOT count as a voluntary pass. So if Player A voluntarily passes, then Player B has a forced pass, this is NOT two consecutive voluntary passes. The game does not end.

**Q: What about stones in seki at game end?**
A: Under Chinese area scoring, seki stones remain on the board and count as points for their respective colors. The empty liberties between seki groups are dame and count for nobody.

### 5.8 Interaction Matrix

| Spell A on Cell | Then Spell B on Same Cell | Result |
|---|---|---|
| Snare | Mirage | Both coexist. Phantom doesn't trigger Snare. |
| Snare | Void Rift | Snare destroyed. Cell becomes Void. |
| Snare | Stone placed by opponent | Snare triggers. Stone placed. Opponent loses next turn. |
| Snare | Stone placed by Snare owner | Nothing happens. Snare remains. |
| Phantom | Void Rift | Phantom destroyed. Cell becomes Void. |
| Phantom | Stone placed by opponent | Phantom revealed/destroyed. Stone placed normally. |
| Phantom | Stone placed by Phantom owner | Phantom replaced by real stone. |
| Phantom | Shatter (targeting it) | Spell fizzles. Phantom revealed. Chi refunded. |
| Fortified stone | Shatter | Shatter succeeds (checks raw liberties). Stone destroyed. |
| Fortified stone | Wildfire | Wildfire 50% roll applies normally. |
| Fortified stone | Void Rift adjacent | Group may lose a liberty but Fortification prevents capture (effective liberties >= 1). |
| Void | Any stone placement | Illegal move. Cannot place on Void. |
| Void | Any spell targeting it | Depends on spell. Most require EMPTY, so they fail on VOID. |

---

## 6. AI Implementation Notes

For the simple MVP AI opponent (not a full Go engine).

### 6.1 Legal Move Generation

```
function generateLegalMoves(board, color) -> List<Position>:
  moves = []
  for row in 0..8:
    for col in 0..8:
      if isLegalMove(board, row, col, color):
        moves.append((row, col))
  return moves
```

### 6.2 Move Selection Heuristic

```
function selectMove(gameState, color) -> Action:
  board = gameState.board
  legalMoves = generateLegalMoves(board, color)
  
  if legalMoves is empty:
    return PASS
  
  // Priority 1 (40%): Save own groups in atari
  atariSaves = []
  for (row, col) in allStonesOfColor(board, color):
    if countLiberties(board, row, col) == 1:
      // Find moves that would add liberties to this group
      group = findGroup(board, row, col)
      for (nr, nc) in getAllAdjacentEmpty(board, group):
        if (nr, nc) in legalMoves:
          atariSaves.append((nr, nc))
  
  if atariSaves is not empty AND random() < 0.4:
    return PLACE(randomChoice(atariSaves))
  
  // Priority 2 (30%): Capture enemy groups in atari
  atariCaptures = []
  opponentColor = opposite(color)
  for (row, col) in allStonesOfColor(board, opponentColor):
    if countLiberties(board, row, col) == 1:
      group = findGroup(board, row, col)
      // Find the single liberty (that's where we play to capture)
      liberty = findLiberties(board, row, col)[0]
      if liberty in legalMoves:
        atariCaptures.append(liberty)
  
  if atariCaptures is not empty AND random() < 0.3:
    return PLACE(randomChoice(atariCaptures))
  
  // Priority 3 (20%): Play near existing stones (1-2 space extension)
  nearMoves = []
  for (row, col) in allStonesOfColor(board, color):
    for (nr, nc) in legalMoves:
      dist = abs(row - nr) + abs(col - nc)
      if 1 <= dist <= 2:
        nearMoves.append((nr, nc))
  
  if nearMoves is not empty AND random() < 0.2:
    return PLACE(randomChoice(nearMoves))
  
  // Priority 4 (10% / fallback): Random legal move
  return PLACE(randomChoice(legalMoves))
```

### 6.3 AI Spell Casting

```
function aiConsiderSpell(gameState, color) -> SpellAction or null:
  /**
   * Simple AI spell usage: 30% chance per turn to attempt casting a spell.
   * Picks a random spell from hand. Picks a random valid target.
   * No strategic reasoning -- this is intentionally weak for MVP.
   */
  if random() > 0.3:
    return null  // Don't cast this turn
  
  hand = gameState.hand[color]
  if hand is empty:
    return null
  
  // Try each spell in hand (shuffled) until one has a valid target
  shuffle(hand)
  for spell in hand:
    if gameState.chi[color] < spell.cost:
      continue
    
    target = findRandomValidTarget(gameState, spell, color)
    if target is not null:
      return {spell: spell, target: target}
  
  return null
```

```
function findRandomValidTarget(gameState, spell, color) -> Position or null:
  board = gameState.board
  opponentColor = opposite(color)
  
  switch spell:
    case SHATTER:
      // Find enemy stones in atari
      targets = []
      for (r, c) in allStonesOfColor(board, opponentColor):
        if countLiberties(board, r, c) == 1:
          targets.append((r, c))
      return targets is empty ? null : randomChoice(targets)
    
    case WILDFIRE:
      // Any non-VOID intersection
      targets = allNonVoidPositions(board)
      return randomChoice(targets)
    
    case STONE_SKIN:
      // Own stones that are not already Fortified
      targets = []
      for (r, c) in allStonesOfColor(board, color):
        if (r, c) not in board.fortified:
          targets.append((r, c))
      return targets is empty ? null : randomChoice(targets)
    
    case MIRAGE:
      // Empty intersections, if under 2 active Phantoms
      phantomCount = countPhantoms(board, color)
      if phantomCount >= 2: return null
      targets = allEmptyPositions(board)
      return targets is empty ? null : randomChoice(targets)
    
    case VOID_RIFT:
      // Empty intersections, if under 2 Voids used
      if gameState.board.voidCount[color] >= 2: return null
      targets = allEmptyPositions(board)
      return targets is empty ? null : randomChoice(targets)
    
    case SNARE:
      // Empty intersections, if under 2 active Snares
      snareCount = countSnares(board, color)
      if snareCount >= 2: return null
      targets = allEmptyPositions(board)
      return targets is empty ? null : randomChoice(targets)
  
  return null
```

### 6.4 AI Turn Decision

```
function aiTakeTurn(gameState, color):
  /**
   * AI decision tree for MVP:
   * 1. Check if a spell should be cast (30% chance)
   * 2. If casting a spell, decide between CAST_SPELLS or PLACE_AND_SPELL
   * 3. Otherwise, just place a stone
   * 4. If no legal moves and no spells to cast, pass
   */
  spellAction = aiConsiderSpell(gameState, color)
  legalMoves = generateLegalMoves(gameState.board, color)
  
  if spellAction is not null AND legalMoves is not empty AND random() < 0.3:
    // Dual Action (if affordable: spell cost + 1 surcharge)
    if gameState.chi[color] >= spellAction.spell.cost + 1:
      move = selectMove(gameState, color)
      return {type: "PLACE_AND_SPELL", row: move.row, col: move.col, 
              spell: spellAction.spell, spellTarget: spellAction.target}
  
  if spellAction is not null:
    return {type: "CAST_SPELLS", spells: [spellAction]}
  
  if legalMoves is not empty:
    move = selectMove(gameState, color)
    return {type: "PLACE", row: move.row, col: move.col}
  
  return {type: "PASS"}
```

---

## 7. Constants and Configuration

All tunable values in one place for easy balance adjustment.

```
const BOARD_SIZE = 9
const KOMI = 5.5

// Chi
const STARTING_CHI = 3
const CHI_PER_TURN = 1
const CHI_PER_CAPTURE = 1
const CHI_FROM_PASS = 2
const MAX_CHI = 10

// Spell Costs
const COST_SHATTER = 4
const COST_WILDFIRE = 6
const COST_STONE_SKIN = 2
const COST_MIRAGE = 3
const COST_VOID_RIFT = 4
const COST_SNARE = 3
const COST_DUAL_ACTION_SURCHARGE = 1

// Spell Limits
const MAX_PHANTOMS_PER_PLAYER = 2
const MAX_VOIDS_PER_PLAYER = 2
const MAX_SNARES_PER_PLAYER = 2

// Spell Durations (in caster's turns)
const STONE_SKIN_DURATION = 5
const MIRAGE_DURATION = 6

// Wildfire
const WILDFIRE_BLAST_RADIUS = 2  // Manhattan distance
const WILDFIRE_DESTROY_CHANCE = 0.5

// Draft
const DECK_SIZE = 5
const STARTING_HAND_SIZE = 2
const MAX_HAND_SIZE = 4
const DRAW_PER_TURN = 1

// AI
const AI_SPELL_CAST_CHANCE = 0.3
const AI_SAVE_PRIORITY = 0.4
const AI_CAPTURE_PRIORITY = 0.3
const AI_EXTEND_PRIORITY = 0.2
```

---

## Appendix: Implementation Checklist

For the front-end developer, implement in this order:

1. **Board rendering**: 9x9 grid with cell states. Support VOID visual.
2. **Stone placement**: `isLegalMove` + `executeStonePlacement` (without spells).
3. **Capture resolution**: `findGroup` + `countLiberties` + `resolveCaptures`.
4. **Ko detection**: `isKo` with board hashing.
5. **Pass and game end**: Consecutive pass detection + `score`.
6. **Spell framework**: Spell hand, Chi tracking, spell casting UI.
7. **Individual spells**: Implement one at a time in this order: Stone Skin (simplest), Snare, Mirage, Shatter, Void Rift, Wildfire (most complex).
8. **AI opponent**: Legal move generation + heuristic selection + random spell casting.
9. **Hidden information layer**: Separate server view from client view. Phantom rendering. Fortification hiding.
10. **Edge case testing**: Use the interaction matrix in Section 5.8 as test cases.

---

*End of Go Rules Implementation Spec v1.0*
