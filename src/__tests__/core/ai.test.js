/**
 * Tests for AI Strategy and Decision Making
 */

import { evaluateAllSabotageOptions, shouldSabotageOverMove } from '../../core/ai.js';
import { findPath } from '../../algorithms/index.js';
import { SABOTAGE_SCORING } from '../../core/constants.js';

describe('AI Strategy', () => {
  describe('shouldSabotageOverMove', () => {
    test('returns false when there is no sabotage option', () => {
      expect(shouldSabotageOverMove(null, 2)).toBe(false);
    });

    test('returns true when sabotage advantage clearly beats moving', () => {
      const sabotageOption = { selfBenefit: 3, opponentHarm: 5 };
      expect(shouldSabotageOverMove(sabotageOption, 0)).toBe(true);
    });

    test('returns false when moving is clearly better than sabotaging', () => {
      const sabotageOption = { selfBenefit: 0, opponentHarm: 0 };
      expect(shouldSabotageOverMove(sabotageOption, 2)).toBe(false);
    });

    test('returns false when sabotage advantage only ties the move threshold', () => {
      const moveAdvantage = Math.min(2, 2); // MAX_MOVES_PER_TURN is 2
      const sabotageOption = { selfBenefit: moveAdvantage + SABOTAGE_SCORING.MOVE_PREFERENCE_THRESHOLD, opponentHarm: 0 };
      expect(shouldSabotageOverMove(sabotageOption, 2)).toBe(false);
    });
  });

  describe('evaluateAllSabotageOptions', () => {
    // 10x10 maze: border walls, open interior, one removable wall at (5,5)
    function buildMaze() {
      const size = 10;
      const maze = Array(size).fill().map((_, y) =>
        Array(size).fill().map((_, x) => {
          if (x === 0 || x === size - 1 || y === 0 || y === size - 1) return 1;
          return 0;
        })
      );
      maze[5][5] = 1; // one interior wall available to remove
      return maze;
    }

    test('returns null immediately when no tokens remain', () => {
      const maze = buildMaze();
      const result = evaluateAllSabotageOptions(
        'red',
        { x: 1, y: 1 },
        { x: 8, y: 8 },
        { x: 4, y: 4 },
        10,
        10,
        0, // no tokens
        'bfs',
        'bfs',
        maze
      );
      expect(result).toBe(null);
    });

    test('finds a sabotage option that keeps both paths open', () => {
      const maze = buildMaze();
      const result = evaluateAllSabotageOptions(
        'red',
        { x: 1, y: 1 },
        { x: 8, y: 8 },
        { x: 4, y: 4 },
        10,
        10,
        3,
        'bfs',
        'bfs',
        maze
      );

      expect(result).not.toBe(null);
      expect(result.remove).toEqual({ x: 5, y: 5 });
      expect(typeof result.score).toBe('number');
      expect(typeof result.selfBenefit).toBe('number');
      expect(typeof result.opponentHarm).toBe('number');
    });

    test('never proposes removing or placing a border wall', () => {
      const maze = buildMaze();
      const result = evaluateAllSabotageOptions(
        'red',
        { x: 1, y: 1 },
        { x: 8, y: 8 },
        { x: 4, y: 4 },
        10,
        10,
        3,
        'bfs',
        'bfs',
        maze
      );

      expect(result).not.toBe(null);
      expect(result.remove.x).toBeGreaterThan(0);
      expect(result.remove.y).toBeGreaterThan(0);
      expect(result.place.x).toBeGreaterThan(0);
      expect(result.place.y).toBeGreaterThan(0);
    });

    test('respects the maxEvaluations cap', () => {
      const maze = buildMaze();
      const result = evaluateAllSabotageOptions(
        'red',
        { x: 1, y: 1 },
        { x: 8, y: 8 },
        { x: 4, y: 4 },
        10,
        10,
        3,
        'bfs',
        'bfs',
        maze,
        0 // no evaluations allowed
      );
      expect(result).toBe(null);
    });

    test('chosen swap always leaves both mice with a path to the cheese', () => {
      const maze = buildMaze();
      const myPos = { x: 1, y: 1 };
      const opponentPos = { x: 8, y: 8 };
      const cheesePos = { x: 4, y: 4 };

      const result = evaluateAllSabotageOptions(
        'red',
        myPos,
        opponentPos,
        cheesePos,
        10,
        10,
        3,
        'bfs',
        'bfs',
        maze
      );

      expect(result).not.toBe(null);

      const testMaze = maze.map(row => [...row]);
      testMaze[result.remove.y][result.remove.x] = 0;
      testMaze[result.place.y][result.place.x] = 1;

      expect(findPath('bfs', myPos, cheesePos, testMaze)).not.toBe(null);
      expect(findPath('bfs', opponentPos, cheesePos, testMaze)).not.toBe(null);
    });
  });
});
