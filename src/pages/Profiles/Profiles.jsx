import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import Profile from '../../components/Profile/Profile';
import useTVNavigation from '../../hooks/useTVNavigation';
import AddProfileModal from '../../components/Profile/AddProfileModal';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './Profiles.css';

const Profiles = () => {
  const { user } = useUser();
  const [profiles, setProfiles] = useState([]);
  const [isManaging, setIsManaging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const colors = ['#1e90ff', '#ff6347', '#32cd32', '#ffeb3b', '#ff69b4'];

  // Referências para os elementos interativos da tela de perfis
  const profileRefs = useRef([]);
  const addProfileRef = useRef(null);
  const manageProfilesRef = useRef(null);

  // Atualizar as referências dinamicamente com base nos perfis
  useEffect(() => {
    profileRefs.current = profiles.map((_, index) => profileRefs.current[index] || React.createRef());
    console.log('Referências atualizadas:', profileRefs.current.map(ref => ref.current));
  }, [profiles]);

  // Lista de referências para o useTVNavigation, memoizada para evitar recriação desnecessária
  const refs = useMemo(() => {
    return [...profileRefs.current, addProfileRef, manageProfilesRef].filter(ref => ref && ref.current);
  }, [profileRefs.current, addProfileRef, manageProfilesRef]);

  // Use o hook useTVNavigation, desabilitando quando o modal estiver aberto
  const { focusedIndex, focusElement, lastFocusedIndex } = useTVNavigation(refs, !isModalOpen);

  // Carregar perfis do usuário
  useEffect(() => {
    if (user && user.Perfil) {
      const userProfiles = user.Perfil.map((name, index) => ({
        id: index,
        name,
        color: colors[index % colors.length],
      }));
      setProfiles(userProfiles);
      console.log('Perfis carregados:', userProfiles);
    }
  }, [user]);

  // Restaurar o foco ao fechar o modal
  useEffect(() => {
    if (!isModalOpen && refs.length > 0) {
      const validIndex = Math.min(lastFocusedIndex, refs.length - 1);
      console.log('Restaurando foco para índice:', validIndex, 'Refs:', refs);
      focusElement(validIndex >= 0 ? validIndex : 0); // Foco no primeiro elemento se inválido
    }
  }, [isModalOpen, lastFocusedIndex, focusElement, refs]);

  // Foco inicial ao carregar a página
  useEffect(() => {
    if (refs.length > 0 && !isModalOpen) {
      console.log('Definindo foco inicial, refs:', refs);
      focusElement(0); // Focar no primeiro elemento ao carregar
    }
  }, [refs, focusElement, isModalOpen]);

  const handleAddProfileClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveProfile = async (name, isChild) => {
    if (profiles.length >= 5) {
      alert('Você só pode ter até 5 perfis.');
      return;
    }

    const newProfile = {
      id: Date.now(),
      name,
      isChild,
      color: colors[profiles.length % colors.length],
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      const profilesRef = collection(userRef, 'profiles');
      await setDoc(doc(profilesRef, newProfile.id.toString()), newProfile);
      setProfiles((prevProfiles) => [...prevProfiles, newProfile]);
    } catch (error) {
      console.error('Erro ao adicionar perfil:', error);
    }
    setIsModalOpen(false);
  };

  const handleRemoveProfile = (id) => {
    const updatedProfiles = profiles.filter((profile) => profile.id !== id);
    setProfiles(updatedProfiles);
    setIsManaging(false);
  };

  return (
    <div className="profiles-container">
      <h1>Quem está assistindo?</h1>
      <div className="profiles-grid">
        {profiles.map((profile, index) => (
          <Profile
            key={profile.id}
            ref={profileRefs.current[index]}
            name={profile.name}
            color={profile.color}
            onRemove={() => handleRemoveProfile(profile.id)}
            isFocused={focusedIndex === index}
            isManaging={isManaging}
            onFocus={() => focusElement(index)}
          />
        ))}
        {profiles.length < 5 && (
          <div className="add-profile-container">
            <button
              ref={addProfileRef}
              className="add-profile"
              onClick={handleAddProfileClick}
              onFocus={() => focusElement(profiles.length)}
              aria-label="Adicionar perfil"
            >
              +
            </button>
            <div className="add-profile-text">Adicionar perfil</div>
          </div>
        )}
      </div>
      <button
        ref={manageProfilesRef}
        className="manage-profiles"
        onClick={() => setIsManaging(!isManaging)}
        onFocus={() => focusElement(profiles.length + 1)}
        aria-label="Gerenciar perfis"
      >
        Gerenciar Perfis
      </button>

      {/* Modal de adicionar perfil */}
      {isModalOpen && (
        <AddProfileModal
          onSave={handleSaveProfile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Profiles;