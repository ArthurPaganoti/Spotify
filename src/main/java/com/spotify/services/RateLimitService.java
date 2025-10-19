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


    public boolean allowRequest(HttpServletRequest request) {
        String clientIP = ClientIPUtil.getClientIP(request);
        Bucket bucket = rateLimitingConfig.resolveBucket(clientIP);
        return bucket.tryConsume(1);
    }


    public boolean allowStrictRequest(HttpServletRequest request) {
        String clientIP = ClientIPUtil.getClientIP(request);
        Bucket bucket = rateLimitingConfig.resolveStrictBucket(clientIP);
        return bucket.tryConsume(1);
    }
}

