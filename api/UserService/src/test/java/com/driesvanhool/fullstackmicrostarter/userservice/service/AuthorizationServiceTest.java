package com.driesvanhool.fullstackmicrostarter.userservice.service;

import com.driesvanhool.fullstackmicrostarter.common.security.AuthenticationFacade;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import com.driesvanhool.fullstackmicrostarter.userservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.lang.reflect.Field;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private AuthenticationFacade authenticationFacade;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthorizationService authorizationService;

    @Test
    void userCanAccessOwnUserData() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "kc-user-1");

        mockAuthenticatedUser();
        when(authenticationFacade.hasRole("ROLE_ADMIN")).thenReturn(false);
        when(authenticationFacade.getSubject()).thenReturn("kc-user-1");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThat(authorizationService.canAccessUserData(userId)).isTrue();
    }

    @Test
    void userCannotAccessOtherUserData() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "kc-user-2");

        mockAuthenticatedUser();
        when(authenticationFacade.getSubject()).thenReturn("kc-user-1");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThat(authorizationService.canAccessUserData(userId)).isFalse();
    }

    @Test
    void userCannotAccessUserDataWithoutSubject() {
        UUID userId = UUID.randomUUID();

        mockAuthenticatedUser();
        when(authenticationFacade.getSubject()).thenReturn(null);

        assertThat(authorizationService.canAccessUserData(userId)).isFalse();
        verify(userRepository, never()).findById(userId);
    }

    @Test
    void adminCanAccessUserData() {
        UUID userId = UUID.randomUUID();

        mockAuthenticatedUser();
        when(authenticationFacade.hasRole("ROLE_ADMIN")).thenReturn(true);

        assertThat(authorizationService.canAccessUserData(userId)).isTrue();
        verify(userRepository, never()).findById(userId);
    }

    @Test
    void adminCanDeleteUser() {
        UUID userId = UUID.randomUUID();

        mockAuthenticatedUser();
        when(authenticationFacade.hasRole("ROLE_ADMIN")).thenReturn(true);

        assertThat(authorizationService.canDeleteUser(userId)).isTrue();
        verify(userRepository, never()).findById(userId);
    }

    @Test
    void ownerCanDeleteOwnUser() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "kc-user-1");

        mockAuthenticatedUser();
        when(authenticationFacade.hasRole("ROLE_ADMIN")).thenReturn(false);
        when(authenticationFacade.getSubject()).thenReturn("kc-user-1");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThat(authorizationService.canDeleteUser(userId)).isTrue();
    }

    @Test
    void genericUserCannotDeleteAnotherUserWithoutAdminRole() {
        UUID userId = UUID.randomUUID();

        mockAuthenticatedUser();
        when(authenticationFacade.hasRole("ROLE_ADMIN")).thenReturn(false);
        when(authenticationFacade.getSubject()).thenReturn("kc-user-9");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user(userId, "kc-user-1")));

        assertThat(authorizationService.canDeleteUser(userId)).isFalse();
    }

    @Test
    void adminCanUpdateUser() {
        UUID userId = UUID.randomUUID();

        mockAuthenticatedUser();
        when(authenticationFacade.hasRole("ROLE_ADMIN")).thenReturn(true);

        assertThat(authorizationService.canUpdateUser(userId)).isTrue();
    }

    @Test
    void nonAdminCannotUpdateUser() {
        UUID userId = UUID.randomUUID();

        mockAuthenticatedUser();
        when(authenticationFacade.hasRole("ROLE_ADMIN")).thenReturn(false);

        assertThat(authorizationService.canUpdateUser(userId)).isFalse();
        verify(userRepository, never()).findById(userId);
    }

    @Test
    void unauthenticatedUserCannotDeleteUser() {
        UUID userId = UUID.randomUUID();
        Authentication authentication = new TestingAuthenticationToken("principal", "credentials");
        authentication.setAuthenticated(false);
        when(authenticationFacade.getAuthentication()).thenReturn(authentication);

        assertThat(authorizationService.canDeleteUser(userId)).isFalse();
        verify(userRepository, never()).findById(userId);
    }

    private void mockAuthenticatedUser() {
        Authentication authentication = new TestingAuthenticationToken("principal", "credentials", "ROLE_USER");
        when(authenticationFacade.getAuthentication()).thenReturn(authentication);
    }

    private User user(UUID id, String keycloakId) {
        User user = new User();
        setField(user, "id", id);
        user.setKeycloakId(keycloakId);
        return user;
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException exception) {
            throw new AssertionError(exception);
        }
    }
}
