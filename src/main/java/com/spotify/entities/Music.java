package com.spotify.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "music", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "band"})
})
public class Music {
    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String genre;

    @Column(nullable = false, length = 200)
    private String band;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "image_file_id", length = 100)
    private String imageFileId;

    @Column(name = "youtube_video_id", length = 20)
    private String youtubeVideoId;

    @Column(name = "youtube_thumbnail_url", length = 500)
    private String youtubeThumbnailUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = true,
                foreignKey = @ForeignKey(name = "fk_music_created_by_user"))
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
