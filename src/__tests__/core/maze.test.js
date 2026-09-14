/**
 * Tests for Maze Generation
 */

import { generateRandomMaze, isValidMove, getInitialMaze } from '../../core/maze.js';
import { MAZE_SIZE, INITIAL_POSITIONS, CELL_TYPES } from '../../core/constants.js';

describe('Maze Generation', () => {
  describe('generateRandomMaze', () => {
    test('generates a maze of correct size', () => {
      const maze = generateRandomMaze();
      expect(maze).toHaveLength(MAZE_SIZE);
      expect(maze[0]).toHaveLength(MAZE_SIZE);
    });

    test('has walls on all borders', () => {
      const maze = generateRandomMaze();
      const borderMax = MAZE_SIZE - 1;

      // Check top and bottom borders
      for (let x = 0; x < MAZE_SIZE; x++) {
        expect(maze[0][x]).toBe(CELL_TYPES.WALL);
        expect(maze[borderMax][x]).toBe(CELL_TYPES.WALL);
      }

      // Check left and right borders
      for (let y = 0; y < MAZE_SIZE; y++) {
        expect(maze[y][0]).toBe(CELL_TYPES.WALL);
        expect(maze[y][borderMax]).toBe(CELL_TYPES.WALL);
      }
    });

    test('has open cells at critical positions', () => {
      const maze = generateRandomMaze();
      
      expect(maze[INITIAL_POSITIONS.RED.y][INITIAL_POSITIONS.RED.x]).toBe(CELL_TYPES.OPEN);
      expect(maze[INITIAL_POSITIONS.BLUE.y][INITIAL_POSITIONS.BLUE.x]).toBe(CELL_TYPES.OPEN);
      expect(maze[INITIAL_POSITIONS.CHEESE.y][INITIAL_POSITIONS.CHEESE.x]).toBe(CELL_TYPES.OPEN);
    });

    test('generates different mazes on multiple calls', () => {
      const maze1 = generateRandomMaze();
      const maze2 = generateRandomMaze();
      
      // At least one cell should be different (very high probability)
      let differences = 0;
      for (let y = 1; y < MAZE_SIZE - 1; y++) {
        for (let x = 1; x < MAZE_SIZE - 1; x++) {
          if (maze1[y][x] !== maze2[y][x]) {
            differences++;
          }
        }
      }
      expect(differences).toBeGreaterThan(0);
    });
  });

  describe('isValidMove', () => {
    test('returns true for open cells within bounds', () => {
      const maze = getInitialMaze();
      expect(isValidMove({ x: 1, y: 1 }, maze)).toBe(true);
      expect(isValidMove({ x: 5, y: 4 }, maze)).toBe(true);
    });

    test('returns false for walls', () => {
      const maze = getInitialMaze();
      expect(isValidMove({ x: 0, y: 0 }, maze)).toBe(false); // border wall
      expect(isValidMove({ x: 2, y: 2 }, maze)).toBe(false); // wall at (2,2) in default maze
      expect(isValidMove({ x: 3, y: 3 }, maze)).toBe(false); // wall at (3,3) in default maze
      // Also test some border walls explicitly
      expect(isValidMove({ x: 0, y: 5 }, maze)).toBe(false); // left border
      expect(isValidMove({ x: 9, y: 5 }, maze)).toBe(false); // right border
    });

    test('returns false for out of bounds positions', () => {
      const maze = getInitialMaze();
      expect(isValidMove({ x: -1, y: 1 }, maze)).toBe(false);
      expect(isValidMove({ x: MAZE_SIZE, y: 1 }, maze)).toBe(false);
      expect(isValidMove({ x: 1, y: -1 }, maze)).toBe(false);
      expect(isValidMove({ x: 1, y: MAZE_SIZE }, maze)).toBe(false);
    });
  });

  describe('getInitialMaze', () => {
    test('returns correct size', () => {
      const maze = getInitialMaze();
      expect(maze).toHaveLength(MAZE_SIZE);
      expect(maze[0]).toHaveLength(MAZE_SIZE);
    });

    test('has walls on borders', () => {
      const maze = getInitialMaze();
      const borderMax = MAZE_SIZE - 1;
      
      for (let x = 0; x < MAZE_SIZE; x++) {
        expect(maze[0][x]).toBe(CELL_TYPES.WALL);
        expect(maze[borderMax][x]).toBe(CELL_TYPES.WALL);
      }
    });

    test('has open cells at critical positions', () => {
      const maze = getInitialMaze();
      expect(maze[INITIAL_POSITIONS.RED.y][INITIAL_POSITIONS.RED.x]).toBe(CELL_TYPES.OPEN);
      expect(maze[INITIAL_POSITIONS.BLUE.y][INITIAL_POSITIONS.BLUE.x]).toBe(CELL_TYPES.OPEN);
      expect(maze[INITIAL_POSITIONS.CHEESE.y][INITIAL_POSITIONS.CHEESE.x]).toBe(CELL_TYPES.OPEN);
    });
  });
});
