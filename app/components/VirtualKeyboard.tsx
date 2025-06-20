import React, { useEffect, useCallback } from "react";
import NavigationItem from './NavigationItem';
import { useNavigation } from '../services/NavigationService';
import type { NavigationAction } from '../services/NavigationService';

const keyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
  ["@gmail.com", "@yahoo.com", "@hotmail.com"],
  // Special characters row
  [
    { label: ".", key: "." },
    { label: "_", key: "_" },
    { label: "-", key: "-" },
    { label: "@", key: "@" },
    { label: ".com", key: ".com" },
    { label: ".br", key: ".br" }
  ],
  // Action row
  [
    { label: "Limpar", key: "clear" },
    { label: "Confirmar", key: "confirm" }
  ]
];

// Create navigation map for keyboard
const createKeyboardNavigationMap = () => {
  const map: Record<string, any> = {};
  
  keyboardLayout.forEach((row, rowIndex) => {
    row.forEach((key, colIndex) => {
      const keyId = typeof key === 'string' ? key : key.key;
      const id = `kb_${keyId}`;
      const nav: any = {};

      // Up navigation
      if (rowIndex > 0) {
        const upRow = keyboardLayout[rowIndex - 1];
        const upKey = upRow[Math.min(colIndex, upRow.length - 1)];
        nav.up = `kb_${typeof upKey === 'string' ? upKey : upKey.key}`;
      }

      // Down navigation
      if (rowIndex < keyboardLayout.length - 1) {
        const downRow = keyboardLayout[rowIndex + 1];
        const downKey = downRow[Math.min(colIndex, downRow.length - 1)];
        nav.down = `kb_${typeof downKey === 'string' ? downKey : downKey.key}`;
      }

      // Left navigation
      if (colIndex > 0) {
        const leftKey = row[colIndex - 1];
        nav.left = `kb_${typeof leftKey === 'string' ? leftKey : leftKey.key}`;
      }

      // Right navigation
      if (colIndex < row.length - 1) {
        const rightKey = row[colIndex + 1];
        nav.right = `kb_${typeof rightKey === 'string' ? rightKey : rightKey.key}`;
      }

      map[id] = nav;
    });
  });

  // Manual fix for layout inconsistencies
  map['kb_@gmail.com'].right = 'kb_@yahoo.com';
  map['kb_@yahoo.com'].left = 'kb_@gmail.com';
  map['kb_@yahoo.com'].right = 'kb_@hotmail.com';
  map['kb_@hotmail.com'].left = 'kb_@yahoo.com';
  map['kb_.'].right = 'kb__';
  map['kb__'].left = 'kb_.';
  map['kb__'].right = 'kb_-';
  map['kb_-'].left = 'kb__';
  map['kb_-'].right = 'kb_@';
  map['kb_@'].left = 'kb_-';
  map['kb_@'].right = 'kb_.com';
  map['kb_.com'].left = 'kb_@';
  map['kb_.com'].right = 'kb_.br';
  map['kb_.br'].left = 'kb_.com';
  map['kb_clear'].right = 'kb_confirm';
  map['kb_confirm'].left = 'kb_clear';

  return map;
};

const navigationMap = createKeyboardNavigationMap();

interface VirtualKeyboardProps {
  scope: string;
  onInput: (value: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  onClear: () => void;
  onEsc?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

export default function VirtualKeyboard({ 
  scope,
  onInput, 
  onBackspace, 
  onConfirm,
  onClear,
  onEsc, 
  disabled, 
  autoFocus,
  style
}: VirtualKeyboardProps) {
  const { setFocus, isMobile } = useNavigation();

  // Auto focus first key when keyboard opens
  useEffect(() => {
    if (autoFocus && !isMobile) {
      // The focus is now handled by the parent component (login.tsx)
      // setTimeout(() => setFocus('kb_1'), 0);
    }
  }, [autoFocus, isMobile, setFocus]);

  // Handle key actions
  const handleKeyAction = useCallback((key: string, action: NavigationAction) => {
    if (disabled) return;
    
    if (action === 'confirm') {
      if (key === 'confirm') onConfirm();
      else if (key === 'clear') onClear();
      else if (key === 'backspace') onBackspace();
      else onInput(key);
    } else if (action === 'back') {
      onEsc?.();
    }
  }, [disabled, onInput, onBackspace, onConfirm, onClear, onEsc]);

  if (isMobile) return null;

  return (
    <div className="virtual-keyboard" style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 4, 
      alignItems: "center", 
      height: '100%', 
      justifyContent: 'center',
      ...style 
    }}>
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex", gap: 4, justifyContent: "center", width: "100%" }}>
          {row.map((keyObj) => {
            const key = typeof keyObj === 'string' ? keyObj : keyObj.key;
            const label = typeof keyObj === 'string' ? keyObj : keyObj.label;
            const id = `kb_${key}`;
            const isSpecialCharRow = rowIndex === keyboardLayout.length - 2;
            const isActionRow = rowIndex === keyboardLayout.length - 1;

            return (
              <NavigationItem
                key={id}
                scope={scope}
                id={id}
                navigation={navigationMap[id]}
                onAction={(action) => handleKeyAction(key, action)}
                disabled={disabled}
              >
                {({ ref, isFocused, tabIndex }) => (
                  <button
                    ref={ref as React.RefObject<HTMLButtonElement>}
                    onClick={() => handleKeyAction(key, 'confirm')}
                    onMouseEnter={() => setFocus(id)}
                    className={`nav-focus ${isActionRow ? 'nav-focus-button' : ''}`}
                    style={{
                      padding: isSpecialCharRow ? "8px 8px" : isActionRow ? "12px 24px" : "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #444",
                      background: "#222",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: isSpecialCharRow ? 15 : 18,
                      cursor: "pointer",
                      opacity: disabled ? 0.5 : 1,
                      minWidth: isSpecialCharRow ? 34 : isActionRow ? 110 : 44,
                      flex: isSpecialCharRow || isActionRow ? 1 : undefined
                    }}
                    tabIndex={tabIndex}
                    data-focused={isFocused}
                  >
                    {label}
                  </button>
                )}
              </NavigationItem>
            );
          })}
        </div>
      ))}
    </div>
  );
} 