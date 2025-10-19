package com.spotify.controllers;

import com.spotify.business.ResponseDTO;
import com.spotify.business.dto.MusicRequestDTO;
import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.business.security.StrictRateLimit;
import com.spotify.services.MusicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/musics")
@Tag(name = "Músicas", description = "Endpoints para gerenciamento de músicas")
public class MusicController {
    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @StrictRateLimit
    @Operation(
        summary = "Adicionar música",
        description = "Adiciona uma nova música para o usuário autenticado. A imagem deve ter dimensões de 640x640 pixels",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<MusicResponseDTO>> addMusic(
            @RequestParam("name") String name,
            @RequestParam("genre") String genre,
            @RequestParam("band") String band,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) {

        MusicRequestDTO requestDTO = new MusicRequestDTO();
        requestDTO.setName(name);
        requestDTO.setGenre(genre);
        requestDTO.setBand(band);

        MusicResponseDTO music = musicService.addMusic(requestDTO, image, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ResponseDTO.success(music, "Música adicionada com sucesso")
        );
    }

    @DeleteMapping("/{musicId}")
    @StrictRateLimit
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
        description = "Lista todas as músicas cadastradas no sistema (de todos os usuários) com paginação",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<Page<MusicResponseDTO>>> getAllMusics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        Page<MusicResponseDTO> musics = musicService.getAllMusics(authentication.getName(), page, size);
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

    @PutMapping(value = "/{musicId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @StrictRateLimit
    @Operation(
        summary = "Atualizar música",
        description = "Atualiza as informações de uma música existente. Apenas quem criou a música pode atualizá-la",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<MusicResponseDTO>> updateMusic(
            @PathVariable String musicId,
            @RequestParam("name") String name,
            @RequestParam("genre") String genre,
            @RequestParam("band") String band,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) {

        MusicRequestDTO requestDTO = new MusicRequestDTO();
        requestDTO.setName(name);
        requestDTO.setGenre(genre);
        requestDTO.setBand(band);

        MusicResponseDTO music = musicService.updateMusic(musicId, requestDTO, image, authentication.getName());
        return ResponseEntity.ok(
            ResponseDTO.success(music, "Música atualizada com sucesso")
        );
    }

    @PostMapping("/search-by-lyrics")
    @StrictRateLimit
    @Operation(
        summary = "Adicionar música por letra",
        description = "Busca no YouTube usando um trecho de letra e adiciona a primeira música encontrada",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<MusicResponseDTO>> addMusicByLyrics(
            @RequestParam("lyrics") String lyrics,
            @RequestParam("genre") String genre,
            Authentication authentication) {

        MusicResponseDTO music = musicService.addMusicByLyrics(lyrics, genre, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ResponseDTO.success(music, "Música adicionada com sucesso")
        );
    }

    @PostMapping("/search-lyrics-options")
    @Operation(
        summary = "Buscar opções de músicas por letra",
        description = "Busca no YouTube usando um trecho de letra e retorna as 3 primeiras opções",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<List<Map<String, String>>>> searchLyricsOptions(
            @RequestParam("lyrics") String lyrics,
            Authentication authentication) {
        List<Map<String, String>> options = musicService.searchMusicOptionsByLyrics(lyrics);
        return ResponseEntity.ok(
            ResponseDTO.success(options, "Opções encontradas")
        );
    }

    @PostMapping("/add-selected-music")
    @StrictRateLimit
    @Operation(
        summary = "Adicionar música selecionada",
        description = "Adiciona uma música baseada nos dados do YouTube já selecionados",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<MusicResponseDTO>> addSelectedMusic(
            @RequestParam("videoId") String videoId,
            @RequestParam("thumbnailUrl") String thumbnailUrl,
            @RequestParam("musicName") String musicName,
            @RequestParam("bandName") String bandName,
            @RequestParam(value = "genre", required = false) String genre,
            Authentication authentication) {

        MusicResponseDTO music = musicService.addSelectedMusic(
            videoId, thumbnailUrl, musicName, bandName, genre, authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ResponseDTO.success(music, "Música adicionada com sucesso")
        );
    }
}
