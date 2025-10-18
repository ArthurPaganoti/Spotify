package com.spotify.controllers;

import com.spotify.business.ResponseDTO;
import com.spotify.business.dto.MusicRequestDTO;
import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.services.MusicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/musics")
@Tag(name = "Músicas", description = "Endpoints para gerenciamento de músicas")
public class MusicController {
    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @PostMapping
    @Operation(
        summary = "Adicionar música",
        description = "Adiciona uma nova música para o usuário autenticado",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<MusicResponseDTO>> addMusic(
            @Valid @RequestBody MusicRequestDTO request,
            Authentication authentication) {
        MusicResponseDTO music = musicService.addMusic(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ResponseDTO.success(music, "Música adicionada com sucesso")
        );
    }

    @DeleteMapping("/{musicId}")
    @Operation(
        summary = "Deletar música",
        description = "Remove uma música do usuário autenticado",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<Void>> deleteMusic(
            @PathVariable String musicId,
            Authentication authentication) {
        musicService.deleteMusic(musicId, authentication.getName());
        return ResponseEntity.ok(ResponseDTO.success("Música deletada com sucesso"));
    }

    @GetMapping
    @Operation(
        summary = "Listar todas as músicas",
        description = "Lista todas as músicas cadastradas no sistema (de todos os usuários)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<List<MusicResponseDTO>>> getAllMusics(
            Authentication authentication) {
        List<MusicResponseDTO> musics = musicService.getAllMusics(authentication.getName());
        return ResponseEntity.ok(
            ResponseDTO.success(musics, "Músicas recuperadas com sucesso")
        );
    }

    @GetMapping("/{musicId}")
    @Operation(
        summary = "Buscar música por ID",
        description = "Busca uma música específica pelo ID",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<MusicResponseDTO>> getMusicById(
            @PathVariable String musicId,
            Authentication authentication) {
        MusicResponseDTO music = musicService.getMusicById(musicId, authentication.getName());
        return ResponseEntity.ok(
            ResponseDTO.success(music, "Música encontrada")
        );
    }
}
