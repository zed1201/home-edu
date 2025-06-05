package com.shufu.homeedu.entity;

import com.shufu.homeedu.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务实体类
 */
@Data
public class Task {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 创建者家长ID
     */
    private Long parentId;

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

    /**
     * 任务状态
     */
    private TaskStatus status;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
} 