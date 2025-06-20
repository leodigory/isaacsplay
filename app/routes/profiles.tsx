import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import NavigationItem from '../components/NavigationItem';
import { useNavigation } from '../services/NavigationService';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import type { NavigationDirection } from '../services/NavigationService';

// --- Tipos e Dados de Exemplo ---
interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKids?: boolean;
}

const MAX_PROFILES = 5;
const SCOPE = 'profiles';

function getAvatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
}

// --- Mapa de Navegação ---
const createProfileNavigationMap = (profiles: Profile[]) => {
  const navigationMap: Record<string, Partial<Record<NavigationDirection, string>>> = {};
  const profileIds = profiles.map(p => p.id);
  const allNavIds = [...profileIds, 'add_profile', 'manage_profiles'];

  allNavIds.forEach((id, index) => {
    navigationMap[id] = {
      // Navegação para a esquerda e direita
      left: index > 0 ? allNavIds[index - 1] : undefined,
      right: index < allNavIds.length - 1 ? allNavIds[index + 1] : undefined,
      // Navegação para baixo/cima
      down: (id !== 'manage_profiles' && id !== 'add_profile' && profiles.length > 0) ? 'manage_profiles' : undefined,
      up: (id === 'manage_profiles') ? profileIds[0] || 'add_profile' : undefined,
    };
  });
  
  // Ajuste para o botão de adicionar
  if (profiles.length < MAX_PROFILES) {
     if (profileIds.length > 0) {
        navigationMap[profileIds[profileIds.length - 1]].right = 'add_profile';
     }
     navigationMap['add_profile'] = {
        left: profileIds.length > 0 ? profileIds[profileIds.length - 1] : undefined,
        down: 'manage_profiles'
     }
  }


  return navigationMap;
};


