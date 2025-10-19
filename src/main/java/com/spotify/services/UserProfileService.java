package com.spotify.services;

import com.spotify.business.dto.UserProfileResponseDTO;
import com.spotify.business.dto.UserProfileUpdateDTO;
import com.spotify.entities.User;
import com.spotify.exceptions.UserNotFoundException;
import com.spotify.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class UserProfileService {
    private final UserRepository userRepository;
    private final ImageKitStorageService imageKitStorageService;

    public UserProfileService(UserRepository userRepository, ImageKitStorageService imageKitStorageService) {
        this.userRepository = userRepository;
        this.imageKitStorageService = imageKitStorageService;
    }

    public UserProfileResponseDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));
        
        return new UserProfileResponseDTO(user.getId(), user.getName(), user.getEmail(), user.getAvatarUrl());
    }

    @Transactional
    public UserProfileResponseDTO updateProfile(String email, UserProfileUpdateDTO updateDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        // Verifica se o novo email já está em uso por outro usuário
        if (!user.getEmail().equals(updateDTO.getEmail())) {
            userRepository.findByEmail(updateDTO.getEmail()).ifPresent(u -> {
                throw new RuntimeException("Email já está em uso");
            });
        }

        user.setName(updateDTO.getName());
        user.setEmail(updateDTO.getEmail());
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        return new UserProfileResponseDTO(updatedUser.getId(), updatedUser.getName(), 
                                         updatedUser.getEmail(), updatedUser.getAvatarUrl());
    }

    @Transactional
    public UserProfileResponseDTO updateAvatar(String email, MultipartFile avatar) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        // Deleta avatar antigo se existir
        if (user.getAvatarFileId() != null && !user.getAvatarFileId().isEmpty()) {
            imageKitStorageService.deleteMusicCover(user.getAvatarFileId());
        }

        // Faz upload do novo avatar
        Map<String, String> uploadResult = imageKitStorageService.uploadMusicCover(avatar);
        user.setAvatarUrl(uploadResult.get("url"));
        user.setAvatarFileId(uploadResult.get("fileId"));
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        return new UserProfileResponseDTO(updatedUser.getId(), updatedUser.getName(), 
                                         updatedUser.getEmail(), updatedUser.getAvatarUrl());
    }

    @Transactional
    public void deleteAvatar(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        if (user.getAvatarFileId() != null && !user.getAvatarFileId().isEmpty()) {
            imageKitStorageService.deleteMusicCover(user.getAvatarFileId());
        }

        user.setAvatarUrl(null);
        user.setAvatarFileId(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}

