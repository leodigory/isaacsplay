# 🎮 Guia do Sistema de Navegação IsaacPlay

Este guia explica como usar o sistema de navegação unificado do IsaacPlay, que funciona com teclado, controle remoto de TV e touch mobile.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Componentes Principais](#componentes-principais)
3. [Como Usar](#como-usar)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Padrões de Navegação](#padrões-de-navegação)
6. [Estilos CSS](#estilos-css)
7. [Boas Práticas](#boas-práticas)

## 🎯 Visão Geral

O sistema de navegação IsaacPlay oferece:

- **Navegação por Teclado**: Setas direcionais, Enter, Escape, Tab
- **Controle Remoto de TV**: D-pad, botões OK/Back/Menu
- **Touch Mobile**: Toque direto nos elementos
- **Acessibilidade**: Suporte completo a leitores de tela
- **Responsividade**: Adaptação automática entre dispositivos

## 🧩 Componentes Principais

### 1. NavigationService
Serviço global que gerencia toda a navegação da aplicação.

```typescript
import { NavigationProvider, useNavigation } from '../services/NavigationService';
```

### 2. NavigationItem
Componente reutilizável que torna qualquer elemento navegável.

```typescript
import NavigationItem from '../components/NavigationItem';
```

### 3. Hooks Personalizados
- `useNavigation()`: Acesso ao contexto de navegação
- `useNavigable()`: Cria elementos navegáveis

## 🚀 Como Usar

### Passo 1: Configurar o Provider

Envolva sua aplicação com o `NavigationProvider`:

```typescript
// app/root.tsx
import { NavigationProvider } from "./services/NavigationService";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavigationProvider>
          {children}
        </NavigationProvider>
      </body>
    </html>
  );
}
```

### Passo 2: Criar Mapa de Navegação

Defina como os elementos se conectam:

```typescript
const navigationMap = {
  'item1': { down: 'item2', right: 'item3' },
  'item2': { up: 'item1', right: 'item4' },
  'item3': { left: 'item1', down: 'item4' },
  'item4': { up: 'item3', left: 'item2' }
};
```

### Passo 3: Usar NavigationItem

Envolva seus elementos interativos:

```typescript
<NavigationItem
  id="item1"
  navigation={navigationMap.item1}
  onAction={(action) => {
    if (action === 'confirm') {
      // Executar ação
    }
  }}
>
  {({ ref, isFocused, tabIndex }) => (
    <button
      ref={ref}
      className="nav-focus"
      data-focused={isFocused}
    >
      Clique aqui
    </button>
  )}
</NavigationItem>
```

## 📝 Exemplos Práticos

### Exemplo 1: Grade de Conteúdo (Netflix-style)

```typescript
// Criar navegação para grade
const createGridNavigation = (rows: string[][]) => {
  const navigationMap: Record<string, any> = {};
  
  rows.forEach((row, rowIndex) => {
    row.forEach((itemId, colIndex) => {
      navigationMap[itemId] = {
        up: rowIndex > 0 ? rows[rowIndex - 1][colIndex] : undefined,
        down: rowIndex < rows.length - 1 ? rows[rowIndex + 1][colIndex] : undefined,
        left: colIndex > 0 ? row[colIndex - 1] : undefined,
        right: colIndex < row.length - 1 ? row[colIndex + 1] : undefined
      };
    });
  });
  
  return navigationMap;
};

// Usar na interface
const gridData = [
  ['item1', 'item2', 'item3'],
  ['item4', 'item5', 'item6'],
  ['item7', 'item8', 'item9']
];

const navigationMap = createGridNavigation(gridData);
```

### Exemplo 2: Menu Lateral

```typescript
const menuItems = [
  { id: 'home', label: 'Início' },
  { id: 'movies', label: 'Filmes' },
  { id: 'series', label: 'Séries' }
];

const createMenuNavigation = (items: typeof menuItems) => {
  const navigationMap: Record<string, any> = {};
  
  items.forEach((item, index) => {
    navigationMap[item.id] = {
      up: index > 0 ? items[index - 1].id : undefined,
      down: index < items.length - 1 ? items[index + 1].id : undefined,
      right: 'close-menu' // Volta para conteúdo principal
    };
  });
  
  return navigationMap;
};
```

### Exemplo 3: Formulário

```typescript
const formNavigation = {
  'email': { down: 'password' },
  'password': { up: 'email', down: 'submit' },
  'submit': { up: 'password' }
};

// No formulário
<NavigationItem id="email" navigation={formNavigation.email}>
  {({ ref, isFocused }) => (
    <input
      ref={ref}
      className="nav-focus"
      data-focused={isFocused}
      type="email"
    />
  )}
</NavigationItem>
```

## 🎮 Padrões de Navegação

### 1. Navegação Linear
```
A → B → C → D
```

### 2. Navegação em Grade
```
A B C
D E F
G H I
```

### 3. Navegação Hierárquica
```
Menu Principal
├── Submenu 1
│   ├── Item 1.1
│   └── Item 1.2
└── Submenu 2
    ├── Item 2.1
    └── Item 2.2
```

### 4. Navegação Modal
```
Conteúdo Principal → Modal → Volta ao Conteúdo
```

## 🎨 Estilos CSS

O sistema inclui classes CSS pré-definidas:

```css
/* Foco básico */
.nav-focus:focus-visible,
.nav-focus[data-focused="true"] {
  outline: 2px solid #e50914;
  box-shadow: 0 0 8px #e5091440;
}

/* Foco em texto */
.nav-focus-text:focus-visible,
.nav-focus-text[data-focused="true"] {
  color: #fff;
  text-shadow: 0 0 8px #e5091440;
  font-weight: bold;
}

/* Foco em botões */
.nav-focus-button:focus-visible,
.nav-focus-button[data-focused="true"] {
  background: #b00610;
  border-color: #fff;
  outline: 1px solid #fff;
}
```

## ✅ Boas Práticas

### 1. IDs Únicos
```typescript
// ✅ Bom
const navigationMap = {
  'header_menu': { right: 'header_search' },
  'content_item1': { down: 'content_item2' }
};

// ❌ Evitar
const navigationMap = {
  'menu': { right: 'search' }, // Pode conflitar
  'item1': { down: 'item2' }   // Muito genérico
};
```

### 2. Navegação Circular
```typescript
// ✅ Bom - Navegação circular
const navigationMap = {
  'item1': { right: 'item2', left: 'item3' },
  'item2': { right: 'item3', left: 'item1' },
  'item3': { right: 'item1', left: 'item2' }
};
```

### 3. Estados Desabilitados
```typescript
<NavigationItem
  id="button"
  navigation={navigationMap.button}
  disabled={isLoading} // Desabilita navegação
  onAction={handleAction}
>
  {/* ... */}
</NavigationItem>
```

### 4. Detecção de Mobile
```typescript
const { isMobile } = useNavigation();

if (isMobile) {
  // Usar navegação touch
  return <TouchFriendlyComponent />;
} else {
  // Usar navegação por teclado/controle
  return <KeyboardFriendlyComponent />;
}
```

### 5. Gerenciamento de Foco
```typescript
const { setFocus } = useNavigation();

// Focar programaticamente
setFocus('target_element');

// Focar após ação
const handleAction = () => {
  // Executar ação
  setTimeout(() => setFocus('next_element'), 100);
};
```

## 🔧 Configuração Avançada

### Personalizar Ações
```typescript
const handleAction = (action: NavigationAction) => {
  switch (action) {
    case 'confirm':
      // Executar ação principal
      break;
    case 'back':
      // Voltar/Anular
      break;
    case 'menu':
      // Abrir menu
      break;
  }
};
```

### Navegação Dinâmica
```typescript
const [navigationMap, setNavigationMap] = useState({});

useEffect(() => {
  // Atualizar navegação baseado no estado
  const newMap = createNavigationMap(currentState);
  setNavigationMap(newMap);
}, [currentState]);
```

## 🐛 Solução de Problemas

### Problema: Navegação não funciona
**Solução:**
1. Verificar se o `NavigationProvider` está configurado
2. Confirmar que os IDs são únicos
3. Verificar se o mapa de navegação está correto

### Problema: Foco não aparece
**Solução:**
1. Verificar se as classes CSS estão aplicadas
2. Confirmar que `data-focused` está sendo definido
3. Verificar se não há conflitos de z-index

### Problema: Navegação travada
**Solução:**
1. Verificar se não há loops no mapa de navegação
2. Confirmar que todos os elementos referenciados existem
3. Verificar se não há elementos desabilitados no caminho

## 📚 Recursos Adicionais

- [Documentação do React Router](https://reactrouter.com/)
- [Guia de Acessibilidade Web](https://www.w3.org/WAI/)
- [Padrões de Navegação TV](https://www.w3.org/TR/tv-controls/)

---

**Desenvolvido para IsaacPlay** 🎬
*Sistema de navegação unificado para TV, Desktop e Mobile* 