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
package com.spotify.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "playlist_collaborator", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"playlist_id", "user_id"})
})
public class PlaylistCollaborator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_collaborator_playlist"))
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_collaborator_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_collaborator_invited_by"))
    private User invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CollaboratorStatus status = CollaboratorStatus.PENDING;

    @Column(name = "invited_at", nullable = false)
    private LocalDateTime invitedAt = LocalDateTime.now();

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    public enum CollaboratorStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}

