package com.driesvanhool.fullstackmicrostarter.userservice.controller;

import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @Test
    void getUserByIdReturnsRequestedUser() {
        UUID userId = UUID.randomUUID();
        UserResponse response = new UserResponse();
        response.setId(userId);
        response.setFirstname("Dries");
        response.setLastname("Van Hool");
        response.setEmail("dries@example.com");
        response.setRoles(List.of("ADMIN"));

        when(userService.findUserById(userId)).thenReturn(response);

        var result = userController.getUserById(userId);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(response);
        verify(userService).findUserById(userId);
    }

    @Test
    void deleteUserByIdReturnsNoContent() {
        UUID userId = UUID.randomUUID();

        var result = userController.deleteUserById(userId);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(userService).deleteUserById(userId);
    }
}
