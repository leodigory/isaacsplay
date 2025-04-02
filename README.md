# IsaacPlay - Streaming Pessoal do Google Drive

IsaacPlay é um aplicativo web desenvolvido com React e Vite que permite aos usuários criar um serviço de streaming pessoal a partir do conteúdo de vídeo armazenado em seu Google Drive. O projeto foi projetado para ser intuitivo e fácil de usar, com navegação otimizada para TVs através de teclado direcional.

## Visão Geral

O objetivo principal deste projeto é fornecer uma plataforma para que os usuários possam acessar e reproduzir seus vídeos armazenados no Google Drive diretamente em suas TVs, sem a necessidade de baixar os arquivos. A funcionalidade de login com teclado direcional garante uma experiência de usuário agradável e acessível.

## Funcionalidades

* **Login com Google Drive**: Permite que os usuários conectem suas contas do Google Drive para acessar seus vídeos.
* **Navegação por Teclado Direcional**: Interface otimizada para uso em TVs, com navegação através das setas do teclado.
* **Streaming de Vídeo**: Reprodução direta de vídeos armazenados no Google Drive, sem necessidade de download.
* **Interface Amigável**: Design limpo e intuitivo para facilitar a navegação e o uso.

## Estrutura do Projeto

![image](https://github.com/user-attachments/assets/ddca54f7-665e-45fa-8e6d-11edc612dc32)

* **`src/assets`**: Contém arquivos estáticos, como imagens e ícones.
* **`src/components`**: Armazena componentes React reutilizáveis, como `MovieCard`, `MovieDetail`, `MovieGrid`, `Profile`, `Sidebar`, `Keyboard` e `PrivateRoute`.
* **`src/config`**: Contém arquivos de configuração para autenticação (`auth.js`), Firebase (`firebase.js`) e TMDb API (`tmdb.js`).
* **`src/hooks`**: Armazena hooks React personalizados, como `useTVNavigation` e `useUser`, para lógica reutilizável.
* **`src/pages`**: Contém as páginas principais do aplicativo, como `Home`, `Profiles` e `Login`.
* **`src/App.css` e `src/App.jsx`**: Arquivos principais do aplicativo.

## Tecnologias Utilizadas

* **React**: Biblioteca JavaScript para construção de interfaces de usuário.
* **Vite**: Ferramenta de build extremamente rápida para desenvolvimento web moderno.
* **Firebase**: Plataforma de desenvolvimento de aplicativos móveis e web com serviços de autenticação e banco de dados.
* **Google Drive API**: API para acesso e gerenciamento de arquivos no Google Drive.
* **TMDb API**: API para acesso a informações de filmes e séries (opcional, para enriquecer a experiência do usuário).

## Como Executar o Projeto

1. Clone o repositório:

    ```bash
    git clone [https://github.com/leodigory/isaacsplay.git](https://github.com/leodigory/isaacsplay.git)
    ```

2. Instale as dependências:

    ```bash
    npm install
    # ou
    yarn install
    ```

3. Configure as variáveis de ambiente:

    * Crie um arquivo `.env` na raiz do projeto.
    * Adicione as variáveis de ambiente necessárias, como chaves de API do Google Drive, Firebase, etc.

4. Execute o aplicativo:

    ```bash
    npm run dev
    # ou
    yarn dev
    ```

5. Abra o navegador em `http://localhost:3000` (ou a porta configurada).

## Contribuição

Contribuições são bem-vindas! Se você deseja contribuir, siga estas etapas:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature ou correção de bug: `git checkout -b minha-feature`
3. Faça as alterações e commit: `git commit -m 'Adiciona minha feature'`
4. Envie para o branch original: `git push origin minha-feature`
5. Abra um pull request.

## Licença



## Autor

leodigory
