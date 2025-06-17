import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página não encontrada</h2>
        <p className="text-gray-400 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-red-600 hover:bg-red-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Voltar para o Início
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage; 