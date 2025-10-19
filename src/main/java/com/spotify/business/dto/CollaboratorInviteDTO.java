package com.spotify.business.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CollaboratorInviteDTO {
    private Long id;
    private Long playlistId;
    private String playlistName;
    private String playlistImageUrl;
    private Long invitedByUserId;
    private String invitedByUserName;
    private String status;
    private LocalDateTime invitedAt;
}
