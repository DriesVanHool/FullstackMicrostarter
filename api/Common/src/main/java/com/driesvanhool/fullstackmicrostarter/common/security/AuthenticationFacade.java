package com.driesvanhool.fullstackmicrostarter.common.security;

import org.springframework.security.core.Authentication;

public interface AuthenticationFacade {
    Authentication getAuthentication();

    String getSubject();

    boolean hasRole(String role);
}
