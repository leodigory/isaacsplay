import React, { useState, useCallback } from "react";
import NavigationItem from "./NavigationItem";
import { useNavigation } from "../services/NavigationService";
import type { NavigationAction } from "../services/NavigationService";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action?: () => void;
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'movies', label: 'Filmes', icon: '🎬' },
  { id: 'series', label: 'Séries', icon: '📺' },
  { id: 'documentaries', label: 'Documentários', icon: '📹' },
  { id: 'kids', label: 'Infantil', icon: '🧸' },
  { id: 'my-list', label: 'Minha Lista', icon: '❤️' },
  { id: 'downloads', label: 'Downloads', icon: '⬇️' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
  { id: 'help', label: 'Ajuda', icon: '❓' }
];

// Criar mapa de navegação para o menu
const createMenuNavigation = (items: MenuItem[]) => {
  const navigationMap: Record<string, any> = {};
  
  items.forEach((item, index) => {
    navigationMap[item.id] = {
      up: index > 0 ? items[index - 1].id : undefined,
      down: index < items.length - 1 ? items[index + 1].id : undefined,
      right: 'close-menu' // Volta para o conteúdo principal
    };
  });
  
  return navigationMap;
};

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { isMobile } = useNavigation();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  const navigationMap = createMenuNavigation(menuItems);
  
  const handleItemAction = useCallback((itemId: string, action: NavigationAction) => {
    if (action === 'confirm') {
      setSelectedItem(itemId);
      const item = menuItems.find(i => i.id === itemId);
      if (item?.action) {
        item.action();
      }
      // Aqui você pode navegar para a página correspondente
      console.log(`Navegando para: ${itemId}`);
    }
  }, []);
  
  const handleCloseAction = useCallback((action: NavigationAction) => {
    if (action === 'confirm') {
      onClose();
    }
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "300px",
      height: "100vh",
      background: "rgba(0,0,0,0.95)",
      backdropFilter: "blur(10px)",
      borderRight: "1px solid #333",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header do Menu */}
      <div style={{
        padding: "20px",
        borderBottom: "1px solid #333",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: 700,
          color: "#e50914"
        }}>
          IsaacPlay
        </h2>
        
        <NavigationItem
          scope="sidemenu"
          id="close-menu"
          navigation={{ left: 'home' }}
          onAction={handleCloseAction}
        >
          {({ ref, isFocused }) => (
            <button
              ref={ref as React.RefObject<HTMLButtonElement>}
              className="nav-focus nav-focus-button"
              style={{
                padding: "8px",
                borderRadius: "50%",
                border: "1px solid #444",
                background: "#222",
                color: "#fff",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              data-focused={isFocused}
            >
              ✕
            </button>
          )}
        </NavigationItem>
      </div>
      
      {/* Lista de Itens do Menu */}
      <nav style={{
        flex: 1,
        padding: "20px 0",
        overflowY: "auto"
      }}>
        {menuItems.map((item) => (
          <NavigationItem
            key={item.id}
            scope="sidemenu"
            id={item.id}
            navigation={navigationMap[item.id]}
            onAction={(action) => handleItemAction(item.id, action)}
          >
            {({ ref, isFocused }) => (
              <div
                ref={ref as React.RefObject<HTMLDivElement>}
                className="nav-focus"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 20px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  background: isFocused ? "rgba(229, 9, 20, 0.1)" : "transparent",
                  borderLeft: isFocused ? "3px solid #e50914" : "3px solid transparent"
                }}
                data-focused={isFocused}
              >
                <span style={{
                  fontSize: "20px",
                  marginRight: "12px",
                  width: "24px",
                  textAlign: "center"
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: "16px",
                  fontWeight: isFocused ? 600 : 400,
                  color: isFocused ? "#fff" : "#ccc"
                }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavigationItem>
        ))}
      </nav>
      
      {/* Footer do Menu */}
      <div style={{
        padding: "20px",
        borderTop: "1px solid #333",
        textAlign: "center"
      }}>
        <p style={{
          margin: 0,
          fontSize: "12px",
          color: "#666"
        }}>
          IsaacPlay v1.0
        </p>
      </div>
      
      {/* Indicador de item selecionado */}
      {selectedItem && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.9)",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e50914",
          zIndex: 1001
        }}>
          <p>Menu selecionado: {selectedItem}</p>
          <button
            onClick={() => setSelectedItem(null)}
            style={{
              padding: "8px 16px",
              background: "#e50914",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
} 