package com.shufu.homeedu.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务分配实体类
 */
@Data
public class TaskAssignment {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 任务ID
     */
    private Long taskId;

    /**
     * 学生ID
     */
    private Long studentId;

    /**
     * 领取时间
     */
    private LocalDateTime assignedAt;

    /**
     * 学生提交时间
     */
    private LocalDateTime studentSubmit;

    /**
     * 学生提交内容
     */
    private String submitContent;

    /**
     * 家长确认时间
     */
    private LocalDateTime confirmedAt;

    /**
     * 最终获得积分
     */
    private Integer finalPoint;

    /**
     * 备注
     */
    private String remark;
} 