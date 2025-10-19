package com.spotify.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spotify.business.ResponseDTO;
import com.spotify.business.security.StrictRateLimit;
import com.spotify.utils.ClientIPUtil;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitingConfig rateLimitingConfig;
    private final ObjectMapper objectMapper;

    public RateLimitInterceptor(RateLimitingConfig rateLimitingConfig, ObjectMapper objectMapper) {
        this.rateLimitingConfig = rateLimitingConfig;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        StrictRateLimit strictRateLimit = handlerMethod.getMethodAnnotation(StrictRateLimit.class);

        String clientIP = ClientIPUtil.getClientIP(request);
        Bucket bucket;

        if (strictRateLimit != null) {
            bucket = rateLimitingConfig.resolveStrictBucket(clientIP);
        } else {
            bucket = rateLimitingConfig.resolveBucket(clientIP);
        }

        if (!bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            
            ResponseDTO<Void> errorResponse = ResponseDTO.error(
                "RATE_LIMIT_EXCEEDED", 
                "Muitas requisições. Tente novamente mais tarde."
            );
            
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return false;
        }

        return true;
    }
}
