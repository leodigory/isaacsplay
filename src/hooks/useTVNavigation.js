import { useEffect, useState, useRef } from 'react';

const useTVNavigation = (refs, isActive = true) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lastFocusedIndex, setLastFocusedIndex] = useState(0);
  const focusedRef = useRef(null);

  // Função para focar em um elemento específico
  const focusElement = (index) => {
    if (index >= 0 && index < refs.length && refs[index] && refs[index].current) {
      setFocusedIndex(index);
      refs[index].current.focus();
      console.log('Foco definido para índice:', index, 'Refs:', refs.map(ref => ref.current));
    } else {
      console.log('Índice inválido ou referência nula:', index, 'Refs:', refs);
    }
  };

  useEffect(() => {
    if (!isActive || refs.length === 0) return;

    const handleKeyDown = (event) => {
      if (!refs.length) return;

      console.log('Tecla pressionada:', event.key, 'FocusedIndex:', focusedIndex);
      if (event.key === 'ArrowRight') {
        setFocusedIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % refs.length;
          setLastFocusedIndex(prevIndex);
          return newIndex;
        });
      } else if (event.key === 'ArrowLeft') {
        setFocusedIndex((prevIndex) => {
          const newIndex = (prevIndex - 1 + refs.length) % refs.length;
          setLastFocusedIndex(prevIndex);
          return newIndex;
        });
      } else if (event.key === 'ArrowDown') {
        setLastFocusedIndex(focusedIndex);
        setFocusedIndex((prevIndex) => (prevIndex + 1) % refs.length);
      } else if (event.key === 'ArrowUp') {
        setLastFocusedIndex(focusedIndex);
        setFocusedIndex((prevIndex) => (prevIndex - 1 + refs.length) % refs.length);
      } else if (event.key === 'Enter' || event.key === ' ') {
        if (focusedRef.current) {
          focusedRef.current.click();
          console.log('Enter clicado no elemento:', focusedRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [refs, focusedIndex, isActive]);

  useEffect(() => {
    if (isActive && refs.length > 0 && refs[focusedIndex] && refs[focusedIndex].current) {
      focusedRef.current = refs[focusedIndex].current;
      focusedRef.current.focus();
      console.log('Foco atualizado para índice:', focusedIndex, 'Ref:', focusedRef.current);
    } else {
      console.log('Não foi possível focar, índice:', focusedIndex, 'Refs:', refs);
    }
  }, [focusedIndex, refs, isActive]);

  return { focusedIndex, focusElement, lastFocusedIndex };
};

export default useTVNavigation;