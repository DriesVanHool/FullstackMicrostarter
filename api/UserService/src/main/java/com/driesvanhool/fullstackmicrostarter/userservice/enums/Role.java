package com.driesvanhool.fullstackmicrostarter.userservice.enums;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public enum Role {
    ADMIN,
    USER;

    public static Set<String> names() {
        return Arrays.stream(values())
                .map(Role::name)
                .collect(Collectors.toUnmodifiableSet());
    }
}
