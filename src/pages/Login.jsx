import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchUserData } from '../components/auth';
import useTVNavigation from '../hooks/useTVNavigation.js';
import Keyboard from '../components/Keyboard.jsx';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const loginButtonRef = useRef(null);
  const navigate = useNavigate();

  // Array de referências para os elementos interativos
  const interactiveElements = [emailInputRef, passwordInputRef, loginButtonRef];

  // Estado para controlar a exibição do teclado virtual
  const [keyboardActive, setKeyboardActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Use o hook useTVNavigation, desativando-o quando o teclado estiver ativo
  const { focusedIndex, focusElement } = useTVNavigation(interactiveElements, !keyboardActive);

  const isMobile = window.innerWidth <= 768;

  // Ativar/desativar o teclado virtual com base no foco
  useEffect(() => {
    if (!isMobile && interactiveElements[focusedIndex] && interactiveElements[focusedIndex].current) {
      setKeyboardActive(focusedIndex === 0 || focusedIndex === 1);
    } else {
      setKeyboardActive(false);
    }
  }, [focusedIndex, isMobile, interactiveElements]);

  // Focar no elemento atual quando o índice de foco mudar
  useEffect(() => {
    if (interactiveElements[focusedIndex] && interactiveElements[focusedIndex].current) {
      interactiveElements[focusedIndex].current.focus();
    }
  }, [focusedIndex, interactiveElements]);

  // Fechar o teclado virtual ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        keyboardActive &&
        !event.target.closest('.keyboard') &&
        !event.target.closest('input') &&
        !event.target.closest('button')
      ) {
        setKeyboardActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [keyboardActive]);

  // Função para lidar com o login
  const handleLogin = async (e) => {
    e.preventDefault(); // Impede a submissão padrão do formulário
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      focusElement(0); // Focar no campo de email
      setKeyboardActive(true);
      return;
    }

    try {
      const userData = await login(email, password);
      const additionalData = await fetchUserData(userData.uid);
      const combinedData = additionalData ? { ...userData, ...additionalData } : userData;
      localStorage.setItem('user', JSON.stringify(combinedData));
      navigate('/profiles');
    } catch (error) {
      setErrorMessage('Email ou senha incorretos.');
      focusElement(0); // Focar no campo de email
      setKeyboardActive(true);
      console.error('Erro durante o login:', error.message);
    }
  };

  // Função para lidar com o botão "OK" do teclado virtual
  const handleKeyboardOk = () => {
    setKeyboardActive(false); // Fechar o teclado
    if (focusedIndex === 0) {
      focusElement(1); // Mover para o campo de senha
    } else if (focusedIndex === 1) {
      focusElement(2); // Mover para o botão de login
    }
  };

  // Função para fechar o teclado virtual
  const handleCloseKeyboard = () => {
    setKeyboardActive(false);
    focusElement(focusedIndex); // Mantém o foco no elemento atual
  };

  // Função para limpar os campos de entrada
  const handleClearInputs = () => {
    setEmail('');
    setPassword('');
  };

  // Impedir que o "Enter" no teclado virtual submeta o formulário
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && keyboardActive) {
      e.preventDefault(); // Impede a submissão do formulário
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src="/images/logologin.png" alt="Logo IsaacPlay" className="logo-login" />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleLogin} onKeyDown={handleKeyDown}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            ref={emailInputRef}
            onFocus={() => {
              focusElement(0);
              setKeyboardActive(true); // Abrir o teclado imediatamente
            }}
            onClick={() => {
              focusElement(0);
              setKeyboardActive(true);
            }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            ref={passwordInputRef}
            onFocus={() => {
              focusElement(1);
              setKeyboardActive(true); // Abrir o teclado imediatamente
            }}
            onClick={() => {
              focusElement(1);
              setKeyboardActive(true);
            }}
          />
          <button type="submit" ref={loginButtonRef} onFocus={() => focusElement(2)}>
            Entrar
          </button>
        </form>
      </div>
      {keyboardActive && !isMobile && (
        <Keyboard
          onKeyPress={(key) => {
            if (focusedIndex === 0) {
              setEmail((prev) => prev + key);
            } else if (focusedIndex === 1) {
              setPassword((prev) => prev + key);
            }
          }}
          onBackspace={() => {
            if (focusedIndex === 0) {
              setEmail((prev) => prev.slice(0, -1));
            } else if (focusedIndex === 1) {
              setPassword((prev) => prev.slice(0, -1));
            }
          }}
          onOk={handleKeyboardOk}
          onClose={handleCloseKeyboard}
          isKeyboardActive={keyboardActive}
          onClear={handleClearInputs}
        />
      )}
    </div>
  );
}

export default Login;