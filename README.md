# Wild Music API

Uma aplicação full-stack moderna para gerenciamento de músicas com integração ao YouTube, sistema de playlists colaborativas e curtidas.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Features](#features)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

## Sobre o Projeto

Wild Music é uma plataforma completa de gerenciamento de músicas que permite aos usuários criar bibliotecas musicais, organizar playlists, colaborar com outros usuários e ouvir previews das músicas através da integração com o YouTube.

## Features

### Gerenciamento de Músicas
- Adicionar músicas com nome, banda e gênero
- Upload de capas personalizadas (640x640px)
- Integração automática com YouTube API para buscar vídeos
- Busca de músicas por letra
- Preview de 30 segundos das músicas
- Sistema de curtidas (likes)
- Edição e exclusão de músicas

### Playlists
- Criar playlists públicas ou privadas
- Adicionar/remover músicas das playlists
- Upload de capas para playlists
- Sistema de colaboradores com convites
- Gerenciar convites (aceitar/rejeitar)
- Colaboradores podem editar playlists

### Perfil de Usuário
- Autenticação JWT
- Gerenciamento de perfil com avatar
- Alteração de senha
- Reset de senha por email
- Visualizar músicas curtidas

### Segurança
- Autenticação JWT com tokens de 24h
- Rate limiting em dois níveis (100 e 20 req/min)
- Criptografia de senhas com BCrypt
- CORS configurado
- Validação de dados com Bean Validation

### Performance
- Cache Redis para músicas e likes
- Paginação em listagens
- Lazy loading de entidades JPA
- Batch inserts/updates

## Tecnologias

### Backend
- Java 17
- Spring Boot 3.5.6
- Spring Security
- Spring Data JPA
- PostgreSQL
- Redis
- Flyway
- JWT (jjwt)
- ImageKit
- YouTube API
- Bucket4j
- Swagger/OpenAPI
- Lombok
- JavaMailSender

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- TanStack Query (React Query)
- Axios
- Zod
- Lucide React
- React Hot Toast

## Pré-requisitos

- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Gradle 8+ (wrapper incluído)

## Como Executar

### Backend

1. Configure o banco de dados PostgreSQL e o Redis conforme as variáveis no `application.yml`.
2. Ajuste as secrets de JWT e do sistema no arquivo `application.yml`.
3. Execute o projeto com:

```bash
./gradlew bootRun
```

O backend estará disponível em: **http://localhost:8080**

### Frontend

1. Navegue até a pasta do frontend:
```bash
cd spotify-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

### Documentação da API

Acesse a documentação Swagger em: **http://localhost:8080/swagger-ui/index.html**

## Estrutura do Projeto

```
Spotify/
├── src/main/java/com/spotify/
│   ├── business/
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── mapper/           # Mapeadores de entidades
│   │   └── security/         # Segurança e JWT
│   ├── config/               # Configurações do Spring
│   ├── controllers/          # Controllers REST
│   ├── entities/             # Entidades JPA
│   ├── exceptions/           # Exceções customizadas
│   ├── repositories/         # Repositories JPA
│   ├── services/             # Lógica de negócio
│   └── utils/                # Utilitários
├── src/main/resources/
│   ├── application.yml       # Configurações da aplicação
│   └── db/migration/         # Migrations Flyway
└── spotify-frontend/
    ├── src/
    │   ├── components/       # Componentes React
    │   ├── contexts/         # Context API
    │   ├── hooks/            # Custom hooks
    │   ├── pages/            # Páginas da aplicação
    │   ├── services/         # Serviços API
    │   ├── types/            # Tipos TypeScript
    │   └── validators/       # Schemas Zod
    └── public/               # Assets estáticos
```

## API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/users/register` | Registrar novo usuário |
| POST | `/users/auth` | Autenticar usuário |
| POST | `/users/password-reset/request` | Solicitar reset de senha |
| POST | `/users/password-reset/confirm` | Confirmar reset de senha |

### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/users/profile` | Obter perfil do usuário | Sim |
| PUT | `/users/profile` | Atualizar perfil | Sim |
| POST | `/users/change-password` | Alterar senha | Sim |
| DELETE | `/users/{id}` | Deletar usuário | Sim |

### Músicas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/musics` | Listar todas as músicas (paginado) | Sim |
| GET | `/musics/{id}` | Obter música por ID | Sim |
| POST | `/musics` | Adicionar nova música | Sim |
| PUT | `/musics/{id}` | Atualizar música | Sim |
| DELETE | `/musics/{id}` | Deletar música | Sim |
| GET | `/musics/my-musics` | Listar músicas do usuário | Sim |
| POST | `/musics/search-by-lyrics` | Buscar música por letra | Sim |

### Playlists

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/playlists/my-playlists` | Listar playlists do usuário | Sim |
| GET | `/playlists/{id}` | Obter playlist por ID | Sim |
| POST | `/playlists` | Criar playlist | Sim |
| PUT | `/playlists/{id}` | Atualizar playlist | Sim |
| DELETE | `/playlists/{id}` | Deletar playlist | Sim |
| POST | `/playlists/{id}/musics` | Adicionar música à playlist | Sim |
| DELETE | `/playlists/{id}/musics/{musicId}` | Remover música da playlist | Sim |
| GET | `/playlists/public` | Listar playlists públicas | Sim |

### Colaboradores

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/playlists/{id}/collaborators/invite` | Convidar colaborador | Sim |
| GET | `/playlists/{id}/collaborators` | Listar colaboradores | Sim |
| DELETE | `/playlists/{id}/collaborators/{collaboratorId}` | Remover colaborador | Sim |
| GET | `/playlists/collaborators/invites` | Listar meus convites | Sim |
| POST | `/playlists/collaborators/invites/{id}/accept` | Aceitar convite | Sim |
| POST | `/playlists/collaborators/invites/{id}/reject` | Rejeitar convite | Sim |

### Likes

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/likes/{musicId}` | Curtir música | Sim |
| DELETE | `/likes/{musicId}` | Descurtir música | Sim |
| GET | `/likes/my-likes` | Listar músicas curtidas | Sim |
| GET | `/likes/{musicId}/status` | Verificar se música está curtida | Sim |

## Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
  data:
    redis:
      host: localhost
      port: 6379

jwt:
  secret: ${JWT_SECRET}

youtube:
  api:
    key: ${YOUTUBE_API_KEY}

imagekit:
  url-endpoint: ${IMAGEKIT_URL_ENDPOINT}
  private-key: ${IMAGEKIT_PRIVATE_KEY}
  public-key: ${IMAGEKIT_PUBLIC_KEY}

spring:
  mail:
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
```

## Licença

Este projeto está sob a licença MIT.

## Autor

**Arthur Paganoti**
- Email: paganotiarthur@gmail.com
