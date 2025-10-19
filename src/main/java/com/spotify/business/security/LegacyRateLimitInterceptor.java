package com.spotify.business.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component("legacyRateLimitInterceptor")
public class LegacyRateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod handlerMethod) {
            RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);

            if (rateLimit != null) {
                String key = getClientKey(request, handlerMethod);
                Bucket bucket = resolveBucket(key, rateLimit);

                if (bucket.tryConsume(1)) {
                    return true;
                } else {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"success\":false,\"code\":\"RATE_LIMIT_EXCEEDED\"," +
                        "\"message\":\"Muitas requisições. Tente novamente mais tarde.\"," +
                        "\"timestamp\":\"" + java.time.Instant.now() + "\"}"
                    );
                    return false;
                }
            }
        }
        return true;
    }

    private Bucket resolveBucket(String key, RateLimit rateLimit) {
        return cache.computeIfAbsent(key, k -> createNewBucket(rateLimit));
    }

    private Bucket createNewBucket(RateLimit rateLimit) {
        Bandwidth limit = Bandwidth.classic(
            rateLimit.requests(),
            Refill.intervally(rateLimit.requests(), Duration.ofMinutes(rateLimit.perMinutes()))
        );
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }

    private String getClientKey(HttpServletRequest request, HandlerMethod handlerMethod) {
        String ip = getClientIP(request);
        String endpoint = handlerMethod.getMethod().getName();
        return ip + ":" + endpoint;
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
