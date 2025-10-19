package com.spotify.services;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.SearchListResponse;
import com.google.api.services.youtube.model.SearchResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class YouTubeService {
    private static final Logger logger = LoggerFactory.getLogger(YouTubeService.class);
    private static final long MAX_RESULTS = 1;

    @Value("${youtube.api.key}")
    private String apiKey;

    private YouTube youtube;

    public YouTubeService() {
        try {
            this.youtube = new YouTube.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                null
            ).setApplicationName("Spotify-App").build();
        } catch (GeneralSecurityException | IOException e) {
            logger.error("Erro ao inicializar YouTube Service: {}", e.getMessage());
        }
    }

    /**
     * Busca informações de uma música no YouTube
     * @param musicName Nome da música
     * @param bandName Nome da banda/artista
     * @return Map com videoId e thumbnailUrl, ou null se não encontrar
     */
    public Map<String, String> searchMusic(String musicName, String bandName) {
        try {
            String query = musicName + " " + bandName + " official";
            
            YouTube.Search.List search = youtube.search()
                .list(List.of("id", "snippet"));
            
            search.setKey(apiKey);
            search.setQ(query);
            search.setType(List.of("video"));
            search.setMaxResults(MAX_RESULTS);
            search.setVideoCategoryId("10"); // 10 = Music category
            search.setFields("items(id/videoId,snippet/thumbnails/high/url)");

            SearchListResponse searchResponse = search.execute();
            List<SearchResult> searchResults = searchResponse.getItems();

            if (searchResults != null && !searchResults.isEmpty()) {
                SearchResult firstResult = searchResults.get(0);
                String videoId = firstResult.getId().getVideoId();
                String thumbnailUrl = firstResult.getSnippet().getThumbnails().getHigh().getUrl();

                Map<String, String> result = new HashMap<>();
                result.put("videoId", videoId);
                result.put("thumbnailUrl", thumbnailUrl);

                logger.info("Vídeo encontrado no YouTube para '{}' - '{}': {}", musicName, bandName, videoId);
                return result;
            }

            logger.warn("Nenhum vídeo encontrado no YouTube para '{}' - '{}'", musicName, bandName);
            return null;

        } catch (IOException e) {
            logger.error("Erro ao buscar música no YouTube: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Retorna a URL de embed do YouTube para um videoId
     * @param videoId ID do vídeo do YouTube
     * @return URL de embed
     */
    public String getEmbedUrl(String videoId) {
        return "https://www.youtube.com/embed/" + videoId + "?start=30&autoplay=0";
    }

    /**
     * Retorna a URL completa do vídeo no YouTube
     * @param videoId ID do vídeo do YouTube
     * @return URL do vídeo
     */
    public String getVideoUrl(String videoId) {
        return "https://www.youtube.com/watch?v=" + videoId;
    }
}

