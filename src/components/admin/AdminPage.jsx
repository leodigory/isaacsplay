import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Layout } from '../common/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Upload, Settings, Users, Film, Tv, Video, Star, Calendar, Clock, Globe, Award } from 'lucide-react';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [focusedElement, setFocusedElement] = useState(0);
  const [categories, setCategories] = useState([]);

  // Content form state
  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'movie',
    category: '',
    genre: '',
    year: '',
    description: '',
    videoUrl: '',
    trailerUrl: '',
    posterUrl: '',
    backdropUrl: '',
    duration: '',
    rating: '',
    cast: '',
    director: '',
    quality: 'HD'
  });

  const { currentUser } = useAuth();

  // Check if user is admin
  const isAdmin = currentUser?.email === 'admin@isaacplay.com';

  useKeyboardNavigation({
    onArrowUp: () => setFocusedElement(prev => Math.max(0, prev - 1)),
    onArrowDown: () => setFocusedElement(prev => prev + 1),
    onArrowLeft: () => {
      const tabs = ['content', 'users', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    },
    onArrowRight: () => {
      const tabs = ['content', 'users', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    enabled: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Implementar carregamento de categorias do Firestore
      const mockCategories = [
        { id: 'action', name: 'Ação' },
        { id: 'comedy', name: 'Comédia' },
        { id: 'drama', name: 'Drama' },
        { id: 'horror', name: 'Terror' },
        { id: 'romance', name: 'Romance' },
        { id: 'scifi', name: 'Ficção Científica' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleContentFormChange = (field, value) => {
    setContentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Implementar lógica de salvamento
      setMessage('Conteúdo salvo com sucesso!');
    } catch (error) {
      setMessage('Erro ao salvar conteúdo.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p>Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-900 p-1 rounded-lg">
              <TabsTrigger 
                value="content"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
              >
                <Film className="h-4 w-4 mr-2" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulário de Adição */}
                <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Adicionar Novo Conteúdo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informações Básicas */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title" className="text-gray-300">Título *</Label>
                            <div className="flex gap-2">
                              <Input
                                id="title"
                                value={contentForm.title}
                                onChange={(e) => handleContentFormChange('title', e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white"
                                placeholder="Nome do filme/série/canal"
                              />
                              <Button
                                onClick={() => {}}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="type" className="text-gray-300">Tipo *</Label>
                            <select
                              id="type"
                              value={contentForm.type}
                              onChange={(e) => handleContentFormChange('type', e.target.value)}
                              className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2"
                            >
                              <option value="movie">Filme</option>
                              <option value="series">Série</option>
                              <option value="channel">Canal</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="category" className="text-gray-300">Categoria *</Label>
                            <select
                              id="category"
                              value={contentForm.category}
                              onChange={(e) => handleContentFormChange('category', e.target.value)}
                              className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2"
                            >
                              <option value="">Selecione uma categoria</option>
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* URLs e Mídia */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="videoUrl" className="text-gray-300">URL do Vídeo *</Label>
                            <Input
                              id="videoUrl"
                              value={contentForm.videoUrl}
                              onChange={(e) => handleContentFormChange('videoUrl', e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white"
                              placeholder="URL do arquivo de vídeo"
                            />
                          </div>

                          <div>
                            <Label htmlFor="trailerUrl" className="text-gray-300">URL do Trailer</Label>
                            <Input
                              id="trailerUrl"
                              value={contentForm.trailerUrl}
                              onChange={(e) => handleContentFormChange('trailerUrl', e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white"
                              placeholder="URL do trailer"
                            />
                          </div>

                          <div>
                            <Label htmlFor="posterUrl" className="text-gray-300">URL do Poster</Label>
                            <Input
                              id="posterUrl"
                              value={contentForm.posterUrl}
                              onChange={(e) => handleContentFormChange('posterUrl', e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white"
                              placeholder="URL da imagem do poster"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descrição */}
                      <div>
                        <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                        <textarea
                          id="description"
                          value={contentForm.description}
                          onChange={(e) => handleContentFormChange('description', e.target.value)}
                          className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2 h-32"
                          placeholder="Descrição do conteúdo"
                        />
                      </div>

                      {/* Metadados */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="year" className="text-gray-300">Ano</Label>
                          <Input
                            id="year"
                            type="number"
                            value={contentForm.year}
                            onChange={(e) => handleContentFormChange('year', e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="2024"
                          />
                        </div>

                        <div>
                          <Label htmlFor="duration" className="text-gray-300">Duração (min)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={contentForm.duration}
                            onChange={(e) => handleContentFormChange('duration', e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="120"
                          />
                        </div>

                        <div>
                          <Label htmlFor="rating" className="text-gray-300">Classificação</Label>
                          <Input
                            id="rating"
                            type="number"
                            step="0.1"
                            value={contentForm.rating}
                            onChange={(e) => handleContentFormChange('rating', e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="8.5"
                          />
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-700 text-white hover:bg-gray-800"
                          onClick={() => setContentForm({
                            title: '',
                            type: 'movie',
                            category: '',
                            genre: '',
                            year: '',
                            description: '',
                            videoUrl: '',
                            trailerUrl: '',
                            posterUrl: '',
                            backdropUrl: '',
                            duration: '',
                            rating: '',
                            cast: '',
                            director: '',
                            quality: 'HD'
                          })}
                        >
                          Limpar
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Lista de Conteúdo */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Video className="h-5 w-5 mr-2" />
                      Conteúdo Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Implementar lista de conteúdo recente */}
                      <p className="text-gray-400">Nenhum conteúdo adicionado recentemente.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Gerenciar Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Implementar gerenciamento de usuários */}
                  <p className="text-gray-400">Funcionalidade em desenvolvimento.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configurações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Implementar configurações do sistema */}
                  <p className="text-gray-400">Funcionalidade em desenvolvimento.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;

