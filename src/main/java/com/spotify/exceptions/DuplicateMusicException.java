package com.spotify.exceptions;

public class DuplicateMusicException extends RuntimeException {
    public DuplicateMusicException(String message) {
        super(message);
    }
}

