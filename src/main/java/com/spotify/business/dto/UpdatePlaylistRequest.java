package com.spotify.business.dto;
import lombok.Data;
import jakarta.validation.constraints.Size;
@Data
public class UpdatePlaylistRequest {
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    private String name;
    private String imageUrl;
    private String imageFileId;
    private Boolean isPublic;
}
