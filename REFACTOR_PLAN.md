# Strategic Mice Competition - Refactoring Plan

## Overview
Transform the monolithic component into a scalable, testable, maintainable codebase with proper separation of concerns.

---

## Phase 1: Project Structure & Constants 📁
**Goal:** Establish folder structure and extract magic numbers

### Steps:
1. **Create folder structure:**
   ```
   src/
   ├── core/           # Pure game logic (no React)
   │   ├── constants.js
   │   ├── engine.js
   │   └── maze.js
   ├── algorithms/     # Pathfinding (pure functions)
   │   ├── bfs.js
   │   ├── astar.js
   │   ├── dfs.js
   │   ├── bidirectional.js
   │   └── index.js
   ├── components/     # React UI components
   │   ├── MazeGrid/
   │   ├── Controls/
   │   ├── SidePanel/
   │   └── FullscreenView/
   ├── hooks/          # Custom React hooks
   │   ├── useGameEngine.js
   │   └── useVisualization.js
   ├── utils/          # Helper functions
   └── __tests__/      # Test files
   ```

2. **Create `core/constants.js`** - Extract all magic numbers:
   ```javascript
   export const DEFAULT_MAZE_SIZE = 10;
   export const WALL_DENSITY = 0.35;
   export const INITIAL_SABOTAGE_TOKENS = 3;
   export const MAX_MOVES_PER_TURN = 2;
   export const FORCED_MOVE_THRESHOLD = 1;
   export const DEFAULT_SPEED_MS = 2500;
   export const MIN_SPEED_MS = 500;
   export const MAX_SPEED_MS = 5000;
   ```

---

## Phase 2: Extract Core Game Engine 🎮
**Goal:** Separate game logic from React

### Steps:
1. **Create `core/engine.js`** - Pure game logic class:
   ```javascript
   export class GameEngine {
     constructor(initialMaze, config) {
       this.state = { /* game state */ };
       this.config = config;
     }
     
     // State getters (immutable)
     getState() { return { ...this.state }; }
     
     // Actions (return new state, don't mutate)
     move(player, newPos) { /* return new state */ }
     sabotage(player, removePos, placePos) { /* return new state */ }
     switchPlayer() { /* return new state */ }
     reset(maze) { /* return new state */ }
     
     // Validation
     canMove(player, pos) { /* validation logic */ }
     canSabotage(player, removePos, placePos) { /* validation logic */ }
   }
   ```

2. **Create `core/maze.js`** - Maze generation:
   ```javascript
   export function generateRandomMaze(size, density) { /* ... */ }
   export function ensureConnectivity(maze, from, to) { /* ... */ }
   export function isValidMove(maze, pos) { /* ... */ }
   ```

3. **Update engine to use pure functions** - No React, no side effects

---

## Phase 3: Pathfinding Algorithms Module 🔍
**Goal:** Extract and isolate algorithms for testing

### Steps:
1. **Extract each algorithm to own file:**
   - `algorithms/bfs.js` - Pure BFS function
   - `algorithms/astar.js` - Pure A* function
   - `algorithms/dfs.js` - Pure DFS function
   - `algorithms/bidirectional.js` - Pure bidirectional function

2. **Create `algorithms/index.js`** - Unified interface:
   ```javascript
   export function findPath(algorithm, start, goal, maze) {
     switch(algorithm) {
       case 'bfs': return bfs(start, goal, maze);
       case 'astar': return astar(start, goal, maze);
       // ... etc
     }
   }
   ```
   
   Each algorithm returns: `{ path: Position[] | null, visited: Position[] }`

4. **Remove algorithm code from main component**

---

## Phase 4: Testing Framework 🧪
**Goal:** Test algorithms and core logic

### Steps:
1. **Install testing dependencies:**
   ```bash
   npm install --save-dev jest @testing-library/react
   ```

2. **Create `jest.config.js`** for JavaScript

3. **Test files to create:**
   - `__tests__/algorithms/bfs.test.js`
   - `__tests__/algorithms/astar.test.js`
   - `__tests__/algorithms/dfs.test.js`
   - `__tests__/algorithms/bidirectional.test.js`
   - `__tests__/core/engine.test.js`
   - `__tests__/core/maze.test.js`

4. **Test cases per algorithm:**
   - Simple path exists
   - No path exists
   - Shortest path correctness
   - Large maze performance
   - Edge cases (same start/goal, etc.)

5. **Test engine:**
   - State transitions
   - Move validation
   - Sabotage validation
   - Win detection

---

## Phase 5: UI/View Separation 🎨
**Goal:** Split React component into manageable pieces

