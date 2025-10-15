package com.spotify.controllers;

import com.spotify.business.dto.UserRegisterDTO;
import com.spotify.business.ResponseDTO;
import com.spotify.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
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
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
