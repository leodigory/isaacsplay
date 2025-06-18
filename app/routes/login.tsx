import React, { useState, useRef, useEffect } from "react";
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

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Foco real no input ao abrir o teclado virtual
  useEffect(() => {
    if (showKeyboard === "EMAIL") {
      emailRef.current?.focus();
    } else if (showKeyboard === "PASSWORD") {
      passwordRef.current?.focus();
    }
  }, [showKeyboard]);

  // Mantém o foco real no input mesmo com o teclado virtual aberto
  useEffect(() => {
    if (showKeyboard === "EMAIL") {
      emailRef.current?.focus();
    } else if (showKeyboard === "PASSWORD") {
      passwordRef.current?.focus();
    }
  }, [focusField, showKeyboard]);

  // Foco no input ao digitar com teclado físico mesmo com teclado virtual aberto
  useEffect(() => {
    if (!showKeyboard) return;
    const handlePhysicalType = (e: KeyboardEvent) => {
      // Ignora teclas de navegação/tab/shift/esc
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (showKeyboard === "EMAIL") {
          emailRef.current?.focus();
        } else if (showKeyboard === "PASSWORD") {
          passwordRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handlePhysicalType);
    return () => window.removeEventListener("keydown", handlePhysicalType);
  }, [showKeyboard]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Simular login bem-sucedido para testar navegação
      console.log("usuario autenticado", { email, uid: "test-user-123" });
      
      // Aguardar um pouco para simular o processo de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.location.href = "/home";
    } catch (err: any) {
      setError("Email ou senha inválidos");
      setEmail("");
      setPassword("");
      setShowKeyboard(null);
      setFocusField("EMAIL");
      setTimeout(() => {
        emailRef.current?.focus();
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para o teclado virtual
  const handleKeyboardInput = (val: string) => {
    if (showKeyboard === "EMAIL") setEmail(email + val);
    else if (showKeyboard === "PASSWORD") setPassword(password + val);
  };
  const handleKeyboardBackspace = () => {
    if (showKeyboard === "EMAIL") setEmail(email.slice(0, -1));
    else if (showKeyboard === "PASSWORD") setPassword(password.slice(0, -1));
  };
  const handleKeyboardConfirm = () => {
    if (showKeyboard === "EMAIL") {
      setShowKeyboard("PASSWORD");
      setFocusField("PASSWORD");
    } else if (showKeyboard === "PASSWORD") {
      setShowKeyboard(null);
      setFocusField("BUTTON");
    }
  };
  const handleKeyboardEsc = () => {
    if (showKeyboard === "PASSWORD") {
      setShowKeyboard("EMAIL");
      setFocusField("EMAIL");
    } else {
      setShowKeyboard(null);
      setFocusField("EMAIL");
    }
  };

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
    const handleInputNav = (e: KeyboardEvent) => {
      if (!showKeyboard) return;
      if (focusField === "EMAIL" && document.activeElement === emailRef.current) {
        const val = emailRef.current?.value || "";
        const pos = emailRef.current?.selectionStart || 0;
        if ((e.key === "ArrowRight" && pos === val.length) || (e.key === "Escape")) {
          setShowKeyboard("EMAIL");
          setTimeout(() => {
            (emailRef.current as HTMLInputElement | null)?.blur();
            // Foco na tecla atualmente selecionada do teclado virtual
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

  // Layout Netflix-like lado a lado, com imagem de fundo e logo centralizada
  return (
    <div suppressHydrationWarning style={{ minHeight: "100dvh", minWidth: "100vw", height: "100dvh", width: "100vw", background: `#111 url('/back.png') center center / cover no-repeat`, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", position: "relative", overflow: 'hidden' }}>
      <div style={{ flex: 1 }} />
      <div className="login-title" style={{ width: "100%", textAlign: "center", marginTop: 10, marginBottom: 18 }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 90, color: "#fff", fontWeight: 700, letterSpacing: '0.15em', textShadow: "0 6px 32px #000", lineHeight: 1, display: 'inline-block', padding: '0 48px', borderRadius: 32, textTransform: 'uppercase' }}>IsaacPlay</span>
      </div>
      <div className="login-main-row" style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "flex-start", minHeight: "auto", marginTop: 0, width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
        <form className="login-form" onSubmit={handleSubmit} style={{ background: "#222", padding: 40, borderRadius: 16, minWidth: 320, maxWidth: 420, width: '100%', boxShadow: "0 0 32px #000a", display: "flex", flexDirection: "column", alignItems: "center", marginRight: 48, boxSizing: 'border-box', marginTop: 0 }}>
          <div style={{ marginBottom: 24, width: "100%" }}>
            <label style={{ fontWeight: 600, fontSize: 18 }}>Email</label>
            <input
              ref={emailRef}
              type="text"
              value={email}
              style={{ width: "100%", padding: 16, borderRadius: 8, border: focusField === "EMAIL" ? "1px solid #e50914" : "none", marginTop: 6, outline: focusField === "EMAIL" ? "1px solid #e50914" : "none", fontSize: 20, background: "#111", color: "#fff" }}
              onChange={e => setEmail(e.target.value)}
              onClick={() => { setFocusField("EMAIL"); setShowKeyboard("EMAIL"); }}
              tabIndex={focusField === "EMAIL" ? 0 : -1}
              autoFocus={focusField === "EMAIL"}
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
              onClick={() => { setFocusField("PASSWORD"); setShowKeyboard("PASSWORD"); }}
              tabIndex={focusField === "PASSWORD" ? 0 : -1}
              autoFocus={focusField === "PASSWORD"}
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
        <div className="virtual-keyboard-bg" style={{ minWidth: 320, maxWidth: 520, width: '100%', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", height: '100%', boxSizing: 'border-box' }}>
          {showKeyboard && (
            <div style={{ marginTop: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%' }}>
              <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 24, padding: 32, boxShadow: '0 4px 32px #0008', display: 'inline-block' }}>
                <VirtualKeyboard
                  onInput={handleKeyboardInput}
                  onBackspace={handleKeyboardBackspace}
                  onConfirm={handleKeyboardConfirm}
                  onEsc={handleKeyboardEsc}
                  disabled={loading}
                  autoFocus={true}
                />
              </div>
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