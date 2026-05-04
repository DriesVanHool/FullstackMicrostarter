package com.driesvanhool.fullstackmicrostarter.gatewayservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CorsConfigTest {
    private final CorsConfig corsConfig = new CorsConfig();

    @Test
    void appliesConfiguredCorsPropertiesToRegisteredConfiguration() {
        CorsProperties properties = new CorsProperties();
        properties.setAllowedOrigins(List.of("http://localhost:5173", "https://portal.starter.example"));
        properties.setAllowedMethods(List.of("GET", "POST", "HEAD"));
        properties.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        properties.setExposedHeaders(List.of("Location"));
        properties.setAllowCredentials(true);

        CorsConfigurationSource source = corsConfig.corsConfigurationSource(properties);
        ServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/admin/users").build());
        CorsConfiguration configuration = source.getCorsConfiguration(exchange);

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins()).containsExactly("http://localhost:5173", "https://portal.starter.example");
        assertThat(configuration.getAllowedMethods()).containsExactly("GET", "POST", "HEAD");
        assertThat(configuration.getAllowedHeaders()).containsExactly("Authorization", "Content-Type");
        assertThat(configuration.getExposedHeaders()).containsExactly("Location");
        assertThat(configuration.getAllowCredentials()).isTrue();
    }

    @Test
    void rejectsWildcardOriginsWhenCredentialsAreEnabled() {
        CorsProperties properties = new CorsProperties();
        properties.setAllowedOrigins(List.of("*"));
        properties.setAllowCredentials(true);

        assertThatThrownBy(() -> corsConfig.corsConfigurationSource(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("allowed-origins contains '*'");
    }
}
