package com.spotify.services;

import com.spotify.business.dto.*;
import com.spotify.entities.Music;
import com.spotify.entities.Playlist;
import com.spotify.entities.PlaylistMusic;
import com.spotify.entities.User;
import com.spotify.exceptions.ForbiddenOperationException;
import com.spotify.repositories.MusicRepository;
import com.spotify.repositories.PlaylistMusicRepository;
import com.spotify.repositories.PlaylistRepository;
import com.spotify.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistMusicRepository playlistMusicRepository;
    private final MusicRepository musicRepository;
    private final UserRepository userRepository;
    private final ImageKitStorageService imageKitStorageService;
    private final PlaylistCollaboratorService collaboratorService;

    public PlaylistService(PlaylistRepository playlistRepository,
                          PlaylistMusicRepository playlistMusicRepository,
                          MusicRepository musicRepository,
                          UserRepository userRepository,
                          ImageKitStorageService imageKitStorageService,
                          PlaylistCollaboratorService collaboratorService) {
        this.playlistRepository = playlistRepository;
        this.playlistMusicRepository = playlistMusicRepository;
        this.musicRepository = musicRepository;
        this.userRepository = userRepository;
        this.imageKitStorageService = imageKitStorageService;
        this.collaboratorService = collaboratorService;
    }

    @Transactional
    public PlaylistDTO createPlaylist(CreatePlaylistRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = new Playlist();
        playlist.setName(request.getName());
        playlist.setImageUrl(request.getImageUrl());
        playlist.setImageFileId(request.getImageFileId());
        playlist.setIsPublic(request.getIsPublic());
        playlist.setUser(user);
        playlist.setCreatedAt(LocalDateTime.now());
        playlist.setUpdatedAt(LocalDateTime.now());

        Playlist savedPlaylist = playlistRepository.save(playlist);

        return convertToDTO(savedPlaylist);
    }

    @Transactional
    public PlaylistDTO updatePlaylist(Long playlistId, UpdatePlaylistRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        if (!playlist.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Apenas o dono da playlist pode editá-la. Colaboradores podem apenas adicionar e remover músicas.");
        }

        if (request.getName() != null) {
            playlist.setName(request.getName());
        }
        if (request.getImageUrl() != null) {
            playlist.setImageUrl(request.getImageUrl());
        }
        if (request.getImageFileId() != null) {
            playlist.setImageFileId(request.getImageFileId());
        }
        if (request.getIsPublic() != null) {
            playlist.setIsPublic(request.getIsPublic());
        }
        playlist.setUpdatedAt(LocalDateTime.now());

        Playlist updatedPlaylist = playlistRepository.save(playlist);

        return convertToDTO(updatedPlaylist);
    }

    @Transactional
    public void deletePlaylist(Long playlistId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        if (!playlist.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Apenas o dono da playlist pode deletá-la");
        }

        playlistRepository.delete(playlist);
    }

    @Transactional(readOnly = true)
    public List<PlaylistDTO> getMyPlaylists(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Playlist> playlists = playlistRepository.findMyPlaylistsAndCollaborations(user.getId());

        return playlists.stream()
                .map(playlist -> convertToDTO(playlist, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlaylistDTO> getAllPublicPlaylists() {
        List<Playlist> playlists = playlistRepository.findAllPublicPlaylists();

        return playlists.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlaylistDTO> getAllAccessiblePlaylists(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Playlist> playlists = playlistRepository.findAllAccessiblePlaylistsIncludingCollaborations(user.getId());

        return playlists.stream()
                .map(playlist -> convertToDTO(playlist, user))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlaylistWithMusicsDTO getPlaylistById(Long playlistId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        boolean isOwner = playlist.getUser().getId().equals(user.getId());
        boolean isCollaborator = collaboratorService.isUserCollaborator(playlist, user);

        if (!playlist.getIsPublic() && !isOwner && !isCollaborator) {
            throw new RuntimeException("Você não tem permissão para visualizar esta playlist");
        }

        return convertToWithMusicsDTO(playlist, user);
    }

    @Transactional
    public void addMusicToPlaylist(Long playlistId, AddMusicToPlaylistRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        boolean isOwner = playlist.getUser().getId().equals(user.getId());
        boolean isCollaborator = collaboratorService.isUserCollaborator(playlist, user);

        if (!isOwner && !isCollaborator) {
            throw new RuntimeException("Você não tem permissão para adicionar músicas nesta playlist");
        }

        Music music = musicRepository.findById(request.getMusicId())
                .orElseThrow(() -> new RuntimeException("Música não encontrada"));

        if (playlistMusicRepository.findByPlaylistAndMusicId(playlist, music.getId()).isPresent()) {
            throw new RuntimeException("Esta música já está na playlist");
        }

        Integer maxPosition = playlistMusicRepository.findMaxPositionByPlaylist(playlist)
                .orElse(-1);

        PlaylistMusic playlistMusic = new PlaylistMusic();
        playlistMusic.setPlaylist(playlist);
        playlistMusic.setMusic(music);
        playlistMusic.setPosition(maxPosition + 1);
        playlistMusic.setCreatedAt(LocalDateTime.now());

        playlistMusicRepository.save(playlistMusic);

        playlist.setUpdatedAt(LocalDateTime.now());
        playlistRepository.save(playlist);
    }

    @Transactional
    public void removeMusicFromPlaylist(Long playlistId, String musicId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        boolean isOwner = playlist.getUser().getId().equals(user.getId());
        boolean isCollaborator = collaboratorService.isUserCollaborator(playlist, user);

        if (!isOwner && !isCollaborator) {
            throw new RuntimeException("Você não tem permissão para remover músicas desta playlist");
        }

        playlistMusicRepository.deleteByPlaylistAndMusicId(playlist, musicId);

        playlist.setUpdatedAt(LocalDateTime.now());
        playlistRepository.save(playlist);
    }

    @Transactional
    public PlaylistDTO updatePlaylistImage(Long playlistId, org.springframework.web.multipart.MultipartFile image, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        if (!playlist.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Apenas o dono da playlist pode alterar a imagem");
        }

        try {
            java.util.Map<String, String> uploadResult = imageKitStorageService.uploadPlaylistCover(image);

            playlist.setImageUrl(uploadResult.get("url"));
            playlist.setImageFileId(uploadResult.get("fileId"));
            playlist.setUpdatedAt(LocalDateTime.now());

            Playlist updatedPlaylist = playlistRepository.save(playlist);
            return convertToDTO(updatedPlaylist);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer upload da imagem: " + e.getMessage());
        }
    }

    private PlaylistDTO convertToDTO(Playlist playlist) {
        return convertToDTO(playlist, null);
    }

    private PlaylistDTO convertToDTO(Playlist playlist, User currentUser) {
        PlaylistDTO dto = new PlaylistDTO();
        dto.setId(playlist.getId());
        dto.setName(playlist.getName());
        dto.setImageUrl(playlist.getImageUrl());
        dto.setImageFileId(playlist.getImageFileId());
        dto.setIsPublic(playlist.getIsPublic());
        dto.setUserId(playlist.getUser().getId());
        dto.setUserName(playlist.getUser().getName());
        dto.setMusicCount(playlist.getPlaylistMusics().size());
        dto.setCreatedAt(playlist.getCreatedAt());
        dto.setUpdatedAt(playlist.getUpdatedAt());

        if (currentUser != null) {
            dto.setIsCollaborator(collaboratorService.isUserCollaborator(playlist, currentUser));
        } else {
            dto.setIsCollaborator(false);
        }

        return dto;
    }

    private PlaylistWithMusicsDTO convertToWithMusicsDTO(Playlist playlist) {
        return convertToWithMusicsDTO(playlist, null);
    }

    private PlaylistWithMusicsDTO convertToWithMusicsDTO(Playlist playlist, User currentUser) {
        PlaylistWithMusicsDTO dto = new PlaylistWithMusicsDTO();
        dto.setId(playlist.getId());
        dto.setName(playlist.getName());
        dto.setImageUrl(playlist.getImageUrl());
        dto.setImageFileId(playlist.getImageFileId());
        dto.setIsPublic(playlist.getIsPublic());
        dto.setUserId(playlist.getUser().getId());
        dto.setUserName(playlist.getUser().getName());
        dto.setCreatedAt(playlist.getCreatedAt());
        dto.setUpdatedAt(playlist.getUpdatedAt());

        if (currentUser != null) {
            dto.setIsCollaborator(collaboratorService.isUserCollaborator(playlist, currentUser));
        } else {
            dto.setIsCollaborator(false);
        }

        List<PlaylistMusic> playlistMusics = playlistMusicRepository
                .findByPlaylistOrderByPositionAsc(playlist);

        List<MusicInPlaylistDTO> musics = playlistMusics.stream()
                .map(pm -> {
                    MusicInPlaylistDTO musicDTO = new MusicInPlaylistDTO();
                    musicDTO.setId(pm.getMusic().getId());
                    musicDTO.setName(pm.getMusic().getName());
                    musicDTO.setGenre(pm.getMusic().getGenre());
                    musicDTO.setBand(pm.getMusic().getBand());
                    musicDTO.setImageUrl(pm.getMusic().getImageUrl());
                    musicDTO.setImageFileId(pm.getMusic().getImageFileId());
                    musicDTO.setYoutubeVideoId(pm.getMusic().getYoutubeVideoId());
                    musicDTO.setYoutubeThumbnailUrl(pm.getMusic().getYoutubeThumbnailUrl());
                    musicDTO.setPosition(pm.getPosition());
                    musicDTO.setAddedAt(pm.getCreatedAt());
                    return musicDTO;
                })
                .collect(Collectors.toList());

        dto.setMusics(musics);
        return dto;
    }
}
