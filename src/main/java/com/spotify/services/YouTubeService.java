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

    public Map<String, String> searchMusic(String musicName, String bandName) {
        try {
            String query = musicName + " " + bandName + " official";
            
            YouTube.Search.List search = youtube.search()
                .list(List.of("id", "snippet"));
            
            search.setKey(apiKey);
            search.setQ(query);
            search.setType(List.of("video"));
            search.setMaxResults(MAX_RESULTS);
            search.setVideoCategoryId("10");
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


    public String getEmbedUrl(String videoId) {
        return "https://www.youtube.com/embed/" + videoId + "?start=30&autoplay=0";
    }

    public String getVideoUrl(String videoId) {
        return "https://www.youtube.com/watch?v=" + videoId;
    }

    public Map<String, String> searchByLyrics(String lyrics) {
        try {
            String optimizedQuery = optimizeLyricsForSearch(lyrics);

            logger.info("Query otimizada para busca: '{}'", optimizedQuery);

            YouTube.Search.List search = youtube.search()
                .list(List.of("id", "snippet"));

            search.setKey(apiKey);
            search.setQ(optimizedQuery);
            search.setType(List.of("video"));
            search.setMaxResults(3L);
            search.setFields("items(id/videoId,snippet(title,thumbnails/high/url))");

            SearchListResponse searchResponse = search.execute();
            List<SearchResult> searchResults = searchResponse.getItems();

            if (searchResults != null && !searchResults.isEmpty()) {
                for (SearchResult result : searchResults) {
                    String videoId = result.getId().getVideoId();
                    String title = result.getSnippet().getTitle();

                    if (title.toLowerCase().contains("lyrics") ||
                        title.toLowerCase().contains("letra") ||
                        title.toLowerCase().contains("music") ||
                        title.toLowerCase().contains("official") ||
                        title.toLowerCase().contains("audio") ||
                        title.contains("-") || title.contains("|")) {

                        String thumbnailUrl = result.getSnippet().getThumbnails().getHigh().getUrl();
                        String[] parts = extractMusicInfo(title);

                        Map<String, String> resultMap = new HashMap<>();
                        resultMap.put("videoId", videoId);
                        resultMap.put("thumbnailUrl", thumbnailUrl);
                        resultMap.put("musicName", parts[0]);
                        resultMap.put("bandName", parts[1]);
                        resultMap.put("originalTitle", title);

                        logger.info("Vídeo encontrado por letra '{}': {} - {}", optimizedQuery, parts[0], parts[1]);
                        return resultMap;
                    }
                }

                SearchResult firstResult = searchResults.get(0);
                String videoId = firstResult.getId().getVideoId();
                String title = firstResult.getSnippet().getTitle();
                String thumbnailUrl = firstResult.getSnippet().getThumbnails().getHigh().getUrl();

                String[] parts = extractMusicInfo(title);

                Map<String, String> result = new HashMap<>();
                result.put("videoId", videoId);
                result.put("thumbnailUrl", thumbnailUrl);
                result.put("musicName", parts[0]);
                result.put("bandName", parts[1]);
                result.put("originalTitle", title);

                logger.info("Vídeo encontrado por letra '{}': {} - {}", optimizedQuery, parts[0], parts[1]);
                return result;
            }

            logger.warn("Nenhum vídeo encontrado para a letra: '{}'", optimizedQuery);
            return null;

        } catch (IOException e) {
            logger.error("Erro ao buscar música por letra no YouTube: {}", e.getMessage());
            return null;
        }
    }

    public List<Map<String, String>> searchMultipleSongsByLyrics(String lyrics) {
        try {
            String optimizedQuery = optimizeLyricsForSearch(lyrics);

            logger.info("Query otimizada para busca múltipla: '{}'", optimizedQuery);

            YouTube.Search.List search = youtube.search()
                .list(List.of("id", "snippet"));

            search.setKey(apiKey);
            search.setQ(optimizedQuery);
            search.setType(List.of("video"));
            search.setMaxResults(3L);
            search.setFields("items(id/videoId,snippet(title,thumbnails/high/url))");

            SearchListResponse searchResponse = search.execute();
            List<SearchResult> searchResults = searchResponse.getItems();

            List<Map<String, String>> results = new java.util.ArrayList<>();

            if (searchResults != null && !searchResults.isEmpty()) {
                for (SearchResult result : searchResults) {
                    String videoId = result.getId().getVideoId();
                    String title = result.getSnippet().getTitle();
                    String thumbnailUrl = result.getSnippet().getThumbnails().getHigh().getUrl();

                    String[] parts = extractMusicInfo(title);

                    Map<String, String> resultMap = new HashMap<>();
                    resultMap.put("videoId", videoId);
                    resultMap.put("thumbnailUrl", thumbnailUrl);
                    resultMap.put("musicName", parts[0]);
                    resultMap.put("bandName", parts[1]);
                    resultMap.put("originalTitle", title);

                    results.add(resultMap);
                }

                logger.info("Encontrados {} vídeos para a letra", results.size());
                return results;
            }

            logger.warn("Nenhum vídeo encontrado para a letra");
            return new java.util.ArrayList<>();

        } catch (IOException e) {
            logger.error("Erro ao buscar músicas por letra no YouTube: {}", e.getMessage());
            return new java.util.ArrayList<>();
        }
    }

    private String optimizeLyricsForSearch(String lyrics) {
        String[] lines = lyrics.split("\\n");
        StringBuilder queryBuilder = new StringBuilder();

        int lineCount = 0;
        for (String line : lines) {
            line = line.trim();
            if (!line.isEmpty() && lineCount < 2) {
                if (lineCount > 0) {
                    queryBuilder.append(" ");
                }
                queryBuilder.append(line);
                lineCount++;
            }
            if (lineCount >= 2) break;
        }

        String query = queryBuilder.toString();

        query = removeAccents(query);
        query = query.replaceAll("[,;.!?]", " ");
        query = query.replaceAll("\\s+", " ");
        query = query.trim();

        if (query.length() > 60) {
            query = query.substring(0, 60);
            int lastSpace = query.lastIndexOf(' ');
            if (lastSpace > 30) {
                query = query.substring(0, lastSpace);
            }
        }

        query = query + " lyrics";

        return query;
    }

    private String removeAccents(String text) {
        String normalized = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("[^\\p{ASCII}]", "");
    }

    private String[] extractMusicInfo(String title) {
        title = title.replaceAll("(?i)\\(official.*?\\)", "")
                    .replaceAll("(?i)\\[official.*?\\]", "")
                    .replaceAll("(?i)official video", "")
                    .replaceAll("(?i)official audio", "")
                    .replaceAll("(?i)official music video", "")
                    .replaceAll("(?i)\\(lyrics\\)", "")
                    .replaceAll("(?i)\\[lyrics\\]", "")
                    .replaceAll("(?i)lyrics", "")
                    .replaceAll("(?i)lyric video", "")
                    .replaceAll("(?i)HD", "")
                    .replaceAll("(?i)4K", "")
                    .trim();

        String musicName;
        String bandName;

        if (title.contains(" - ")) {
            String[] parts = title.split(" - ", 2);
            bandName = parts[0].trim();
            musicName = parts[1].trim();
        }
        else if (title.contains("|")) {
            String[] parts = title.split("\\|", 2);
            bandName = parts[0].trim();
            musicName = parts[1].trim();
        }
        else {
            musicName = title;
            bandName = "Desconhecido";
        }

        return new String[]{musicName, bandName};
    }
}
