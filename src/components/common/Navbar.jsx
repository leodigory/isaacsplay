import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Film, 
  Tv, 
  Heart,
  Clock,
  Shield
} from 'lucide-react';

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [focusedItem, setFocusedItem] = useState(0);
  
  const { currentUser, currentProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, path: '/browse' },
    { id: 'movies', label: 'Filmes', icon: Film, path: '/movies' },
    { id: 'series', label: 'Séries', icon: Tv, path: '/series' },
    { id: 'channels', label: 'TV', icon: Tv, path: '/channels' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, path: '/favorites' },
    { id: 'history', label: 'Histórico', icon: Clock, path: '/history' }
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/admin' });
  }

  const userMenuItems = [
    { id: 'profiles', label: 'Perfis', action: () => navigate('/profiles') },
    { id: 'settings', label: 'Configurações', action: () => navigate('/settings') },
    { id: 'logout', label: 'Sair', action: handleLogout }
  ];

  useKeyboardNavigation({
    onArrowLeft: () => setFocusedItem(prev => Math.max(0, prev - 1)),
    onArrowRight: () => setFocusedItem(prev => Math.min(navItems.length + 2, prev + 1)), // +2 for search and user menu
    onEnter: () => handleKeyboardAction(),
    onEscape: () => {
      setShowSearch(false);
      setShowUserMenu(false);
    },
    enabled: true
  });

  const handleKeyboardAction = () => {
    if (focusedItem < navItems.length) {
      navigate(navItems[focusedItem].path);
    } else if (focusedItem === navItems.length) {
      setShowSearch(!showSearch);
    } else if (focusedItem === navItems.length + 1) {
      setShowUserMenu(!showUserMenu);
    }
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (!event.target.closest('.search-container')) {
        setShowSearch(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/browse" 
            className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors duration-200"
          >
            <Play className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold hidden sm:block">IsaacPlay</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isFocused = focusedItem === index;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  data-focus-index={index}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-red-400 bg-red-900/20' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  } ${
                    isFocused ? 'ring-2 ring-red-600' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="search-container relative">
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar filmes, séries..."
                    className="w-64 bg-gray-900 border-gray-700 text-white focus:border-red-600"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="ml-2 bg-red-600 hover:bg-red-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  onClick={() => setShowSearch(true)}
                  data-focus-index={navItems.length}
                  variant="ghost"
                  size="sm"
                  className={`text-gray-300 hover:text-white hover:bg-gray-800/50 ${
                    focusedItem === navItems.length ? 'ring-2 ring-red-600' : ''
                  }`}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* User Menu */}
            <div className="user-menu-container relative">
              <Button
                onClick={() => setShowUserMenu(!showUserMenu)}
                data-focus-index={navItems.length + 1}
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800/50 ${
                  focusedItem === navItems.length + 1 ? 'ring-2 ring-red-600' : ''
                }`}
              >
                {currentProfile?.avatar ? (
                  <img 
                    src={currentProfile.avatar} 
                    alt={currentProfile.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="hidden sm:block">{currentProfile?.name || 'Usuário'}</span>
              </Button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-white font-medium">{currentProfile?.name}</p>
                    <p className="text-xs text-gray-400">{currentUser?.email}</p>
                  </div>
                  
                  {userMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-900/50 border-t border-gray-800">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-md transition-colors duration-200 ${
                  isActive ? 'text-red-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Navigation Instructions */}
      <div className="hidden lg:block absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
        <div className="bg-black/80 text-gray-400 text-xs px-3 py-1 rounded-b-md">
          ←→ navegar • Enter selecionar • Esc fechar
        </div>
      </div>
    </nav>
  );
};

