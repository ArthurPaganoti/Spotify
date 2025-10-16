package com.spotify.services;

import com.spotify.business.dto.UserRegisterDTO;
import com.spotify.business.ResponseDTO;
import com.spotify.entities.User;
import com.spotify.repositories.UserRepository;
import com.spotify.exceptions.EmailAlreadyExistsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
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
    public ResponseDTO<Object> deleteUser(Long id) {
        return userRepository.findById(id)
            .map(user -> {
                userRepository.deleteById(id);
                return ResponseDTO.success("Usuário deletado com sucesso");
            })
            .orElseThrow(() -> {
                return new com.spotify.exceptions.UserNotFoundException("Usuário não encontrado");
            });
    }
}
