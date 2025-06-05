package com.shufu.homeedu.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务分配响应DTO
 */
@Data
public class TaskAssignmentResponse {
    /**
     * 分配记录ID
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
     * 学生姓名
     */
    private String studentName;

    /**
     * 领取时间
     */
    private LocalDateTime assignTime;

    /**
     * 学生提交时间
     */
    private LocalDateTime submitTime;

    /**
     * 学生提交内容
     */
    private String submitContent;

    /**
     * 家长确认时间
     */
    private LocalDateTime confirmTime;

    /**
     * 最终获得积分
     */
    private Integer finalPoint;

    /**
     * 备注
     */
    private String remark;
} 