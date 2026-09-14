import { findPathBFS } from '../../algorithms/bfs';

describe('BFS Algorithm', () => {
  // Simple open maze (10x10 with only border walls)
  const openMaze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  // Maze with obstacles
  const mazeWithWalls = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  // Completely blocked maze (no path from start to goal)
  const blockedMaze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  describe('Basic pathfinding', () => {
    test('finds path in open maze (straight line)', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 1 };
      const path = findPathBFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });

    test('finds path around obstacles', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathBFS(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });

    test('finds diagonal path (zigzag around walls)', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathBFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      // Should be shortest path (Manhattan distance is 14, so path length should be at least 14)
      expect(path.length).toBeGreaterThanOrEqual(15); // path includes start
    });
  });

  describe('Edge cases', () => {
    test('returns null when no path exists', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathBFS(start, goal, blockedMaze);

      expect(path).toBeNull();
    });

    test('returns single-point path when start equals goal', () => {
      const start = { x: 5, y: 5 };
      const goal = { x: 5, y: 5 };
      const path = findPathBFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    test('returns null when start is a wall', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 5, y: 5 };
      const path = findPathBFS(start, goal, openMaze);

      expect(path).toBeNull();
    });

    test('returns null when goal is a wall', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 0, y: 0 };
      const path = findPathBFS(start, goal, openMaze);

      expect(path).toBeNull();
    });
  });

  describe('Path optimality (shortest path)', () => {
    test('finds shortest path in open maze', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 5, y: 5 };
      const path = findPathBFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      // Manhattan distance from (1,1) to (5,5) is 8
      // Shortest path should have length 9 (including start)
      expect(path.length).toBe(9);
    });

    test('finds shortest path with obstacles', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 1 };
      const path = findPathBFS(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      // Should find shortest path around walls
      // Can't go straight (blocked at x=3), must go around
      expect(path.length).toBeGreaterThan(8);
    });
  });

  describe('Path correctness', () => {
    test('path contains only valid moves', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathBFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        
        // Check that adjacent cells differ by exactly 1 in one coordinate
        const dx = Math.abs(next.x - current.x);
        const dy = Math.abs(next.y - current.y);
        expect(dx + dy).toBe(1); // Exactly one step difference
        expect(dx).toBeLessThanOrEqual(1);
        expect(dy).toBeLessThanOrEqual(1);
      }
    });

    test('path cells are all open (not walls)', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathBFS(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      
      path.forEach(cell => {
        expect(mazeWithWalls[cell.y][cell.x]).toBe(0); // 0 = open
      });
    });
  });
});
