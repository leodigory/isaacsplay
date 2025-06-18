import React, { useState, useEffect, useRef } from "react";

const keyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
  ["@gmail.com", "@yahoo.com", "@hotmail.com"],
  [".", "_", "-", "@", ".com", "backspace", "confirm"]
];

interface VirtualKeyboardProps {
  onInput: (value: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  onEsc?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function VirtualKeyboard({ onInput, onBackspace, onConfirm, onEsc, disabled, autoFocus }: VirtualKeyboardProps) {
  const [focus, setFocus] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const keyboardRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const totalRows = keyboardLayout.length;

  // Foco automático ao abrir
  useEffect(() => {
    if (autoFocus) {
      setFocus({ row: 0, col: 0 });
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  // Navegação por teclado
  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && keyboardRef.current && !keyboardRef.current.contains(document.activeElement)) return;
      let { row, col } = focus;
      if (e.key === "ArrowDown") {
        if (row < totalRows - 1) {
          row = Math.min(totalRows - 1, row + 1);
          col = Math.min(col, keyboardLayout[row].length - 1);
          setFocus({ row, col });
        }
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        if (row > 0) {
          row = Math.max(0, row - 1);
          col = Math.min(col, keyboardLayout[row].length - 1);
          setFocus({ row, col });
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        col = Math.max(0, col - 1);
        setFocus({ row, col });
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        col = Math.min(keyboardLayout[row].length - 1, col + 1);
        setFocus({ row, col });
        e.preventDefault();
      } else if (e.key === "Enter") {
        const key = keyboardLayout[row][col];
        if (key === "backspace") onBackspace();
        else if (key === "confirm") onConfirm();
        else onInput(key);
        e.preventDefault();
      } else if (e.key === "Escape") {
        onEsc && onEsc();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focus, onInput, onBackspace, onConfirm, onEsc, disabled]);

  // Mouse: foco e clique
  const handleMouseEnter = (rowIdx: number, colIdx: number) => {
    setFocus({ row: rowIdx, col: colIdx });
  };
  const handleClick = (key: string) => {
    if (key === "backspace") onBackspace();
    else if (key === "confirm") onConfirm();
    else onInput(key);
  };

  return (
    <div ref={keyboardRef} className="virtual-keyboard" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      {keyboardLayout.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {row.map((key, colIdx) => {
            const isFocused = focus.row === rowIdx && focus.col === colIdx;
            const ref = rowIdx === 0 && colIdx === 0 ? firstButtonRef : undefined;
            if (key === "confirm") {
              return (
                <button
                  key={key}
                  ref={ref}
                  style={{
                    padding: "16px 40px",
                    borderRadius: 10,
                    border: isFocused ? "1px solid #e50914" : "1px solid #444",
                    background: isFocused ? "#232323" : "#222",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 22,
                    outline: isFocused ? "1px solid #e50914" : "none",
                    cursor: "pointer",
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: isFocused ? '0 0 8px #e5091440' : 'none',
                    transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                    minWidth: 120
                  }}
                  tabIndex={isFocused ? 0 : -1}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onClick={onConfirm}
                  disabled={disabled}
                >
                  Confirmar
                </button>
              );
            }
            return (
              <button
                key={key}
                ref={ref}
                style={{
                  padding: "12px 18px",
                  borderRadius: 8,
                  border: isFocused ? "1px solid #e50914" : "1px solid #444",
                  background: isFocused ? "#232323" : "#222",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 18,
                  outline: isFocused ? "1px solid #e50914" : "none",
                  cursor: "pointer",
                  opacity: disabled ? 0.5 : 1,
                  boxShadow: isFocused ? '0 0 8px #e5091440' : 'none',
                  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s'
                }}
                tabIndex={isFocused ? 0 : -1}
                onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                onClick={() => handleClick(key)}
                disabled={disabled}
              >
                {key === "backspace" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
} 