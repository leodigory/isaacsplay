import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserById, updateUser } from '../services/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'pt-BR',
    theme: 'dark',
    notifications: true,
    autoplay: true,
    quality: 'auto'
  });

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
      setFormData(prev => ({
        ...prev,
        displayName: userData.displayName || '',
        email: userData.email || '',
        language: userData.language || 'pt-BR',
        theme: userData.theme || 'dark',
        notifications: userData.notifications ?? true,
        autoplay: userData.autoplay ?? true,
        quality: userData.quality || 'auto'
      }));
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Validar senha
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }
      }

      // Atualizar perfil
      await updateUser(user.uid, {
        displayName: formData.displayName,
        language: formData.language,
        theme: formData.theme,
        notifications: formData.notifications,
        autoplay: formData.autoplay,
        quality: formData.quality
      });

      // Atualizar senha se necessário
      if (formData.newPassword) {
        // Implementar atualização de senha
      }

      navigate('/profile');
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.message || 'Erro ao salvar configurações. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
        <span className="ml-4 text-white">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Profile Settings */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-gray-800 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Senha</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nova Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Preferências</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Idioma
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tema
                </label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="dark">Escuro</option>
                  <option value="light">Claro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Qualidade do Vídeo
                </label>
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="auto">Automático</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 focus:ring-red-600 border-gray-600 rounded"
                />
                <label className="text-sm font-medium text-gray-400">
                  Receber Notificações
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="autoplay"
                  checked={formData.autoplay}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 focus:ring-red-600 border-gray-600 rounded"
                />
                <label className="text-sm font-medium text-gray-400">
                  Reproduzir Automaticamente
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage; 