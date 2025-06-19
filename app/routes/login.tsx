import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import VirtualKeyboard from "../components/VirtualKeyboard";

const FOCUS = {
  EMAIL: 0,
  PASSWORD: 1,
  BUTTON: 2,
  REMEMBER: 3,
  FORGOT: 4,
  HELP: 5
} as const;
type FocusType = keyof typeof FOCUS;
const focusOrder: FocusType[] = ["EMAIL", "PASSWORD", "BUTTON", "REMEMBER", "FORGOT", "HELP"];

// Mapeamento de navegação livre
const focusMatrix: Record<FocusType, Partial<Record<"up" | "down" | "left" | "right", FocusType>>> = {
  EMAIL:    { down: "PASSWORD", up: "HELP", left: "EMAIL", right: "EMAIL" },
  PASSWORD: { up: "EMAIL", down: "BUTTON", left: "PASSWORD", right: "PASSWORD" },
  BUTTON:   { up: "PASSWORD", down: "REMEMBER", left: "BUTTON", right: "BUTTON" },
  REMEMBER: { up: "BUTTON", down: "HELP", left: "REMEMBER", right: "FORGOT" },
  FORGOT:   { up: "BUTTON", down: "HELP", left: "REMEMBER", right: "FORGOT" },
  HELP:     { up: "REMEMBER", down: "EMAIL", left: "HELP", right: "HELP" }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<FocusType>("EMAIL");
  const [showKeyboard, setShowKeyboard] = useState<FocusType | null>(null);
  const [remember, setRemember] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Detecta se está em modo mobile (tela pequena)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Foco real no input ao abrir o teclado virtual ou mudar o campo de foco
  useEffect(() => {
    if (showKeyboard === "EMAIL" || focusField === "EMAIL") {
      emailRef.current?.focus();
    } else if (showKeyboard === "PASSWORD" || focusField === "PASSWORD") {
      passwordRef.current?.focus();
    }
  }, [showKeyboard, focusField]);

  // Foco no input ao digitar com teclado físico mesmo com teclado virtual aberto
  useEffect(() => {
    if (!showKeyboard) return;
    const handlePhysicalType = (e: KeyboardEvent) => {
      if (typeof e.key === "string" && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (showKeyboard === "EMAIL") {
          emailRef.current?.focus();
        } else if (showKeyboard === "PASSWORD") {
          passwordRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handlePhysicalType, { passive: true });
    return () => window.removeEventListener("keydown", handlePhysicalType);
  }, [showKeyboard]);

  // Força atualização dos valores dos inputs após autocomplete (apenas no mount)
  useEffect(() => {
    setTimeout(() => {
      if (emailRef.current) setEmail(emailRef.current.value);
      if (passwordRef.current) setPassword(passwordRef.current.value);
    }, 100);
  }, []);

  // Navegação livre entre todos os elementos
  useEffect(() => {
    if (loading || showKeyboard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      let next: FocusType | undefined;
      if (e.key === "ArrowDown") next = focusMatrix[focusField].down;
      else if (e.key === "ArrowUp") next = focusMatrix[focusField].up;
      else if (e.key === "ArrowLeft") next = focusMatrix[focusField].left;
      else if (e.key === "ArrowRight") next = focusMatrix[focusField].right;
      else if (e.key === "Tab") next = focusOrder[(focusOrder.indexOf(focusField) + 1) % focusOrder.length];
      if (next) {
        setFocusField(next);
        e.preventDefault();
        return;
      }
      if (e.key === "Enter") {
        if (focusField === "EMAIL" || focusField === "PASSWORD") {
          setShowKeyboard(focusField);
        } else if (focusField === "BUTTON") {
          handleSubmit();
        } else if (focusField === "REMEMBER") {
          setRemember(r => !r);
        } else if (focusField === "FORGOT") {
          window.alert("Recuperação de senha não implementada.");
        } else if (focusField === "HELP") {
          window.open("https://helpisaacplay.com", "_blank");
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusField, loading, showKeyboard]);

  // Se o input estiver com foco e o usuário apertar para o lado no final do texto, ou ESC, o foco sai do input e vai para o teclado virtual (mas não fecha o teclado)
  useEffect(() => {
    if (!showKeyboard) return;
    const handleInputNav = (e: KeyboardEvent) => {
      if (focusField === "EMAIL" && document.activeElement === emailRef.current) {
        const val = emailRef.current?.value || "";
        const pos = emailRef.current?.selectionStart || 0;
        if ((e.key === "ArrowRight" && pos === val.length) || (e.key === "Escape")) {
          setShowKeyboard("EMAIL");
          setTimeout(() => {
            (emailRef.current as HTMLInputElement | null)?.blur();
            const vk = document.querySelector('.virtual-keyboard');
            if (vk) {
              const focused = vk.querySelector('button[tabindex="0"]');
              if (focused) (focused as HTMLButtonElement).focus();
            }
          }, 0);
        }
      } else if (focusField === "PASSWORD" && document.activeElement === passwordRef.current) {
        const val = passwordRef.current?.value || "";
        const pos = passwordRef.current?.selectionStart || 0;
        if ((e.key === "ArrowRight" && pos === val.length) || (e.key === "Escape")) {
          setShowKeyboard("PASSWORD");
          setTimeout(() => {
            (passwordRef.current as HTMLInputElement | null)?.blur();
            const vk = document.querySelector('.virtual-keyboard');
            if (vk) {
              const focused = vk.querySelector('button[tabindex="0"]');
              if (focused) (focused as HTMLButtonElement).focus();
            }
          }, 0);
        }
      }
    };
    window.addEventListener("keydown", handleInputNav);
    return () => window.removeEventListener("keydown", handleInputNav);
  }, [focusField, showKeyboard]);

  // Handlers do teclado virtual otimizados com useCallback
  const handleKeyboardInput = useCallback((val: string) => {
    if (typeof val !== "string") return;
    if (showKeyboard === "EMAIL") setEmail(email + val);
    else if (showKeyboard === "PASSWORD") setPassword(password + val);
  }, [email, password, showKeyboard]);

  const handleKeyboardBackspace = useCallback(() => {
    if (showKeyboard === "EMAIL") setEmail(email.slice(0, -1));
    else if (showKeyboard === "PASSWORD") setPassword(password.slice(0, -1));
  }, [email, password, showKeyboard]);

  const handleKeyboardConfirm = useCallback(() => {
    if (showKeyboard === "EMAIL") {
      setShowKeyboard("PASSWORD");
      setFocusField("PASSWORD");
    } else if (showKeyboard === "PASSWORD") {
      setShowKeyboard(null);
      setFocusField("BUTTON");
    }
  }, [showKeyboard]);

  const handleKeyboardEsc = useCallback(() => {
    setShowKeyboard(null);
    setFocusField("EMAIL");
    setTimeout(() => {
      emailRef.current?.focus();
    }, 0);
  }, []);

  // Estilos otimizados com useMemo
  const loginMainRowStyle = useMemo(() => ({
    display: "flex",
    flexDirection: isMobile ? 'column' : 'row' as 'row' | 'column',
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    maxWidth: '100vw',
    overflow: 'visible',
    gap: 0,
    position: ("relative" as "relative"),
    minHeight: 480,
    height: 480,
  }), [isMobile]);

  const loginFormContainerStyle = useMemo(() => ({
    position: isMobile ? ('static' as 'static') : ('relative' as 'relative'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? '100%' : (showKeyboard ? 480 : 450),
    height: 400,
    transition: isMobile ? 'none' : 'width 0.5s cubic-bezier(.4,0,.2,1)',
    flexDirection: isMobile ? 'column' : 'row' as 'row' | 'column',
  }), [isMobile, showKeyboard]);

  const loginFormStyle = useMemo(() => ({
    background: "#222",
    padding: 40,
    borderRadius: 16,
    minWidth: 320,
    maxWidth: 420,
    width: isMobile ? '100%' : 420,
    minHeight: 400,
    height: 400,
    boxShadow: "0 0 32px #000a",
    display: "flex",
    flexDirection: "column" as 'column',
    alignItems: "center",
    justifyContent: "center",
    boxSizing: 'border-box' as 'border-box',
    zIndex: 2,
    position: isMobile ? ('static' as 'static') : ('absolute' as 'absolute'),
    left: isMobile ? undefined : 0,
    top: isMobile ? undefined : 0,
    right: 'auto',
    bottom: 'auto',
    transform: isMobile ? 'none' : (showKeyboard ? 'translateX(-230px)' : 'translateX(0)'),
    transition: isMobile ? 'none' : 'transform 0.5s cubic-bezier(.4,0,.2,1)',
  }), [isMobile, showKeyboard, focusField]);

  const keyboardStyle = useMemo(() => ({
    position: 'absolute' as 'absolute',
    left: showKeyboard ? 190 : 210,
    top: 0,
    minWidth: 400,
    maxWidth: 520,
    width: 600,
    minHeight: 400,
    height: 400,
    display: "flex",
    flexDirection: "column" as 'column',
    alignItems: "center",
    justifyContent: "center",
    boxSizing: 'border-box' as 'border-box',
    transition: "left 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s cubic-bezier(.4,0,.2,1)",
    opacity: showKeyboard ? 1 : 0,
    zIndex: 1,
    pointerEvents: (showKeyboard ? 'auto' : 'none') as 'auto' | 'none',
    boxShadow: '0 4px 32px #0008',
    background: 'rgba(0,0,0,0.55)',
    borderRadius: 24,
    padding: 32,
  }), [showKeyboard]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validações básicas
    if (!email.trim()) {
      setError("Por favor, insira seu email");
      setFocusField("EMAIL");
      return;
    }
    
    if (!password.trim()) {
      setError("Por favor, insira sua senha");
      setFocusField("PASSWORD");
      return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido");
      setFocusField("EMAIL");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Verificar se o Firebase está configurado
      if (!auth) {
        throw new Error("Firebase não está configurado corretamente");
      }
      
      // Autenticação real com Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Usuário autenticado com sucesso:", { email: user.email, uid: user.uid });
      
      // Redirecionar para home após login bem-sucedido
      window.location.href = "/home";
      
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      
      // Tratamento específico de erros do Firebase
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
      setPassword(""); // Limpa apenas a senha
      setShowKeyboard(null);
      setFocusField("PASSWORD");
      
      // Foca no campo de senha para nova tentativa
      setTimeout(() => {
        passwordRef.current?.focus();
      }, 0);
      
    } finally {
      setLoading(false);
    }
  };

  // Layout Netflix-like lado a lado, com imagem de fundo e logo centralizada
  return (
    <div style={{
      minHeight: "100dvh",
      minWidth: "100vw",
      height: "100dvh",
      width: "100vw",
      background: `#111 url('/back.png') center center / cover no-repeat`,
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      position: "relative",
      overflow: 'hidden'
    }}>
      <div style={{ flex: 1 }} />
      <div className="login-title" style={{
        width: "100%",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 18,
        overflow: "visible"
      }}>
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: "clamp(60px, 8vw, 80px)",
            color: "#fff",
            fontWeight: 700,
            letterSpacing: '0.15em',
            textShadow: "0 6px 32px #000",
            lineHeight: 1,
            display: 'inline-block',
            padding: '0 clamp(8px, 6vw, 48px)',
            borderRadius: 32,
            textTransform: 'uppercase',
            maxWidth: "100%",
            boxSizing: "border-box",
            whiteSpace: "nowrap",
            overflow: "visible",
          }}
        >
          IsaacPlay
        </span>
      </div>
      <div className="login-main-row" style={loginMainRowStyle}>
        <div style={loginFormContainerStyle}>
          <form className="login-form" onSubmit={handleSubmit} style={loginFormStyle}>
            <div style={{ marginBottom: 24, width: "100%" }}>
              <label style={{ fontWeight: 600, fontSize: 18 }}>Email</label>
              <input
                ref={emailRef}
                type="text"
                value={email}
                style={{ width: "100%", padding: 16, borderRadius: 8, border: focusField === "EMAIL" ? "1px solid #e50914" : "none", marginTop: 6, outline: focusField === "EMAIL" ? "1px solid #e50914" : "none", fontSize: 20, background: "#111", color: "#fff" }}
                onChange={e => setEmail(e.target.value)}
                onClick={() => { setFocusField("EMAIL"); if (!isMobile) setShowKeyboard("EMAIL"); }}
                tabIndex={focusField === "EMAIL" ? 0 : -1}
                autoComplete="email"
              />
            </div>
            <div style={{ marginBottom: 24, width: "100%" }}>
              <label style={{ fontWeight: 600, fontSize: 18 }}>Senha</label>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                style={{ width: "100%", padding: 16, borderRadius: 8, border: focusField === "PASSWORD" ? "1px solid #e50914" : "none", marginTop: 6, outline: focusField === "PASSWORD" ? "1px solid #e50914" : "none", fontSize: 20, background: "#111", color: "#fff" }}
                onChange={e => setPassword(e.target.value)}
                onClick={() => { setFocusField("PASSWORD"); if (!isMobile) setShowKeyboard("PASSWORD"); }}
                tabIndex={focusField === "PASSWORD" ? 0 : -1}
                autoComplete="current-password"
              />
            </div>
            {error && <div style={{ color: "#f55", marginBottom: 16 }}>{error}</div>}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 8,
                background: focusField === "BUTTON" ? "#b00610" : "#e50914",
                color: "#fff",
                border: focusField === "BUTTON" ? "1px solid #fff" : "none",
                fontWeight: "bold",
                fontSize: 22,
                outline: focusField === "BUTTON" ? "1px solid #fff" : "none",
                marginTop: 12
              }}
              onClick={() => setFocusField("BUTTON")}
              tabIndex={focusField === "BUTTON" ? 0 : -1}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <div style={{ marginTop: 24, fontSize: 15, color: "#aaa", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  display: "flex", alignItems: "center", border: focusField === "REMEMBER" ? "1px solid #e50914" : "none", borderRadius: 6, padding: focusField === "REMEMBER" ? 2 : 0, background: focusField === "REMEMBER" ? "#181818" : "none"
                }}
                tabIndex={focusField === "REMEMBER" ? 0 : -1}
                onClick={() => setFocusField("REMEMBER")}
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
              <a
                href="#"
                style={{ color: focusField === "FORGOT" ? "#fff" : "#e50914", textDecoration: focusField === "FORGOT" ? "underline" : "none", fontWeight: focusField === "FORGOT" ? "bold" : "normal" }}
                tabIndex={focusField === "FORGOT" ? 0 : -1}
                onClick={() => setFocusField("FORGOT")}
              >
                Esqueceu a senha?
              </a>
            </div>
          </form>
          {showKeyboard && (
            <div className={`virtual-keyboard-bg show`} style={keyboardStyle}>
              <VirtualKeyboard
                onInput={handleKeyboardInput}
                onBackspace={handleKeyboardBackspace}
                onConfirm={handleKeyboardConfirm}
                onClear={() => {
                  if (showKeyboard === "EMAIL") setEmail("");
                  if (showKeyboard === "PASSWORD") setPassword("");
                }}
                onEsc={handleKeyboardEsc}
                disabled={loading}
                autoFocus={true}
              />
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 2 }} />
      <div
        style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", color: focusField === "HELP" ? "#fff" : "#888", fontSize: 13, fontWeight: focusField === "HELP" ? "bold" : "normal", textDecoration: focusField === "HELP" ? "underline" : "none", cursor: "pointer" }}
        tabIndex={focusField === "HELP" ? 0 : -1}
        onClick={() => setFocusField("HELP")}
      >
        Precisa de ajuda para entrar? Visite <span style={{ color: focusField === "HELP" ? "#e50914" : "#e50914", fontWeight: "bold" }}>helpisaacplay.com</span>
      </div>
    </div>
  );
} 