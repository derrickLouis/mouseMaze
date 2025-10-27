# Strategic Mice Competition

A React-based game where two AI mice compete to reach cheese using different pathfinding algorithms and sabotage tactics.

## Features

- **Adjustable Maze Sizes**: Choose from 8x8, 10x10, 12x12, or 15x15 mazes
- **Guaranteed Paths**: All generated mazes ensure both mice can reach the cheese
- **Multiple Pathfinding Algorithms**: A* Search, Breadth-First Search, Depth-First Search
- **Strategic Sabotage**: Players can use tokens to modify the maze
- **Real-time Visualization**: Watch the AI algorithms work with step-by-step visualization
- **Interactive Controls**: Step-by-step mode, auto-play, and new maze generation
- **Algorithm Selection**: Choose different algorithms for each mouse

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

1. **Choose Maze Size**: Select from Small (8x8), Medium (10x10), Large (12x12), or Extra Large (15x15)
2. **Select Algorithms**: Choose pathfinding algorithms for the Red and Blue mice
3. **Generate New Maze**: Use "New Maze" button to create a fresh maze layout (guaranteed to have paths)
4. **Start the Game**: Click "Auto Play" to watch the mice compete automatically, or use "Step" for manual control
5. **Watch the AI**: Observe how each algorithm navigates the maze and makes strategic decisions
6. **Sabotage**: Mice can use sabotage tokens to block opponents or create new paths
7. **Win Condition**: First mouse to reach the cheese wins!

## Game Mechanics

- **Movement**: Each mouse can move up to 2 steps per turn
- **Sabotage**: Remove a wall and place it elsewhere (with restrictions)
- **Strategy**: Mice evaluate whether to move or sabotage based on opponent distance and available tokens
- **Forced Movement**: If a mouse hasn't moved for 2 turns, it must move

## Technical Details

- Built with React 18
- Uses Tailwind CSS for styling
- Lucide React for icons
- Real-time pathfinding visualization
- Responsive design

## Bugs Fixed

1. **File Extension**: Fixed missing `.jsx` extension that caused linter errors
2. **Dependencies**: Added proper `package.json` with all required dependencies
3. **Import Path Error**: Moved MouseMaze component into `src/` directory to fix React build system import restrictions
4. **UpdatePaths Bug**: Fixed incorrect parameter passing in `updatePaths` function
5. **useEffect Dependencies**: Removed `currentPlayer` from dependency array to prevent interval restart issues
6. **Clean Imports**: Removed unused `useCallback` import

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
