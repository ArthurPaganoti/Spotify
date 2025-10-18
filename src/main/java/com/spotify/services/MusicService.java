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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MusicService {
    private final MusicRepository musicRepository;
    private final MusicMapper musicMapper;
    private final UserRepository userRepository;

    public MusicService(MusicRepository musicRepository, MusicMapper musicMapper, UserRepository userRepository) {
        this.musicRepository = musicRepository;
        this.musicMapper = musicMapper;
        this.userRepository = userRepository;
    }

    @Transactional
    public MusicResponseDTO addMusic(MusicRequestDTO request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        if (musicRepository.existsByNameAndBandAndGenre(request.getName(), request.getBand(), request.getGenre())) {
            throw new DuplicateMusicException("Já existe uma música com este nome, banda e gênero no sistema");
        }

        Music music = new Music();
        music.setId(UUID.randomUUID().toString());
        music.setName(request.getName());
        music.setGenre(request.getGenre());
        music.setBand(request.getBand());
        music.setCreatedBy(user);
        music.setCreatedAt(LocalDateTime.now());
        music.setUpdatedAt(LocalDateTime.now());

        Music savedMusic = musicRepository.save(music);
        return musicMapper.toResponseDTO(savedMusic);
    }

    @Transactional
    public void deleteMusic(String musicId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));

        if (!music.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Você não tem permissão para deletar esta música. Apenas quem adicionou pode deletá-la.");
        }

        musicRepository.delete(music);
    }

    public List<MusicResponseDTO> getAllMusics(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        return musicRepository.findAll().stream()
                .map(musicMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public MusicResponseDTO getMusicById(String musicId, String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        Music music = musicRepository.findById(musicId)
                .orElseThrow(() -> new MusicNotFoundException("Música não encontrada"));
        return musicMapper.toResponseDTO(music);
    }
}
