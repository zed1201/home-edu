package com.shufu.homeedu.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务创建请求DTO
 */
@Data
public class TaskCreateRequest {
    /**
     * 任务标题
     */
    private String title;

    /**
     * 任务说明
     */
    private String description;

    /**
     * 原始积分
     */
    private Integer point;

    /**
     * 截止时间
     */
    private LocalDateTime deadline;
} 