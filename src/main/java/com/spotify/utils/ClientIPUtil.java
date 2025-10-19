package com.spotify.utils;

import jakarta.servlet.http.HttpServletRequest;

public class ClientIPUtil {
    
    private ClientIPUtil() {
    }
    

    public static String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

