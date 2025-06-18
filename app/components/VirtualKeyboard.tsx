import React, { useState, useEffect, useRef } from "react";

const keyboardLayout = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
  ["@gmail.com", "@yahoo.com", "@hotmail.com"],
  // Linha de caracteres especiais
  [
    { label: ".", key: ".1" },
    { label: "_", key: "_" },
    { label: "-", key: "-" },
    { label: ".", key: ".2" },
    { label: "@", key: "@" },
    { label: ".com", key: ".com" }
  ],
  // Linha de ação
  [
    { label: "Limpar", key: "clear" },
    { label: "Confirmar", key: "confirm" }
  ]
];

interface VirtualKeyboardProps {
  onInput: (value: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  onClear: () => void;
  onEsc?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function VirtualKeyboard({ onInput, onBackspace, onConfirm, onClear, onEsc, disabled, autoFocus }: VirtualKeyboardProps) {
  const [focus, setFocus] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [isClient, setIsClient] = useState(false);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const totalRows = keyboardLayout.length;
  const emailRowIdx = 4; // linha dos emails
  const specialRowIdx = 5; // linha dos caracteres especiais
  const actionRowIdx = 6; // linha dos botões de ação

  // Verifica se está no cliente para evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Foco automático ao abrir
  useEffect(() => {
    if (autoFocus && isClient) {
      setFocus({ row: 0, col: 0 });
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 0);
    }
  }, [autoFocus, isClient]);

  // Navegação por teclado
  useEffect(() => {
    if (disabled || !isClient) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && keyboardRef.current && !keyboardRef.current.contains(document.activeElement)) return;
      let { row, col } = focus;
      if (e.key === "ArrowDown") {
        if (row < keyboardLayout.length - 1) {
          // Busca a coluna mais próxima na linha de baixo
          const nextRow = row + 1;
          const nextRowLen = keyboardLayout[nextRow].length;
          // Encontra a coluna mais próxima
          let minDist = Infinity;
          let bestCol = 0;
          for (let c = 0; c < nextRowLen; c++) {
            const dist = Math.abs(c - col);
            if (dist < minDist) {
              minDist = dist;
              bestCol = c;
            }
          }
          setFocus({ row: nextRow, col: bestCol });
        }
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        if (row > 0) {
          // Busca a coluna mais próxima na linha de cima
          const prevRow = row - 1;
          const prevRowLen = keyboardLayout[prevRow].length;
          let minDist = Infinity;
          let bestCol = 0;
          for (let c = 0; c < prevRowLen; c++) {
            const dist = Math.abs(c - col);
            if (dist < minDist) {
              minDist = dist;
              bestCol = c;
            }
          }
          setFocus({ row: prevRow, col: bestCol });
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        if (col > 0) {
          setFocus({ row, col: col - 1 });
        }
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        if (col < keyboardLayout[row].length - 1) {
          setFocus({ row, col: col + 1 });
        }
        e.preventDefault();
      } else if (e.key === "Enter") {
        const keyObj = keyboardLayout[row][col];
        const key = typeof keyObj === "string" ? keyObj : keyObj.key;
        if (key === "backspace") onBackspace();
        else if (key === "confirm") onConfirm();
        else if (key === "clear") onClear();
        else if (typeof key === "string") onInput(key);
        e.preventDefault();
      } else if (e.key === "Escape") {
        onEsc && onEsc();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focus, onInput, onBackspace, onConfirm, onClear, onEsc, disabled, isClient]);

  // Mouse: foco e clique
  const handleMouseEnter = (rowIdx: number, colIdx: number) => {
    setFocus({ row: rowIdx, col: colIdx });
  };
  const handleClick = (keyObj: string | { label: string; key: string }) => {
    const key = typeof keyObj === "string" ? keyObj : keyObj.key;
    if (key === "backspace") onBackspace();
    else if (key === "confirm") onConfirm();
    else if (key === "clear") onClear();
    else if (typeof key === "string") onInput(key);
  };

  return (
    <div ref={keyboardRef} className="virtual-keyboard" style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", height: '100%', justifyContent: 'center' }}>
      {keyboardLayout.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: "flex", gap: 4, justifyContent: "center", width: "100%" }}>
          {row.map((keyObj, colIdx) => {
            const key = typeof keyObj === "string" ? keyObj : keyObj.label;
            const uniqueKey = typeof keyObj === "string" ? keyObj + rowIdx + colIdx : keyObj.key;
            const isFocused = focus.row === rowIdx && focus.col === colIdx;
            const ref = rowIdx === 0 && colIdx === 0 ? firstButtonRef : undefined;
            // Linha de caracteres especiais
            const isSpecialCharRow = rowIdx === keyboardLayout.length - 2;
            // Linha de ação
            const isActionRow = rowIdx === keyboardLayout.length - 1;
            if (key === "confirm") {
              return (
                <button
                  key={uniqueKey}
                  ref={ref}
                  style={{
                    padding: "14px 32px",
                    borderRadius: 10,
                    border: isFocused ? "1.5px solid #e50914" : "1px solid #444",
                    background: isFocused ? "#232323" : "#222",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 18,
                    outline: isFocused ? "1.5px solid #e50914" : "none",
                    cursor: "pointer",
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: isFocused ? '0 0 8px #e5091440' : 'none',
                    transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                    minWidth: 120,
                    flex: 1,
                    marginLeft: 8
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
            if (key === "clear") {
              return (
                <button
                  key={uniqueKey}
                  style={{
                    padding: "14px 32px",
                    borderRadius: 10,
                    border: isFocused ? "1.5px solid #e50914" : "1px solid #444",
                    background: isFocused ? "#232323" : "#222",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 18,
                    outline: isFocused ? "1.5px solid #e50914" : "none",
                    cursor: "pointer",
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: isFocused ? '0 0 8px #e5091440' : 'none',
                    transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                    minWidth: 120,
                    flex: 1,
                    marginRight: 8
                  }}
                  tabIndex={isFocused ? 0 : -1}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onClick={onClear}
                  disabled={disabled}
                >
                  Limpar
                </button>
              );
            }
            return (
              <button
                key={uniqueKey}
                ref={ref}
                style={{
                  padding: isSpecialCharRow ? "8px 8px" : isActionRow ? "12px 24px" : "10px 14px",
                  borderRadius: 8,
                  border: isFocused ? "1.5px solid #e50914" : "1px solid #444",
                  background: isFocused ? "#232323" : "#222",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: isSpecialCharRow ? 15 : 18,
                  outline: isFocused ? "1.5px solid #e50914" : "none",
                  cursor: "pointer",
                  opacity: disabled ? 0.5 : 1,
                  boxShadow: isFocused ? '0 0 8px #e5091440' : 'none',
                  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                  minWidth: isSpecialCharRow ? 34 : isActionRow ? 110 : 44,
                  flex: isSpecialCharRow || isActionRow ? 1 : undefined
                }}
                tabIndex={isFocused ? 0 : -1}
                onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                onClick={() => handleClick(keyObj)}
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