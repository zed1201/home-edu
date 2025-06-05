package com.shufu.homeedu.service;

import com.shufu.homeedu.dto.TaskAssignmentResponse;
import com.shufu.homeedu.dto.TaskConfirmRequest;
import com.shufu.homeedu.dto.TaskCreateRequest;
import com.shufu.homeedu.entity.PointLog;
import com.shufu.homeedu.entity.Task;
import com.shufu.homeedu.entity.TaskAssignment;
import com.shufu.homeedu.enums.PointLogType;
import com.shufu.homeedu.enums.TaskStatus;
import com.shufu.homeedu.mapper.PointLogMapper;
import com.shufu.homeedu.mapper.TaskAssignmentMapper;
import com.shufu.homeedu.mapper.TaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务服务类
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskMapper taskMapper;
    private final TaskAssignmentMapper taskAssignmentMapper;
    private final PointLogMapper pointLogMapper;

    /**
     * 创建任务（家长）
     */
    public Task createTask(Long parentId, TaskCreateRequest request) {
        Task task = new Task();
        task.setParentId(parentId);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPoint(request.getPoint());
        task.setDeadline(request.getDeadline());
        task.setStatus(TaskStatus.PUBLISHED);
        
        taskMapper.insert(task);
        return task;
    }

    /**
     * 领取任务（学生）
     */
    @Transactional
    public void assignTask(Long taskId, Long studentId) {
        // 检查任务是否存在且可领取
        Task task = taskMapper.findById(taskId);
        if (task == null || task.getStatus() != TaskStatus.PUBLISHED) {
            throw new RuntimeException("任务不存在或不可领取");
        }
        
        // 检查是否已领取
        TaskAssignment existing = taskAssignmentMapper.findByTaskIdAndStudentId(taskId, studentId);
        if (existing != null) {
            throw new RuntimeException("任务已被领取");
        }
        
        // 创建分配记录
        TaskAssignment assignment = new TaskAssignment();
        assignment.setTaskId(taskId);
        assignment.setStudentId(studentId);
        taskAssignmentMapper.insert(assignment);
        
        // 更新任务状态
        taskMapper.updateStatus(taskId, TaskStatus.IN_PROGRESS);
    }

    /**
     * 提交任务（学生）
     */
    @Transactional
    public void submitTask(Long taskId, Long studentId, String submitContent) {
        TaskAssignment assignment = taskAssignmentMapper.findByTaskIdAndStudentId(taskId, studentId);
        if (assignment == null) {
            throw new RuntimeException("未找到任务分配记录");
        }
        
        // 更新提交时间和提交内容
        taskAssignmentMapper.updateStudentSubmit(taskId, studentId, LocalDateTime.now(), submitContent);
        
        // 更新任务状态为待确认
        taskMapper.updateStatus(taskId, TaskStatus.WAIT_CONFIRM);
    }

    /**
     * 确认任务（家长）
     */
    @Transactional
    public void confirmTask(Long taskId, TaskConfirmRequest request) {
        Task task = taskMapper.findById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        // 查找所有该任务的分配记录（一个任务可能被多个学生领取）
        List<TaskAssignment> assignments = taskAssignmentMapper.findByTaskId(taskId);
        if (assignments == null || assignments.isEmpty()) {
            throw new RuntimeException("未找到任务分配记录");
        }
        
        // 通常一个任务只会被一个学生领取，取第一个
        TaskAssignment assignment = assignments.get(0);
        Long studentId = assignment.getStudentId();
        
        if (request.getConfirmed()) {
            // 确认完成
            Integer finalPoint = request.getFinalPoint() != null ? request.getFinalPoint() : task.getPoint();
            
            // 更新分配记录
            taskAssignmentMapper.updateConfirm(taskId, studentId, LocalDateTime.now(), finalPoint, request.getRemark());
            
            // 添加积分记录
            PointLog pointLog = new PointLog();
            pointLog.setStudentId(studentId);
            pointLog.setType(PointLogType.TASK);
            pointLog.setRefId(taskId);
            pointLog.setPoints(finalPoint);
            pointLog.setDescription("完成任务：" + task.getTitle());
            pointLogMapper.insert(pointLog);
            
            // 更新任务状态为已完成
            taskMapper.updateStatus(taskId, TaskStatus.DONE);
        } else {
            // 不确认完成，重置为进行中
            taskMapper.updateStatus(taskId, TaskStatus.IN_PROGRESS);
        }
    }

    /**
     * 获取家长创建的任务列表
     */
    public List<Task> getTasksByParentId(Long parentId) {
        return taskMapper.findByParentId(parentId);
    }

    /**
     * 获取学生可领取的任务列表
     */
    public List<Task> getAvailableTasksByStudentId(Long studentId) {
        return taskMapper.findAvailableTasksByStudentId(studentId);
    }

    /**
     * 获取学生已领取的任务列表
     */
    public List<Task> getAssignedTasksByStudentId(Long studentId) {
        return taskMapper.findAssignedTasksByStudentId(studentId);
    }

    /**
     * 获取待确认的任务列表
     */
    public List<Task> getPendingConfirmTasksByParentId(Long parentId) {
        return taskMapper.findPendingConfirmTasksByParentId(parentId);
    }

    /**
     * 获取任务的分配记录（家长）
     */
    public List<TaskAssignmentResponse> getTaskAssignments(Long taskId, Long parentId) {
        // 验证任务是否属于该家长
        Task task = taskMapper.findById(taskId);
        if (task == null || !task.getParentId().equals(parentId)) {
            throw new RuntimeException("任务不存在或无权限访问");
        }
        
        return taskAssignmentMapper.findByTaskIdWithStudentName(taskId);
    }
} 