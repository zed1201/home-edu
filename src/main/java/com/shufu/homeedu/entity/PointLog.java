package com.shufu.homeedu.entity;

import com.shufu.homeedu.enums.PointLogType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分日志实体类
 */
@Data
public class PointLog {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 学生ID
     */
    private Long studentId;

    /**
     * 类型
     */
    private PointLogType type;

    /**
     * 关联ID
     */
    private Long refId;

    /**
     * 积分（正数为收入，负数为支出）
     */
    private Integer points;

    /**
     * 描述
     */
    private String description;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
} 