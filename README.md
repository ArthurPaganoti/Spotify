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

### DELETE /users/{id}
Remove um usuário do sistema. **Requer autenticação JWT.** O usuário só pode deletar o próprio usuário.

Exemplo de requisição:
```
DELETE /users/1
Authorization: Bearer <seu_token_jwt>
```
Exemplo de resposta (sucesso):
```json
{
  "success": true,
  "message": "Usuário deletado com sucesso",
  "data": null
}
```
Exemplo de resposta (erro - usuário não encontrado):
```json
{
  "success": false,
  "message": "Usuário não encontrado",
  "data": null
}
```
Exemplo de resposta (erro - token ausente ou inválido):
```json
{
  "success": false,
  "code": "INVALID_CREDENTIALS",
  "message": "Email ou senha inválidos"
}
```
Exemplo de resposta (erro - operação não permitida):
```json
{
  "success": false,
  "code": "FORBIDDEN",
  "message": "Operação não permitida. Você só pode deletar o próprio usuário."
}
```

---

## Observações
- Novas funcionalidades serão adicionadas em breve.
- Para mais detalhes, consulte a documentação Swagger em: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
