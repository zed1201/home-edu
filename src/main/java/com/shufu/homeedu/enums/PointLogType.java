package com.shufu.homeedu.enums;

/**
 * 积分日志类型枚举
 */
public enum PointLogType {
    TASK("任务奖励"),
    PRIZE("奖品兑换"),
    ADJUST("手动调整");

    private final String description;

    PointLogType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 