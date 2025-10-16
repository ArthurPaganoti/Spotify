# Spotify API

Este projeto é uma API REST.

## Tecnologias
- Java
- Spring Boot
- PostgreSQL
- Redis
- Flyway
- JWT

## Como executar
1. Configure o banco de dados PostgreSQL e o Redis conforme as variáveis no `application.yml`.
2. Ajuste as secrets de JWT e do sistema no arquivo `application.yml`.
3. Execute o projeto com:

```bash
./gradlew bootRun
```

## Endpoints

### POST /users/register
Registra um novo usuário.

Exemplo de requisição:
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```
Exemplo de resposta:
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": null
}
```

---

### POST /users/auth
Autentica o usuário e retorna um token JWT.

Exemplo de requisição:
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```
Exemplo de resposta:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

---

## Observações
- Novas funcionalidades serão adicionadas em breve.
- Para mais detalhes, consulte a documentação Swagger em: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
