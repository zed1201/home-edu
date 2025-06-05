package com.shufu.homeedu.entity;

import com.shufu.homeedu.enums.ExchangeStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 奖品兑换实体类
 */
@Data
public class PrizeExchange {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 奖品ID
     */
    private Long prizeId;

    /**
     * 学生ID
     */
    private Long studentId;

    /**
     * 花费积分
     */
    private Integer costPoints;

    /**
     * 状态
     */
    private ExchangeStatus status;

    /**
     * 兑换时间
     */
    private LocalDateTime exchangedAt;

    /**
     * 确认时间
     */
    private LocalDateTime confirmedAt;
} 