package com.driesvanhool.fullstackmicrostarter.gatewayservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.config.GatewayProperties;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class GatewayRoutesTest {
    @Autowired
    private GatewayProperties gatewayProperties;

    @Test
    void loadsExpectedGatewayRoutes() {
        assertThat(gatewayProperties.getRoutes())
                .extracting(route -> route.getId())
                .containsExactly("user-service");
    }
}
