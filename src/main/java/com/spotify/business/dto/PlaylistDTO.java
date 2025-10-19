package com.spotify.business.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PlaylistDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private String imageFileId;
    private Boolean isPublic;
    private Long userId;
    private String userName;
    private Integer musicCount;
    private Boolean isCollaborator;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
