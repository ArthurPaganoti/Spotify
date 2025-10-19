package com.spotify.business.mapper;

import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.entities.Music;
import com.spotify.entities.User;
import com.spotify.repositories.LikeRepository;
import org.springframework.stereotype.Component;

@Component
public class MusicMapper {
    private final LikeRepository likeRepository;

    public MusicMapper(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    public MusicResponseDTO toResponseDTO(Music music) {
        MusicResponseDTO dto = new MusicResponseDTO();
        dto.setId(music.getId());
        dto.setName(music.getName());
        dto.setGenre(music.getGenre());
        dto.setBand(music.getBand());
        dto.setImageUrl(music.getImageUrl());
        dto.setYoutubeVideoId(music.getYoutubeVideoId());
        dto.setYoutubeThumbnailUrl(music.getYoutubeThumbnailUrl());

        if (music.getCreatedBy() != null) {
            dto.setCreatedByUserId(music.getCreatedBy().getId());
            dto.setCreatedByUserName(music.getCreatedBy().getName());
        } else {
            dto.setCreatedByUserId(null);
            dto.setCreatedByUserName("Usuário Deletado");
        }

        dto.setCreatedAt(music.getCreatedAt());
        dto.setUpdatedAt(music.getUpdatedAt());
        dto.setLikesCount(likeRepository.countByMusic(music));
        return dto;
    }

    public MusicResponseDTO toResponseDTO(Music music, User currentUser) {
        MusicResponseDTO dto = toResponseDTO(music);
        dto.setLiked(likeRepository.existsByUserAndMusic(currentUser, music));
        return dto;
    }
}
