package com.spotify.controllers;

import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.business.ResponseDTO;
import com.spotify.services.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/likes")
@Tag(name = "Curtidas", description = "Endpoints para gerenciamento de curtidas de músicas")
public class LikeController {
    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{musicId}")
    @Operation(
        summary = "Curtir/Descurtir música",
        description = "Alterna o estado de curtida de uma música. Se já estiver curtida, remove a curtida. Se não estiver curtida, adiciona a curtida.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Curtida atualizada com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Token JWT ausente ou inválido",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Música não encontrada",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public ResponseEntity<ResponseDTO<String>> toggleLike(
            @PathVariable String musicId,
            Authentication authentication) {

        likeService.toggleLike(musicId, authentication.getName());
        return ResponseEntity.ok(ResponseDTO.success("Like atualizado com sucesso"));
    }

    @GetMapping("/{musicId}/check")
    @Operation(
        summary = "Verificar se música está curtida",
        description = "Verifica se o usuário autenticado curtiu uma música específica",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status de curtida retornado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Token JWT ausente ou inválido",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Música ou usuário não encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public ResponseEntity<ResponseDTO<Boolean>> isLiked(
            @PathVariable String musicId,
            Authentication authentication) {
        boolean isLiked = likeService.isLiked(musicId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(isLiked, null));
    }

    @GetMapping
    @Operation(
        summary = "Listar músicas curtidas",
        description = "Retorna todas as músicas curtidas pelo usuário autenticado com paginação, ordenadas por data de curtida (mais recentes primeiro)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Músicas curtidas retornadas com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Token JWT ausente ou inválido",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResponseDTO.class)))
    })
    public ResponseEntity<ResponseDTO<Page<MusicResponseDTO>>> getLikedMusics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        Page<MusicResponseDTO> likedMusics = likeService.getLikedMusics(authentication.getName(), page, size);
        return ResponseEntity.ok(
            ResponseDTO.success(likedMusics, "Músicas curtidas recuperadas com sucesso")
        );
    }
}
