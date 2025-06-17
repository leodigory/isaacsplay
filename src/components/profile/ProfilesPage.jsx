import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboardNavigation, useGridNavigation } from '../../hooks/useKeyboardNavigation';
import { Button } from '@/components/ui/button';
import { Layout } from '../common/Layout';
import { Plus, Edit, Trash2, Play } from 'lucide-react';

export const ProfilesPage = () => {
  const [focusedProfile, setFocusedProfile] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { 
    currentUser, 
    userProfiles, 
    selectProfile, 
    createProfile, 
    loadUserProfiles 
  } = useAuth();
  const navigate = useNavigate();

  const maxProfiles = 4;
  const canCreateProfile = userProfiles.length < maxProfiles;
  const totalSlots = canCreateProfile ? userProfiles.length + 1 : userProfiles.length;

  const gridNavigation = useGridNavigation({
    rows: Math.ceil(totalSlots / 2),
    columns: 2,
    wrap: false
  });

  useKeyboardNavigation({
    onArrowUp: () => {
      const newPosition = gridNavigation.moveUp();
      setFocusedProfile(newPosition.row * 2 + newPosition.col);
    },
    onArrowDown: () => {
      const newPosition = gridNavigation.moveDown();
      setFocusedProfile(newPosition.row * 2 + newPosition.col);
    },
    onArrowLeft: () => {
      const newPosition = gridNavigation.moveLeft();
      setFocusedProfile(newPosition.row * 2 + newPosition.col);
    },
    onArrowRight: () => {
      const newPosition = gridNavigation.moveRight();
      setFocusedProfile(newPosition.row * 2 + newPosition.col);
    },
    onEnter: () => handleKeyboardAction(),
    onEscape: () => {
      if (showCreateForm) {
        setShowCreateForm(false);
        setNewProfileName('');
        setError('');
      }
    },
    enabled: !showCreateForm
  });

  const handleKeyboardAction = () => {
    if (focusedProfile < userProfiles.length) {
      handleSelectProfile(userProfiles[focusedProfile]);
    } else if (focusedProfile === userProfiles.length && canCreateProfile) {
      setShowCreateForm(true);
    }
  };

  const handleSelectProfile = async (profile) => {
    try {
      selectProfile(profile);
      navigate('/browse');
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    
    if (!newProfileName.trim()) {
      setError('Por favor, insira um nome para o perfil');
      return;
    }

    if (newProfileName.length > 20) {
      setError('O nome deve ter no máximo 20 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await createProfile(currentUser.uid, newProfileName.trim());
      setShowCreateForm(false);
      setNewProfileName('');
      
      // Reload profiles to get the updated list
      await loadUserProfiles(currentUser.uid);
    } catch (error) {
      setError('Erro ao criar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserProfiles(currentUser.uid);
    }
  }, [currentUser]);

  useEffect(() => {
    // Update grid navigation when profiles change
    const newRows = Math.ceil(totalSlots / 2);
    gridNavigation.setPosition(
      Math.floor(focusedProfile / 2),
      focusedProfile % 2
    );
  }, [totalSlots, focusedProfile]);

  return (
    <Layout showNavbar={false}>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Play className="h-16 w-16 text-red-600 mr-4" />
              <h1 className="text-5xl font-bold text-white">IsaacPlay</h1>
            </div>
            <h2 className="text-2xl text-white mb-2">Quem está assistindo?</h2>
            <p className="text-gray-400">Selecione um perfil para continuar</p>
          </div>

          {/* Create Profile Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">Criar Novo Perfil</h3>
                
                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateProfile}>
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nome do Perfil
                    </label>
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:outline-none focus:border-red-600"
                      placeholder="Digite o nome do perfil"
                      maxLength={20}
                      autoFocus
                      disabled={loading}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      {newProfileName.length}/20 caracteres
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                    >
                      {loading ? 'Criando...' : 'Criar Perfil'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewProfileName('');
                        setError('');
                      }}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Profiles Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {/* Existing Profiles */}
            {userProfiles.map((profile, index) => (
              <div
                key={profile.id}
                className={`group cursor-pointer transition-all duration-300 transform ${
                  focusedProfile === index ? 'scale-110 z-10' : 'scale-100'
                }`}
                onClick={() => handleSelectProfile(profile)}
                data-focusable="true"
              >
                <div className={`relative ${
                  focusedProfile === index ? 'ring-4 ring-red-600 rounded-lg' : ''
                }`}>
                  {/* Avatar */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-800 group-hover:ring-4 group-hover:ring-white/50 transition-all duration-300">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Name */}
                  <h3 className="text-white text-center font-medium group-hover:text-red-400 transition-colors duration-300">
                    {profile.name}
                  </h3>
                  
                  {/* Default Badge */}
                  {profile.isDefault && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      Principal
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Profile Button */}
            {canCreateProfile && (
              <div
                className={`group cursor-pointer transition-all duration-300 transform ${
                  focusedProfile === userProfiles.length ? 'scale-110 z-10' : 'scale-100'
                }`}
                onClick={() => setShowCreateForm(true)}
                data-focusable="true"
              >
                <div className={`relative ${
                  focusedProfile === userProfiles.length ? 'ring-4 ring-red-600 rounded-lg' : ''
                }`}>
                  {/* Add Button */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-lg bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center group-hover:border-white group-hover:bg-gray-700 transition-all duration-300">
                    <Plus className="h-12 w-12 text-gray-400 group-hover:text-white" />
                  </div>
                  
                  {/* Label */}
                  <h3 className="text-gray-400 text-center font-medium group-hover:text-white transition-colors duration-300">
                    Adicionar Perfil
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Profile Limit Info */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              {userProfiles.length} de {maxProfiles} perfis criados
            </p>
          </div>

          {/* Navigation Instructions */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Use as setas direcionais para navegar • Enter para selecionar • Esc para cancelar
            </p>
          </div>

          {/* Logout Option */}
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

