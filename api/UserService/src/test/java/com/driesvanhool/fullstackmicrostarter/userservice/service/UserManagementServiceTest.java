package com.driesvanhool.fullstackmicrostarter.userservice.service;

import com.driesvanhool.fullstackmicrostarter.common.dto.PageResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserRequest;
import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.exceptions.ResourceNotFoundException;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import com.driesvanhool.fullstackmicrostarter.userservice.repository.UserRepository;
import com.driesvanhool.fullstackmicrostarter.userservice.service.identity.IdentityService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private IdentityService identityService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditActorService auditActorService;

    @InjectMocks
    private UserManagementService userManagementService;

    @Test
    void getUsersReturnsMappedPagedResponseWithoutFilters() {
        User firstUser = new User();
        firstUser.setKeycloakId("kc-1");
        firstUser.setEmail("admin@example.com");
        firstUser.setFirstName("Admin");
        firstUser.setLastName("User");

        User secondUser = new User();
        secondUser.setKeycloakId("kc-2");
        secondUser.setEmail("user@example.com");
        secondUser.setFirstName("User");
        secondUser.setLastName("User");

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(userRepository.findAll(pageRequest))
                .thenReturn(new PageImpl<>(List.of(firstUser, secondUser), pageRequest, 2));

        PageResponse<UserResponse> response = userManagementService.getUsers(0, 10, null, null, null);

        assertThat(response.getContent()).hasSize(2);
        assertThat(response.getContent()).extracting(UserResponse::getFirstname)
                .containsExactly("Admin", "User");
        assertThat(response.getPage()).isEqualTo(0);
        assertThat(response.getSize()).isEqualTo(10);
        assertThat(response.getTotalElements()).isEqualTo(2);
        assertThat(response.getTotalPages()).isEqualTo(1);
    }

    @Test
    void getUsersUsesSpecificationWhenSearchIsPresent() {
        User filteredUser = new User();
        filteredUser.setKeycloakId("kc-1");
        filteredUser.setEmail("admin@example.com");
        filteredUser.setFirstName("Admin");
        filteredUser.setLastName("User");

        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "email"));
        when(userRepository.findAll(any(Specification.class), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(filteredUser), pageRequest, 1));

        PageResponse<UserResponse> response = userManagementService.getUsers(0, 10, "firstName~adm", "email", "asc");

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().getFirst().getFirstname()).isEqualTo("Admin");
        verify(userRepository).findAll(any(Specification.class), eq(pageRequest));
    }

    @Test
    void registerUserRegistersIdentityAndPersistsUser() {
        UserRequest request = new UserRequest();
        request.setEmail("dries@example.com");
        request.setFirstName("Dries");
        request.setLastName("Van Hool");
        request.setRoles(List.of("USER"));

        UUID actorId = UUID.randomUUID();
        when(auditActorService.getCurrentActorUserIdOrNull()).thenReturn(actorId);
        when(identityService.registerUser(request)).thenReturn("kc-123");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userManagementService.registerUser(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getKeycloakId()).isEqualTo("kc-123");
        assertThat(savedUser.getEmail()).isEqualTo("dries@example.com");
        assertThat(savedUser.getCreateUser()).isEqualTo(actorId);
        assertThat(savedUser.getUpdateUser()).isEqualTo(actorId);
        assertThat(savedUser.getCreateDate()).isNotNull();
        assertThat(savedUser.getUpdateDate()).isNotNull();
        assertThat(response.getFirstname()).isEqualTo("Dries");
        assertThat(response.getRoles()).containsExactly("USER");
    }

    @Test
    void registerUserRollsBackRegisteredIdentityWhenDatabaseSaveFails() {
        UserRequest request = new UserRequest();
        request.setEmail("dries@example.com");
        request.setFirstName("Dries");
        request.setLastName("Van Hool");
        request.setRoles(List.of("USER"));

        when(identityService.registerUser(request)).thenReturn("kc-123");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("db down"));

        assertThrows(RuntimeException.class, () -> userManagementService.registerUser(request));

        verify(identityService).deleteUser("kc-123");
    }

    @Test
    void registerUserStillThrowsOriginalFailureWhenRollbackAlsoFails() {
        UserRequest request = new UserRequest();
        request.setEmail("dries@example.com");
        request.setFirstName("Dries");
        request.setLastName("Van Hool");

        RuntimeException original = new RuntimeException("db down");
        when(identityService.registerUser(request)).thenReturn("kc-123");
        when(userRepository.save(any(User.class))).thenThrow(original);
        doThrow(new RuntimeException("rollback failed"))
                .when(identityService)
                .deleteUser("kc-123");

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> userManagementService.registerUser(request));

        assertThat(thrown).isSameAs(original);
        verify(identityService).deleteUser("kc-123");
    }

    @Test
    void registerUserDoesNotRollbackWhenRegistrationFailsBeforeIdentityExists() {
        UserRequest request = new UserRequest();
        request.setEmail("dries@example.com");

        when(identityService.registerUser(request)).thenThrow(new RuntimeException("keycloak down"));

        assertThrows(RuntimeException.class, () -> userManagementService.registerUser(request));

        verify(identityService, never()).deleteUser(any());
    }

    @Test
    void updateUserUpdatesIdentityAndAuditFieldsWithoutChangingEmail() {
        UUID userId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        User user = new User();
        user.setKeycloakId("kc-123");
        user.setEmail("existing@example.com");
        user.setFirstName("Old");
        user.setLastName("Name");
        user.setCreateDate(Instant.parse("2026-05-01T10:15:30Z"));
        user.setUpdateDate(Instant.parse("2026-05-01T10:15:30Z"));

        UserRequest request = new UserRequest();
        request.setEmail("changed@example.com");
        request.setFirstName(" New ");
        request.setLastName(" Value ");
        request.setRoles(List.of("ADMIN", "USER"));

        setField(user, "id", userId);
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(user));
        when(auditActorService.getCurrentActorUserIdOrNull()).thenReturn(actorId);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userManagementService.updateUser(userId, request);

        verify(identityService).updateUser(user, request);
        assertThat(user.getEmail()).isEqualTo("existing@example.com");
        assertThat(user.getFirstName()).isEqualTo("New");
        assertThat(user.getLastName()).isEqualTo("Value");
        assertThat(user.getUpdateUser()).isEqualTo(actorId);
        assertThat(user.getUpdateDate()).isAfterOrEqualTo(user.getCreateDate());
        assertThat(response.getEmail()).isEqualTo("existing@example.com");
        assertThat(response.getRoles()).containsExactly("ADMIN", "USER");
    }

    @Test
    void updateUserThrowsWhenUserDoesNotExist() {
        UUID userId = UUID.randomUUID();
        UserRequest request = new UserRequest();
        request.setFirstName("Dries");
        request.setLastName("Van Hool");
        request.setRoles(List.of("ADMIN"));

        when(userRepository.findById(userId)).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userManagementService.updateUser(userId, request));
        verify(identityService, never()).updateUser(any(), any());
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException exception) {
            throw new AssertionError(exception);
        }
    }
}
