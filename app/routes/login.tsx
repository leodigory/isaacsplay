import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import VirtualKeyboard from "../components/VirtualKeyboard";
import NavigationItem from "../components/NavigationItem";
import { useNavigation } from "../services/NavigationService";
import type { NavigationAction } from "../services/NavigationService";
import logoLight from "../welcome/logo-light.png";

const SCOPES = {
  LOGIN: 'login',
  KEYBOARD: 'keyboard',
} as const;

// Navigation IDs
const NAV = {
  EMAIL: 'login_email',
  PASSWORD: 'login_password',
  BUTTON: 'login_button',
  REMEMBER: 'login_remember',
  FORGOT: 'login_forgot',
  HELP: 'login_help'
} as const;

// Navigation map
const navigationMap = {
  [NAV.EMAIL]: { down: NAV.PASSWORD, up: NAV.HELP },
  [NAV.PASSWORD]: { up: NAV.EMAIL, down: NAV.BUTTON },
  [NAV.BUTTON]: { up: NAV.PASSWORD, down: NAV.REMEMBER },
  [NAV.REMEMBER]: { up: NAV.BUTTON, down: NAV.HELP, right: NAV.FORGOT },
  [NAV.FORGOT]: { up: NAV.BUTTON, down: NAV.HELP, left: NAV.REMEMBER },
  [NAV.HELP]: { up: NAV.REMEMBER, down: NAV.EMAIL }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState<typeof NAV.EMAIL | typeof NAV.PASSWORD | null>(null);
  const [remember, setRemember] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const { isMobile, setFocus, setActiveScope, currentFocus, activeScope } = useNavigation();

  // Load remembered email on initial render
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('isaacplay-remembered-email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Basic validations
    if (!email.trim()) {
      setError("Por favor, insira seu email");
      setFocus(NAV.EMAIL);
      return;
    }
    
    if (!password.trim()) {
      setError("Por favor, insira sua senha");
      setFocus(NAV.PASSWORD);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido");
      setFocus(NAV.EMAIL);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Check if Firebase is configured
      if (!auth || !db) {
        throw new Error("Firebase não está configurado corretamente");
      }
      
      // Real Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Lógica de criação de perfil
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().profiles?.length) {
        // Cria o primeiro perfil se não existir nenhum
        const profileName = email.split('@')[0];
        await setDoc(userRef, {
          profiles: [{
            id: 'default',
            name: profileName,
            avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${profileName}`
          }]
        }, { merge: true });
      }
      
      console.log("Usuário autenticado com sucesso:", { email: user.email, uid: user.uid });
      
      // Handle "Remember Email" logic
      if (remember) {
        localStorage.setItem('isaacplay-remembered-email', email);
      } else {
        localStorage.removeItem('isaacplay-remembered-email');
      }

      // Redirect to profiles screen after successful login
      window.location.href = "/profiles";
      
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      
      // Specific Firebase error handling
      let errorMessage = "Email ou senha inválidos";
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado";
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Email inválido";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Erro de conexão. Verifique sua internet";
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = "Conta desabilitada";
      } else if (err.message && err.message.includes("Firebase não está configurado")) {
        errorMessage = "Erro de configuração. Tente novamente mais tarde";
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = "Credenciais inválidas";
      }
      
      setError(errorMessage);
      setPassword(""); // Clear only password
      setShowKeyboard(false);
      setFocus(NAV.PASSWORD);
      
    } finally {
      setLoading(false);
    }
  }, [email, password, setFocus, remember]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Set initial scope on mount
  useEffect(() => {
    setActiveScope(SCOPES.LOGIN);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set initial focus once the scope is active
  useEffect(() => {
    if (activeScope === SCOPES.LOGIN && !currentFocus) {
      setFocus(NAV.EMAIL);
    }
  }, [activeScope, currentFocus, setFocus]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const closeKeyboard = useCallback(() => {
    if (keyboardTarget) {
      const lastTarget = keyboardTarget;
      setShowKeyboard(false);
      setKeyboardTarget(null);
      setActiveScope(SCOPES.LOGIN);
      setFocus(lastTarget);
    }
  }, [keyboardTarget, setActiveScope, setFocus]);

  // Close keyboard on resize
  useEffect(() => {
    if (windowWidth <= 1024 && showKeyboard) {
      closeKeyboard();
    }
  }, [windowWidth, showKeyboard, closeKeyboard]);

  // When keyboard becomes visible and its scope is active, focus its first element.
  useEffect(() => {
    if (showKeyboard && activeScope === SCOPES.KEYBOARD) {
      setFocus('kb_1');
    }
  }, [showKeyboard, activeScope, setFocus]);

  // When keyboard is open, ensure DOM focus stays on the correct input for physical keyboard typing
  useEffect(() => {
    // This effect should ONLY run when the keyboard is visible.
    if (!showKeyboard || !currentFocus?.startsWith('kb_')) return;

    if (keyboardTarget === NAV.EMAIL && document.activeElement !== emailRef.current) {
      emailRef.current?.focus();
    } else if (keyboardTarget === NAV.PASSWORD && document.activeElement !== passwordRef.current) {
      passwordRef.current?.focus();
    }
  }, [currentFocus, keyboardTarget, showKeyboard]);

  // Keyboard action handlers
  const handleKeyboardInput = useCallback((val: string) => {
    if (keyboardTarget === NAV.EMAIL) setEmail(e => e + val);
    else if (keyboardTarget === NAV.PASSWORD) setPassword(p => p + val);
  }, [keyboardTarget]);

  const handleKeyboardBackspace = useCallback(() => {
    if (keyboardTarget === NAV.EMAIL) setEmail(e => e.slice(0, -1));
    else if (keyboardTarget === NAV.PASSWORD) setPassword(p => p.slice(0, -1));
  }, [keyboardTarget]);

  const handleKeyboardClear = useCallback(() => {
    if (keyboardTarget === NAV.EMAIL) setEmail("");
    else if (keyboardTarget === NAV.PASSWORD) setPassword("");
  }, [keyboardTarget]);

  const handleKeyboardConfirm = useCallback(() => {
    if (keyboardTarget === NAV.EMAIL) {
      setActiveScope(SCOPES.LOGIN);
      setFocus(NAV.PASSWORD);
    } else if (keyboardTarget === NAV.PASSWORD) {
      setActiveScope(SCOPES.LOGIN);
      setFocus(NAV.BUTTON);
    }
    setShowKeyboard(false);
    setKeyboardTarget(null);
  }, [keyboardTarget, setActiveScope, setFocus]);
  
  const openKeyboard = useCallback((target: typeof NAV.EMAIL | typeof NAV.PASSWORD) => {
    if (windowWidth > 1024) {
      setKeyboardTarget(target);
      setShowKeyboard(true);
      setActiveScope(SCOPES.KEYBOARD);
    }
  }, [windowWidth, setActiveScope]);

  // Global handler to close keyboard
  useEffect(() => {
    const handleGlobalClose = (e: KeyboardEvent) => {
      if (!showKeyboard) return;

      // Always close on Escape
      if (e.key === 'Escape') {
        closeKeyboard();
        e.preventDefault();
        return;
      }

      // Close on Backspace ONLY if the keyboard scope is active
      if (e.key === 'Backspace' && activeScope === SCOPES.KEYBOARD) {
        closeKeyboard();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleGlobalClose);
    return () => window.removeEventListener('keydown', handleGlobalClose);
  }, [showKeyboard, closeKeyboard, activeScope]);

  // Form item action handlers
  const handleEmailAction = useCallback((action: NavigationAction) => {
    if (action === 'confirm') openKeyboard(NAV.EMAIL);
  }, [openKeyboard]);

  const handlePasswordAction = useCallback((action: NavigationAction) => {
    if (action === 'confirm') openKeyboard(NAV.PASSWORD);
  }, [openKeyboard]);

  const handleButtonAction = useCallback((action: NavigationAction) => {
    if (action === 'confirm') {
      handleSubmitRef.current();
    }
  }, []);

  const handleRememberAction = useCallback((action: NavigationAction) => {
    if (action === 'confirm') {
      setRemember(r => !r);
    }
  }, []);

  const handleForgotAction = useCallback((action: NavigationAction) => {
    if (action === 'confirm') {
      // Simulate click on the link
      (document.querySelector(`[data-nav-id="${NAV.FORGOT}"] a`) as HTMLElement)?.click();
      console.log('Forgot password action triggered');
    }
  }, []);

  const handleHelpAction = useCallback((action: NavigationAction) => {
    if (action === 'confirm') {
      // Simulate click on the link
       (document.querySelector(`[data-nav-id="${NAV.HELP}"] div`) as HTMLElement)?.click();
      console.log('Help action triggered');
    }
  }, []);
  
  // Styles optimized with useMemo
  const loginMainRowStyle = useMemo(() => ({
    display: "flex",
    flexDirection: "column" as "column",
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    minHeight: '100vh',
    backgroundImage: 'url(/back.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '20px',
    boxSizing: 'border-box' as 'border-box',
  }), []);

  const logoContainerStyle = useMemo(() => ({
    marginBottom: '32px',
  }), []);

  const loginFormContainerStyle = useMemo(() => ({
    width: '100%', // Use full width for positioning context
    height: 400,
    position: 'relative' as 'relative',
  }), []);

  const loginFormStyle = useMemo(() => ({
    background: "rgba(20, 20, 20, 0.95)",
    padding: '40px',
    borderRadius: 16,
    width: 460,
    height: '100%',
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column" as 'column',
    alignItems: "center",
    justifyContent: "center",
    boxSizing: 'border-box' as 'border-box',
    position: 'absolute' as 'absolute', // Make it absolute
    top: 0,
    left: '50%',
    transform: showKeyboard && windowWidth > 1024 ? 'translateX(-100%)' : 'translateX(-50%)', // Dynamic transform
    transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)', // Transition transform
    zIndex: 2,
  }), [showKeyboard, isMobile, windowWidth]);
  
  const virtualKeyboardContainerStyle = useMemo(() => ({
    position: 'absolute' as 'absolute',
    left: '50%', // Position start at center
    top: 0,
    width: '520px',
    height: '100%',
    opacity: showKeyboard ? 1 : 0,
    transform: showKeyboard ? 'translateX(0)' : 'translateX(-50%)',
    transition: 'transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s cubic-bezier(.4,0,.2,1)',
    pointerEvents: showKeyboard ? 'auto' : 'none' as 'auto' | 'none',
    zIndex: 1,
    boxSizing: 'border-box' as 'border-box',
  }), [showKeyboard]);
  
  // Standardized input style
  const inputStyle = useCallback((isFocused: boolean) => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: `2px solid ${isFocused ? "#e50914" : "#444"}`,
    background: "#333",
    color: "#fff",
    fontSize: "16px",
    lineHeight: "1.5",
    outline: "none",
    boxSizing: "border-box" as "border-box",
    transition: 'border-color 0.2s',
  }), []);

  return (
    <div style={loginMainRowStyle}>
      <div style={logoContainerStyle}>
        <img src={logoLight} alt="IsaacPlay" style={{ width: 260 }} />
      </div>

      <div style={loginFormContainerStyle}>
        <form onSubmit={handleSubmit} style={loginFormStyle}>
          <NavigationItem
            scope={SCOPES.LOGIN}
            id={NAV.EMAIL}
            navigation={navigationMap[NAV.EMAIL]}
            onAction={handleEmailAction}
          >
            {({ ref, isFocused }) => (
              <div style={{ marginBottom: 24, width: "100%" }}>
                <label style={{ fontWeight: 600, fontSize: 18, color: '#fff' }}>Email</label>
                <input
                  ref={ref as React.RefObject<HTMLInputElement>}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === email.length) {
                      e.preventDefault();
                      openKeyboard(NAV.EMAIL);
                    }
                  }}
                  style={inputStyle(isFocused)}
                  autoComplete="email"
                  onClick={() => openKeyboard(NAV.EMAIL)}
                />
              </div>
            )}
          </NavigationItem>
          <NavigationItem
            scope={SCOPES.LOGIN}
            id={NAV.PASSWORD}
            navigation={navigationMap[NAV.PASSWORD]}
            onAction={handlePasswordAction}
            disabled={loading}
          >
            {({ ref, isFocused }) => (
              <div style={{ marginBottom: 24, width: "100%" }}>
                <label style={{ fontWeight: 600, fontSize: 18, color: '#fff' }}>Senha</label>
                <input
                  ref={ref as React.RefObject<HTMLInputElement>}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === password.length) {
                      e.preventDefault();
                      openKeyboard(NAV.PASSWORD);
                    }
                  }}
                  style={inputStyle(isFocused)}
                  autoComplete="current-password"
                  onClick={() => openKeyboard(NAV.PASSWORD)}
                />
              </div>
            )}
          </NavigationItem>
          {error && <div style={{ color: "#f55", marginBottom: 16 }}>{error}</div>}
          <NavigationItem
            scope={SCOPES.LOGIN}
            id={NAV.BUTTON}
            navigation={navigationMap[NAV.BUTTON]}
            onAction={handleButtonAction}
            disabled={loading}
            style={{ 
              width: '82%', 
              marginTop: '24px',
              transition: 'width 0.3s ease-in-out', // Fluid transition for resizing
            }}
          >
            {({ ref, isFocused }) => (
              <button
                ref={ref as React.RefObject<HTMLButtonElement>}
                type="submit"
                disabled={loading}
                style={{
                  ...inputStyle(isFocused),
                  background: "#e50914",
                  border: `2px solid ${isFocused ? "#fff" : "#e50914"}`,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            )}
          </NavigationItem>
          <div style={{ marginTop: 24, fontSize: 15, color: "#aaa", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <NavigationItem
              scope={SCOPES.LOGIN}
              id={NAV.REMEMBER}
              navigation={navigationMap[NAV.REMEMBER]}
              onAction={handleRememberAction}
              disabled={loading}
            >
              {({ ref, isFocused, tabIndex }) => (
                <span
                  ref={ref as React.RefObject<HTMLSpanElement>}
                  className="nav-focus"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 6,
                    padding: 2
                  }}
                  data-focused={isFocused}
                  tabIndex={tabIndex}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(r => !r)}
                    style={{ marginRight: 6 }}
                    tabIndex={-1}
                  />
                  Lembrar Email
                </span>
              )}
            </NavigationItem>
            <NavigationItem
              scope={SCOPES.LOGIN}
              id={NAV.FORGOT}
              navigation={navigationMap[NAV.FORGOT]}
              onAction={handleForgotAction}
              disabled={loading}
            >
              {({ ref, isFocused, tabIndex }) => (
                <a
                  ref={ref as React.RefObject<HTMLAnchorElement>}
                  href="#"
                  className="nav-focus-text"
                  style={{ color: "#e50914" }}
                  data-focused={isFocused}
                  tabIndex={tabIndex}
                >
                  Esqueceu a senha?
                </a>
              )}
            </NavigationItem>
          </div>
        </form>

        <div style={virtualKeyboardContainerStyle}>
          {showKeyboard && windowWidth > 1024 && (
            <VirtualKeyboard
              scope={SCOPES.KEYBOARD}
              onInput={handleKeyboardInput}
              onBackspace={handleKeyboardBackspace}
              onConfirm={handleKeyboardConfirm}
              onClear={handleKeyboardClear}
              onEsc={closeKeyboard}
              style={{
                background: 'rgba(20, 20, 20, 0.7)',
                borderRadius: '16px',
                padding: '20px',
                boxSizing: 'border-box' as 'border-box',
                height: '100%',
                width: '100%',
              }}
            />
          )}
        </div>
      </div>
      
      <NavigationItem
        scope={SCOPES.LOGIN}
        id={NAV.HELP}
        navigation={navigationMap[NAV.HELP]}
        onAction={handleHelpAction}
        disabled={loading}
      >
        {({ ref, isFocused, tabIndex }) => (
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="nav-focus-text"
            style={{
              position: "absolute",
              bottom: 24,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#888",
              fontSize: 13,
              cursor: "pointer"
            }}
            data-focused={isFocused}
            tabIndex={tabIndex}
          >
            Precisa de ajuda para entrar? Visite <span style={{ color: "#e50914", fontWeight: "bold" }}>helpisaacplay.com</span>
          </div>
        )}
      </NavigationItem>
    </div>
  );
} 