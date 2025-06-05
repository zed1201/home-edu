package com.shufu.homeedu.enums;

/**
 * 奖品状态枚举
 */
public enum PrizeStatus {
    ACTIVE("有效"),
    INACTIVE("无效");

    private final String description;

    PrizeStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 