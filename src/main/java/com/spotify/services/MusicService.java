package com.spotify.services;

import com.spotify.business.dto.MusicRequestDTO;
import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.business.mapper.MusicMapper;
import com.spotify.entities.Music;
import com.spotify.entities.User;
import com.spotify.exceptions.MusicNotFoundException;
import com.spotify.exceptions.ForbiddenOperationException;
import com.spotify.exceptions.UserNotFoundException;
import com.spotify.exceptions.DuplicateMusicException;
import com.spotify.repositories.MusicRepository;
import com.spotify.repositories.UserRepository;
import com.spotify.utils.ImageValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class MusicService {
    private static final Logger logger = LoggerFactory.getLogger(MusicService.class);
    private static final int DEFAULT_PAGE_SIZE = 50;
    private final MusicRepository musicRepository;
    private final MusicMapper musicMapper;
    private final UserRepository userRepository;
    private final ImageKitStorageService imageKitStorageService;
    private final YouTubeService youTubeService;

    public MusicService(MusicRepository musicRepository, MusicMapper musicMapper,
                       UserRepository userRepository, ImageKitStorageService imageKitStorageService,
                       YouTubeService youTubeService) {
        this.musicRepository = musicRepository;
        this.musicMapper = musicMapper;
        this.userRepository = userRepository;
        this.imageKitStorageService = imageKitStorageService;
        this.youTubeService = youTubeService;
    }

    @Transactional
    @CacheEvict(value = "musics", allEntries = true)
    public MusicResponseDTO addMusic(MusicRequestDTO request, MultipartFile image, String email) {
        logger.info("Adding music: {} by {} for user: {}", request.getName(), request.getBand(), email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        if (musicRepository.existsByNameAndBand(request.getName(), request.getBand())) {
            throw new DuplicateMusicException("Já existe uma música com este nome e banda no sistema");
        }

        String imageUrl = null;
        String imageFileId = null;
        if (image != null && !image.isEmpty()) {
            try {
                ImageValidator.validateMusicCover(image);

                Map<String, String> uploadResult = imageKitStorageService.uploadMusicCover(image);
                imageUrl = uploadResult.get("url");
                imageFileId = uploadResult.get("fileId");
                logger.info("Image uploaded successfully: {}", imageFileId);
            } catch (IOException e) {
                logger.error("Error uploading image: {}", e.getMessage());
                throw new RuntimeException("Erro ao fazer upload da imagem: " + e.getMessage());
            }
        }

        Map<String, String> youtubeData = youTubeService.searchMusic(request.getName(), request.getBand());

        Music music = new Music();
        music.setId(UUID.randomUUID().toString());
        music.setName(request.getName());
        music.setGenre(request.getGenre());
        music.setBand(request.getBand());
        music.setImageUrl(imageUrl);
        music.setImageFileId(imageFileId);

        if (youtubeData != null) {
            music.setYoutubeVideoId(youtubeData.get("videoId"));
            music.setYoutubeThumbnailUrl(youtubeData.get("thumbnailUrl"));
        }

        music.setCreatedBy(user);
        music.setCreatedAt(LocalDateTime.now());
        music.setUpdatedAt(LocalDateTime.now());

        Music savedMusic = musicRepository.save(music);
        logger.info("Music added successfully with ID: {}", savedMusic.getId());
        return musicMapper.toResponseDTO(savedMusic, user);
    }

    @Transactional
    @CacheEvict(value = "musics", allEntries = true)
    public void deleteMusic(String musicId, String email) {
        logger.info("Deleting music: {} by user: {}", musicId, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        if (music.getCreatedBy() == null) {
            throw new ForbiddenOperationException("Esta música não pode ser editada ou deletada pois o criador deletou sua conta.");
        }

        if (!music.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Você não tem permissão para deletar esta música. Apenas quem adicionou pode deletá-la.");
        }

        if (music.getImageFileId() != null && !music.getImageFileId().isEmpty()) {
            imageKitStorageService.deleteMusicCover(music.getImageFileId());
        }

        musicRepository.delete(music);
        logger.info("Music deleted successfully: {}", musicId);
    }

    @Cacheable(value = "musics", key = "#email + '_' + #page + '_' + #size")
    public Page<MusicResponseDTO> getAllMusics(String email, int page, int size) {
        logger.debug("Fetching all musics for user: {}, page: {}, size: {}", email, page, size);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        int finalSize = size > 0 ? size : DEFAULT_PAGE_SIZE;
        Pageable pageable = PageRequest.of(page, finalSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Music> musicsPage = musicRepository.findAll(pageable);

        return musicsPage.map(music -> musicMapper.toResponseDTO(music, user));
    }

    public MusicResponseDTO getMusicById(String musicId, String email) {
        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        if (music.getCreatedBy() == null) {
            throw new ForbiddenOperationException("Esta música não pode ser editada ou deletada pois o criador deletou sua conta.");
        }

        if (!music.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Você não tem permissão para editar esta música. Apenas quem adicionou pode editá-la.");
        }

        return musicMapper.toResponseDTO(music, user);
    }

    @Transactional
    @CacheEvict(value = "musics", allEntries = true)
    public MusicResponseDTO updateMusic(String musicId, MusicRequestDTO request, MultipartFile image, String email) {
        logger.info("Updating music: {} by user: {}", musicId, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        if (music.getCreatedBy() == null) {
            throw new ForbiddenOperationException("Esta música não pode ser editada ou deletada pois o criador deletou sua conta.");
        }

        if (!music.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Você não tem permissão para atualizar esta música. Apenas quem adicionou pode atualizá-la.");
        }

        Optional<Music> existingMusic = musicRepository.findByNameAndBand(request.getName(), request.getBand());
        if (existingMusic.isPresent() && !existingMusic.get().getId().equals(musicId)) {
            throw new DuplicateMusicException("Já existe uma música com este nome e banda no sistema");
        }

        if (image != null && !image.isEmpty()) {
            try {
                // Validar imagem
                ImageValidator.validateMusicCover(image);

                if (music.getImageFileId() != null && !music.getImageFileId().isEmpty()) {
                    imageKitStorageService.deleteMusicCover(music.getImageFileId());
                }
                Map<String, String> uploadResult = imageKitStorageService.uploadMusicCover(image);
                music.setImageUrl(uploadResult.get("url"));
                music.setImageFileId(uploadResult.get("fileId"));
                logger.info("Image updated successfully for music: {}", musicId);
            } catch (IOException e) {
                logger.error("Error uploading image: {}", e.getMessage());
                throw new RuntimeException("Erro ao fazer upload da imagem: " + e.getMessage());
            }
        }

        if (!music.getName().equals(request.getName()) || !music.getBand().equals(request.getBand())) {
            Map<String, String> youtubeData = youTubeService.searchMusic(request.getName(), request.getBand());
            if (youtubeData != null) {
                music.setYoutubeVideoId(youtubeData.get("videoId"));
                music.setYoutubeThumbnailUrl(youtubeData.get("thumbnailUrl"));
            }
        }

        music.setName(request.getName());
        music.setGenre(request.getGenre());
        music.setBand(request.getBand());
        music.setUpdatedAt(LocalDateTime.now());

        Music updatedMusic = musicRepository.save(music);
        logger.info("Music updated successfully: {}", musicId);
        return musicMapper.toResponseDTO(updatedMusic, user);
    }

    @Transactional
    @CacheEvict(value = "musics", allEntries = true)
    public MusicResponseDTO addMusicByLyrics(String lyrics, String genre, String email) {
        logger.info("Adding music by lyrics for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Map<String, String> youtubeData = youTubeService.searchByLyrics(lyrics);

        if (youtubeData == null) {
            throw new MusicNotFoundException("Nenhuma música encontrada com esse trecho de letra");
        }

        String musicName = youtubeData.get("musicName");
        String bandName = youtubeData.get("bandName");

        String finalGenre = (genre == null || genre.trim().isEmpty()) ? "Desconhecido" : genre;

        if (musicRepository.existsByNameAndBand(musicName, bandName)) {
            throw new DuplicateMusicException("Já existe uma música com este nome e banda no sistema");
        }

        Music music = new Music();
        music.setId(UUID.randomUUID().toString());
        music.setName(musicName);
        music.setGenre(finalGenre);
        music.setBand(bandName);
        music.setYoutubeVideoId(youtubeData.get("videoId"));
        music.setYoutubeThumbnailUrl(youtubeData.get("thumbnailUrl"));
        music.setImageUrl(youtubeData.get("thumbnailUrl"));
        music.setCreatedBy(user);
        music.setCreatedAt(LocalDateTime.now());
        music.setUpdatedAt(LocalDateTime.now());

        Music savedMusic = musicRepository.save(music);
        return musicMapper.toResponseDTO(savedMusic, user);
    }

    public List<Map<String, String>> searchMusicOptionsByLyrics(String lyrics) {
        return youTubeService.searchMultipleSongsByLyrics(lyrics);
    }

    @Transactional
    @CacheEvict(value = "musics", allEntries = true)
    public MusicResponseDTO addSelectedMusic(String videoId, String thumbnailUrl,
                                            String musicName, String bandName,
                                            String genre, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        String finalGenre = (genre == null || genre.trim().isEmpty()) ? "Desconhecido" : genre;

        if (musicRepository.existsByNameAndBand(musicName, bandName)) {
            throw new DuplicateMusicException("Já existe uma música com este nome e banda no sistema");
        }

        Music music = new Music();
        music.setId(UUID.randomUUID().toString());
        music.setName(musicName);
        music.setGenre(finalGenre);
        music.setBand(bandName);
        music.setYoutubeVideoId(videoId);
        music.setYoutubeThumbnailUrl(thumbnailUrl);
        music.setImageUrl(thumbnailUrl);
        music.setCreatedBy(user);
        music.setCreatedAt(LocalDateTime.now());
        music.setUpdatedAt(LocalDateTime.now());

        Music savedMusic = musicRepository.save(music);
        return musicMapper.toResponseDTO(savedMusic, user);
    }
}
