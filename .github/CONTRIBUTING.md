# Diretrizes de Contribuição

Obrigado por considerar contribuir com o IsaacPlay! Este documento contém diretrizes e instruções para contribuir com o projeto.

## Como Contribuir

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Processo de Pull Request

1. Atualize o README.md com detalhes das mudanças na API, se aplicável
2. Atualize a documentação com detalhes de qualquer nova variável de ambiente, expostas portas, comandos úteis, etc.
3. O PR será mesclado assim que você tiver a aprovação de pelo menos um outro desenvolvedor

## Ambiente de Desenvolvimento

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` baseado no `.env.example`
4. Inicie o servidor de desenvolvimento: `npm start`

## Padrões de Código

* Use 2 espaços para indentação
* Use aspas simples para strings
* Use ponto e vírgula no final das declarações
* Use camelCase para nomes de variáveis e funções
* Use PascalCase para nomes de classes e componentes
* Use UPPER_CASE para constantes
* Use nomes descritivos para variáveis e funções
* Comente seu código quando necessário
* Mantenha as funções pequenas e focadas
* Evite duplicação de código
* Siga o princípio DRY (Don't Repeat Yourself)
* Siga o princípio KISS (Keep It Simple, Stupid)
* Siga o princípio YAGNI (You Aren't Gonna Need It)

## Testes

* Escreva testes para novas funcionalidades
* Mantenha a cobertura de testes acima de 80%
* Execute os testes antes de enviar um PR: `npm test`

## Documentação

* Mantenha a documentação atualizada
* Use JSDoc para documentar funções e classes
* Inclua exemplos de uso quando apropriado
* Mantenha o README.md atualizado

## Commits

* Use mensagens de commit descritivas
* Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/)
* Referencie issues e pull requests quando apropriado

## Issues

* Use o template de issue apropriado
* Forneça detalhes suficientes para reproduzir o problema
* Inclua screenshots quando apropriado
* Verifique se o problema já foi reportado

## Código de Conduta

Por favor, leia e siga nosso [Código de Conduta](CODE_OF_CONDUCT.md).

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [Licença MIT](LICENSE). 