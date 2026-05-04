package com.driesvanhool.fullstackmicrostarter.userservice.service;

import com.driesvanhool.fullstackmicrostarter.common.dto.PageResponse;
import com.driesvanhool.fullstackmicrostarter.common.mapper.PageResponseMapper;
import com.driesvanhool.fullstackmicrostarter.common.repository.specification.GenericSpecificationBuilder;
import com.driesvanhool.fullstackmicrostarter.common.util.PageRequestUtil;
import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserRequest;
import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.exceptions.ResourceNotFoundException;
import com.driesvanhool.fullstackmicrostarter.userservice.mapper.UserMapper;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import com.driesvanhool.fullstackmicrostarter.userservice.repository.UserRepository;
import com.driesvanhool.fullstackmicrostarter.userservice.service.identity.IdentityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
public class UserManagementService {
    private static final String USERS_PAGE_PATH = "/admin/users";
    private static final Set<String> USER_SORT_FIELDS = Set.of("firstName", "lastName", "email");
    private static final Logger log = LoggerFactory.getLogger(UserManagementService.class);

    private final IdentityService identityService;
    private final UserRepository userRepository;
    private final AuditActorService auditActorService;

    public UserManagementService(IdentityService identityService,
                                 UserRepository userRepository,
                                 AuditActorService auditActorService) {
        this.identityService = identityService;
        this.userRepository = userRepository;
        this.auditActorService = auditActorService;
    }

    @Transactional
    public UserResponse registerUser(UserRequest request) {
        log.info("Registering user with roles={}", request.getRoles());
        String keycloakId = identityService.registerUser(request);

        try {
            User user = UserMapper.requestToDto(keycloakId, request);
            Instant now = Instant.now();
            UUID actorUserId = auditActorService.getCurrentActorUserIdOrNull();
            user.setCreateDate(now);
            user.setUpdateDate(now);
            user.setCreateUser(actorUserId);
            user.setUpdateUser(actorUserId);
            userRepository.save(user);
            log.info("User registration persisted for keycloakId={}", keycloakId);
            return UserMapper.toDto(user, request.getRoles());
        } catch (Exception e) {
            log.error("User registration persistence failed for keycloakId={}", keycloakId, e);
            deleteUser(keycloakId);
            throw e;
        }
    }

    public PageResponse<UserResponse> getUsers(int page,
                                               int size,
                                               String search,
                                               String sortBy,
                                               String orderBy) {
        Pageable pageable = PageRequestUtil.getPageRequest(page, size, sortBy, orderBy, USER_SORT_FIELDS);
        Specification<User> filters = new GenericSpecificationBuilder<User>(search).build();
        Page<User> usersPage = filters == null
                ? userRepository.findAll(pageable)
                : userRepository.findAll(filters, pageable);

        log.debug("Listed {} users for page={} size={}", usersPage.getNumberOfElements(), usersPage.getNumber(), usersPage.getSize());

        return PageResponseMapper.toDto(
                usersPage.getContent().stream().map(UserMapper::toDto).toList(),
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                USERS_PAGE_PATH
        );
    }

    @Transactional
    public UserResponse updateUser(UUID id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not found"));

        identityService.updateUser(user, request);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setUpdateDate(Instant.now());
        user.setUpdateUser(auditActorService.getCurrentActorUserIdOrNull());
        userRepository.save(user);

        log.info("Updated user userId={} keycloakId={} with roles={}", user.getId(), user.getKeycloakId(), request.getRoles());
        return UserMapper.toDto(user, request.getRoles());
    }

    private void deleteUser(String keycloakId) {
        try {
            identityService.deleteUser(keycloakId);
            log.info("Rolled back Keycloak user creation for keycloakId={}", keycloakId);
        } catch (Exception rollbackException) {
            log.error("Rollback failed for keycloakId={}", keycloakId, rollbackException);
        }
    }
}
