package com.shufu.homeedu.service;

import com.shufu.homeedu.entity.PointLog;
import com.shufu.homeedu.entity.User;
import com.shufu.homeedu.mapper.PointLogMapper;
import com.shufu.homeedu.mapper.UserMapper;
import com.shufu.homeedu.vo.StudentPointsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 积分服务类
 */
@Service
@RequiredArgsConstructor
public class PointService {

    private final PointLogMapper pointLogMapper;
    private final UserMapper userMapper;

    /**
     * 获取学生积分详情
     */
    public StudentPointsVO getStudentPoints(Long studentId) {
        User student = userMapper.findById(studentId);
        if (student == null) {
            throw new RuntimeException("学生不存在");
        }
        
        Integer totalPoints = pointLogMapper.getCurrentPointsByStudentId(studentId);
        List<PointLog> pointLogs = pointLogMapper.findByStudentId(studentId);
        
        StudentPointsVO vo = new StudentPointsVO();
        vo.setStudentId(studentId);
        vo.setStudentName(student.getRealName() != null ? student.getRealName() : student.getUsername());
        vo.setTotalPoints(totalPoints != null ? totalPoints : 0);
        vo.setPointLogs(pointLogs);
        
        return vo;
    }

    /**
     * 获取学生积分明细（分页）
     */
    public List<PointLog> getStudentPointLogs(Long studentId, Integer page, Integer size) {
        int offset = (page - 1) * size;
        return pointLogMapper.findByStudentIdWithPage(studentId, offset, size);
    }

    /**
     * 获取学生当前积分
     */
    public Integer getCurrentPoints(Long studentId) {
        Integer points = pointLogMapper.getCurrentPointsByStudentId(studentId);
        return points != null ? points : 0;
    }
} 