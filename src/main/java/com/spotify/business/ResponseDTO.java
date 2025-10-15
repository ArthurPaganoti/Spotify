package com.spotify.business;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
public class ResponseDTO<T> {

    private boolean success;
    private String code;
    private String message;
    private T content;
    private Instant timestamp;


    public ResponseDTO(String code, String message) {
        this.success = false;
        this.code = code;
        this.message = message;
        this.timestamp = Instant.now();
    }

    public ResponseDTO(T content, String message) {
        this.success = true;
        this.content = content;
        this.message = message;
        this.timestamp = Instant.now();
    }

    public static <T> ResponseDTO<T> success(String message) {
        ResponseDTO<T> response = new ResponseDTO<>(null, message);
        response.success = true;
        return response;
    }

    public static <T> ResponseDTO<T> success(T content, String message) {
        return new ResponseDTO<>(content, message);
    }

    public static <T> ResponseDTO<T> error(String code, String message) {
        return new ResponseDTO<>(code, message);
    }
}
