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

    public void saveResetToken(String token, String email, int expirationHours) {
        String key = REDIS_KEY_PREFIX + token;
        redisTemplate.opsForValue().set(key, email, expirationHours, TimeUnit.HOURS);
    }

    public String getEmailByToken(String token) {
        String key = REDIS_KEY_PREFIX + token;
        return redisTemplate.opsForValue().get(key);
    }


    public void deleteToken(String token) {
        String key = REDIS_KEY_PREFIX + token;
        redisTemplate.delete(key);
    }

    public boolean isTokenValid(String token) {
        String key = REDIS_KEY_PREFIX + token;
        Boolean hasKey = redisTemplate.hasKey(key);
        return hasKey != null && hasKey;
    }


    public void deleteAllTokensByEmail(String email) {
        redisTemplate.keys(REDIS_KEY_PREFIX + "*").forEach(key -> {
            String storedEmail = redisTemplate.opsForValue().get(key);
            if (email.equals(storedEmail)) {
                redisTemplate.delete(key);
            }
        });
    }
}
