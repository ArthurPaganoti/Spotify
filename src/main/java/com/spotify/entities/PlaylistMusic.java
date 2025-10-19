package com.spotify.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "playlist_music", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"playlist_id", "music_id"})
})
public class PlaylistMusic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_playlist_music_playlist"))
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "music_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_playlist_music_music"))
    private Music music;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

