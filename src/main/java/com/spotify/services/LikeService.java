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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LikeService {
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
    public void toggleLike(String musicId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        if (likeRepository.existsByUserAndMusic(user, music)) {
            likeRepository.deleteByUserAndMusic(user, music);
        } else {
            Like like = new Like();
            like.setUser(user);
            like.setMusic(music);
            likeRepository.save(like);
        }
    }

    public boolean isLiked(String musicId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        return likeRepository.existsByUserAndMusic(user, music);
    }

    public List<MusicResponseDTO> getLikedMusics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        return likeRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(like -> musicMapper.toResponseDTO(like.getMusic()))
                .collect(Collectors.toList());
    }

    public long getLikesCount(String musicId) {
        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        return likeRepository.countByMusic(music);
    }
}

