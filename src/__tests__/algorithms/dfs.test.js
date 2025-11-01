import { findPathDFS } from '../../algorithms/dfs';

describe('DFS Algorithm', () => {
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

  // Completely blocked maze
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
    test('finds path in open maze', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 1 };
      const path = findPathDFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });

    test('finds path around obstacles', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathDFS(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });

    test('finds some path (may not be shortest)', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 5, y: 5 };
      const path = findPathDFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      // DFS may find longer paths, so we just check it exists
      expect(path.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge cases', () => {
    test('returns null when no path exists', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathDFS(start, goal, blockedMaze);

      expect(path).toBeNull();
    });

    test('returns single-point path when start equals goal', () => {
      const start = { x: 5, y: 5 };
      const goal = { x: 5, y: 5 };
      const path = findPathDFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    test('returns null when start is a wall', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 5, y: 5 };
      const path = findPathDFS(start, goal, openMaze);

      expect(path).toBeNull();
    });
  });

  describe('Path correctness', () => {
    test('path contains only valid moves', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathDFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        
        const dx = Math.abs(next.x - current.x);
        const dy = Math.abs(next.y - current.y);
        expect(dx + dy).toBe(1); // Exactly one step
        expect(dx).toBeLessThanOrEqual(1);
        expect(dy).toBeLessThanOrEqual(1);
      }
    });

    test('path cells are all open', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathDFS(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      
      path.forEach(cell => {
        expect(mazeWithWalls[cell.y][cell.x]).toBe(0);
      });
    });

    test('path starts and ends correctly', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 5, y: 5 };
      const path = findPathDFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });
  });

  describe('DFS behavior (non-optimal paths)', () => {
    test('may find longer paths than optimal (by design)', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 3, y: 1 };
      const path = findPathDFS(start, goal, openMaze);

      expect(path).not.toBeNull();
      // DFS might find a longer path due to randomness and depth-first exploration
      // But should still find a valid path
      expect(path.length).toBeGreaterThanOrEqual(3); // At least start, middle, goal
    });
  });
});
