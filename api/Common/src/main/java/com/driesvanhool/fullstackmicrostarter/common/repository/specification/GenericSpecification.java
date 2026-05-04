package com.driesvanhool.fullstackmicrostarter.common.repository.specification;

import com.driesvanhool.fullstackmicrostarter.common.model.SearchCriteria;
import jakarta.persistence.criteria.*;
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.domain.Specification;

/**
 * @param <T> entity type being filtered
 * @author Dries Van Hool
 * Applies one {@code SearchCriteria} object to a JPA query.
 * This is the low-level reusable specification piece that turns a parsed
 * criterion into a concrete predicate for the entity being queried.
 */
public class GenericSpecification<T> implements Specification<T> {
    private final SearchCriteria criteria;

    public GenericSpecification(SearchCriteria criteria) {
        this.criteria = criteria;
    }

    @Override
    public Predicate toPredicate(Root<T> root, @NonNull CriteriaQuery<?> query, @NonNull CriteriaBuilder criteriaBuilder) {
        Path<?> path = root.get(criteria.getKey());

        return switch (criteria.getOperation()) {
            case EQUALITY -> criteriaBuilder.equal(path, criteria.getValue());
            case NEGATION -> criteriaBuilder.notEqual(path, criteria.getValue());
            case GREATER_THAN -> criteriaBuilder.greaterThan(root.get(criteria.getKey()), criteria.getValue());
            case LESS_THAN -> criteriaBuilder.lessThan(root.get(criteria.getKey()), criteria.getValue());
            case CONTAINS -> criteriaBuilder.like(
                    criteriaBuilder.lower(root.get(criteria.getKey())),
                    "%" + criteria.getValue().toLowerCase() + "%"
            );
        };
    }
}
