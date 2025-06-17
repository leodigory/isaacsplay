# IsaacPlay

IsaacPlay é uma plataforma de streaming de vídeo desenvolvida com React e Firebase, oferecendo uma experiência moderna e intuitiva para os usuários.

## Funcionalidades

- Autenticação de usuários
- Navegação por categorias
- Busca de conteúdo
- Reprodução de vídeos
- Lista pessoal de favoritos
- Histórico de visualização
- Perfil de usuário
- Configurações personalizadas

## Tecnologias Utilizadas

- React
- Firebase (Authentication, Firestore, Storage)
- React Router
- Tailwind CSS
- Lucide Icons

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no Firebase

## Configuração

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/isaacplay.git
cd isaacplay
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
REACT_APP_FIREBASE_API_KEY=sua-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=seu-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=seu-app-id
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
yarn start
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── config/        # Configurações do Firebase
  ├── hooks/         # Hooks personalizados
  ├── pages/         # Páginas da aplicação
  ├── services/      # Serviços (Firestore, etc)
  ├── App.jsx        # Componente principal
  └── index.js       # Ponto de entrada
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Seu Nome - [@seu-twitter](https://twitter.com/seu-twitter) - seu-email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/isaacplay](https://github.com/seu-usuario/isaacplay) 