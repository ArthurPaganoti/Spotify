package com.spotify.business.mapper;

import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.entities.Music;
import org.springframework.stereotype.Component;

@Component
public class MusicMapper {
    public MusicResponseDTO toResponseDTO(Music music) {
        MusicResponseDTO dto = new MusicResponseDTO();
        dto.setId(music.getId());
        dto.setName(music.getName());
        dto.setGenre(music.getGenre());
        dto.setBand(music.getBand());
        dto.setCreatedByUserId(music.getCreatedBy().getId());
        dto.setCreatedByUserName(music.getCreatedBy().getName());
        dto.setCreatedAt(music.getCreatedAt());
        dto.setUpdatedAt(music.getUpdatedAt());
        return dto;
    }
}
