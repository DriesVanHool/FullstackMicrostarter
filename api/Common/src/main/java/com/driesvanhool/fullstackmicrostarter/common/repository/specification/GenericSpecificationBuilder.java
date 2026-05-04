package com.driesvanhool.fullstackmicrostarter.common.repository.specification;

import com.driesvanhool.fullstackmicrostarter.common.enums.SearchOperation;
import com.driesvanhool.fullstackmicrostarter.common.model.SearchCriteria;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @param <T> entity type being filtered
 * @author Dries Van Hool
 * Parses the incoming search string into reusable {@code SearchCriteria}
 * objects and combines them into a single JPA {@code Specification}. This keeps the
 * controller and service layers free from manual query parsing logic.
 * <p>
 * Search groups separated by `,` are combined with AND.
 * Criteria within one group separated by `|` are combined with OR.
 * <p>
 * Example:
 * {@code firstName~dries|lastName~dries|email~dries,status:ACTIVE}
 * becomes:
 * {@code (firstName contains dries OR lastName contains dries OR email contains dries) AND status = ACTIVE}
 */
public class GenericSpecificationBuilder<T> {
    private static final Pattern SEARCH_PATTERN = Pattern.compile("([\\w.]+?)([:!><~])([^,|]+)");

    private final List<List<SearchCriteria>> criteriaGroups = new ArrayList<>();

    public GenericSpecificationBuilder(String search) {
        if (search == null || search.isBlank()) {
            return;
        }

        String[] groups = search.split(",");
        for (String group : groups) {
            List<SearchCriteria> orCriteria = new ArrayList<>();
            Matcher matcher = SEARCH_PATTERN.matcher(group);

            while (matcher.find()) {
                orCriteria.add(new SearchCriteria(
                        matcher.group(1),
                        SearchOperation.fromSymbol(matcher.group(2)),
                        matcher.group(3).trim()
                ));
            }

            if (!orCriteria.isEmpty()) {
                criteriaGroups.add(orCriteria);
            }
        }
    }

    public Specification<T> build() {
        if (criteriaGroups.isEmpty()) {
            return null;
        }

        Specification<T> specification = buildOrSpecification(criteriaGroups.getFirst());
        for (int index = 1; index < criteriaGroups.size(); index++) {
            specification = specification.and(buildOrSpecification(criteriaGroups.get(index)));
        }
        return specification;
    }

    private Specification<T> buildOrSpecification(List<SearchCriteria> criteriaGroup) {
        Specification<T> specification = new GenericSpecification<>(criteriaGroup.getFirst());
        for (int index = 1; index < criteriaGroup.size(); index++) {
            specification = specification.or(new GenericSpecification<>(criteriaGroup.get(index)));
        }
        return specification;
    }
}
