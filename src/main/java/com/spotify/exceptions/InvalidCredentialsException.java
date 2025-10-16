package com.spotify.exceptions;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Usuário ou senha inválidos");
    }
}

