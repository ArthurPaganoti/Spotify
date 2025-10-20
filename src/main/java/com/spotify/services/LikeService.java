package com.spotify.services;

import com.spotify.business.dto.MusicResponseDTO;
import com.spotify.business.mapper.MusicMapper;
import com.spotify.entities.Like;
import com.spotify.entities.Music;
import com.spotify.entities.User;
import com.spotify.exceptions.MusicNotFoundException;
import com.spotify.exceptions.UserNotFoundException;
import com.spotify.repositories.LikeRepository;
import com.spotify.repositories.MusicRepository;
import com.spotify.repositories.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class LikeService {
    private static final Logger logger = LoggerFactory.getLogger(LikeService.class);
    private static final int DEFAULT_PAGE_SIZE = 50;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final MusicRepository musicRepository;
    private final MusicMapper musicMapper;

    public LikeService(LikeRepository likeRepository, UserRepository userRepository,
                      MusicRepository musicRepository, MusicMapper musicMapper) {
        this.likeRepository = likeRepository;
        this.userRepository = userRepository;
        this.musicRepository = musicRepository;
        this.musicMapper = musicMapper;
    }

    @Transactional
    @CacheEvict(value = {"likedMusics", "musics"}, allEntries = true)
    public void toggleLike(String musicId, String email) {
        logger.info("Toggling like for musicId: {} by user: {}", musicId, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        logger.debug("User found: {}", user.getEmail());

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada com ID: " + musicId));

        logger.debug("Music found: {} by {}", music.getName(), music.getBand());

        if (likeRepository.existsByUserAndMusic(user, music)) {
            logger.info("Removing like for music: {} by user: {}", musicId, email);
            likeRepository.deleteByUserAndMusic(user, music);
        } else {
            logger.info("Adding like for music: {} by user: {}", musicId, email);
            Like like = new Like();
            like.setUser(user);
            like.setMusic(music);
            likeRepository.save(like);
        }
    }

    public boolean isLiked(String musicId, String email) {
        logger.debug("Checking if musicId: {} is liked by user: {}", musicId, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada com ID: " + musicId));

        return likeRepository.existsByUserAndMusic(user, music);
    }

    @Cacheable(value = "likedMusics", key = "#email + '_' + #page + '_' + #size")
    public Page<MusicResponseDTO> getLikedMusics(String email, int page, int size) {
        logger.info("Getting liked musics for user: {} (page: {}, size: {})", email, page, size);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        int finalSize = size > 0 ? size : DEFAULT_PAGE_SIZE;
        Pageable pageable = PageRequest.of(page, finalSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Like> likesPage = likeRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        logger.info("Found {} liked musics for user: {}", likesPage.getTotalElements(), email);
        logger.info("Liked musics IDs: {}", likesPage.getContent().stream()
                .map(like -> like.getMusic().getId())
                .collect(java.util.stream.Collectors.toList()));

        Page<MusicResponseDTO> result = likesPage.map(like -> musicMapper.toResponseDTO(like.getMusic(), user));

        logger.info("Returning {} musics in response", result.getContent().size());

        return result;
    }

    public long getLikesCount(String musicId) {
        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        return likeRepository.countByMusic(music);
    }
}
