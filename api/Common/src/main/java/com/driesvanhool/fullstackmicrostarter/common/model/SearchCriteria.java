package com.driesvanhool.fullstackmicrostarter.common.model;

import com.driesvanhool.fullstackmicrostarter.common.enums.SearchOperation;

/**
 * @author Dries Van Hool
 * @description Represents one parsed filter fragment from the incoming search query.
 * It keeps the field name, selected operator, and raw value together so the
 * generic specification layer can transform search input into database predicates.
 */
public class SearchCriteria {
    private final String key;
    private final SearchOperation operation;
    private final String value;

    public SearchCriteria(String key, SearchOperation operation, String value) {
        this.key = key;
        this.operation = operation;
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public SearchOperation getOperation() {
        return operation;
    }

    public String getValue() {
        return value;
    }
}
