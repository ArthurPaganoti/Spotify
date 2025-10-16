package com.spotify.services;

import com.spotify.business.dto.LoginRequestDTO;
import com.spotify.business.dto.LoginResponseDTO;
import com.spotify.business.security.JwtUtil;
import com.spotify.entities.User;
import com.spotify.exceptions.InvalidCredentialsException;
import com.spotify.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponseDTO login(LoginRequestDTO loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new LoginResponseDTO(token);
    }
}
