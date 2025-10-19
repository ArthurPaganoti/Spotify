package com.spotify.controllers;

import com.spotify.business.ResponseDTO;
import com.spotify.business.dto.*;
import com.spotify.services.PlaylistService;
import com.spotify.services.PlaylistCollaboratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/playlists")
@Tag(name = "Playlists", description = "Endpoints para gerenciamento de playlists")
public class PlaylistController {

    private final PlaylistService playlistService;
    private final PlaylistCollaboratorService collaboratorService;

    public PlaylistController(PlaylistService playlistService,
                             PlaylistCollaboratorService collaboratorService) {
        this.playlistService = playlistService;
        this.collaboratorService = collaboratorService;
    }

    @PostMapping
    @Operation(
        summary = "Criar playlist",
        description = "Cria uma nova playlist para o usuário autenticado",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<PlaylistDTO>> createPlaylist(
            @Valid @RequestBody CreatePlaylistRequest request,
            Authentication authentication) {
        
        PlaylistDTO playlist = playlistService.createPlaylist(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseDTO<>(playlist, "Playlist criada com sucesso"));
    }

    @PutMapping("/{playlistId}")
    @Operation(
        summary = "Atualizar playlist",
        description = "Atualiza uma playlist existente",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<PlaylistDTO>> updatePlaylist(
            @PathVariable Long playlistId,
            @Valid @RequestBody UpdatePlaylistRequest request,
            Authentication authentication) {
        
        PlaylistDTO playlist = playlistService.updatePlaylist(playlistId, request, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(playlist, "Playlist atualizada com sucesso"));
    }

    @DeleteMapping("/{playlistId}")
    @Operation(
        summary = "Deletar playlist",
        description = "Deleta uma playlist existente",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<Void>> deletePlaylist(
            @PathVariable Long playlistId,
            Authentication authentication) {
        
        playlistService.deletePlaylist(playlistId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(null, "Playlist deletada com sucesso"));
    }

    @GetMapping("/my-playlists")
    @Operation(
        summary = "Listar minhas playlists",
        description = "Lista todas as playlists do usuário autenticado",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<List<PlaylistDTO>>> getMyPlaylists(
            Authentication authentication) {
        
        List<PlaylistDTO> playlists = playlistService.getMyPlaylists(authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(playlists, "Playlists recuperadas com sucesso"));
    }

    @GetMapping("/public")
    @Operation(
        summary = "Listar playlists públicas",
        description = "Lista todas as playlists públicas"
    )
    public ResponseEntity<ResponseDTO<List<PlaylistDTO>>> getAllPublicPlaylists() {
        List<PlaylistDTO> playlists = playlistService.getAllPublicPlaylists();
        return ResponseEntity.ok(new ResponseDTO<>(playlists, "Playlists públicas recuperadas com sucesso"));
    }

    @GetMapping
    @Operation(
        summary = "Listar playlists acessíveis",
        description = "Lista todas as playlists públicas e as privadas do usuário autenticado",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<List<PlaylistDTO>>> getAllAccessiblePlaylists(
            Authentication authentication) {
        
        List<PlaylistDTO> playlists = playlistService.getAllAccessiblePlaylists(authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(playlists, "Playlists recuperadas com sucesso"));
    }

    @GetMapping("/{playlistId}")
    @Operation(
        summary = "Buscar playlist por ID",
        description = "Busca uma playlist específica com suas músicas",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<PlaylistWithMusicsDTO>> getPlaylistById(
            @PathVariable Long playlistId,
            Authentication authentication) {
        
        PlaylistWithMusicsDTO playlist = playlistService.getPlaylistById(playlistId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(playlist, "Playlist recuperada com sucesso"));
    }

    @PostMapping("/{playlistId}/musics")
    @Operation(
        summary = "Adicionar música à playlist",
        description = "Adiciona uma música à playlist especificada",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<Void>> addMusicToPlaylist(
            @PathVariable Long playlistId,
            @Valid @RequestBody AddMusicToPlaylistRequest request,
            Authentication authentication) {
        
        playlistService.addMusicToPlaylist(playlistId, request, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(null, "Música adicionada à playlist com sucesso"));
    }

    @PostMapping(value = "/{playlistId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Upload de imagem da playlist",
        description = "Faz upload de uma imagem para a playlist",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<PlaylistDTO>> uploadPlaylistImage(
            @PathVariable Long playlistId,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        PlaylistDTO playlist = playlistService.updatePlaylistImage(playlistId, image, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(playlist, "Imagem da playlist atualizada com sucesso"));
    }

    @DeleteMapping("/{playlistId}/musics/{musicId}")
    @Operation(
        summary = "Remover música da playlist",
        description = "Remove uma música da playlist especificada",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<Void>> removeMusicFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable String musicId,
            Authentication authentication) {
        
        playlistService.removeMusicFromPlaylist(playlistId, musicId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(null, "Música removida da playlist com sucesso"));
    }

    @PostMapping("/{playlistId}/collaborators")
    @Operation(
        summary = "Convidar colaborador",
        description = "Convida um usuário para ser colaborador da playlist",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<CollaboratorDTO>> inviteCollaborator(
            @PathVariable Long playlistId,
            @Valid @RequestBody InviteCollaboratorRequest request,
            Authentication authentication) {

        CollaboratorDTO collaborator = collaboratorService.inviteCollaborator(
            playlistId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseDTO<>(collaborator, "Convite enviado com sucesso"));
    }

    @GetMapping("/{playlistId}/collaborators")
    @Operation(
        summary = "Listar colaboradores da playlist",
        description = "Lista todos os colaboradores aceitos da playlist",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<List<CollaboratorDTO>>> getPlaylistCollaborators(
            @PathVariable Long playlistId,
            Authentication authentication) {

        List<CollaboratorDTO> collaborators = collaboratorService.getPlaylistCollaborators(
            playlistId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(collaborators, "Colaboradores recuperados com sucesso"));
    }

    @DeleteMapping("/{playlistId}/collaborators/{collaboratorId}")
    @Operation(
        summary = "Remover colaborador",
        description = "Remove um colaborador da playlist",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<Void>> removeCollaborator(
            @PathVariable Long playlistId,
            @PathVariable Long collaboratorId,
            Authentication authentication) {

        collaboratorService.removeCollaborator(playlistId, collaboratorId, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(null, "Colaborador removido com sucesso"));
    }

    @GetMapping("/collaborator-invites")
    @Operation(
        summary = "Listar meus convites",
        description = "Lista todos os convites de colaboração pendentes do usuário",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<List<CollaboratorInviteDTO>>> getMyInvites(
            Authentication authentication) {

        List<CollaboratorInviteDTO> invites = collaboratorService.getMyInvites(authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(invites, "Convites recuperados com sucesso"));
    }

    @PostMapping("/collaborator-invites/{inviteId}/accept")
    @Operation(
        summary = "Aceitar convite de colaboração",
        description = "Aceita um convite para ser colaborador de uma playlist",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<CollaboratorDTO>> acceptInvite(
            @PathVariable Long inviteId,
            Authentication authentication) {

        CollaboratorDTO collaborator = collaboratorService.respondToInvite(
            inviteId, true, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(collaborator, "Convite aceito com sucesso"));
    }

    @PostMapping("/collaborator-invites/{inviteId}/reject")
    @Operation(
        summary = "Rejeitar convite de colaboração",
        description = "Rejeita um convite para ser colaborador de uma playlist",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ResponseDTO<CollaboratorDTO>> rejectInvite(
            @PathVariable Long inviteId,
            Authentication authentication) {

        CollaboratorDTO collaborator = collaboratorService.respondToInvite(
            inviteId, false, authentication.getName());
        return ResponseEntity.ok(new ResponseDTO<>(collaborator, "Convite rejeitado com sucesso"));
    }
}
