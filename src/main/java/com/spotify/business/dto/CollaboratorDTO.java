package com.spotify.business.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CollaboratorDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userAvatarUrl;
    private String status;
    private Long invitedByUserId;
    private String invitedByUserName;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
}

