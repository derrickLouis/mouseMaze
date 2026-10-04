/**
 * AI Strategy and Decision Making
 * Pure functions for evaluating strategic moves and sabotage options
 */

import { findPath } from '../algorithms/index';
import { MAZE_SIZE, MAX_MOVES_PER_TURN, SABOTAGE_SCORING, MAX_SABOTAGE_EVALUATIONS } from './constants';

/**
 * Find all removable walls (excluding borders)
 * @param {number[][]} maze - The current maze
 * @returns {Array<{x: number, y: number}>} Array of wall positions
 */
function findRemovableWalls(maze) {
  const removableWalls = [];
  for (let y = 1; y < MAZE_SIZE - 1; y++) {
    for (let x = 1; x < MAZE_SIZE - 1; x++) {
      if (maze[y][x] === 1) {
        removableWalls.push({ x, y });
      }
    }
  }
  return removableWalls;
}

/**
 * Find all valid placement positions for walls
 * @param {number[][]} maze - The current maze
 * @param {{x: number, y: number}} myPos - Current player position
 * @param {{x: number, y: number}} opponentPos - Opponent position
 * @param {{x: number, y: number}} cheesePos - Cheese position
 * @returns {Array<{x: number, y: number}>} Array of valid placement positions
 */
function findValidPlacements(maze, myPos, opponentPos, cheesePos) {
  const validPlacements = [];
  for (let y = 1; y < MAZE_SIZE - 1; y++) {
    for (let x = 1; x < MAZE_SIZE - 1; x++) {
      if (maze[y][x] === 0 &&
          !(x === myPos.x && y === myPos.y) &&
          !(x === opponentPos.x && y === opponentPos.y) &&
          !(x === cheesePos.x && y === cheesePos.y)) {
        validPlacements.push({ x, y });
      }
    }
  }
  return validPlacements;
}

/**
 * Calculate strategic bonuses based on algorithm and game context
 * @param {string} opponentAlgorithm - Opponent's algorithm
 * @param {number} opponentCurrentDist - Opponent's current distance to cheese
 * @param {number} myCurrentDist - Current player's distance to cheese
 * @param {number} tokens - Number of sabotage tokens remaining
 * @returns {number} Bonus score
 */
function calculateStrategicBonuses(opponentAlgorithm, opponentCurrentDist, myCurrentDist, tokens) {
  const { ALGORITHM_BONUS, CONTEXT_BONUS } = SABOTAGE_SCORING;

  let algorithmBonus = 0;
  if (opponentAlgorithm === 'astar') {
    algorithmBonus = ALGORITHM_BONUS.ASTAR; // A* is predictable, easier to sabotage
  } else if (opponentAlgorithm === 'dfs') {
    algorithmBonus = ALGORITHM_BONUS.DFS; // DFS is unpredictable, harder to sabotage effectively
  }

  let contextBonus = 0;
  if (opponentCurrentDist <= CONTEXT_BONUS.OPPONENT_CLOSE_TO_WIN_DISTANCE) {
    contextBonus += CONTEXT_BONUS.OPPONENT_CLOSE_TO_WIN_BONUS; // Opponent close to winning
  }
  if (myCurrentDist > opponentCurrentDist + CONTEXT_BONUS.PLAYER_BEHIND_THRESHOLD) {
    contextBonus += CONTEXT_BONUS.PLAYER_BEHIND_BONUS; // I'm behind
  }
  if (tokens >= CONTEXT_BONUS.ENDGAME_TOKEN_THRESHOLD && myCurrentDist <= CONTEXT_BONUS.ENDGAME_DISTANCE_THRESHOLD) {
    contextBonus += CONTEXT_BONUS.ENDGAME_BONUS; // Endgame with tokens
  }

  return algorithmBonus + contextBonus;
}

