package com.spotify.services;

import com.spotify.business.ResponseDTO;
import com.spotify.business.dto.PasswordResetConfirmDTO;
import com.spotify.business.dto.PasswordResetRequestDTO;
import com.spotify.entities.PasswordResetToken;
import com.spotify.entities.User;
import com.spotify.exceptions.InvalidTokenException;
import com.spotify.exceptions.UserNotFoundException;
import com.spotify.repositories.PasswordResetTokenRepository;
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
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private static final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.password-reset.expiration-hours}")
    private int tokenExpirationHours;

    public PasswordResetService(
            PasswordResetTokenRepository passwordResetTokenRepository,
            UserRepository userRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ResponseDTO<String> requestPasswordReset(PasswordResetRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com o email fornecido"));

        passwordResetTokenRepository.deleteByUser(user);

        String token = generateSecureToken();
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(tokenExpirationHours));
        resetToken.setUsed(false);
        
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token, user.getName());

        return ResponseDTO.success("Email de reset de senha enviado com sucesso");
    }

    @Transactional
    public ResponseDTO<String> resetPassword(PasswordResetConfirmDTO request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Token inválido"));

        validateToken(resetToken);

        User user = resetToken.getUser();
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new com.spotify.exceptions.BusinessException("A nova senha deve ser diferente da senha anterior");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return ResponseDTO.success("Senha alterada com sucesso");
    }

    private void validateToken(PasswordResetToken resetToken) {
        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Este token já foi utilizado");
        }

        if (LocalDateTime.now().isAfter(resetToken.getExpiresAt())) {
            throw new InvalidTokenException("Token expirado");
        }
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
