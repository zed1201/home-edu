package com.shufu.homeedu.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 奖品创建请求DTO
 */
@Data
public class PrizeCreateRequest {
    /**
     * 奖品名称
     */
    private String name;

    /**
     * 奖品说明
     */
    private String description;

    /**
     * 所需积分
     */
    private Integer costPoints;

    /**
     * 当前库存
     */
    private Integer stock;

    /**
     * 有效期
     */
    private LocalDateTime expireAt;

    /**
     * 奖品图片
     */
    private String imageUrl;
} 