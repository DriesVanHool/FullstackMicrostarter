package com.driesvanhool.fullstackmicrostarter.userservice.mapper;

import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserRequest;
import com.driesvanhool.fullstackmicrostarter.userservice.dto.UserResponse;
import com.driesvanhool.fullstackmicrostarter.userservice.model.User;

import java.util.List;

public final class UserMapper {
    private UserMapper() {
    }

    public static UserResponse toDto(User user) {
        return toDto(user, List.of());
    }

    public static UserResponse toDto(User user, List<String> roles) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setFirstname(user.getFirstName());
        userResponse.setLastname(user.getLastName());
        userResponse.setEmail(user.getEmail());
        userResponse.setRoles(roles);

        return userResponse;
    }

    public static User requestToDto(String keycloakId, UserRequest userRequest){
        User user = new User();
        user.setKeycloakId(keycloakId);
        user.setEmail(userRequest.getEmail());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        return user;
    }
}
