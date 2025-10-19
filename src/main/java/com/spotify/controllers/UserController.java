package com.spotify.controllers;

import com.spotify.business.dto.UserRegisterDTO;
import com.spotify.business.ResponseDTO;
import com.spotify.services.UserService;
import com.spotify.business.dto.LoginRequestDTO;
import com.spotify.business.dto.LoginResponseDTO;
import com.spotify.business.dto.PasswordResetRequestDTO;
import com.spotify.business.dto.PasswordResetConfirmDTO;
import com.spotify.services.AuthService;
import com.spotify.services.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários")
public class UserController {
    private final UserService userService;
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public UserController(UserService userService, AuthService authService, PasswordResetService passwordResetService) {
        this.userService = userService;
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria um novo usuário no sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuário registrado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Erro de validação ou email já cadastrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public ResponseEntity<ResponseDTO<String>> register(@Valid @RequestBody UserRegisterDTO dto) {
        ResponseDTO<String> response = userService.register(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth")
    @Operation(summary = "Autenticação do usuário", description = "Autentica o usuário e retorna um token JWT em caso de sucesso.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Requisição inválida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Credenciais inválidas",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        return authService.login(loginRequest);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Deletar usuário",
        description = "Remove um usuário do sistema. Requer autenticação JWT.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuário deletado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Token JWT ausente ou inválido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "403", description = "Operação não permitida. Você só pode deletar o próprio usuário.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public ResponseEntity<ResponseDTO<Object>> deleteUser(
            @PathVariable String id,
            Authentication authentication) {
        ResponseDTO<Object> response = userService.deleteUser(Long.valueOf(id), authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset/request")
    @Operation(summary = "Solicitar reset de senha", description = "Envia um email com token para reset de senha")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email de reset enviado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Erro de validação",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public ResponseEntity<ResponseDTO<String>> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDTO request) {
        ResponseDTO<String> response = passwordResetService.requestPasswordReset(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset/confirm")
    @Operation(summary = "Confirmar reset de senha", description = "Redefine a senha do usuário usando o token recebido por email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Token inválido, expirado ou já utilizado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public ResponseEntity<ResponseDTO<String>> resetPassword(@Valid @RequestBody PasswordResetConfirmDTO request) {
        ResponseDTO<String> response = passwordResetService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}
