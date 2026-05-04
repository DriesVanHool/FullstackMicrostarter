package com.driesvanhool.fullstackmicrostarter.userservice.service;

import com.driesvanhool.fullstackmicrostarter.common.security.AuthenticationFacade;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import com.driesvanhool.fullstackmicrostarter.userservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service("authorizationService")
public class AuthorizationService {
    private static final Logger log = LoggerFactory.getLogger(AuthorizationService.class);

    private final AuthenticationFacade authenticationFacade;
    private final UserRepository userRepository;

    public AuthorizationService(AuthenticationFacade authenticationFacade, UserRepository userRepository) {
        this.authenticationFacade = authenticationFacade;
        this.userRepository = userRepository;
    }

    public boolean canAccessUserData(UUID userId) {
        if (!isAuthenticated()) {
            log.debug("Access denied for userId={}: missing or unauthenticated principal", userId);
            return false;
        }

        if (hasAnyRole("ROLE_ADMIN")) {
            log.debug("Access granted for userId={} via elevated role", userId);
            return true;
        }

        if (isOwner(userId)) {
            log.debug("Access granted for userId={} via ownership", userId);
            return true;
        }

        log.debug("Access denied for userId={}: principal does not own requested user", userId);
        return false;
    }

    public boolean canDeleteUser(UUID userId) {
        if (!isAuthenticated()) {
            log.debug("Delete denied for userId={}: missing or unauthenticated principal", userId);
            return false;
        }

        if (hasAnyRole("ROLE_ADMIN")) {
            log.debug("Delete granted for userId={} via admin role", userId);
            return true;
        }

        if (isOwner(userId)) {
            log.debug("Delete granted for userId={} via ownership", userId);
            return true;
        }

        log.debug("Delete denied for userId={}: principal is not allowed to delete requested user", userId);
        return false;
    }

    public boolean canUpdateUser(UUID userId) {
        if (!isAuthenticated()) {
            log.debug("Update denied for userId={}: missing or unauthenticated principal", userId);
            return false;
        }

        boolean allowed = hasAnyRole("ROLE_ADMIN");
        log.debug("Update {} for userId={} via admin-only rule", allowed ? "granted" : "denied", userId);
        return allowed;
    }

    private boolean isAuthenticated() {
        Authentication authentication = authenticationFacade.getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    private boolean hasAnyRole(String... roles) {
        for (String role : roles) {
            if (authenticationFacade.hasRole(role)) {
                return true;
            }
        }
        return false;
    }

    private boolean isOwner(UUID userId) {
        String subject = authenticationFacade.getSubject();
        if (subject == null || subject.isBlank()) {
            log.debug("Ownership check denied for userId={}: missing subject", userId);
            return false;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.debug("Ownership check denied for userId={}: user not found", userId);
            return false;
        }

        return subject.equals(user.getKeycloakId());
    }
}
