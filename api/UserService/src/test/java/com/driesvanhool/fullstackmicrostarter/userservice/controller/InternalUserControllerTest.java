package com.driesvanhool.fullstackmicrostarter.userservice.controller;

import com.driesvanhool.fullstackmicrostarter.userservice.service.AuthorizationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InternalUserControllerTest {

    @Mock
    private AuthorizationService authorizationService;

    @InjectMocks
    private InternalUserController internalUserController;

    @Test
    void canAccessUserDataReturnsAuthorizationDecision() {
        UUID userId = UUID.randomUUID();
        when(authorizationService.canAccessUserData(userId)).thenReturn(true);

        ResponseEntity<Boolean> result = internalUserController.canAccessUserData(userId);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody()).isTrue();
        verify(authorizationService).canAccessUserData(userId);
    }
}
