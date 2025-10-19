package com.spotify.business.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class PlaylistWithMusicsDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private String imageFileId;
    private Boolean isPublic;
    private Long userId;
    private String userName;
    private List<MusicInPlaylistDTO> musics;
    private Boolean isCollaborator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
