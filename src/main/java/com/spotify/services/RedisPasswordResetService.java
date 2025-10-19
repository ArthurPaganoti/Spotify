package com.spotify.services;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisPasswordResetService {
    private static final String REDIS_KEY_PREFIX = "password_reset:";
    private final RedisTemplate<String, String> redisTemplate;

    public RedisPasswordResetService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Salva o token de reset com expiração automática
     * @param token Token gerado
     * @param email Email do usuário
     * @param expirationHours Tempo de expiração em horas
     */
    public void saveResetToken(String token, String email, int expirationHours) {
        String key = REDIS_KEY_PREFIX + token;
        redisTemplate.opsForValue().set(key, email, expirationHours, TimeUnit.HOURS);
    }

    /**
     * Busca o email associado ao token
     * @param token Token de reset
     * @return Email do usuário ou null se não encontrado/expirado
     */
    public String getEmailByToken(String token) {
        String key = REDIS_KEY_PREFIX + token;
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Remove o token (usado após reset de senha ou invalidação)
     * @param token Token a ser removido
     */
    public void deleteToken(String token) {
        String key = REDIS_KEY_PREFIX + token;
        redisTemplate.delete(key);
    }

    /**
     * Verifica se o token existe e é válido
     * @param token Token a ser verificado
     * @return true se existe e não expirou
     */
    public boolean isTokenValid(String token) {
        String key = REDIS_KEY_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Remove todos os tokens de reset de um usuário (útil ao solicitar novo token)
     * @param email Email do usuário
     */
    public void deleteAllTokensByEmail(String email) {
        // Busca todos os tokens que correspondem ao email
        redisTemplate.keys(REDIS_KEY_PREFIX + "*").forEach(key -> {
            String storedEmail = redisTemplate.opsForValue().get(key);
            if (email.equals(storedEmail)) {
                redisTemplate.delete(key);
            }
        });
    }
}

