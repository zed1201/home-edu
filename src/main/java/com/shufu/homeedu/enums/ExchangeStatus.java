package com.shufu.homeedu.enums;

/**
 * 兑换状态枚举
 */
public enum ExchangeStatus {
    PENDING("待处理"),
    CONFIRMED("已确认"),
    CANCELLED("已取消");

    private final String description;

    ExchangeStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 