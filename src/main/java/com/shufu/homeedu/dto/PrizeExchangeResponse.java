package com.shufu.homeedu.dto;

import com.shufu.homeedu.enums.ExchangeStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 奖品兑换记录响应DTO
 */
@Data
public class PrizeExchangeResponse {
    /**
     * 兑换记录ID
     */
    private Long id;

    /**
     * 奖品ID
     */
    private Long prizeId;

    /**
     * 奖品名称
     */
    private String prizeName;

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