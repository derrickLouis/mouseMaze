import { useState } from 'react';
import {
  INITIAL_POSITIONS,
  INITIAL_SABOTAGE_TOKENS,
  DEFAULT_ALGORITHMS,
  DEFAULT_SPEED_MS,
  MAZE_SIZE,
  WALL_DENSITY,
  CELL_TYPES
} from '../core/constants';
import { getInitialMaze, isValidMove } from '../core/maze';
import { findPath } from '../algorithms/index';

export default function useGameState() {
  // Core game state
  const [maze, setMaze] = useState([]);
  const [redPos, setRedPos] = useState(INITIAL_POSITIONS.RED);
  const [bluePos, setBluePos] = useState(INITIAL_POSITIONS.BLUE);
  const [cheesePos] = useState(INITIAL_POSITIONS.CHEESE);
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [turn, setTurn] = useState(1);
  const [sabotageTokens, setSabotageTokens] = useState({
    red: INITIAL_SABOTAGE_TOKENS,
    blue: INITIAL_SABOTAGE_TOKENS
  });
  const [turnsSinceMove, setTurnsSinceMove] = useState({ red: 0, blue: 0 });
  const [redAlgorithm, setRedAlgorithm] = useState(DEFAULT_ALGORITHMS.RED);
  const [blueAlgorithm, setBlueAlgorithm] = useState(DEFAULT_ALGORITHMS.BLUE);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // UI/Display state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [currentPaths, setCurrentPaths] = useState({ red: null, blue: null });
  const [showPaths, setShowPaths] = useState(true);
  const [playSpeed, setPlaySpeed] = useState(DEFAULT_SPEED_MS);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper function to update paths
  const updatePaths = (currentMaze, redPosition, bluePosition, redAlg, blueAlg) => {
    const mazeToUse = currentMaze || maze;
    const redPosToUse = redPosition || redPos;
    const bluePosToUse = bluePosition || bluePos;
    const redAlgToUse = redAlg || redAlgorithm;
    const blueAlgToUse = blueAlg || blueAlgorithm;

    const redPath = findPath(redAlgToUse, redPosToUse, cheesePos, mazeToUse);
    const bluePath = findPath(blueAlgToUse, bluePosToUse, cheesePos, mazeToUse);
    setCurrentPaths({ red: redPath, blue: bluePath });
  };

  // Initialize game with default maze
  const initializeMaze = () => {
    const initialMaze = getInitialMaze();
    setMaze(initialMaze);
    updatePaths(initialMaze, INITIAL_POSITIONS.RED, INITIAL_POSITIONS.BLUE);
  };

  // Generate new random maze
  const generateRandomMaze = () => {
    const borderMax = MAZE_SIZE - 1;
    const newMaze = Array(MAZE_SIZE).fill().map((_, y) => 
      Array(MAZE_SIZE).fill().map((_, x) => {
        if (x === 0 || x === borderMax || y === 0 || y === borderMax) return CELL_TYPES.WALL;
        return Math.random() < WALL_DENSITY ? CELL_TYPES.WALL : CELL_TYPES.OPEN;
      })
    );

    // Ensure critical positions are open
    const redStart = INITIAL_POSITIONS.RED;
    const blueStart = INITIAL_POSITIONS.BLUE;
    const cheese = INITIAL_POSITIONS.CHEESE;

    newMaze[redStart.y][redStart.x] = CELL_TYPES.OPEN;
    newMaze[blueStart.y][blueStart.x] = CELL_TYPES.OPEN;
    newMaze[cheese.y][cheese.x] = CELL_TYPES.OPEN;

    // Ensure paths exist
    const ensureConnectivity = (maze, from, to) => {
      const path = findPath('bfs', from, to, maze);
      if (!path) {
        let current = { ...from };
        while (current.x !== to.x || current.y !== to.y) {
          if (current.x < to.x) current.x++;
          else if (current.x > to.x) current.x--;
          else if (current.y < to.y) current.y++;
          else if (current.y > to.y) current.y--;
          maze[current.y][current.x] = CELL_TYPES.OPEN;
        }
      }
    };

    ensureConnectivity(newMaze, redStart, cheese);
    ensureConnectivity(newMaze, blueStart, cheese);

    return newMaze;
  };

  // Generate new random maze
  const randomizeMaze = (onMazeGenerated) => {
    const newMaze = generateRandomMaze();
    setMaze(newMaze);
    updatePaths(newMaze, INITIAL_POSITIONS.RED, INITIAL_POSITIONS.BLUE);
    
    // Reset game state for new maze
    setRedPos(INITIAL_POSITIONS.RED);
    setBluePos(INITIAL_POSITIONS.BLUE);
    setCurrentPlayer('red');
    setTurn(1);
    setSabotageTokens({ red: INITIAL_SABOTAGE_TOKENS, blue: INITIAL_SABOTAGE_TOKENS });
    setTurnsSinceMove({ red: 0, blue: 0 });
    setGameOver(false);
    setWinner(null);
    setIsPlaying(false);
    setGameLog([]);
    setCalculationSteps(['New maze generated - Let the strategic competition begin!']);
    
    if (onMazeGenerated) {
      onMazeGenerated(); // Callback for cleanup (e.g., clearing intervals)
    }
  };

  // Reset game to initial state
  const resetGame = (onReset) => {
    initializeMaze();
    setRedPos(INITIAL_POSITIONS.RED);
    setBluePos(INITIAL_POSITIONS.BLUE);
    setCurrentPlayer('red');
    setTurn(1);
    setSabotageTokens({ red: INITIAL_SABOTAGE_TOKENS, blue: INITIAL_SABOTAGE_TOKENS });
    setTurnsSinceMove({ red: 0, blue: 0 });
    setGameOver(false);
    setWinner(null);
    setIsPlaying(false);
    setGameLog([]);
    setCalculationSteps(['Game reset - Ready for strategic competition!']);
    
    if (onReset) {
      onReset(); // Callback for cleanup
    }
  };

  // Update player position
  const updatePlayerPosition = (player, newPos) => {
    if (player === 'red') {
      setRedPos(newPos);
    } else {
      setBluePos(newPos);
    }
    setTurnsSinceMove(prev => ({ ...prev, [player]: 0 }));
  };

  // Increment turn counter for a player
  const incrementTurnsSinceMove = (player) => {
    setTurnsSinceMove(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }));
  };

  // Switch to next player
  const switchPlayer = () => {
    setCurrentPlayer(prev => (prev === 'red' ? 'blue' : 'red'));
    if (currentPlayer === 'blue') {
      setTurn(prev => prev + 1);
    }
  };

  // Handle win condition
  const handleWin = (player) => {
    setWinner(player);
    setGameOver(true);
    setIsPlaying(false);
    addToLog(`🎉 ${player.toUpperCase()} MOUSE WINS!`, 'system');
  };

  // Add entry to game log
  const addToLog = (message, type) => {
    setGameLog(prev => [...prev, { message, type, turn }]);
  };

  // Update sabotage tokens
  const consumeSabotageToken = (player) => {
    setSabotageTokens(prev => ({
      ...prev,
      [player]: Math.max(0, prev[player] - 1)
    }));
  };

  return {
    // State
    maze,
    setMaze,
    redPos,
    bluePos,
    cheesePos,
    currentPlayer,
    turn,
    sabotageTokens,
    turnsSinceMove,
    redAlgorithm,
    setRedAlgorithm,
    blueAlgorithm,
    setBlueAlgorithm,
    gameOver,
    winner,
    isPlaying,
    setIsPlaying,
    gameLog,
    calculationSteps,
    setCalculationSteps,
    currentPaths,
    showPaths,
    setShowPaths,
    playSpeed,
    setPlaySpeed,
    isFullscreen,
    setIsFullscreen,

    // Actions
    initializeMaze,
    randomizeMaze,
    resetGame,
    updatePaths,
    updatePlayerPosition,
    incrementTurnsSinceMove,
    switchPlayer,
    handleWin,
    addToLog,
    consumeSabotageToken
  };
}
