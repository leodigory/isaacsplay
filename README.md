IsaacPlay - Streaming Pessoal do Google Drive
IsaacPlay é um aplicativo web desenvolvido com React e Vite que permite aos usuários criar um serviço de streaming pessoal a partir do conteúdo de vídeo armazenado em seu Google Drive. O projeto foi projetado para ser intuitivo e fácil de usar, com navegação otimizada para TVs através de teclado direcional.

Visão Geral
O objetivo principal deste projeto é fornecer uma plataforma para que os usuários possam acessar e reproduzir seus vídeos armazenados no Google Drive diretamente em suas TVs, sem a necessidade de baixar os arquivos. A funcionalidade de login com teclado direcional garante uma experiência de usuário agradável e acessível.

Funcionalidades
Login com Google Drive: Permite que os usuários conectem suas contas do Google Drive para acessar seus vídeos.
Navegação por Teclado Direcional: Interface otimizada para uso em TVs, com navegação através das setas do teclado.
Streaming de Vídeo: Reprodução direta de vídeos armazenados no Google Drive, sem necessidade de download.
Interface Amigável: Design limpo e intuitivo para facilitar a navegação e o uso.
Estrutura do Projeto
isaacplay/
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── MovieCard/
│   │   │   ├── MovieCard.css
│   │   │   └── MovieCard.jsx
│   │   ├── MovieDetail/
│   │   │   ├── MovieDetail.css
│   │   │   └── MovieDetail.jsx
│   │   ├── MovieGrid/
│   │   │   ├── MovieGrid.css
│   │   │   └── MovieGrid.jsx
│   │   ├── Profile/
│   │   │   ├── AddProfileModal.css
│   │   │   ├── AddProfileModal.jsx
│   │   │   ├── Profile.css
│   │   │   └── Profile.jsx
│   │   ├── Sidebar/
│   │   ├── Keyboard.css
│   │   ├── Keyboard.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── ...
│   ├── config/
│   │   ├── auth.js
│   │   ├── firebase.js
│   │   └── tmdb.js
│   ├── hooks/
│   │   ├── useTVNavigation.js
│   │   └── useUser.jsx
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.css
│   │   │   └── Home.jsx
│   │   ├── Profiles/
│   │   │   ├── Profiles.css
│   │   │   └── Profiles.jsx
│   │   ├── Login/
│   │   │   └── Login.jsx
│   ├── App.css
│   └── App.jsx
└── ...
src/assets: Contém arquivos estáticos, como imagens e ícones.
src/components: Armazena componentes React reutilizáveis, como MovieCard, MovieDetail, MovieGrid, Profile, Sidebar, Keyboard e PrivateRoute.
src/config: Contém arquivos de configuração para autenticação (auth.js), Firebase (firebase.js) e TMDb API (tmdb.js).
src/hooks: Armazena hooks React personalizados, como useTVNavigation e useUser, para lógica reutilizável.
src/pages: Contém as páginas principais do aplicativo, como Home, Profiles e Login.
src/App.css e src/App.jsx: Arquivos principais do aplicativo.
Tecnologias Utilizadas
React: Biblioteca JavaScript para construção de interfaces de usuário.
Vite: Ferramenta de build extremamente rápida para desenvolvimento web moderno.   
Firebase: Plataforma de desenvolvimento de aplicativos móveis e web com serviços de autenticação e banco de dados.
Google Drive API: API para acesso e gerenciamento de arquivos no Google Drive.
TMDb API: API para acesso a informações de filmes e séries (opcional, para enriquecer a experiência do usuário).
Como Executar o Projeto
Clone o repositório:

Bash

git clone https://github.com/leodigory/isaacsplay.git
Instale as dependências:

Bash

npm install
# ou
yarn install
Configure as variáveis de ambiente:

Crie um arquivo .env na raiz do projeto.
Adicione as variáveis de ambiente necessárias, como chaves de API do Google Drive, Firebase, etc.
Execute o aplicativo:

Bash

npm run dev
# ou
yarn dev
Abra o navegador em http://localhost:3000 (ou a porta configurada).

Contribuição
Contribuições são bem-vindas! Se você deseja contribuir, siga estas etapas:

Faça um fork do repositório.
Crie uma branch para sua feature ou correção de bug: git checkout -b minha-feature   
Faça as alterações e commit: git commit -m 'Adiciona minha feature'   
Envie para o branch original: git push origin minha-feature
Abra um pull request.
Licença

Autor
leodigory
