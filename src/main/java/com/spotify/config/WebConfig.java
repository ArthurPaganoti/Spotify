package com.spotify.config;

import com.spotify.business.security.LegacyRateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    private final LegacyRateLimitInterceptor legacyRateLimitInterceptor;
    private final com.spotify.config.RateLimitInterceptor rateLimitInterceptor;

    public WebConfig(LegacyRateLimitInterceptor legacyRateLimitInterceptor,
                     com.spotify.config.RateLimitInterceptor rateLimitInterceptor) {
        this.legacyRateLimitInterceptor = legacyRateLimitInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/swagger-ui/**", "/v3/api-docs/**");

        registry.addInterceptor(legacyRateLimitInterceptor)
                .addPathPatterns("/users/**");
    }
}

