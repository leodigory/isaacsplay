import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserById, updateUser } from '../services/firestore';
import ContentCard from '../components/common/ContentCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, LogOut, Heart, Clock, Settings } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('myList');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getUserById(user.uid);
      setProfile(userData);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const handleContentSelect = (content) => {
    navigate(`/details/${content.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
        <span className="ml-4 text-white">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <Button onClick={loadProfile} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold">Meu Perfil</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/settings')}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Profile Info */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl text-gray-400">
                {profile?.displayName?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{profile?.displayName}</h2>
            <p className="text-gray-400">{profile?.email}</p>
          </div>
          <Button
            onClick={() => navigate('/profile/edit')}
            variant="outline"
            className="ml-auto"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('myList')}
            className={`pb-4 px-2 flex items-center space-x-2 ${
              activeTab === 'myList'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>Minha Lista</span>
          </button>
          <button
            onClick={() => setActiveTab('watchHistory')}
            className={`pb-4 px-2 flex items-center space-x-2 ${
              activeTab === 'watchHistory'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Histórico</span>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {activeTab === 'myList' ? (
            profile?.myList?.length > 0 ? (
              profile.myList.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  size="small"
                  onSelect={handleContentSelect}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 py-8">
                Sua lista está vazia. Adicione conteúdo para vê-lo aqui.
              </p>
            )
          ) : profile?.watchHistory?.length > 0 ? (
            profile.watchHistory.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                size="small"
                onSelect={handleContentSelect}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400 py-8">
              Seu histórico está vazio. Comece a assistir conteúdo para vê-lo aqui.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 