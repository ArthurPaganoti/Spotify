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

### POST /users/password-reset/request
Solicita o envio de um token de reset de senha para o e-mail do usuário.

Exemplo de requisição:
```json
{
  "email": "joao@email.com"
}
```
Exemplo de resposta (sucesso):
```json
{
  "success": true,
  "message": "Email de reset de senha enviado com sucesso"
}
```
Exemplo de resposta (erro):
```json
{
  "success": false,
  "code": "USER_NOT_FOUND",
  "message": "Usuário não encontrado com o email fornecido"
}
```

---

### POST /users/password-reset/confirm
Confirma o reset de senha usando o token enviado por e-mail.

Exemplo de requisição:
```json
{
  "token": "TOKEN_RECEBIDO_NO_EMAIL",
  "newPassword": "novaSenhaSegura"
}
```
Exemplo de resposta (sucesso):
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```
Exemplo de resposta (token inválido, expirado ou já utilizado):
```json
{
  "success": false,
  "code": "INVALID_TOKEN",
  "message": "Token inválido"
}
```
Exemplo de resposta (nova senha igual à anterior):
```json
{
  "success": false,
  "code": "BUSINESS_ERROR",
  "message": "A nova senha deve ser diferente da senha anterior"
}
```

---

## Observações
- Novas funcionalidades serão adicionadas em breve.
- Para mais detalhes, consulte a documentação Swagger em: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
