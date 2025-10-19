package com.spotify.utils;

import jakarta.servlet.http.HttpServletRequest;

public class ClientIPUtil {
    
    private ClientIPUtil() {
        // Utility class
    }
    
    /**
     * Extrai o IP real do cliente considerando proxies e load balancers
     */
    public static String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        // Pega o primeiro IP da lista (IP original do cliente)
        return xfHeader.split(",")[0].trim();
    }
}

