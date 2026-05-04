package com.driesvanhool.fullstackmicrostarter.userservice.service;

import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.exceptions.ResourceNotFoundException;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;
import com.driesvanhool.fullstackmicrostarter.userservice.repository.UserRepository;
import com.driesvanhool.fullstackmicrostarter.userservice.service.identity.IdentityService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.InOrder;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionTemplate;

import java.lang.reflect.Field;
import java.util.function.Consumer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private IdentityService identityService;

    @Mock
    private TransactionTemplate transactionTemplate;

    @InjectMocks
    private UserService userService;

    @Test
    void getUserReturnsMappedUserDto() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "kc-1", "dries@example.com", "Van Hool", "Dries");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(identityService.getUserRealmRoles("kc-1")).thenReturn(List.of("ADMIN", "USER"));

        UserResponse result = userService.findUserById(userId);

        assertThat(result.getId()).isEqualTo(userId);
        assertThat(result.getFirstname()).isEqualTo("Dries");
        assertThat(result.getRoles()).containsExactly("ADMIN", "USER");
    }

    @Test
    void getUserThrowsWhenUserIsMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.findUserById(userId));
    }

    @Test
    void deleteUserByIdDeletesIdentityThenLocalRecord() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "kc-1", "dries@example.com", "Van Hool", "Dries");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        doAnswer(invocation -> {
            Consumer<Object> callback = invocation.getArgument(0);
            callback.accept(null);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());

        userService.deleteUserById(userId);

        InOrder inOrder = org.mockito.Mockito.inOrder(identityService, transactionTemplate, userRepository);
        inOrder.verify(identityService).deleteUser("kc-1");
        inOrder.verify(transactionTemplate).executeWithoutResult(any());
        inOrder.verify(userRepository).deleteById(userId);
        inOrder.verify(userRepository).flush();
    }

    @Test
    void deleteUserByIdDoesNotDeleteLocalRecordWhenIdentityDeletionFails() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, "kc-1", "dries@example.com", "Van Hool", "Dries");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        doThrow(new IllegalStateException("Identity provider delete failed")).when(identityService).deleteUser("kc-1");

        assertThrows(IllegalStateException.class, () -> userService.deleteUserById(userId));

        verify(transactionTemplate, never()).executeWithoutResult(any());
        verify(userRepository, never()).deleteById(userId);
        verify(userRepository, never()).flush();
    }

    @Test
    void deleteUserByIdThrowsWhenUserIsMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUserById(userId));

        verify(transactionTemplate, never()).executeWithoutResult(any());
        verify(userRepository, never()).deleteById(any());
        verify(userRepository, never()).flush();
        verify(identityService, never()).deleteUser(org.mockito.ArgumentMatchers.anyString());
    }

    private User user(UUID id, String keycloakId, String email, String lastName, String firstName) {
        User user = new User();
        setField(user, "id", id);
        user.setKeycloakId(keycloakId);
        user.setEmail(email);
        user.setLastName(lastName);
        user.setFirstName(firstName);
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
