package com.driesvanhool.fullstackmicrostarter.common.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.Set;

/**
 * @author Dries Van Hool
 * @description Builds validated Spring Data {@code PageRequest} instances for reusable
 * pagination and sorting. It centralizes allowed sort-field checks so services can
 * share the mechanics while still controlling which fields are sortable.
 */
public final class PageRequestUtil {
    private PageRequestUtil() {
    }

    public static PageRequest getPageRequest(int page,
                                             int size,
                                             String sortBy,
                                             String orderBy,
                                             Set<String> allowedSortFields) {
        Sort sort = Sort.unsorted();

        if (sortBy != null && !sortBy.isBlank()) {
            if (!allowedSortFields.contains(sortBy)) {
                throw new IllegalArgumentException("Unsupported sort field: " + sortBy);
            }

            Sort.Direction direction = "desc".equalsIgnoreCase(orderBy)
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            sort = Sort.by(direction, sortBy);
        }

        return PageRequest.of(page, size, sort);
    }
}
