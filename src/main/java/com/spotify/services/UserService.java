package com.spotify.services;

import com.spotify.business.dto.UserRegisterDTO;
import com.spotify.business.ResponseDTO;
import com.spotify.entities.User;
import com.spotify.repositories.UserRepository;
import com.spotify.exceptions.EmailAlreadyExistsException;
import com.spotify.business.security.JwtUtil;
import com.spotify.exceptions.ForbiddenOperationException;
import com.spotify.exceptions.InvalidCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtil = jwtUtil;
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
    public ResponseDTO<Object> deleteUser(Long id, String token) {
        if (token == null || token.isEmpty())
            throw new InvalidCredentialsException("Token JWT ausente ou inválido");
        Long authenticatedUserId = jwtUtil.extractUserId(token);
        if (!authenticatedUserId.equals(id))
            throw new ForbiddenOperationException("Operação não permitida. Você só pode deletar o próprio usuário.");
        return userRepository.findById(id)
            .map(user -> {
                userRepository.deleteById(id);
                return ResponseDTO.success("Usuário deletado com sucesso");
            })
            .orElseThrow(() -> new com.spotify.exceptions.UserNotFoundException("Usuário não encontrado"));
    }
}
