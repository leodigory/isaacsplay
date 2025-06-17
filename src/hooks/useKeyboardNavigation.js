import { useEffect, useRef, useCallback } from 'react';

export const useKeyboardNavigation = ({
  onArrowLeft,
  onArrowRight,
  onArrowUp,
  onArrowDown,
  onEnter,
  onEscape,
  onSpace,
  onKeyF,
  onKeyM,
  enabled = true
}) => {
  const isNavigating = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (isNavigating.current) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onArrowLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onArrowRight?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onArrowDown?.();
          break;
        case 'Enter':
          event.preventDefault();
          onEnter?.();
          break;
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
        case ' ':
          event.preventDefault();
          onSpace?.();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          onKeyF?.();
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          onKeyM?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    onArrowLeft,
    onArrowRight,
    onArrowUp,
    onArrowDown,
    onEnter,
    onEscape,
    onSpace,
    onKeyF,
    onKeyM
  ]);

  return {
    setNavigating: (value) => {
      isNavigating.current = value;
    }
  };
};

export default useKeyboardNavigation;

export const useFocusManagement = () => {
  const focusableElementsRef = useRef([]);
  const currentFocusIndexRef = useRef(0);

  const updateFocusableElements = useCallback((container = document) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[data-focusable="true"]'
    ].join(', ');

    focusableElementsRef.current = Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
  }, []);

  const focusElement = useCallback((index) => {
    if (focusableElementsRef.current[index]) {
      focusableElementsRef.current[index].focus();
      currentFocusIndexRef.current = index;
    }
  }, []);

  const focusNext = useCallback(() => {
    const nextIndex = (currentFocusIndexRef.current + 1) % focusableElementsRef.current.length;
    focusElement(nextIndex);
  }, [focusElement]);

  const focusPrevious = useCallback(() => {
    const prevIndex = currentFocusIndexRef.current === 0 
      ? focusableElementsRef.current.length - 1 
      : currentFocusIndexRef.current - 1;
    focusElement(prevIndex);
  }, [focusElement]);

  const focusFirst = useCallback(() => {
    focusElement(0);
  }, [focusElement]);

  const focusLast = useCallback(() => {
    focusElement(focusableElementsRef.current.length - 1);
  }, [focusElement]);

  return {
    updateFocusableElements,
    focusElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    getCurrentFocusIndex: () => currentFocusIndexRef.current,
    getFocusableElements: () => focusableElementsRef.current
  };
};

export const useGridNavigation = (gridConfig = {}) => {
  const { rows = 1, columns = 1, wrap = false } = gridConfig;
  const currentPositionRef = useRef({ row: 0, col: 0 });

  const moveUp = useCallback(() => {
    const { row, col } = currentPositionRef.current;
    const newRow = wrap ? (row === 0 ? rows - 1 : row - 1) : Math.max(0, row - 1);
    currentPositionRef.current = { row: newRow, col };
    return currentPositionRef.current;
  }, [rows, wrap]);

  const moveDown = useCallback(() => {
    const { row, col } = currentPositionRef.current;
    const newRow = wrap ? (row === rows - 1 ? 0 : row + 1) : Math.min(rows - 1, row + 1);
    currentPositionRef.current = { row: newRow, col };
    return currentPositionRef.current;
  }, [rows, wrap]);

  const moveLeft = useCallback(() => {
    const { row, col } = currentPositionRef.current;
    const newCol = wrap ? (col === 0 ? columns - 1 : col - 1) : Math.max(0, col - 1);
    currentPositionRef.current = { row, col: newCol };
    return currentPositionRef.current;
  }, [columns, wrap]);

  const moveRight = useCallback(() => {
    const { row, col } = currentPositionRef.current;
    const newCol = wrap ? (col === columns - 1 ? 0 : col + 1) : Math.min(columns - 1, col + 1);
    currentPositionRef.current = { row, col: newCol };
    return currentPositionRef.current;
  }, [columns, wrap]);

  const setPosition = useCallback((row, col) => {
    currentPositionRef.current = { 
      row: Math.max(0, Math.min(rows - 1, row)), 
      col: Math.max(0, Math.min(columns - 1, col)) 
    };
    return currentPositionRef.current;
  }, [rows, columns]);

  const getPosition = useCallback(() => {
    return currentPositionRef.current;
  }, []);

  const getIndex = useCallback(() => {
    const { row, col } = currentPositionRef.current;
    return row * columns + col;
  }, [columns]);

  return {
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    setPosition,
    getPosition,
    getIndex
  };
};

