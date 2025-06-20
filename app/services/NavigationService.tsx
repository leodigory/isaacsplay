import React, { createContext, useContext, useEffect, useCallback, useState, useRef, useMemo } from 'react';

// Types
export type NavigationDirection = 'up' | 'down' | 'left' | 'right';
export type NavigationAction = 'confirm' | 'back' | 'menu';

export interface NavigationNode {
  id: string;
  ref: React.RefObject<HTMLElement | null>;
  navigation: Partial<Record<NavigationDirection, string>>;
  onAction?: (action: NavigationAction) => void;
  disabled?: boolean;
}

interface NavigationContextType {
  registerNode: (scope: string, node: NavigationNode) => void;
  unregisterNode: (scope: string, id: string) => void;
  setFocus: (id: string) => void;
  currentFocus: string | null;
  isMobile: boolean;
  activeScope: string | null;
  setActiveScope: (scopeId: string | null) => void;
}

// Context
const NavigationContext = createContext<NavigationContextType | null>(null);

// Provider Component
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Record<string, Record<string, NavigationNode>>>({});
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [activeScope, setActiveScope] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Use refs to hold the latest state and nodes for the event listener
  const stateRef = useRef({ nodes, currentFocus, activeScope });
  stateRef.current = { nodes, currentFocus, activeScope };

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set focus on element when currentFocus changes
  useEffect(() => {
    if (activeScope && currentFocus) {
      const node = nodes[activeScope]?.[currentFocus];
      if (node && !node.disabled) {
        node.ref.current?.focus();
      }
    }
  }, [currentFocus, activeScope, nodes]);

  // Handle keyboard navigation using a stable useEffect
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Always get the latest state from the ref
      const { nodes, currentFocus, activeScope } = stateRef.current;

      if (!activeScope || !currentFocus) return;
      
      const currentScopeNodes = nodes[activeScope];
      if (!currentScopeNodes) return;

      const currentNode = currentScopeNodes[currentFocus];
      if (!currentNode || currentNode.disabled) return;

      let nextNodeId: string | undefined;
      let action: NavigationAction | undefined;

      switch (e.key) {
        case 'ArrowUp':
          nextNodeId = currentNode.navigation.up;
          break;
        case 'ArrowDown':
          nextNodeId = currentNode.navigation.down;
          break;
        case 'ArrowLeft':
          nextNodeId = currentNode.navigation.left;
          break;
        case 'ArrowRight':
          nextNodeId = currentNode.navigation.right;
          break;
        case 'Enter':
          action = 'confirm';
          break;
        case 'Escape':
          action = 'back';
          break;
        case 'Tab': // Example for a potential menu button
          action = 'menu';
          break;
        default:
          return; // Exit if the key is not a navigation key
      }
      
      // Prevent default browser action for navigation keys
      e.preventDefault();

      if (action && currentNode.onAction) {
        currentNode.onAction(action);
      } else if (nextNodeId) {
        const nextNode = currentScopeNodes[nextNodeId];
        if (nextNode && !nextNode.disabled) {
          // Update state to trigger re-render and focus change
          setCurrentFocus(nextNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]); // Only re-run if isMobile changes

  const registerNode = useCallback((scope: string, node: NavigationNode) => {
    setNodes(prev => ({
      ...prev,
      [scope]: { ...(prev[scope] || {}), [node.id]: node },
    }));
  }, []);

  const unregisterNode = useCallback((scope: string, id: string) => {
    setNodes(prev => {
      const newScopeNodes = { ...(prev[scope] || {}) };
      delete newScopeNodes[id];
      return { ...prev, [scope]: newScopeNodes };
    });
  }, []);
  
  const setFocus = useCallback((id: string) => {
    // A simple state setter. The useEffect handles the actual DOM focus.
    setCurrentFocus(id);
  }, []);

  const memoizedSetActiveScope = useCallback((scopeId: string | null) => {
    console.log(`%cNAVIGATION SCOPE CHANGED: ${scopeId}`, 'color: #7f00ff; font-weight: bold;');
    setActiveScope(prevScope => {
      if (prevScope !== scopeId) {
        setCurrentFocus(null);
      }
      return scopeId;
    });
  }, []);

  const value = {
    registerNode,
    unregisterNode,
    setFocus,
    currentFocus,
    isMobile,
    activeScope,
    setActiveScope: memoizedSetActiveScope,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook to use navigation
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Custom hook to make an element navigable
export function useNavigable(
  scope: string,
  id: string,
  navigation: Partial<Record<NavigationDirection, string>>,
  onAction?: (action: NavigationAction) => void,
  disabled?: boolean
) {
  const { registerNode, unregisterNode, currentFocus, activeScope } = useNavigation();
  const ref = useRef<HTMLElement | null>(null);

  // Estabiliza a callback 'onAction' para evitar re-execuções desnecessárias do useEffect.
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const stableOnAction = useCallback((action: NavigationAction) => {
    onActionRef.current?.(action);
  }, []);

  // O useEffect agora depende da versão estável da callback.
  const stableNode = useMemo(() => ({
    id,
    ref,
    navigation: navigation || {},
    onAction: stableOnAction,
    disabled
  }), [id, ref, navigation, stableOnAction, disabled]);

  useEffect(() => {
    registerNode(scope, stableNode);
    return () => unregisterNode(scope, id);
  }, [scope, id, registerNode, unregisterNode, stableNode]);

  return {
    ref,
    isFocused: currentFocus === id && activeScope === scope,
    // Deixando o tabIndex sempre -1 para forçar o uso da navegação programática
    tabIndex: -1
  };
} 