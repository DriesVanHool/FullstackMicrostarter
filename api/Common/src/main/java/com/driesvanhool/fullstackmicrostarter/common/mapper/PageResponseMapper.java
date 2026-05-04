package com.driesvanhool.fullstackmicrostarter.common.mapper;

import com.driesvanhool.fullstackmicrostarter.common.dto.PageResponse;

import java.util.List;

/**
 * @author Dries Van Hool
 * @description Maps paged query results into the shared {@code PageResponse} contract.
 * This keeps pagination response assembly in one reusable place instead of repeating
 * the same next/previous link and metadata logic in each service.
 */
public final class PageResponseMapper {
    private PageResponseMapper() {
    }

    public static <T> PageResponse<T> toDto(List<T> content,
                                            int page,
                                            int size,
                                            long totalElements,
                                            int totalPages,
                                            String basePath) {
        PageResponse<T> response = new PageResponse<>();
        response.setContent(content);
        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(totalElements);
        response.setTotalPages(totalPages);
        response.setNext(page + 1 < totalPages ? basePath + "?page=" + (page + 1) + "&size=" + size : null);
        response.setPrevious(page > 0 ? basePath + "?page=" + (page - 1) + "&size=" + size : null);
        return response;
    }
}
