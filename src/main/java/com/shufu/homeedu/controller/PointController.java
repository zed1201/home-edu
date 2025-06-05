package com.shufu.homeedu.controller;

import com.shufu.homeedu.entity.PointLog;
import com.shufu.homeedu.service.PointService;
import com.shufu.homeedu.vo.ApiResponse;
import com.shufu.homeedu.vo.StudentPointsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 积分控制器
 */
@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
public class PointController {

    private final PointService pointService;

    /**
     * 获取学生积分详情
     */
    @GetMapping
    public ApiResponse<StudentPointsVO> getStudentPoints(@RequestHeader("User-Id") Long studentId) {
        try {
            StudentPointsVO pointsVO = pointService.getStudentPoints(studentId);
            return ApiResponse.success(pointsVO);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取学生当前积分
     */
    @GetMapping("/current")
    public ApiResponse<Integer> getCurrentPoints(@RequestHeader("User-Id") Long studentId) {
        try {
            Integer points = pointService.getCurrentPoints(studentId);
            return ApiResponse.success(points);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取学生积分明细（分页）
     */
    @GetMapping("/logs")
    public ApiResponse<List<PointLog>> getPointLogs(@RequestHeader("User-Id") Long studentId,
                                                   @RequestParam(defaultValue = "1") Integer page,
                                                   @RequestParam(defaultValue = "20") Integer size) {
        try {
            List<PointLog> logs = pointService.getStudentPointLogs(studentId, page, size);
            return ApiResponse.success(logs);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 