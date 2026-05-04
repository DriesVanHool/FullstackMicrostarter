package com.driesvanhool.fullstackmicrostarter.common.repository.specification;

public enum SearchOperation {
    EQUALITY(':'),
    NEGATION('!'),
    GREATER_THAN('>'),
    LESS_THAN('<'),
    CONTAINS('~');

    private final char symbol;

    SearchOperation(char symbol) {
        this.symbol = symbol;
    }

    public char getSymbol() {
        return symbol;
    }

    public static SearchOperation fromSymbol(String symbol) {
        char operator = symbol.charAt(0);
        for (SearchOperation value : values()) {
            if (value.symbol == operator) {
                return value;
            }
        }
        throw new IllegalArgumentException("Unsupported search operator: " + symbol);
    }
}
