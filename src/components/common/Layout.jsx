import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'medium', text = 'Carregando...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-600 border-t-red-600`} />
      {text && <p className="text-gray-400">{text}</p>}
    </div>
  );
};

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="text-red-400 text-lg font-semibold">Ops! Algo deu errado</div>
      <p className="text-gray-400 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ 
  title = 'Nenhum conteúdo encontrado', 
  description = 'Não há itens para exibir no momento.',
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16">
      <div className="text-gray-400 text-6xl">📺</div>
      <h3 className="text-white text-xl font-semibold">{title}</h3>
      <p className="text-gray-400 text-center max-w-md">{description}</p>
      {action}
    </div>
  );
};

