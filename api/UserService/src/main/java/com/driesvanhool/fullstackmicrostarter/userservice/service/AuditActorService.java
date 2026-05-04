package com.driesvanhool.fullstackmicrostarter.userservice.service;

import com.driesvanhool.fullstackmicrostarter.common.security.AuthenticationFacade;
import com.driesvanhool.fullstackmicrostarter.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditActorService {
    private final AuthenticationFacade authenticationFacade;
    private final UserRepository userRepository;

    public AuditActorService(AuthenticationFacade authenticationFacade,
                             UserRepository userRepository) {
        this.authenticationFacade = authenticationFacade;
        this.userRepository = userRepository;
    }

    public UUID getCurrentActorUserIdOrNull() {
        String subject = authenticationFacade.getSubject();
        if (subject == null || subject.isBlank()) {
            return null;
        }

        return userRepository.findByIdentityId(subject)
                .map(com.driesvanhool.fullstackmicrostarter.userservice.model.User::getId)
                .orElse(null);
    }
}
