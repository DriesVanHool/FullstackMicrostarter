package com.driesvanhool.fullstackmicrostarter.userservice.exceptions;

public class KeycloakException extends RuntimeException {
    public KeycloakException(String message) {
        super(message);
    }
}