// --- Componente Principal ---
export default function Profiles() {
  const { setActiveScope, setFocus } = useNavigation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState<null | Profile>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileKids, setNewProfileKids] = useState(false);
  const [error, setError] = useState('');
  const initialized = useRef(false);
  const [showManage, setShowManage] = useState(false);
  const navigate = useNavigate();
  const [lastTopFocus, setLastTopFocus] = useState('profile_0');

  // Aguarda o Firebase Auth inicializar
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Carrega perfis do Firestore
  useEffect(() => {
    if (!authReady) return;
    if (!firebaseUser) return;
    async function fetchProfiles() {
      setLoading(true);
      if (!firebaseUser || !db) {
        setLoading(false);
        return;
      }
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      setProfiles(data?.profiles || []);
      setLoading(false);
    }
    fetchProfiles();
  }, [authReady, firebaseUser]);

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (authReady && !firebaseUser) {
      window.location.href = '/';
    }
  }, [authReady, firebaseUser]);

  // Atualiza navegação e foco sempre que perfis mudarem
  useEffect(() => {
    setActiveScope(SCOPE);
    if (profiles.length > 0) {
      setFocus('profile_0');
    } else {
      setFocus('add_profile');
    }
  }, [profiles, setActiveScope, setFocus]);

  // Atualiza lastTopFocus sempre que o foco mudar para um perfil ou adicionar
  const { currentFocus, activeScope } = useNavigation();
  useEffect(() => {
    if (activeScope === SCOPE && currentFocus && (currentFocus.startsWith('profile_') || currentFocus === addId)) {
      setLastTopFocus(currentFocus);
    }
  }, [currentFocus, activeScope]);

  // Gera ids previsíveis para os perfis
  const profileIds = profiles.map((_, idx) => `profile_${idx}`);
  const addId = 'add_profile';
  const manageId = 'manage_profiles';
  const allIds = [...profileIds, addId];

  // Mapa de navegação dinâmico
  const navigationMap = useMemo(() => {
    const map: Record<string, any> = {};
    allIds.forEach((id, idx) => {
      map[id] = {
        left: idx > 0 ? allIds[idx - 1] : undefined,
        right: idx < allIds.length - 1 ? allIds[idx + 1] : undefined,
        down: manageId,
      };
    });
    map[manageId] = {
      up: lastTopFocus,
    };
    return map;
  }, [profiles, lastTopFocus]);

  // Adicionar perfil
  const handleAddProfile = useCallback(async () => {
    setError('');
    if (!newProfileName.trim()) {
      setError('Digite um nome para o perfil.');
      return;
    }
    if (!firebaseUser || !db) return;
    if (profiles.length >= MAX_PROFILES) {
      setError('Limite de perfis atingido.');
      return;
    }
    const userRef = doc(db, 'users', firebaseUser.uid);
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      avatar: getAvatarUrl(newProfileName.trim()),
      isKids: newProfileKids
    };
    const updatedProfiles = [...profiles, newProfile];
    await updateDoc(userRef, { profiles: updatedProfiles });
    setProfiles(updatedProfiles);
    setShowAdd(false);
    setNewProfileName('');
    setNewProfileKids(false);
  }, [newProfileName, newProfileKids, profiles, firebaseUser]);

  // Excluir perfil
  const handleDeleteProfile = useCallback(async () => {
    if (!showDelete || !firebaseUser || !db) return;
    if (profiles.length <= 1) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const updatedProfiles = profiles.filter(p => p.id !== showDelete.id);
    await updateDoc(userRef, { profiles: updatedProfiles });
    setProfiles(updatedProfiles);
    setShowDelete(null);
  }, [showDelete, profiles, firebaseUser]);

  // Ao abrir modal de adicionar perfil, sugerir nome do usuário
  useEffect(() => {
    if (showAdd && firebaseUser && firebaseUser.email) {
      const defaultName = firebaseUser.email.split('@')[0];
      setNewProfileName(defaultName);
    }
  }, [showAdd, firebaseUser]);

  // Foco automático no input do modal de adicionar perfil
  const addInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (showAdd && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAdd]);

  // Foco automático no botão do modal de gerenciar perfis
  const manageButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (showManage && manageButtonRef.current) {
      manageButtonRef.current.focus();
    }
  }, [showManage]);

  // Fechar modais com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAdd) setShowAdd(false);
        if (showDelete) setShowDelete(null);
        if (showManage) setShowManage(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showAdd, showDelete, showManage]);

  // Handler para selecionar perfil
  const handleSelectProfile = (profile: Profile) => {
    // Aqui você pode redirecionar para a home do perfil, salvar no contexto, etc.
    alert(`Perfil selecionado: ${profile.name}`);
  };

  // Renderização
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>Carregando...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Quem está assistindo?</h1>
      
      <div style={styles.profilesGrid}>
        {profiles.map((profile, idx) => (
          <NavigationItem
            key={profile.id}
            scope={SCOPE}
            id={`profile_${idx}`}
            navigation={navigationMap[`profile_${idx}`]}
            onAction={() => handleSelectProfile(profile)}
          >
            {({ ref, isFocused }) => (
              <div
                ref={ref as React.RefObject<HTMLDivElement>}
                tabIndex={-1}
                style={styles.profileItem}
                onClick={() => handleSelectProfile(profile)}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{ ...styles.avatar, ...(isFocused ? styles.avatarFocused : {}) }}
                />
                <p style={{ ...styles.profileName, ...(isFocused ? styles.profileNameFocused : {}) }}>{profile.name}</p>
                {profiles.length > 1 && (
                  <button
                    style={styles.deleteButton}
                    onClick={() => setShowDelete(profile)}
                  >Excluir</button>
                )}
              </div>
            )}
          </NavigationItem>
        ))}
        {profiles.length < MAX_PROFILES && (
          <NavigationItem
            scope={SCOPE}
            id={addId}
            navigation={navigationMap[addId]}
            onAction={() => navigate('/profiles/add')}
          >
            {({ ref, isFocused }) => (
              <div
                ref={ref as React.RefObject<HTMLDivElement>}
                tabIndex={-1}
                style={styles.profileItem}
                onClick={() => navigate('/profiles/add')}
              >
                <div style={{ ...styles.addIcon, ...(isFocused ? styles.avatarFocused : {}) }}>+</div>
                <p style={{ ...styles.profileName, ...(isFocused ? styles.profileNameFocused : {}) }}>Adicionar Perfil</p>
              </div>
            )}
          </NavigationItem>
        )}
      </div>
      <div style={styles.manageButtonContainer}>
        <NavigationItem
          scope={SCOPE}
          id={manageId}
          navigation={navigationMap[manageId]}
          onAction={() => navigate('/profiles/manage')}
        >
          {({ ref, isFocused }) => (
            <button
              ref={ref as React.RefObject<HTMLButtonElement>}
              tabIndex={-1}
              style={{ ...styles.manageButton, ...(isFocused ? styles.manageButtonFocused : {}) }}
              onClick={() => navigate('/profiles/manage')}
            >
              Gerenciar Perfis
            </button>
          )}
        </NavigationItem>
      </div>

      {/* Modal Adicionar Perfil */}
      {showAdd && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Adicionar perfil</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, margin: '32px 0' }}>
              <img src={getAvatarUrl(newProfileName || 'Novo Perfil')} alt="avatar" style={{ width: 80, height: 80, borderRadius: 8 }} />
              <input
                ref={addInputRef}
                style={styles.input}
                placeholder="Nome do perfil"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                maxLength={20}
              />
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={newProfileKids}
                  onChange={e => setNewProfileKids(e.target.checked)}
                />
                Criança?
              </label>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <NavigationItem scope="modal_add" id="modal_add_confirm" navigation={{ right: 'modal_add_cancel' }} onAction={handleAddProfile}>
                {({ ref, isFocused }) => (
                  <button ref={ref as React.RefObject<HTMLButtonElement>} style={styles.continueButton}>Continuar</button>
                )}
              </NavigationItem>
              <NavigationItem scope="modal_add" id="modal_add_cancel" navigation={{ left: 'modal_add_confirm' }} onAction={() => setShowAdd(false)}>
                {({ ref, isFocused }) => (
                  <button ref={ref as React.RefObject<HTMLButtonElement>} style={styles.cancelButton}>Cancelar</button>
                )}
              </NavigationItem>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir Perfil */}
      {showDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Tem certeza de que quer excluir este perfil?</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, margin: '32px 0' }}>
              <img src={showDelete.avatar} alt={showDelete.name} style={{ width: 80, height: 80, borderRadius: 8 }} />
              <div style={{ color: '#fff' }}>
                Todo o histórico deste perfil será apagado para sempre.<br />Você não terá mais acesso a ele.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <NavigationItem scope="modal_delete" id="modal_delete_cancel" navigation={{ right: 'modal_delete_confirm' }} onAction={() => setShowDelete(null)}>
                {({ ref, isFocused }) => (
                  <button ref={ref as React.RefObject<HTMLButtonElement>} style={styles.cancelButton}>Manter perfil</button>
                )}
              </NavigationItem>
              <NavigationItem scope="modal_delete" id="modal_delete_confirm" navigation={{ left: 'modal_delete_cancel' }} onAction={handleDeleteProfile}>
                {({ ref, isFocused }) => (
                  <button ref={ref as React.RefObject<HTMLButtonElement>} style={styles.continueButton}>Excluir perfil</button>
                )}
              </NavigationItem>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Perfis */}
      {showManage && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Gerenciar Perfis</h2>
            <div style={{ color: '#fff', margin: '24px 0' }}>
              (Em breve: edição de nome, avatar, favoritos, etc)
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <NavigationItem scope="modal_manage" id="modal_manage_close" navigation={{}} onAction={() => setShowManage(false)}>
                {({ ref, isFocused }) => (
                  <button ref={ref as React.RefObject<HTMLButtonElement>} style={styles.continueButton}>Fechar</button>
                )}
              </NavigationItem>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// --- Estilos ---
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#141414',
        color: '#fff',
        fontFamily: 'sans-serif',
    },
    title: {
        fontSize: '3.5vw',
        fontWeight: 'bold',
        marginBottom: '2em',
    },
    profilesGrid: {
        display: 'flex',
        gap: '2vw',
        justifyContent: 'center',
    },
    profileItem: {
        cursor: 'pointer',
        textAlign: 'center',
        color: 'grey',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.8em',
        outline: 'none',
        position: 'relative',
    },
    avatar: {
        width: '10vw',
        height: '10vw',
        maxWidth: '180px',
        maxHeight: '180px',
        borderRadius: '8px',
        border: '4px solid transparent',
        transition: 'all 0.2s ease-in-out',
    },
    avatarFocused: {
        border: '2px solid #fff',
        outline: 'none',
        boxShadow: 'none',
        transform: 'scale(1.05)',
        transition: 'border-color 0.2s, transform 0.2s',
        zIndex: 2,
    },
    addIcon: {
      width: '10vw',
      height: '10vw',
      maxWidth: '180px',
      maxHeight: '180px',
      borderRadius: '8px',
      border: '4px solid grey',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '5vw',
      color: 'grey',
      transition: 'all 0.2s ease-in-out',
    },
    addIconFocused: {
       borderColor: '#e5e5e5',
       color: '#e5e5e5',
       background: '#222',
       transform: 'scale(1.05)',
    },
    profileName: {
        fontSize: '1.3vw',
        transition: 'color 0.2s ease-in-out',
    },
    profileNameFocused: {
        color: '#e5e5e5',
    },
    manageButtonContainer: {
        marginTop: '5em',
    },
    manageButton: {
        background: 'transparent',
        border: '1px solid grey',
        color: 'grey',
        padding: '0.7em 1.5em',
        fontSize: '1.2vw',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
    },
    manageButtonFocused: {
        border: '2px solid #fff',
        color: '#fff',
        background: '#222',
        boxShadow: 'none',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        background: '#e50914',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '2px 8px',
        cursor: 'pointer',
        fontSize: 12,
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
    },
    modal: {
        background: '#181818',
        borderRadius: 12,
        padding: 32,
        minWidth: 400,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 16,
    },
    input: {
        background: '#222',
        color: '#fff',
        border: '1px solid #444',
        borderRadius: 6,
        padding: '10px 16px',
        fontSize: 18,
        outline: 'none',
        width: 220,
    },
    continueButton: {
        background: '#e50914',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '10px 24px',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
    },
    cancelButton: {
        background: 'transparent',
        color: '#fff',
        border: '1px solid #444',
        borderRadius: 4,
        padding: '10px 24px',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
    },
}; 