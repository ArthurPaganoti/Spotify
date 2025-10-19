package com.spotify.utils;

import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;

public class ImageValidator {
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int REQUIRED_WIDTH = 640;
    private static final int REQUIRED_HEIGHT = 640;
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"};

    public static void validateMusicCover(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedType(contentType)) {
            throw new IllegalArgumentException("Tipo de arquivo inválido. Permitidos: JPEG, PNG, WEBP");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Arquivo muito grande. Tamanho máximo: 5MB");
        }

        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) {
            throw new IllegalArgumentException("Arquivo de imagem corrompido ou inválido");
        }

        if (image.getWidth() != REQUIRED_WIDTH || image.getHeight() != REQUIRED_HEIGHT) {
            throw new IllegalArgumentException(
                String.format("Dimensões inválidas. Requerido: %dx%d pixels. Recebido: %dx%d pixels",
                    REQUIRED_WIDTH, REQUIRED_HEIGHT, image.getWidth(), image.getHeight())
            );
        }
    }

    public static void validateAvatar(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedType(contentType)) {
            throw new IllegalArgumentException("Tipo de arquivo inválido. Permitidos: JPEG, PNG, WEBP");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Arquivo muito grande. Tamanho máximo: 5MB");
        }

        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) {
            throw new IllegalArgumentException("Arquivo de imagem corrompido ou inválido");
        }
    }

    private static boolean isAllowedType(String contentType) {
        for (String type : ALLOWED_TYPES) {
            if (type.equals(contentType)) {
                return true;
            }
        }
        return false;
    }
}

