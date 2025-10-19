package com.spotify.services;

import com.spotify.business.dto.UserProfileResponseDTO;
import com.spotify.business.dto.UserProfileUpdateDTO;
import com.spotify.entities.User;
import com.spotify.exceptions.UserNotFoundException;
import com.spotify.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    public UserProfileService(UserRepository userRepository, ImageKitStorageService imageKitStorageService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.imageKitStorageService = imageKitStorageService;
        this.passwordEncoder = passwordEncoder;
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

        String currentEmail = user.getEmail().trim().toLowerCase();
        String newEmail = updateDTO.getEmail().trim().toLowerCase();
        String currentName = user.getName().trim();
        String newName = updateDTO.getName().trim();

        if (currentEmail.equals(newEmail) && currentName.equals(newName)) {
            throw new IllegalArgumentException("Nenhuma alteração foi detectada. Modifique pelo menos um campo para atualizar o perfil.");
        }

        if (!currentEmail.equals(newEmail)) {
            userRepository.findByEmail(updateDTO.getEmail()).ifPresent(u -> {
                if (!u.getId().equals(user.getId())) {
                    throw new IllegalArgumentException("Este email já está sendo usado por outro usuário");
                }
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

        if (user.getAvatarFileId() != null && !user.getAvatarFileId().isEmpty()) {
            imageKitStorageService.deleteMusicCover(user.getAvatarFileId());
        }

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

    @Transactional
    public void changePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        if (user.getAvatarFileId() != null && !user.getAvatarFileId().isEmpty()) {
            try {
                imageKitStorageService.deleteMusicCover(user.getAvatarFileId());
            } catch (Exception e) {
                System.err.println("Erro ao deletar avatar: " + e.getMessage());
            }
        }

        userRepository.delete(user);
    }
}
