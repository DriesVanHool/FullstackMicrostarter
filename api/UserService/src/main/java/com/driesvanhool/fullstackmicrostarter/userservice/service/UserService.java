package com.driesvanhool.fullstackmicrostarter.userservice.service;

import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.exceptions.ResourceNotFoundException;
import com.driesvanhool.fullstackmicrostarter.userservice.mapper.UserMapper;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import com.driesvanhool.fullstackmicrostarter.userservice.repository.UserRepository;
import com.driesvanhool.fullstackmicrostarter.userservice.service.identity.IdentityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final IdentityService identityService;
    private final TransactionTemplate transactionTemplate;

    public UserService(UserRepository userRepository,
                       IdentityService identityService,
                       TransactionTemplate transactionTemplate) {
        this.userRepository = userRepository;
        this.identityService = identityService;
        this.transactionTemplate = transactionTemplate;
    }

    public UserResponse findUserById(UUID id) {
        log.debug("Fetching user profile for userId={}", id);
        User user = findUserByIdOrThrow(id);

        log.debug("User profile lookup succeeded for userId={}", id);
        return UserMapper.toDto(user, identityService.getUserRealmRoles(user.getKeycloakId()));
    }

    public void deleteUserById(UUID id) {
        User user = findUserByIdOrThrow(id);

        log.warn("Deleting user userId={} userIdentityId={}", user.getId(), user.getKeycloakId());
        identityService.deleteUser(user.getKeycloakId());

        transactionTemplate.executeWithoutResult(status -> {
            userRepository.deleteById(id);
            userRepository.flush();
        });

        log.info("Deleted user userId={} userIdentityId={} from identity provider and local store", user.getId(), user.getKeycloakId());
    }

    private User findUserByIdOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not found"));
    }
}
