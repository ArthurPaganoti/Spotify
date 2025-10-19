package com.spotify.business.dto;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
@Data
public class CreatePlaylistRequest {
    @NotBlank(message = "Nome da playlist é obrigatório")
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    private String name;
    private String imageUrl;
    private String imageFileId;
    @NotNull(message = "É necessário informar se a playlist é pública ou privada")
    private Boolean isPublic;
}
