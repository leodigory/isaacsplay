import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout, PageContainer } from '../common/Layout';
import { ArrowLeft, Save, Trash2, User } from 'lucide-react';

export const ProfileSettingsPage = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(0);

  const { 
    currentProfile, 
    userProfiles, 
    updateUserProfile, 
    loadUserProfiles,
    currentUser 
  } = useAuth();
  const navigate = useNavigate();

  // Avatar options
  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Garfield',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Fluffy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Whiskers',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Shadow',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
  ];

  const fields = ['name', 'avatars', 'save', 'back'];

  useKeyboardNavigation({
    onArrowUp: () => {
      if (focusedField === 1) { // avatars
        // Handle avatar grid navigation
        const currentIndex = avatarOptions.indexOf(selectedAvatar);
        const newIndex = Math.max(0, currentIndex - 4); // 4 avatars per row
        setSelectedAvatar(avatarOptions[newIndex]);
      } else {
        setFocusedField(prev => Math.max(0, prev - 1));
      }
    },
    onArrowDown: () => {
      if (focusedField === 1) { // avatars
        const currentIndex = avatarOptions.indexOf(selectedAvatar);
        const newIndex = Math.min(avatarOptions.length - 1, currentIndex + 4);
        setSelectedAvatar(avatarOptions[newIndex]);
      } else {
        setFocusedField(prev => Math.min(fields.length - 1, prev + 1));
      }
    },
    onArrowLeft: () => {
      if (focusedField === 1) { // avatars
        const currentIndex = avatarOptions.indexOf(selectedAvatar);
        const newIndex = Math.max(0, currentIndex - 1);
        setSelectedAvatar(avatarOptions[newIndex]);
      }
    },
    onArrowRight: () => {
      if (focusedField === 1) { // avatars
        const currentIndex = avatarOptions.indexOf(selectedAvatar);
        const newIndex = Math.min(avatarOptions.length - 1, currentIndex + 1);
        setSelectedAvatar(avatarOptions[newIndex]);
      }
    },
    onEnter: () => handleKeyboardAction(),
    onEscape: () => navigate('/profiles'),
    enabled: true
  });

  const handleKeyboardAction = () => {
    switch (fields[focusedField]) {
      case 'save':
        handleSaveProfile();
        break;
      case 'back':
        navigate('/profiles');
        break;
    }
  };

  useEffect(() => {
    if (currentProfile) {
      setSelectedProfile(currentProfile);
      setProfileName(currentProfile.name);
      setSelectedAvatar(currentProfile.avatar);
    }
  }, [currentProfile]);

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      setError('Por favor, insira um nome para o perfil');
      return;
    }

    if (profileName.length > 20) {
      setError('O nome deve ter no máximo 20 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await updateUserProfile(selectedProfile.id, {
        name: profileName.trim(),
        avatar: selectedAvatar
      });

      setSuccess('Perfil atualizado com sucesso!');
      
      // Reload profiles to get updated data
      await loadUserProfiles(currentUser.uid);
      
      setTimeout(() => {
        navigate('/profiles');
      }, 1500);
    } catch (error) {
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProfile) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-16">
            <p className="text-gray-400">Carregando configurações do perfil...</p>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              onClick={() => navigate('/profiles')}
              variant="ghost"
              className="mr-4 text-gray-400 hover:text-white"
              data-focus-index="3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">Configurações do Perfil</h1>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            {/* Current Profile Preview */}
            <div className="flex items-center mb-8 pb-6 border-b border-gray-700">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 mr-4">
                <img
                  src={selectedAvatar}
                  alt={profileName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-white font-semibold">{profileName || 'Sem nome'}</h3>
                <p className="text-gray-400 text-sm">Perfil atual</p>
              </div>
            </div>

            {/* Profile Name */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Nome do Perfil
              </label>
              <Input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                data-focus-index="0"
                className={`bg-gray-800 border-gray-600 text-white focus:border-red-600 ${
                  focusedField === 0 ? 'ring-2 ring-red-600' : ''
                }`}
                placeholder="Digite o nome do perfil"
                maxLength={20}
                disabled={loading}
              />
              <p className="text-gray-500 text-xs mt-1">
                {profileName.length}/20 caracteres
              </p>
            </div>

            {/* Avatar Selection */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Escolha um Avatar
              </label>
              <div 
                className={`grid grid-cols-4 gap-4 p-4 rounded-lg border-2 transition-colors duration-200 ${
                  focusedField === 1 ? 'border-red-600 bg-gray-800/50' : 'border-gray-700'
                }`}
                data-focus-index="1"
              >
                {avatarOptions.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedAvatar === avatar 
                        ? 'border-red-600 ring-2 ring-red-600/50' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    disabled={loading}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleSaveProfile}
                data-focus-index="2"
                className={`flex-1 bg-red-600 hover:bg-red-700 text-white ${
                  focusedField === 2 ? 'ring-2 ring-red-400' : ''
                }`}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>

          {/* Navigation Instructions */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Use ↑↓←→ para navegar • Enter para selecionar • Esc para voltar
            </p>
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
};

