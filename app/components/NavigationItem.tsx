import React from 'react';
import { useNavigable } from '../services/NavigationService';
import type { NavigationDirection, NavigationAction } from '../services/NavigationService';

interface NavigationItemProps {
  scope: string;
  id: string;
  navigation: Partial<Record<NavigationDirection, string>>;
  onAction?: (action: NavigationAction) => void;
  disabled?: boolean;
  children: (props: {
    ref: React.RefObject<HTMLElement | null>;
    isFocused: boolean;
    tabIndex: number;
  }) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function NavigationItem({
  scope,
  id,
  navigation,
  onAction,
  disabled,
  children,
  className,
  style
}: NavigationItemProps) {
  const { ref, isFocused, tabIndex } = useNavigable(scope, id, navigation, onAction, disabled);

  return (
    <div className={className} style={style}>
      {children({ ref, isFocused, tabIndex })}
    </div>
  );
}

// Helper function to create navigation maps
export function createNavigationMap(items: string[][], itemPrefix = '') {
  const navigationMap: Record<string, Partial<Record<NavigationDirection, string>>> = {};

  items.forEach((row, rowIndex) => {
    row.forEach((itemId, colIndex) => {
      const fullId = itemPrefix + itemId;
      navigationMap[fullId] = {
        up: rowIndex > 0 ? itemPrefix + items[rowIndex - 1][colIndex] : undefined,
        down: rowIndex < items.length - 1 ? itemPrefix + items[rowIndex + 1][colIndex] : undefined,
        left: colIndex > 0 ? itemPrefix + row[colIndex - 1] : undefined,
        right: colIndex < row.length - 1 ? itemPrefix + row[colIndex + 1] : undefined
      };
    });
  });

  return navigationMap;
} 