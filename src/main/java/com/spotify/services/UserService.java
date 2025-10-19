package com.spotify.services;

import com.spotify.business.dto.UserRegisterDTO;
import com.spotify.business.ResponseDTO;
import com.spotify.entities.User;
import com.spotify.repositories.UserRepository;
import com.spotify.exceptions.EmailAlreadyExistsException;
import com.spotify.exceptions.ForbiddenOperationException;
import com.spotify.exceptions.UserNotFoundException;
import com.spotify.repositories.PasswordResetTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public ResponseDTO<String> register(UserRegisterDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email já cadastrado");
        }
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        userRepository.save(user);
        return ResponseDTO.success("Usuário registrado com sucesso");
    }

    @Transactional
    public ResponseDTO<Object> deleteUser(Long id, String authenticatedEmail) {
        User authenticatedUser = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuário autenticado não encontrado"));

        if (!authenticatedUser.getId().equals(id)) {
            throw new ForbiddenOperationException("Operação não permitida. Você só pode deletar o próprio usuário.");
        }

        return userRepository.findById(id)
                .map(user -> {
                    passwordResetTokenRepository.deleteByUser(user);
                    userRepository.deleteById(id);
                    return ResponseDTO.success("Usuário deletado com sucesso");
                })
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));
    }
}
