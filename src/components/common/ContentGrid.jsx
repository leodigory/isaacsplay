import React, { useState, useRef, useEffect } from 'react';
import ContentCard from './ContentCard';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

const ContentGrid = ({ 
  title, 
  items, 
  onSelect, 
  onHover,
  onHoverEnd,
  columns = 6,
  rows = 2,
  initialFocus = { row: 0, col: 0 }
}) => {
  const [focusedIndex, setFocusedIndex] = useState(initialFocus);
  const gridRef = useRef(null);

  const handleKeyNavigation = (direction) => {
    const currentRow = focusedIndex.row;
    const currentCol = focusedIndex.col;
    const totalItems = items.length;
    const itemsPerRow = Math.min(columns, Math.ceil(totalItems / rows));

    let newRow = currentRow;
    let newCol = currentCol;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, currentRow - 1);
        break;
      case 'down':
        newRow = Math.min(rows - 1, currentRow + 1);
        break;
      case 'left':
        newCol = Math.max(0, currentCol - 1);
        break;
      case 'right':
        newCol = Math.min(itemsPerRow - 1, currentCol + 1);
        break;
    }

    const newIndex = newRow * itemsPerRow + newCol;
    if (newIndex < totalItems) {
      setFocusedIndex({ row: newRow, col: newCol });
    }
  };

  useKeyboardNavigation({
    onUp: () => handleKeyNavigation('up'),
    onDown: () => handleKeyNavigation('down'),
    onLeft: () => handleKeyNavigation('left'),
    onRight: () => handleKeyNavigation('right'),
    onEnter: () => {
      const index = focusedIndex.row * Math.min(columns, Math.ceil(items.length / rows)) + focusedIndex.col;
      if (index < items.length) {
        onSelect?.(items[index]);
      }
    }
  });

  const getGridTemplateColumns = () => {
    return `repeat(${Math.min(columns, Math.ceil(items.length / rows))}, minmax(0, 1fr))`;
  };

  return (
    <div className="w-full space-y-4">
      {title && (
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      )}
      <div 
        ref={gridRef}
        className="grid gap-4"
        style={{ 
          gridTemplateColumns: getGridTemplateColumns(),
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        {items.map((item, index) => {
          const row = Math.floor(index / Math.min(columns, Math.ceil(items.length / rows)));
          const col = index % Math.min(columns, Math.ceil(items.length / rows));
          const isSelected = row === focusedIndex.row && col === focusedIndex.col;

          return (
            <ContentCard
              key={item.id}
              content={item}
              isSelected={isSelected}
              onSelect={onSelect}
              onFocus={() => setFocusedIndex({ row, col })}
              onHover={onHover}
              onHoverEnd={onHoverEnd}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ContentGrid; 