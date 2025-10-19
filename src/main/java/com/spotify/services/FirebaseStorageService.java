package com.spotify.services;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class FirebaseStorageService {

    private static final String MUSIC_COVERS_FOLDER = "music-covers/";
    
    /**
     * Faz upload de uma imagem para o Firebase Storage
     * Dimensões recomendadas: 640x640 pixels (mesma dimensão usada pelo Spotify)
     * 
     * @param file arquivo de imagem
     * @return URL pública da imagem
     * @throws IOException se houver erro no upload
     */
    public String uploadMusicCover(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }

        // Validar tipo de arquivo
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("O arquivo deve ser uma imagem");
        }

        // Gerar nome único para o arquivo
        String fileName = MUSIC_COVERS_FOLDER + UUID.randomUUID().toString() + getFileExtension(file.getOriginalFilename());

        // Upload para o Firebase Storage
        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.create(fileName, file.getBytes(), contentType);

        // Tornar o arquivo público e retornar URL
        blob.createAcl(com.google.cloud.storage.Acl.of(
            com.google.cloud.storage.Acl.User.ofAllUsers(),
            com.google.cloud.storage.Acl.Role.READER
        ));

        // Retornar URL pública
        return String.format(
            "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
            bucket.getName(),
            fileName.replace("/", "%2F")
        );
    }

    /**
     * Deleta uma imagem do Firebase Storage
     * 
     * @param imageUrl URL da imagem a ser deletada
     */
    public void deleteMusicCover(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extrair o nome do arquivo da URL
            String fileName = extractFileNameFromUrl(imageUrl);
            if (fileName != null) {
                Bucket bucket = StorageClient.getInstance().bucket();
                Blob blob = bucket.get(fileName);
                if (blob != null) {
                    blob.delete();
                }
            }
        } catch (Exception e) {
            // Log do erro mas não lança exceção para não interromper outras operações
            System.err.println("Erro ao deletar imagem do Firebase: " + e.getMessage());
        }
    }

    /**
     * Extrai o nome do arquivo da URL do Firebase Storage
     */
    private String extractFileNameFromUrl(String url) {
        try {
            if (url.contains("/o/")) {
                String encoded = url.split("/o/")[1].split("\\?")[0];
                return encoded.replace("%2F", "/");
            }
        } catch (Exception e) {
            System.err.println("Erro ao extrair nome do arquivo da URL: " + e.getMessage());
        }
        return null;
    }

    /**
     * Obtém a extensão do arquivo
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
}

