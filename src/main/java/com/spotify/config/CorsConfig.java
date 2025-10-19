package com.spotify.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permite credenciais
        config.setAllowCredentials(true);
        
        // Permite requisições de localhost nas portas 3000 e 5173 (Vite)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173"
        ));
        
        // Permite todos os headers
        config.addAllowedHeader("*");
        
        // Permite todos os métodos HTTP
        config.addAllowedMethod("*");
        
        // Expõe headers de autorização
        config.addExposedHeader("Authorization");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}

