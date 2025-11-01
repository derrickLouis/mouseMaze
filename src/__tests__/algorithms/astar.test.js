import { findPathAStar } from '../../algorithms/astar';

describe('A* Algorithm', () => {
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
      const path = findPathAStar(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });

    test('finds path around obstacles', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathAStar(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(goal);
    });
  });

  describe('Edge cases', () => {
    test('returns null when no path exists', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathAStar(start, goal, blockedMaze);

      expect(path).toBeNull();
    });

    test('returns single-point path when start equals goal', () => {
      const start = { x: 5, y: 5 };
      const goal = { x: 5, y: 5 };
      const path = findPathAStar(start, goal, openMaze);

      expect(path).not.toBeNull();
      expect(path.length).toBe(1);
      expect(path[0]).toEqual(start);
    });

    test('returns null when start is a wall', () => {
      const start = { x: 0, y: 0 };
      const goal = { x: 5, y: 5 };
      const path = findPathAStar(start, goal, openMaze);

      expect(path).toBeNull();
    });
  });

  describe('Path optimality (should find shortest path)', () => {
    test('finds optimal path in open maze', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 5, y: 5 };
      const path = findPathAStar(start, goal, openMaze);

      expect(path).not.toBeNull();
      // Manhattan distance is 8, so optimal path length should be 9 (including start)
      expect(path.length).toBe(9);
    });

    test('finds optimal path with obstacles', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 1 };
      const path = findPathAStar(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      // Should find optimal path around walls
      expect(path.length).toBeGreaterThan(8);
    });
  });

  describe('Path correctness', () => {
    test('path contains only valid moves', () => {
      const start = { x: 1, y: 1 };
      const goal = { x: 8, y: 8 };
      const path = findPathAStar(start, goal, openMaze);

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
      const path = findPathAStar(start, goal, mazeWithWalls);

      expect(path).not.toBeNull();
      
      path.forEach(cell => {
        expect(mazeWithWalls[cell.y][cell.x]).toBe(0);
      });
    });
  });
});
