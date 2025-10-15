package com.spotify.business.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para registro de novo usuário")
public class UserRegisterDTO {
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100)
    @Schema(description = "Nome completo do usuário", example = "Teste", maxLength = 100)
    private String name;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    @Size(max = 100)
    @Schema(description = "Email do usuário", example = "teste@gmail.com", maxLength = 100)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, max = 255)
    @Schema(description = "Senha do usuário (mínimo 6 caracteres)", example = "123456", minLength = 6, maxLength = 255)
    private String password;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
