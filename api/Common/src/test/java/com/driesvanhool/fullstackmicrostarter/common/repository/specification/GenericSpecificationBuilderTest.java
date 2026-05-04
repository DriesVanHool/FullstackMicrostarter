package com.driesvanhool.fullstackmicrostarter.common.repository.specification;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import static org.assertj.core.api.Assertions.assertThat;

class GenericSpecificationBuilderTest {

    @Test
    void buildReturnsNullForBlankSearch() {
        Specification<Object> specification = new GenericSpecificationBuilder<Object>("   ").build();

        assertThat(specification).isNull();
    }

    @Test
    void buildSupportsSearchValuesWithSpacesAndSpecialCharacters() {
        String search = "firstName~Dries Van,lastName~O'Hool,email~dries+test@example.com,keycloakId~tenant:user-01";

        Specification<Object> specification = new GenericSpecificationBuilder<Object>(search).build();

        assertThat(specification).isNotNull();
    }

    @Test
    void buildSupportsOrGroupsInsideOneSearchClause() {
        String search = "firstName~dries|lastName~dries|email~dries,status:ACTIVE";

        Specification<Object> specification = new GenericSpecificationBuilder<Object>(search).build();

        assertThat(specification).isNotNull();
    }
}