/**
 * Evaluate all possible sabotage combinations and return the best option
 * @param {string} player - 'red' or 'blue'
 * @param {{x: number, y: number}} myPos - Current player position
 * @param {{x: number, y: number}} opponentPos - Opponent position
 * @param {{x: number, y: number}} cheesePos - Cheese position
 * @param {number} myCurrentDist - Current player's distance to cheese
 * @param {number} opponentCurrentDist - Opponent's distance to cheese
 * @param {number} tokens - Number of sabotage tokens remaining
 * @param {string} myAlgorithm - Current player's algorithm
 * @param {string} opponentAlgorithm - Opponent's algorithm
 * @param {number[][]} maze - The current maze
 * @param {number} maxEvaluations - Maximum number of combinations to evaluate (default: MAX_SABOTAGE_EVALUATIONS)
 * @returns {Object|null} Best sabotage option or null if none found
 */
export function evaluateAllSabotageOptions(
  player,
  myPos,
  opponentPos,
  cheesePos,
  myCurrentDist,
  opponentCurrentDist,
  tokens,
  myAlgorithm,
  opponentAlgorithm,
  maze,
  maxEvaluations = MAX_SABOTAGE_EVALUATIONS
) {
  if (tokens <= 0) return null;

  const removableWalls = findRemovableWalls(maze);
  const validPlacements = findValidPlacements(maze, myPos, opponentPos, cheesePos);

  let bestOption = null;
  let bestScore = -Infinity;
  let evaluationCount = 0;

  // Evaluate every combination of remove + place
  for (let removeWall of removableWalls) {
    for (let placePos of validPlacements) {
      if (evaluationCount >= maxEvaluations) break;

      // Create test maze
      const testMaze = maze.map(row => [...row]);
      testMaze[removeWall.y][removeWall.x] = 0; // Remove wall
      testMaze[placePos.y][placePos.x] = 1; // Place wall

      // Ensure both mice can still reach cheese
      const myNewPath = findPath(myAlgorithm, myPos, cheesePos, testMaze);
      const opponentNewPath = findPath(opponentAlgorithm, opponentPos, cheesePos, testMaze);

      if (!myNewPath || !opponentNewPath) continue; // Skip if blocks either mouse completely

      const myNewDist = myNewPath.length - 1;
      const opponentNewDist = opponentNewPath.length - 1;

      // Calculate benefits
      const selfBenefit = myCurrentDist - myNewDist; // Positive = shorter path for me
      const opponentHarm = opponentNewDist - opponentCurrentDist; // Positive = longer path for opponent

      // Calculate strategic bonuses
      const bonuses = calculateStrategicBonuses(opponentAlgorithm, opponentCurrentDist, myCurrentDist, tokens);

      // Min-max score: prioritize self-help, then opponent-harm
      const score = (selfBenefit * SABOTAGE_SCORING.SELF_BENEFIT_WEIGHT) +
        (opponentHarm * SABOTAGE_SCORING.OPPONENT_HARM_WEIGHT) + bonuses;

      if (score > bestScore) {
        bestScore = score;
        bestOption = {
          remove: removeWall,
          place: placePos,
          score: score,
          selfBenefit: selfBenefit,
          opponentHarm: opponentHarm,
          myNewDist: myNewDist,
          opponentNewDist: opponentNewDist,
          reason: `Self: ${selfBenefit > 0 ? '+' : ''}${selfBenefit}, Opponent: ${opponentHarm > 0 ? '+' : ''}${opponentHarm}`
        };
      }

      evaluationCount++;
    }
    if (evaluationCount >= maxEvaluations) break;
  }

  return bestOption;
}

/**
 * Determine if sabotage is better than moving
 * @param {Object} sabotageOption - Best sabotage option from evaluateAllSabotageOptions
 * @param {number} movementBenefit - How many steps would be gained by moving
 * @returns {boolean} True if sabotage is better than moving
 */
export function shouldSabotageOverMove(sabotageOption, movementBenefit) {
  if (!sabotageOption) return false;

  // Movement benefit: how much closer to cheese we get by moving
  const moveAdvantage = Math.min(MAX_MOVES_PER_TURN, movementBenefit);

  // Sabotage total benefit
  const sabotageAdvantage = sabotageOption.selfBenefit +
    (sabotageOption.opponentHarm * SABOTAGE_SCORING.SABOTAGE_ADVANTAGE_MULTIPLIER);

  // Only sabotage if it provides more total strategic value than moving
  return sabotageAdvantage > moveAdvantage + SABOTAGE_SCORING.MOVE_PREFERENCE_THRESHOLD;
}
