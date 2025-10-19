package com.spotify.business.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class MusicInPlaylistDTO {
    private String id;
    private String name;
    private String genre;
    private String band;
    private String imageUrl;
    private String imageFileId;
    private String youtubeVideoId;
    private String youtubeThumbnailUrl;
    private Integer position;
    private LocalDateTime addedAt;
}
