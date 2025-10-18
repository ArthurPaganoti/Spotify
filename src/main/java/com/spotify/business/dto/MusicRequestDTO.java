package com.spotify.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MusicRequestDTO {
    @NotBlank(message = "Nome da música é obrigatório")
    @Size(max = 200, message = "Nome da música deve ter no máximo 200 caracteres")
    private String name;

    @NotBlank(message = "Gênero é obrigatório")
    @Size(max = 50, message = "Gênero deve ter no máximo 50 caracteres")
    private String genre;

    @NotBlank(message = "Banda é obrigatória")
    @Size(max = 200, message = "Banda deve ter no máximo 200 caracteres")
    private String band;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getBand() { return band; }
    public void setBand(String band) { this.band = band; }
}
