import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Play } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(0);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const fields = ['displayName', 'email', 'password', 'showPassword', 'confirmPassword', 'showConfirmPassword', 'submit', 'login'];

  useKeyboardNavigation({
    onArrowUp: () => setFocusedField(prev => Math.max(0, prev - 1)),
    onArrowDown: () => setFocusedField(prev => Math.min(fields.length - 1, prev + 1)),
    onEnter: () => handleKeyboardAction(),
    enabled: true
  });

  const handleKeyboardAction = () => {
    switch (fields[focusedField]) {
      case 'showPassword':
        setShowPassword(!showPassword);
        break;
      case 'showConfirmPassword':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      case 'submit':
        handleSubmit();
        break;
      case 'login':
        navigate('/login');
        break;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.displayName);
      navigate('/profiles');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha é muito fraca');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const focusElement = document.querySelector(`[data-focus-index="${focusedField}"]`);
    if (focusElement) {
      focusElement.focus();
    }
  }, [focusedField]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Play className="h-12 w-12 text-red-600 mr-2" />
            <h1 className="text-4xl font-bold text-white">IsaacPlay</h1>
          </div>
          <p className="text-gray-400">Filmes, Séries e TV Online</p>
        </div>

        {/* Register Form */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Criar Conta</h2>
          
          {error && (
            <Alert className="mb-4 bg-red-900/50 border-red-700">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-gray-300">Nome</Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                data-focus-index="0"
                className={`bg-gray-900 border-gray-700 text-white focus:border-red-600 ${
                  focusedField === 0 ? 'ring-2 ring-red-600' : ''
                }`}
                placeholder="Seu nome"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                data-focus-index="1"
                className={`bg-gray-900 border-gray-700 text-white focus:border-red-600 ${
                  focusedField === 1 ? 'ring-2 ring-red-600' : ''
                }`}
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  data-focus-index="2"
                  className={`bg-gray-900 border-gray-700 text-white focus:border-red-600 pr-10 ${
                    focusedField === 2 ? 'ring-2 ring-red-600' : ''
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-focus-index="3"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white ${
                    focusedField === 3 ? 'ring-2 ring-red-600 rounded' : ''
                  }`}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  data-focus-index="4"
                  className={`bg-gray-900 border-gray-700 text-white focus:border-red-600 pr-10 ${
                    focusedField === 4 ? 'ring-2 ring-red-600' : ''
                  }`}
                  placeholder="Confirme sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-focus-index="5"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white ${
                    focusedField === 5 ? 'ring-2 ring-red-600 rounded' : ''
                  }`}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              data-focus-index="6"
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 ${
                focusedField === 6 ? 'ring-2 ring-red-400' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                data-focus-index="7"
                className={`text-red-400 hover:text-red-300 underline ${
                  focusedField === 7 ? 'ring-2 ring-red-600 rounded px-1' : ''
                }`}
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Navigation Instructions */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Use ↑↓ para navegar • Enter para selecionar</p>
        </div>
      </div>
    </div>
  );
};


