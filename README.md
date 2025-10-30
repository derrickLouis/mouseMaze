# Strategic Mice Competition

A React-based game where two AI mice compete to reach cheese using different pathfinding algorithms and sabotage tactics.

## Current Features

- **10x10 Maze Board**: Fixed-size grid with border walls.
- **Guaranteed Paths**: Randomly generated mazes always ensure both mice can reach the cheese.
- **Multiple Pathfinding Algorithms**: A* Search, Breadth-First Search, Depth-First Search, and Bidirectional Search.
- **Strategic Sabotage (3 tokens each)**: AI evaluates removing one wall and placing it elsewhere to help itself and hinder the opponent.
- **Real-time Visualization**: Step-by-step exploration highlights for each algorithm (visited, exploring, and thinking cells).
- **Interactive Controls**: Auto Play, single-step, reset, and "New Maze" generation.
- **Path Overlay Toggle**: Show/hide each mouse's current planned path.
- **Speed Control**: Adjustable turn interval with visual feedback.
- **Game Log & AI Reasoning**: Side panels show decisions, exploration steps, and game events.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How to Play

1. **Select Algorithms** for Red and Blue from the dropdowns.
2. **Generate a New Maze** with "New Maze" (paths guaranteed).
3. **Start** with "Auto Play" or use **Step** for manual turns.
4. **Toggle Path Overlay** to see each mouse's current planned route.
5. **Win Condition**: First mouse to reach the cheese wins.

## Game Mechanics

- **Movement**: Up to 2 cells per turn along the chosen algorithm's path.
- **Sabotage**: Consumes 1 token. Removes one wall and places it in another empty cell (mice/cheese cells are excluded). The AI evaluates options and will only sabotage if it yields higher strategic value than moving.
- **Forced Movement**: If a mouse did not move on its previous turn, it is forced to move on its next turn.
- **Turn Order**: Red starts; turns alternate. Auto-play advances turns at the selected speed.

## Technical Details

- React 18
- Tailwind CSS for styling
- Lucide React for icons
- Real-time pathfinding visualization with algorithm-specific highlighting, including bidirectional forward/backward coloring

## Known Limitations (current state)

- Maze size is fixed at 10x10.
- Both mice use the same emoji (rings/colors differentiate positions).
- Speed slider maps to turn interval; labeling may feel inverted depending on expectation.

## Project Structure

```
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── MouseMaze.jsx
├── package.json
└── README.md
```
