package com.spotify.services;

import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageKitStorageService {
    private static final Logger logger = LoggerFactory.getLogger(ImageKitStorageService.class);
    private static final String MUSIC_COVERS_FOLDER = "/music-covers";
    private static final String PLAYLIST_COVERS_FOLDER = "/playlist-covers";

    private final ImageKit imageKit;

    public ImageKitStorageService(ImageKit imageKit) {
        this.imageKit = imageKit;
    }

    public Map<String, String> uploadMusicCover(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("O arquivo deve ser uma imagem");
        }

        try {
            byte[] fileBytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(fileBytes);

            String fileName = UUID.randomUUID() + getFileExtension(file.getOriginalFilename());

            FileCreateRequest fileCreateRequest = new FileCreateRequest(base64, fileName);
            fileCreateRequest.setFolder(MUSIC_COVERS_FOLDER);
            fileCreateRequest.setUseUniqueFileName(false);

            Result result = imageKit.upload(fileCreateRequest);

            Map<String, String> uploadResult = new HashMap<>();
            uploadResult.put("url", result.getUrl());
            uploadResult.put("fileId", result.getFileId());

            logger.info("Image uploaded successfully to ImageKit: {}", result.getFileId());
            return uploadResult;
        } catch (Exception e) {
            logger.error("Error uploading image to ImageKit: {}", e.getMessage());
            throw new RuntimeException("Erro ao fazer upload da imagem para ImageKit: " + e.getMessage(), e);
        }
    }

    public Map<String, String> uploadPlaylistCover(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("O arquivo deve ser uma imagem");
        }

        try {
            byte[] fileBytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(fileBytes);

            String fileName = UUID.randomUUID() + getFileExtension(file.getOriginalFilename());

            FileCreateRequest fileCreateRequest = new FileCreateRequest(base64, fileName);
            fileCreateRequest.setFolder(PLAYLIST_COVERS_FOLDER);
            fileCreateRequest.setUseUniqueFileName(false);

            Result result = imageKit.upload(fileCreateRequest);

            Map<String, String> uploadResult = new HashMap<>();
            uploadResult.put("url", result.getUrl());
            uploadResult.put("fileId", result.getFileId());

            logger.info("Playlist cover uploaded successfully to ImageKit: {}", result.getFileId());
            return uploadResult;
        } catch (Exception e) {
            logger.error("Error uploading playlist cover to ImageKit: {}", e.getMessage());
            throw new RuntimeException("Erro ao fazer upload da imagem da playlist para ImageKit: " + e.getMessage(), e);
        }
    }

    public void deleteMusicCover(String fileId) {
        if (fileId == null || fileId.isEmpty()) {
            return;
        }

        try {
            imageKit.deleteFile(fileId);
            logger.info("Image deleted successfully from ImageKit: {}", fileId);
        } catch (Exception e) {
            logger.error("Error deleting image from ImageKit: {}", e.getMessage());
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
}
