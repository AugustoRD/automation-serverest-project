# Automation ServeRest API

Este projeto consiste em uma suíte de automação de testes de API desenvolvida com **Playwright** e **TypeScript**. O objetivo principal é validar fluxos, contratos e regras de negócio de uma aplicação de e-commerce utilizando o **ServeRest** como alvo de testes.

---

## O que é o ServeRest?

O **[ServeRest](https://serverest.dev/)** é uma API REST gratuita que simula um e-commerce de forma completa (oferecendo endpoints de cadastro de usuários, autenticação/login, gerenciamento de produtos e carrinhos de compras). 

---

## Tecnologias Utilizadas

*   [Playwright](https://playwright.dev/) (API Testing Context)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Docker](https://www.docker.com/) & Dockerfile (Padronização de ambiente)
*   [GitHub Actions](https://github.com/features/actions) (CI/CD)

---

## Estrutura do Projeto

```text
automation-serverest-project/
├── .github/
│   └── workflows/
│       └── playwright.yml     # Pipeline de CI/CD com Docker
├── src/
│   ├── builders/              # Padrão Builder para criação dinâmica de dados de massa
│   ├── controllers/           # Mapeamento das requisições por rota da API
│   ├── helpers/               # Funções auxiliares e configuração de ambiente/setup
│   └── models/                # Interfaces, contratos e tipagens (TypeScript Models)
├── tests/
│   └── api/                   # Especificações e cenários de testes de API (specs)
├── playwright.api.config.ts   # Configurações do Playwright voltadas para testes de API
├── playwright.config.ts       # Configurações gerais do Playwright
├── Dockerfile                 # Receita da imagem Docker baseada na Microsoft
├── .dockerignore              # Arquivos ignorados durante o build do Docker
├── .gitignore                 # Arquivos ignorados pelo controle de versão Git
├── package.json               # Dependências e scripts do projeto
└── README.md                  # Documentação do repositório
```

---

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (Versão 20 ou superior)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Opcional, caso deseje executar os testes via container)

---

## Instalação e Execução Local

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/AugustoRD/automation-serverest-project.git
   cd automation-serverest-project
   ```

2. **Instale as dependências:**
   ```bash
   npm ci
   ```

3. **Execute os testes apontando para a API de homologação:**
   ```bash
   BASE_URL=[https://serverest.dev](https://serverest.dev) npm run test:api
   ```

4. **Visualize o relatório HTML local:**
   ```bash
   npx playwright show-report
   ```

---

## Executando com Docker

Para isolar o ambiente e rodar os testes de dentro de um container Docker utilizando a imagem oficial:

1. **Construir a imagem:**
   ```bash
   docker build -t testes-api-serverest .
   ```

2. **Rodar o container injetando a URL base:**
   ```bash
   docker run -e BASE_URL=[https://serverest.dev](https://serverest.dev) testes-api-serverest
   ```

---

## Integração Contínua (CI/CD)

O repositório conta com uma pipeline automatizada no **GitHub Actions** (`.github/workflows/playwright.yml`). A cada `push` na branch `dev` ou abertura de `pull_request` para a `main`, a esteira se encarrega de construir o container Docker, rodar todos os testes de forma isolada na nuvem e gerar o relatório HTML como um artefato para download.
