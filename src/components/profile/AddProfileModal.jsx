import React, { useState, useRef, useEffect } from 'react';
import Keyboard from '../Keyboard';
import useTVNavigation from '../../hooks/useTVNavigation';
import './AddProfileModal.css';

const AddProfileModal = ({ onSave, onClose }) => {
  const [profileName, setProfileName] = useState('');
  const [isChild, setIsChild] = useState(false);
  const [isKeyboardActive, setKeyboardActive] = useState(false);

  // Referências para os elementos interativos do modal
  const inputRef = useRef(null);
  const checkboxRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Array de referências para os elementos interativos
  const modalRefs = [inputRef, checkboxRef, cancelButtonRef, saveButtonRef];

  // Usar o hook useTVNavigation para o modal, desativando quando o teclado está ativo
  const { focusedIndex, focusElement } = useTVNavigation(modalRefs, !isKeyboardActive);

  // Focar no input quando o modal for aberto
  useEffect(() => {
    focusElement(0); // Foca no input ao abrir o modal
  }, [focusElement]);

  // Ativar/desativar o teclado virtual com base no foco no input
  useEffect(() => {
    if (focusedIndex === 0) {
      setKeyboardActive(true);
    } else {
      setKeyboardActive(false);
    }
  }, [focusedIndex]);

  const handleSave = () => {
    if (profileName.trim()) {
      onSave(profileName, isChild);
      onClose();
    } else {
      alert('Por favor, insira um nome para o perfil.');
      focusElement(0);
    }
  };

  const handleKeyPress = (key) => {
    setProfileName((prev) => prev + key);
  };

  const handleBackspace = () => {
    setProfileName((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setProfileName('');
  };

  const handleKeyboardOk = () => {
    setKeyboardActive(false);
    focusElement(1); // Move o foco para o checkbox após fechar o teclado
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Adicionar Perfil</h2>
        <input
          type="text"
          placeholder="Nome do perfil"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          ref={inputRef}
          onFocus={() => focusElement(0)}
        />
        <label>
          <input
            type="checkbox"
            checked={isChild}
            onChange={(e) => setIsChild(e.target.checked)}
            ref={checkboxRef}
            onFocus={() => focusElement(1)}
          />
          É criança?
        </label>
        <div className="modal-buttons">
          <button onClick={onClose} ref={cancelButtonRef} onFocus={() => focusElement(2)}>
            Cancelar
          </button>
          <button onClick={handleSave} ref={saveButtonRef} onFocus={() => focusElement(3)}>
            Salvar
          </button>
        </div>
        {isKeyboardActive && (
          <Keyboard
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
            onOk={handleKeyboardOk}
            onClose={() => {
              setKeyboardActive(false);
              focusElement(0);
            }}
            onClear={handleClear}
            isKeyboardActive={isKeyboardActive}
          />
        )}
      </div>
    </div>
  );
};

export default AddProfileModal;