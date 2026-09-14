import React, { memo } from 'react';

/**
 * The 10x10 board. Purely presentational - all cell styling and content is
 * supplied by the caller so the windowed and fullscreen views stay identical.
 */
const MazeGrid = ({ maze, getCellClass, getCellContent, renderPathDot, keyPrefix = 'cell' }) => {
  return (
    <div className="grid grid-cols-10 gap-0.5" role="grid" aria-label="Maze board">
      {maze.map((row, y) =>
        row.map((_cell, x) => (
          <div key={`${keyPrefix}-${x}-${y}`} className={getCellClass(x, y)} role="gridcell">
            {getCellContent(x, y)}
            {renderPathDot(x, y)}
          </div>
        ))
      )}
    </div>
  );
};

export default memo(MazeGrid);
