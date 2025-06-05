package com.shufu.homeedu.controller;

import com.shufu.homeedu.dto.TaskAssignmentResponse;
import com.shufu.homeedu.dto.TaskConfirmRequest;
import com.shufu.homeedu.dto.TaskCreateRequest;
import com.shufu.homeedu.entity.Task;
import com.shufu.homeedu.entity.TaskAssignment;
import com.shufu.homeedu.service.TaskService;
import com.shufu.homeedu.vo.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 任务控制器
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * 创建任务（家长）
     */
    @PostMapping
    public ApiResponse<Task> createTask(@RequestHeader("User-Id") Long parentId, 
                                       @RequestBody TaskCreateRequest request) {
        try {
            Task task = taskService.createTask(parentId, request);
            return ApiResponse.success("任务创建成功", task);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 领取任务（学生）
     */
    @PostMapping("/{id}/assign")
    public ApiResponse<String> assignTask(@PathVariable Long id, 
                                       @RequestHeader("User-Id") Long studentId) {
        try {
            taskService.assignTask(id, studentId);
            return ApiResponse.success("任务领取成功", "success");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 提交任务（学生）
     */
    @PostMapping("/{id}/submit")
    public ApiResponse<String> submitTask(@PathVariable Long id, 
                                       @RequestHeader("User-Id") Long studentId,
                                       @RequestBody(required = false) java.util.Map<String, Object> request) {
        try {
            String submitContent = null;
            if (request != null && request.containsKey("submitContent")) {
                submitContent = (String) request.get("submitContent");
            }
            taskService.submitTask(id, studentId, submitContent);
            return ApiResponse.success("任务提交成功", "success");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 确认任务（家长）
     */
    @PutMapping("/{taskId}/confirm")
    public ApiResponse<String> confirmTask(@PathVariable Long taskId,
                                        @RequestBody java.util.Map<String, Object> request) {
        try {
            Boolean isCompleted = (Boolean) request.get("isCompleted");
            Integer finalPoint = request.containsKey("finalPoint") ? (Integer) request.get("finalPoint") : null;
            
            TaskConfirmRequest confirmRequest = new TaskConfirmRequest();
            confirmRequest.setConfirmed(isCompleted);
            confirmRequest.setFinalPoint(finalPoint);
            confirmRequest.setRemark(null);
            
            taskService.confirmTask(taskId, confirmRequest);
            return ApiResponse.success("任务确认成功", "success");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取我创建的任务列表（家长）
     */
    @GetMapping("/my-created")
    public ApiResponse<List<Task>> getMyCreatedTasks(@RequestHeader("User-Id") Long parentId) {
        try {
            List<Task> tasks = taskService.getTasksByParentId(parentId);
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取可领取的任务列表（学生）
     */
    @GetMapping("/available")
    public ApiResponse<List<Task>> getAvailableTasks(@RequestHeader("User-Id") Long studentId) {
        try {
            List<Task> tasks = taskService.getAvailableTasksByStudentId(studentId);
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取我领取的任务列表（学生）
     */
    @GetMapping("/my-assigned")
    public ApiResponse<List<Task>> getMyAssignedTasks(@RequestHeader("User-Id") Long studentId) {
        try {
            List<Task> tasks = taskService.getAssignedTasksByStudentId(studentId);
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取待确认的任务列表（家长）
     */
    @GetMapping("/pending-confirm")
    public ApiResponse<List<Task>> getPendingConfirmTasks(@RequestHeader("User-Id") Long parentId) {
        try {
            List<Task> tasks = taskService.getPendingConfirmTasksByParentId(parentId);
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取任务的分配记录（家长）
     */
    @GetMapping("/{taskId}/assignments")
    public ApiResponse<List<TaskAssignmentResponse>> getTaskAssignments(@PathVariable Long taskId,
                                                              @RequestHeader("User-Id") Long parentId) {
        try {
            List<TaskAssignmentResponse> assignments = taskService.getTaskAssignments(taskId, parentId);
            return ApiResponse.success(assignments);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 