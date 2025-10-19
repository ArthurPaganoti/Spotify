package com.spotify.services;

import com.spotify.business.ResponseDTO;
import com.spotify.business.dto.PasswordResetConfirmDTO;
import com.spotify.business.dto.PasswordResetRequestDTO;
import com.spotify.entities.User;
import com.spotify.exceptions.InvalidTokenException;
import com.spotify.exceptions.UserNotFoundException;
import com.spotify.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class PasswordResetService {
    private final RedisPasswordResetService redisPasswordResetService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private static final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.password-reset.expiration-hours}")
    private int tokenExpirationHours;

    public PasswordResetService(
            RedisPasswordResetService redisPasswordResetService,
            UserRepository userRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.redisPasswordResetService = redisPasswordResetService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ResponseDTO<String> requestPasswordReset(PasswordResetRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com o email fornecido"));

        redisPasswordResetService.deleteAllTokensByEmail(user.getEmail());

        String token = generateSecureToken();
        
        redisPasswordResetService.saveResetToken(token, user.getEmail(), tokenExpirationHours);

        emailService.sendPasswordResetEmail(user.getEmail(), token, user.getName());

        return ResponseDTO.success("Email de reset de senha enviado com sucesso");
    }

    @Transactional
    public ResponseDTO<String> resetPassword(PasswordResetConfirmDTO request) {
        String email = redisPasswordResetService.getEmailByToken(request.getToken());

        if (email == null) {
            throw new InvalidTokenException("Token inválido ou expirado");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new com.spotify.exceptions.BusinessException("A nova senha deve ser diferente da senha anterior");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        redisPasswordResetService.deleteToken(request.getToken());

        return ResponseDTO.success("Senha alterada com sucesso");
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
