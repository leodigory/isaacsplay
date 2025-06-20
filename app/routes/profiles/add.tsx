import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../services/NavigationService';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import NavigationItem from '../../components/NavigationItem';

const SCOPE = 'add_profile';
const AVATAR_OPTIONS = [
  'adventurer', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'croodles', 'identicon', 'micah'
];

function getAvatarUrl(name: string, style: string) {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(name)}`;
}

export default function AddProfile() {
  const navigate = useNavigate();
  const { setActiveScope, setFocus } = useNavigation();
  const [name, setName] = useState('');
  const [isKids, setIsKids] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusStep, setFocusStep] = useState<'avatar' | 'input'>('avatar');

  // Foco inicial só uma vez
  useEffect(() => {
    setActiveScope(SCOPE);
    setFocus('avatar_0');
    setFocusStep('avatar');
    // eslint-disable-next-line
  }, []);

  // Handler para mover foco do avatar para o input
  const handleAvatarAction = useCallback((idx: number, action: string) => {
    if (action === 'confirm') {
      setFocus('add_name');
      setFocusStep('input');
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (action === 'right' && idx < AVATAR_OPTIONS.length - 1) {
      setFocus(`avatar_${idx + 1}`);
    } else if (action === 'left' && idx > 0) {
      setFocus(`avatar_${idx - 1}`);
    }
  }, []);

  // Handler para voltar do input para o avatar
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      setFocus('avatar_0');
      setFocusStep('avatar');
      e.preventDefault();
    }
  };

  // Salvar perfil no Firestore
  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('Digite um nome para o perfil.');
      setFocus('add_name');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !db) throw new Error('Usuário não autenticado');
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      const profiles = data?.profiles || [];
      const newProfile = {
        id: Date.now().toString(),
        name: name.trim(),
        avatar: getAvatarUrl(name.trim(), selectedAvatar),
        isKids,
      };
      await updateDoc(userRef, {
        profiles: [...profiles, newProfile],
      });
      navigate('/profiles');
    } catch (e) {
      setError('Erro ao adicionar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#141414', color: '#fff' }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Adicionar Perfil</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', background: '#181818', padding: 32, borderRadius: 12, minWidth: 400 }}>
        {/* Carrossel de Avatares */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {AVATAR_OPTIONS.map((style, idx) => (
            <NavigationItem
              key={style}
              scope={SCOPE}
              id={`avatar_${idx}`}
              navigation={{ left: idx > 0 ? `avatar_${idx - 1}` : undefined, right: idx < AVATAR_OPTIONS.length - 1 ? `avatar_${idx + 1}` : undefined, down: 'add_name' }}
              onAction={action => {
                setSelectedAvatar(style);
                handleAvatarAction(idx, action);
              }}
            >
              {({ ref, isFocused }) => (
                <div
                  ref={ref as React.RefObject<HTMLDivElement>}
                  tabIndex={-1}
                  style={{
                    border: isFocused ? '2px solid #fff' : '2px solid #444',
                    borderRadius: 8,
                    padding: 4,
                    background: isFocused ? '#222' : 'transparent',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onClick={() => {
                    setSelectedAvatar(style);
                    setFocus('add_name');
                    setFocusStep('input');
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                >
                  <img src={getAvatarUrl(name || 'Novo Perfil', style)} alt={style} style={{ width: 64, height: 64, borderRadius: 6, opacity: selectedAvatar === style ? 1 : 0.5 }} />
                </div>
              )}
            </NavigationItem>
          ))}
        </div>
        {/* Input de nome */}
        <input
          ref={inputRef}
          style={{ background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6, padding: '10px 16px', fontSize: 18, outline: 'none', width: 220, marginBottom: 8 }}
          placeholder="Nome do perfil"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
          id="add_name"
          onKeyDown={handleInputKeyDown}
        />
        <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={isKids}
            onChange={e => setIsKids(e.target.checked)}
          />
          Criança?
        </label>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <NavigationItem scope={SCOPE} id="add_save" navigation={{ right: 'add_cancel' }} onAction={handleSave}>
            {({ ref, isFocused }) => (
              <button ref={ref as React.RefObject<HTMLButtonElement>} style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }} disabled={loading}>
                Salvar
              </button>
            )}
          </NavigationItem>
          <NavigationItem scope={SCOPE} id="add_cancel" navigation={{ left: 'add_save' }} onAction={() => navigate('/profiles')}>
            {({ ref, isFocused }) => (
              <button ref={ref as React.RefObject<HTMLButtonElement>} style={{ background: 'transparent', color: '#fff', border: '1px solid #444', borderRadius: 4, padding: '10px 24px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </NavigationItem>
        </div>
      </div>
    </div>
  );
} 