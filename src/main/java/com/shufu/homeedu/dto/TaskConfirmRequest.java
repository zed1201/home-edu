package com.shufu.homeedu.dto;

import lombok.Data;

/**
 * 任务确认请求DTO
 */
@Data
public class TaskConfirmRequest {
    /**
     * 是否确认完成
     */
    private Boolean confirmed;

    /**
     * 最终积分（可调整）
     */
    private Integer finalPoint;

    /**
     * 备注
     */
    private String remark;
} 