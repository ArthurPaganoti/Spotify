package com.spotify.services;

import com.spotify.business.dto.*;
import com.spotify.entities.Playlist;
import com.spotify.entities.PlaylistCollaborator;
import com.spotify.entities.User;
import com.spotify.repositories.PlaylistCollaboratorRepository;
import com.spotify.repositories.PlaylistRepository;
import com.spotify.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistCollaboratorService {

    private final PlaylistCollaboratorRepository collaboratorRepository;
    private final PlaylistRepository playlistRepository;
    private final UserRepository userRepository;

    public PlaylistCollaboratorService(PlaylistCollaboratorRepository collaboratorRepository,
                                      PlaylistRepository playlistRepository,
                                      UserRepository userRepository) {
        this.collaboratorRepository = collaboratorRepository;
        this.playlistRepository = playlistRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CollaboratorDTO inviteCollaborator(Long playlistId, InviteCollaboratorRequest request, String ownerEmail) {
        // Busca o dono da playlist
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Busca a playlist
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        // Verifica se o usuário é o dono da playlist
        if (!playlist.getUser().getId().equals(owner.getId())) {
            throw new RuntimeException("Apenas o dono da playlist pode convidar colaboradores");
        }

        // Busca o usuário que será convidado
        User invitedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário com email " + request.getEmail() + " não encontrado"));

        // Não pode convidar a si mesmo
        if (invitedUser.getId().equals(owner.getId())) {
            throw new RuntimeException("Você não pode convidar a si mesmo como colaborador");
        }

        // Verifica se já existe um convite
        if (collaboratorRepository.findByPlaylistAndUser(playlist, invitedUser).isPresent()) {
            throw new RuntimeException("Este usuário já foi convidado para esta playlist");
        }

        // Cria o convite
        PlaylistCollaborator collaborator = new PlaylistCollaborator();
        collaborator.setPlaylist(playlist);
        collaborator.setUser(invitedUser);
        collaborator.setInvitedBy(owner);
        collaborator.setStatus(PlaylistCollaborator.CollaboratorStatus.PENDING);
        collaborator.setInvitedAt(LocalDateTime.now());

        PlaylistCollaborator saved = collaboratorRepository.save(collaborator);

        return convertToDTO(saved);
    }

    @Transactional
    public CollaboratorDTO respondToInvite(Long inviteId, boolean accept, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        PlaylistCollaborator collaborator = collaboratorRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Convite não encontrado"));

        // Verifica se o convite é para este usuário
        if (!collaborator.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Este convite não é para você");
        }

        // Verifica se o convite ainda está pendente
        if (collaborator.getStatus() != PlaylistCollaborator.CollaboratorStatus.PENDING) {
            throw new RuntimeException("Este convite já foi respondido");
        }

        // Atualiza o status
        collaborator.setStatus(accept ? 
            PlaylistCollaborator.CollaboratorStatus.ACCEPTED : 
            PlaylistCollaborator.CollaboratorStatus.REJECTED);
        collaborator.setRespondedAt(LocalDateTime.now());

        PlaylistCollaborator updated = collaboratorRepository.save(collaborator);

        return convertToDTO(updated);
    }

    @Transactional
    public void removeCollaborator(Long playlistId, Long collaboratorId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        // Verifica se o usuário é o dono da playlist
        if (!playlist.getUser().getId().equals(owner.getId())) {
            throw new RuntimeException("Apenas o dono da playlist pode remover colaboradores");
        }

        PlaylistCollaborator collaborator = collaboratorRepository.findById(collaboratorId)
                .orElseThrow(() -> new RuntimeException("Colaborador não encontrado"));

        // Verifica se o colaborador pertence a esta playlist
        if (!collaborator.getPlaylist().getId().equals(playlistId)) {
            throw new RuntimeException("Este colaborador não pertence a esta playlist");
        }

        collaboratorRepository.delete(collaborator);
    }

    @Transactional(readOnly = true)
    public List<CollaboratorDTO> getPlaylistCollaborators(Long playlistId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist não encontrada"));

        // Verifica se o usuário é o dono da playlist
        if (!playlist.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Apenas o dono da playlist pode ver os colaboradores");
        }

        List<PlaylistCollaborator> collaborators = collaboratorRepository.findByPlaylistAndStatus(
            playlist, PlaylistCollaborator.CollaboratorStatus.ACCEPTED);

        return collaborators.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CollaboratorInviteDTO> getMyInvites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<PlaylistCollaborator> invites = collaboratorRepository.findByUserAndStatus(
            user, PlaylistCollaborator.CollaboratorStatus.PENDING);

        return invites.stream()
                .map(this::convertToInviteDTO)
                .collect(Collectors.toList());
    }

    public boolean isUserCollaborator(Playlist playlist, User user) {
        return collaboratorRepository.isUserCollaborator(playlist, user);
    }

    private CollaboratorDTO convertToDTO(PlaylistCollaborator collaborator) {
        CollaboratorDTO dto = new CollaboratorDTO();
        dto.setId(collaborator.getId());
        dto.setUserId(collaborator.getUser().getId());
        dto.setUserName(collaborator.getUser().getName());
        dto.setUserEmail(collaborator.getUser().getEmail());
        dto.setUserAvatarUrl(collaborator.getUser().getAvatarUrl());
        dto.setStatus(collaborator.getStatus().name());
        dto.setInvitedByUserId(collaborator.getInvitedBy().getId());
        dto.setInvitedByUserName(collaborator.getInvitedBy().getName());
        dto.setInvitedAt(collaborator.getInvitedAt());
        dto.setRespondedAt(collaborator.getRespondedAt());
        return dto;
    }

    private CollaboratorInviteDTO convertToInviteDTO(PlaylistCollaborator collaborator) {
        CollaboratorInviteDTO dto = new CollaboratorInviteDTO();
        dto.setId(collaborator.getId());
        dto.setPlaylistId(collaborator.getPlaylist().getId());
        dto.setPlaylistName(collaborator.getPlaylist().getName());
        dto.setPlaylistImageUrl(collaborator.getPlaylist().getImageUrl());
        dto.setInvitedByUserId(collaborator.getInvitedBy().getId());
        dto.setInvitedByUserName(collaborator.getInvitedBy().getName());
        dto.setStatus(collaborator.getStatus().name());
        dto.setInvitedAt(collaborator.getInvitedAt());
        return dto;
    }
}

