import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Play } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profiles';

  const fields = ['email', 'password', 'showPassword', 'submit', 'register'];

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
      case 'submit':
        handleSubmit();
        break;
      case 'register':
        navigate('/register');
        break;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setEmail('admin@isaacplay.com');
    setPassword('123456');
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

        {/* Login Form */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Entrar</h2>
          
          {error && (
            <Alert className="mb-4 bg-red-900/50 border-red-700">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-focus-index="0"
                className={`bg-gray-900 border-gray-700 text-white focus:border-red-600 ${
                  focusedField === 0 ? 'ring-2 ring-red-600' : ''
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-focus-index="1"
                  className={`bg-gray-900 border-gray-700 text-white focus:border-red-600 pr-10 ${
                    focusedField === 1 ? 'ring-2 ring-red-600' : ''
                  }`}
                  placeholder="Sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-focus-index="2"
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white ${
                    focusedField === 2 ? 'ring-2 ring-red-600 rounded' : ''
                  }`}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              data-focus-index="3"
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 ${
                focusedField === 3 ? 'ring-2 ring-red-400' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Quick Admin Login */}
          <div className="mt-4">
            <Button
              type="button"
              onClick={handleAdminLogin}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 text-sm"
              disabled={loading}
            >
              Login Rápido Admin
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                data-focus-index="4"
                className={`text-red-400 hover:text-red-300 underline ${
                  focusedField === 4 ? 'ring-2 ring-red-600 rounded px-1' : ''
                }`}
              >
                Registre-se
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


