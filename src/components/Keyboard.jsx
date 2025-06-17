import React, { useRef, useEffect, useState, useMemo } from 'react';
import './Keyboard.css';

function Keyboard({ onKeyPress, onBackspace, onOk, isKeyboardActive, onClose, onClear }) {
  const keyboardKeys = useMemo(
    () => [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', '_', '-', 'DEL'],
      ['Limpar', '@hotmail.com', '@gmail.com', '@yahoo.com', '.br', '.com', 'OK'],
    ],
    []
  );

  const keyRefs = useRef([]);
  const keyboardCols = 10;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const keyboardRef = useRef(null);

  const keyToDestinationMap = useMemo(
    () => ({
      '_': '.br',
      '-': '.com',
      'DEL': 'OK',
      'z': '@hotmail.com',
      'x': '@hotmail.com',
      'c': '@gmail.com',
      'v': '@gmail.com',
      'b': '@yahoo.com',
      'n': '@yahoo.com',
      'm': '@yahoo.com',
    }),
    []
  );

  if (keyRefs.current.length === 0) {
    keyRefs.current = keyboardKeys.flat().map(() => React.createRef());
  }

  const handleKeyDown = (e) => {
    if (!isKeyboardActive) return;

    const key = e.key;
    let newIndex = focusedIndex;

    if (key === 'ArrowRight') {
      newIndex = (focusedIndex + 1) % keyRefs.current.length;
    } else if (key === 'ArrowLeft') {
      newIndex = (focusedIndex - 1 + keyRefs.current.length) % keyRefs.current.length;
    } else if (key === 'ArrowDown') {
      const currentKey = keyRefs.current[focusedIndex].current.innerText;
      if (keyToDestinationMap[currentKey]) {
        const destinationKey = keyToDestinationMap[currentKey];
        newIndex = keyRefs.current.findIndex((ref) => ref.current.innerText === destinationKey);
      } else {
        newIndex = (focusedIndex + keyboardCols) % keyRefs.current.length;
      }
    } else if (key === 'ArrowUp') {
      newIndex = (focusedIndex - keyboardCols + keyRefs.current.length) % keyRefs.current.length;
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault(); // Impede qualquer comportamento padrão (como submissão do formulário)
      const currentKey = keyRefs.current[focusedIndex].current.innerText;
      if (currentKey === 'DEL') {
        onBackspace();
      } else if (currentKey === 'OK') {
        onOk();
      } else if (currentKey === 'Limpar') {
        onClear();
      } else {
        onKeyPress(currentKey);
      }
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  };

  useEffect(() => {
    if (isKeyboardActive) {
      window.addEventListener('keydown', handleKeyDown);
      // Focar no primeiro elemento do teclado ao ativar
      if (keyRefs.current[0] && keyRefs.current[0].current) {
        keyRefs.current[0].current.focus();
      }
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isKeyboardActive, focusedIndex, onKeyPress, onBackspace, onOk, onClear]);

  useEffect(() => {
    if (isKeyboardActive && keyRefs.current[focusedIndex] && keyRefs.current[focusedIndex].current) {
      keyRefs.current[focusedIndex].current.focus();
    }
  }, [focusedIndex, isKeyboardActive]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (keyboardRef.current && !keyboardRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="keyboard" ref={keyboardRef}>
      {keyboardKeys.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key, keyIndex) => {
            const index = keyboardKeys.flat().indexOf(key);
            return (
              <button
                key={key}
                className={`keyboard-key ${key === 'OK' ? 'keyboard-ok' : ''}`}
                ref={keyRefs.current[index]}
                onClick={(e) => {
                  e.preventDefault(); // Impede qualquer comportamento padrão
                  if (key === 'DEL') {
                    onBackspace();
                  } else if (key === 'OK') {
                    onOk();
                  } else if (key === 'Limpar') {
                    onClear();
                  } else {
                    onKeyPress(key);
                  }
                }}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;