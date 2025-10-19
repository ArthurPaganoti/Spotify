package com.spotify.business.dto;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
@Data
public class AddMusicToPlaylistRequest {
    @NotBlank(message = "ID da música é obrigatório")
    private String musicId;
}
