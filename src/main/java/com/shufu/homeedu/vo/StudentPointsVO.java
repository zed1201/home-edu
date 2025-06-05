package com.shufu.homeedu.vo;

import com.shufu.homeedu.entity.PointLog;
import lombok.Data;

import java.util.List;

/**
 * 学生积分视图对象
 */
@Data
public class StudentPointsVO {
    /**
     * 学生ID
     */
    private Long studentId;

    /**
     * 学生姓名
     */
    private String studentName;

    /**
     * 当前总积分
     */
    private Integer totalPoints;

    /**
     * 积分明细记录
     */
    private List<PointLog> pointLogs;
} 