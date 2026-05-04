package com.driesvanhool.fullstackmicrostarter.common.util;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PageRequestUtilTest {

    @Test
    void returnsSortedPageRequestForAllowedField() {
        PageRequest pageRequest = PageRequestUtil.getPageRequest(1, 20, "email", "desc", Set.of("email", "firstName"));

        assertThat(pageRequest.getPageNumber()).isEqualTo(1);
        assertThat(pageRequest.getPageSize()).isEqualTo(20);
        assertThat(pageRequest.getSort()).isEqualTo(Sort.by(Sort.Direction.DESC, "email"));
    }

    @Test
    void throwsForUnsupportedSortField() {
        assertThrows(IllegalArgumentException.class,
                () -> PageRequestUtil.getPageRequest(0, 10, "createdAt", "asc", Set.of("email", "firstName")));
    }
}
