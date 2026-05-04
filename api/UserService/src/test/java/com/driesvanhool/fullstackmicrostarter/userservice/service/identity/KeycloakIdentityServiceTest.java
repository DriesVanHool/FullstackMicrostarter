package com.driesvanhool.fullstackmicrostarter.userservice.service.identity;

import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserRequest;
import com.driesvanhool.fullstackmicrostarter.userservice.exceptions.KeycloakException;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.RoleMappingResource;
import org.keycloak.admin.client.resource.RoleScopeResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KeycloakIdentityServiceTest {

    @Mock
    private Keycloak keycloak;

    @Mock
    private RealmResource realmResource;

    @Mock
    private UsersResource usersResource;

    @Mock
    private UserResource userResource;

    @Mock
    private RoleMappingResource roleMappingResource;

    @Mock
    private RoleScopeResource roleScopeResource;

    @Test
    void updateUserThrowsKeycloakExceptionWhenUserLookupIsNotFound() {
        KeycloakIdentityService service = new KeycloakIdentityService(keycloak, "starter-dev");
        User user = new User();
        user.setKeycloakId("kc-123");

        UserRequest request = new UserRequest();
        request.setFirstName("Dries");
        request.setLastName("Van Hool");
        request.setRoles(List.of("ADMIN"));

        when(keycloak.realm("starter-dev")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
        when(usersResource.get("kc-123")).thenThrow(new NotFoundException("missing"));

        assertThatThrownBy(() -> service.updateUser(user, request))
                .isInstanceOf(KeycloakException.class)
                .hasMessage("Identity provider user not found");
    }

    @Test
    void updateUserUpdatesRepresentationAndRoles() {
        KeycloakIdentityService service = new KeycloakIdentityService(keycloak, "starter-dev");
        User user = new User();
        user.setKeycloakId("kc-123");

        UserRequest request = new UserRequest();
        request.setFirstName("Dries");
        request.setLastName("Van Hool");
        request.setRoles(List.of());

        org.keycloak.representations.idm.UserRepresentation representation = new org.keycloak.representations.idm.UserRepresentation();

        when(keycloak.realm("starter-dev")).thenReturn(realmResource);
        when(realmResource.users()).thenReturn(usersResource);
        when(usersResource.get("kc-123")).thenReturn(userResource);
        when(userResource.toRepresentation()).thenReturn(representation);
        when(userResource.roles()).thenReturn(roleMappingResource);
        when(roleMappingResource.realmLevel()).thenReturn(roleScopeResource);
        when(roleScopeResource.listAll()).thenReturn(List.of());

        service.updateUser(user, request);

        verify(userResource).update(representation);
    }
}
