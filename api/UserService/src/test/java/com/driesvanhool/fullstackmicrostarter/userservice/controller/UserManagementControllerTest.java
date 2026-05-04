package com.driesvanhool.fullstackmicrostarter.userservice.controller;

import com.driesvanhool.fullstackmicrostarter.common.dto.PageResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserRequest;
import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.service.UserManagementService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementControllerTest {

    @Mock
    private UserManagementService userManagementService;

    @InjectMocks
    private UserManagementController userManagementController;

    @Test
    void getUsersReturnsPagedResponse() {
        UserResponse user = new UserResponse();
        user.setId(UUID.randomUUID());
        user.setFirstname("Dries");

        PageResponse<UserResponse> response = new PageResponse<>();
        response.setContent(List.of(user));
        response.setPage(0);
        response.setSize(10);
        response.setTotalElements(1);
        response.setTotalPages(1);

        when(userManagementService.getUsers(0, 10, "firstName~dries", "email", "asc")).thenReturn(response);

        ResponseEntity<PageResponse<UserResponse>> result = userManagementController.getUsers(0, 10, "firstName~dries", "email", "asc");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(response);
        verify(userManagementService).getUsers(0, 10, "firstName~dries", "email", "asc");
    }

    @Test
    void registerUserReturnsCreatedResponse() {
        UserRequest request = new UserRequest();
        request.setEmail("dries@example.com");
        request.setFirstName("Dries");
        request.setLastName("Van Hool");

        UserResponse response = new UserResponse();
        response.setId(UUID.randomUUID());
        response.setFirstname("Dries");

        when(userManagementService.registerUser(request)).thenReturn(response);

        ResponseEntity<UserResponse> result = userManagementController.registerUser(request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(result.getBody()).isSameAs(response);
        verify(userManagementService).registerUser(request);
    }

    @Test
    void updateUserReturnsOkResponse() {
        UUID userId = UUID.randomUUID();
        UserRequest request = new UserRequest();
        request.setEmail("dries@example.com");
        request.setFirstName("Dries");
        request.setLastName("Updated");
        request.setRoles(List.of("ADMIN"));

        UserResponse response = new UserResponse();
        response.setId(userId);
        response.setFirstname("Dries");
        response.setLastname("Updated");

        when(userManagementService.updateUser(userId, request)).thenReturn(response);

        ResponseEntity<UserResponse> result = userManagementController.updateUser(userId, request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(response);
        verify(userManagementService).updateUser(userId, request);
    }
}
