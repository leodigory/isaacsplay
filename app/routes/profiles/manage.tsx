import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationItem from '../../components/NavigationItem';
import { useNavigation } from '../../services/NavigationService';

const SCOPE = 'manage_profiles';

export default function ManageProfiles() {
  const navigate = useNavigate();
  const { setActiveScope, setFocus } = useNavigation();
  React.useEffect(() => {
    setActiveScope(SCOPE);
    setFocus('manage_back');
  }, [setActiveScope, setFocus]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#141414', color: '#fff' }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Gerenciar Perfis</h1>
      <div style={{ color: '#fff', margin: '24px 0' }}>
        (Em breve: edição de nome, avatar, favoritos, etc)
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <NavigationItem scope={SCOPE} id="manage_back" navigation={{}} onAction={() => navigate('/profiles')}>
          {({ ref, isFocused }) => (
            <button ref={ref as React.RefObject<HTMLButtonElement>} style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Voltar
            </button>
          )}
        </NavigationItem>
      </div>
    </div>
  );
} 