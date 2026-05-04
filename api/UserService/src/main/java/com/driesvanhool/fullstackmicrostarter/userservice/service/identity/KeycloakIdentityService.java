package com.driesvanhool.fullstackmicrostarter.userservice.service.identity;

import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserRequest;
import com.driesvanhool.fullstackmicrostarter.userservice.enums.Role;
import com.driesvanhool.fullstackmicrostarter.userservice.exceptions.KeycloakException;
import com.driesvanhool.fullstackmicrostarter.userservice.exceptions.ResourcesAlreadyExists;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RealmRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class KeycloakIdentityService implements IdentityService {
    private static final List<String> REGISTRATION_REQUIRED_ACTIONS = List.of("UPDATE_PASSWORD", "VERIFY_EMAIL");
    private static final Logger log = LoggerFactory.getLogger(KeycloakIdentityService.class);

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakIdentityService(Keycloak keycloak,
                                   @Value("${keycloak.realm}") String realm) {
        this.keycloak = keycloak;
        this.realm = realm;
    }

    @Override
    public String registerUser(UserRequest request) {
        log.info("Creating Keycloak user in realm={} with roles={}", realm, request.getRoles());
        RealmResource realmResource = keycloak.realm(realm);
        String keycloakId = createUser(realmResource, request);
        try {
            assignInitialRoles(realmResource, keycloakId, request.getRoles());
            triggerRegistrationActions(realmResource, keycloakId);
        } catch (Exception e) {
            deleteUser(keycloakId);
            throw e;
        }
        log.info("Created Keycloak user keycloakId={} in realm={}", keycloakId, realm);
        return keycloakId;
    }

    @Override
    public void updateUser(User user, UserRequest request) {
        RealmResource realmResource = keycloak.realm(realm);

        try {
            UserResource userResource = realmResource.users().get(user.getKeycloakId());
            UserRepresentation representation = userResource.toRepresentation();
            representation.setFirstName(request.getFirstName());
            representation.setLastName(request.getLastName());
            userResource.update(representation);
            replaceRealmRoles(realmResource, user.getKeycloakId(), request.getRoles());
            log.info("Updated Keycloak user keycloakId={} in realm={} with roles={}", user.getKeycloakId(), realm, request.getRoles());
        } catch (NotFoundException e) {
            log.warn("Keycloak user keycloakId={} not found in realm={} while updating", user.getKeycloakId(), realm);
            throw new KeycloakException("Identity provider user not found");
        } catch (Exception e) {
            log.error("Failed to update Keycloak user keycloakId={} in realm={}", user.getKeycloakId(), realm, e);
            throw new KeycloakException("Failed to update identity provider user");
        }
    }

    @Override
    public void deleteUser(String userIdentityId) {
        RealmResource realmResource = keycloak.realm(realm);
        log.warn("Deleting Keycloak user keycloakId={} in realm={}", userIdentityId, realm);
        try (Response response = realmResource.users().delete(userIdentityId)) {
            int status = response.getStatus();
            if (status >= 400 && status != 404) {
                log.error("Keycloak user delete failed for keycloakId={} in realm={} with status={}", userIdentityId, realm, status);
                throw new KeycloakException("Identity provider delete failed");
            }

            if (status == 404) {
                log.info("Keycloak user keycloakId={} was already absent in realm={}", userIdentityId, realm);
                return;
            }

            log.info("Keycloak user delete completed for keycloakId={} in realm={} with status={}", userIdentityId, realm, status);
        }
    }

    @Override
    public List<String> getUserRealmRoles(String userIdentityId) {
        RealmResource realmResource = keycloak.realm(realm);

        try {
            return realmResource.users().get(userIdentityId).roles().realmLevel().listAll().stream()
                    .map(RoleRepresentation::getName)
                    .filter(roleName -> roleName != null && Role.names().contains(roleName))
                    .sorted(Comparator.naturalOrder())
                    .toList();
        } catch (NotFoundException ex) {
            log.warn("Keycloak user keycloakId={} not found in realm={} while loading roles", userIdentityId, realm);
            return List.of();
        } catch (Exception ex) {
            log.error("Failed to load Keycloak roles for keycloakId={} in realm={}", userIdentityId, realm, ex);
            throw new KeycloakException("Failed to load user roles from identity provider");
        }
    }

    private String createUser(RealmResource realmResource, UserRequest request) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEnabled(true);
        user.setEmailVerified(false);

        try (Response response = realmResource.users().create(user)) {
            int status = response.getStatus();
            return switch (status) {
                case 201 -> CreatedResponseUtil.getCreatedId(response);
                case 409 -> {
                    log.warn("Keycloak user already exists in realm={}", realm);
                    throw new ResourcesAlreadyExists("Email or username already exists");
                }
                case 400 -> {
                    log.warn("Keycloak rejected user creation in realm={} with status={}", realm, status);
                    throw new IllegalArgumentException("Invalid user data: " + response.readEntity(String.class));
                }
                default -> {
                    log.error("Keycloak user create failed in realm={} with status={}", realm, status);
                    throw new KeycloakException("Identity provider create failed: " + response.readEntity(String.class));
                }
            };
        }
    }

    private void assignInitialRoles(RealmResource realmResource, String keycloakId, List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return;
        }

        List<RoleRepresentation> roles = loadRealmRoles(realmResource, roleNames);
        realmResource.users().get(keycloakId).roles().realmLevel().add(roles);
        log.info("Assigned {} Keycloak roles to keycloakId={} in realm={}", roles.size(), keycloakId, realm);
    }

    private void replaceRealmRoles(RealmResource realmResource, String keycloakId, List<String> requestedRoleNames) {
        UserResource userResource = realmResource.users().get(keycloakId);
        List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll().stream()
                .filter(role -> role.getName() != null && Role.names().contains(role.getName()))
                .toList();

        Set<String> requestedRoleSet = requestedRoleNames == null ? Set.of() : requestedRoleNames.stream().collect(Collectors.toSet());
        List<RoleRepresentation> rolesToRemove = currentRoles.stream()
                .filter(role -> !requestedRoleSet.contains(role.getName()))
                .toList();

        if (!rolesToRemove.isEmpty()) {
            userResource.roles().realmLevel().remove(rolesToRemove);
        }

        List<RoleRepresentation> rolesToAdd = loadRealmRoles(realmResource, requestedRoleNames).stream()
                .filter(role -> currentRoles.stream().noneMatch(currentRole -> currentRole.getName().equals(role.getName())))
                .toList();

        if (!rolesToAdd.isEmpty()) {
            userResource.roles().realmLevel().add(rolesToAdd);
        }
    }

    private List<RoleRepresentation> loadRealmRoles(RealmResource realmResource, List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return List.of();
        }

        return roleNames.stream()
                .map(roleName -> {
                    try {
                        return realmResource.roles().get(roleName).toRepresentation();
                    } catch (NotFoundException e) {
                        log.warn("Keycloak role {} not found in realm={}", roleName, realm);
                        throw new IllegalArgumentException("Role does not exist in Keycloak: " + roleName);
                    }
                })
                .toList();
    }

    private void triggerRegistrationActions(RealmResource realmResource, String keycloakId) {
        validateMailConfigured(realmResource);

        try {
            realmResource.users().get(keycloakId).executeActionsEmail(REGISTRATION_REQUIRED_ACTIONS);
            log.info("Triggered {} registration actions for keycloakId={} in realm={}",
                    REGISTRATION_REQUIRED_ACTIONS.size(), keycloakId, realm);
        } catch (Exception e) {
            log.warn("Registration actions could not be triggered for keycloakId={}", keycloakId, e);
            throw new IllegalStateException("Problem with registration flow");
        }
    }

    private void validateMailConfigured(RealmResource realmResource) {
        RealmRepresentation realmRepresentation = realmResource.toRepresentation();
        Map<String, String> smtpConfig = realmRepresentation.getSmtpServer();

        if (smtpConfig == null || smtpConfig.isEmpty() || !smtpConfig.containsKey("host")) {
            log.info("Keycloak realm '{}' has no SMTP server configured. Cannot send registration action emails.", realmRepresentation.getRealm());
            throw new IllegalStateException("Mail connectivity problems. Please contact support.");
        }
    }
}
