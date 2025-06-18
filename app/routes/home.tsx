import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IsaacPlay - Home" },
    { name: "description", content: "Bem-vindo ao IsaacPlay!" },
  ];
}

export default function Home() {
  return (
    <div style={{ 
      minHeight: "100dvh", 
      minWidth: "100vw", 
      background: `#111 url('/back.png') center center / cover no-repeat`, 
      color: "#fff", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <h1 style={{ 
          fontFamily: 'Montserrat, sans-serif', 
          fontSize: 48, 
          fontWeight: 700, 
          marginBottom: 20,
          textShadow: "0 4px 16px #000"
        }}>
          Bem-vindo ao IsaacPlay!
        </h1>
        
        <p style={{ 
          fontSize: 18, 
          marginBottom: 40, 
          lineHeight: 1.6,
          opacity: 0.9
        }}>
          Você foi autenticado com sucesso! Esta é a página inicial do seu app de streaming.
        </p>
        
        <button 
          onClick={() => window.location.href = "/"}
          style={{
            padding: "12px 24px",
            borderRadius: 8,
            border: "1px solid #e50914",
            background: "#e50914",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f40612"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#e50914"}
        >
          Voltar ao Login
        </button>
      </div>
    </div>
  );
}
