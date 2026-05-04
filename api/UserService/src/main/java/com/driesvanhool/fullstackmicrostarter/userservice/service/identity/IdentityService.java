package com.driesvanhool.fullstackmicrostarter.userservice.service.identity;

import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserRequest;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;

import java.util.List;

public interface IdentityService {
    String registerUser(UserRequest request);

    void updateUser(User user, UserRequest request);

    void deleteUser(String userIdentityId);

    List<String> getUserRealmRoles(String userIdentityId);
}
