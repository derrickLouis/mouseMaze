import React, { memo } from 'react';

const MazeGrid = ({ maze, getCellClass, getCellContent, renderPathDot }) => {
  return (
    <div className="grid grid-cols-10 gap-0.5">
      {maze.map((row, y) =>
        row.map((cell, x) => (
          <div key={`${x}-${y}`} className={getCellClass(x, y)}>
            {getCellContent(x, y)}
            {renderPathDot(x, y)}
          </div>
        ))
      )}
    </div>
  );
};

export default memo(MazeGrid);


