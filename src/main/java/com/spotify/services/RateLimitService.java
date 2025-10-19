package com.spotify.services;

import com.spotify.config.RateLimitingConfig;
import com.spotify.utils.ClientIPUtil;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {
    
    private final RateLimitingConfig rateLimitingConfig;

    public RateLimitService(RateLimitingConfig rateLimitingConfig) {
        this.rateLimitingConfig = rateLimitingConfig;
    }

    /**
     * Verifica se a requisição pode ser processada baseado no rate limit
     * @param request HttpServletRequest para extrair o IP
     * @return true se pode processar, false se excedeu o limite
     */
    public boolean allowRequest(HttpServletRequest request) {
        String clientIP = ClientIPUtil.getClientIP(request);
        Bucket bucket = rateLimitingConfig.resolveBucket(clientIP);
        return bucket.tryConsume(1);
    }

    /**
     * Verifica se a requisição pode ser processada baseado no rate limit estrito
     * @param request HttpServletRequest para extrair o IP
     * @return true se pode processar, false se excedeu o limite
     */
    public boolean allowStrictRequest(HttpServletRequest request) {
        String clientIP = ClientIPUtil.getClientIP(request);
        Bucket bucket = rateLimitingConfig.resolveStrictBucket(clientIP);
        return bucket.tryConsume(1);
    }
}

