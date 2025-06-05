package com.shufu.homeedu.enums;

/**
 * 任务状态枚举
 */
public enum TaskStatus {
    PUBLISHED("已发布"),
    IN_PROGRESS("进行中"),
    WAIT_CONFIRM("待确认"),
    DONE("已完成"),
    EXPIRED("已过期");

    private final String description;

    TaskStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 