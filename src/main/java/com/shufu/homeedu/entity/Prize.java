package com.shufu.homeedu.entity;

import com.shufu.homeedu.enums.PrizeStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 奖品实体类
 */
@Data
public class Prize {
    /**
     * 主键ID
     */
    private Long id;

    /**
     * 创建者家长ID
     */
    private Long parentId;

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

    /**
     * 状态
     */
    private PrizeStatus status;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
} 