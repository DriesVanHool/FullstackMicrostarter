package com.driesvanhool.fullstackmicrostarter.userservice.exceptions;

public class ResourcesAlreadyExists extends RuntimeException {
    public ResourcesAlreadyExists(String message) {
        super(message);
    }
}