### Steps:
1. **Create `hooks/useGameEngine.js`** - React wrapper for engine:
   ```javascript
   export function useGameEngine(config) {
     const [engine] = useState(() => new GameEngine(initialMaze, config));
     const [state, setState] = useState(() => engine.getState());
     
     const move = useCallback((player, pos) => {
       const newState = engine.move(player, pos);
       setState(newState);
     }, [engine]);
     
     // ... other actions
     
     return { state, move, sabotage, reset, /* ... */ };
   }
   ```

2. **Create `hooks/useVisualization.js`** - Extract visualization logic:
   ```javascript
   export function useVisualization() {
     const [exploringCells, setExploringCells] = useState([]);
     const [visitedCells, setVisitedCells] = useState([]);
     // ... visualization state
     
     const visualizePathfinding = useCallback(async (...) => {
       // Pure visualization logic
     }, []);
     
     return { exploringCells, visitedCells, visualizePathfinding };
   }
   ```

3. **Split `MouseMaze.jsx` into components:**
   - `<MazeGrid />` - Just renders cells
   - `<GameControls />` - Play/Pause/Reset/New Maze buttons
   - `<AlgorithmSelectors />` - Red/Blue algorithm dropdowns
   - `<SidePanel />` - Calculation log, stats, game log
   - `<FullscreenView />` - Fullscreen overlay
   - `<MouseMaze />` - Main orchestrator

4. **Memoize expensive renders:**
   ```javascript
   const MazeCell = React.memo(({ x, y, cellType, ... }) => {
     // Individual cell component
   });
   ```

---

## Phase 6: TypeScript Migration (Optional) ⚙️
**Goal:** Add type safety after code is modularized

### Steps:
1. **Install TypeScript dependencies**
   ```bash
   npm install --save-dev typescript @types/react @types/react-dom @types/node
   ```

2. **Create `tsconfig.json`** with strict settings

3. **Rename `.js` files to `.ts` / `.jsx` to `.tsx`** incrementally:
   - Start with `core/` (no React dependencies)
   - Then `algorithms/`
   - Finally `components/` and `hooks/`

4. **Add type definitions:**
   - Create `core/types.ts` - Define all game state types
   - Add types to algorithm functions
   - Type React components and hooks

5. **Update `jest.config.js`** to use `ts-jest` for TypeScript tests

**Note:** This phase is optional - the codebase will work perfectly fine in JavaScript with JSDoc comments.

---

## Phase 7: Code Cleanup 🧹
**Goal:** Remove dead code, optimize, document

### Steps:
1. **Delete unused functions:**
   - Remove `validateSabotageAction` OR wire it into engine
   - Remove any commented-out code

2. **Extract repeated logic:**
   - Path calculation helpers
   - Cell styling logic
   - Distance calculations

3. **Optimize performance:**
   - Use `Set` for O(1) lookups instead of `.find()`
   - Memoize path calculations
   - Debounce rapid state updates

4. **Add JSDoc/TSDoc comments** to public APIs

5. **Create `docs/` folder** with:
   - Architecture overview
   - Algorithm explanations
   - Contribution guide

---

## Implementation Order (Recommended)

**Week 1: Foundation**
- Phase 1: Folder structure + constants extraction
- Phase 2: Extract engine (keep old component working)

**Week 2: Algorithms & Tests**
- Phase 3: Extract algorithms
- Phase 4: Write tests

**Week 3: UI Refactor**
- Phase 5: Split components + hooks

**Week 4: Polish**
- Phase 7: Cleanup + optimization
- Phase 6: TypeScript migration (optional)

---

## Migration Strategy

**Incremental approach:**
1. Keep old `MouseMaze.jsx` working
2. Create new files alongside old ones
3. Gradually move logic into new structure
4. Update imports one section at a time
5. Delete old code only after new code is verified

**Testing at each step:**
- Run tests after Phase 4
- Manually verify UI works after each phase
- Compare old vs new behavior

---

## Success Metrics

✅ All algorithms have 90%+ test coverage  
✅ `GameEngine` has zero React dependencies  
✅ Component file sizes < 200 lines  
✅ No magic numbers in business logic  
✅ Fullscreen mode works identically to normal mode  
✅ Performance: 60fps even with visualization running  
✅ TypeScript catches type errors at compile time (if Phase 6 completed)  

---

## Risk Mitigation

**Risk:** Breaking existing functionality  
**Mitigation:** Keep old code working, migrate incrementally, comprehensive testing

**Risk:** TypeScript migration complexity (Phase 6)  
**Mitigation:** Optional phase - can skip entirely and use JSDoc instead

**Risk:** Performance regression  
**Mitigation:** Benchmark before/after, use React DevTools Profiler

---

## Next Steps

1. Review this plan
2. Start with Phase 1 (Folder structure + constants)
3. Extract one algorithm as proof-of-concept
4. Gradually refactor, testing at each phase
5. Add TypeScript later (Phase 6) if desired
