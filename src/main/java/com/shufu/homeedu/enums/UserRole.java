package com.shufu.homeedu.enums;

/**
 * 用户角色枚举
 */
public enum UserRole {
    PARENT("家长"),
    STUDENT("学生");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 