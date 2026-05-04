package com.driesvanhool.fullstackmicrostarter.userservice.controller;

import com.driesvanhool.fullstackmicrostarter.userservice.service.AuthorizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {
    private final AuthorizationService authorizationService;

    public InternalUserController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @GetMapping("/{id}/access")
    public ResponseEntity<Boolean> canAccessUserData(@PathVariable UUID id) {
        return ResponseEntity.ok(authorizationService.canAccessUserData(id));
    }
}
