package com.shufu.homeedu.controller;

import com.shufu.homeedu.dto.LoginRequest;
import com.shufu.homeedu.dto.UserRegisterRequest;
import com.shufu.homeedu.entity.User;
import com.shufu.homeedu.service.UserService;
import com.shufu.homeedu.vo.ApiResponse;
import com.shufu.homeedu.vo.LoginResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ApiResponse.success("登录成功", response);
        } catch (Exception e) {
            log.info("登录失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ApiResponse<User> register(@RequestBody UserRegisterRequest request) {
        try {
            User user = userService.register(request);
            // 不返回密码信息
            user.setPassword(null);
            return ApiResponse.success("注册成功", user);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            if (user == null) {
                return ApiResponse.error("用户不存在");
            }
            // 不返回密码信息
            user.setPassword(null);
            return ApiResponse.success(user);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 绑定家长和学生关系
     */
    @PostMapping("/bind")
    public ApiResponse<String> bindParentStudent(@RequestParam Long parentId, 
                                               @RequestParam Long studentId) {
        try {
            userService.bindParentStudent(parentId, studentId);
            return ApiResponse.success("绑定成功", "success");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取家长的学生列表
     */
    @GetMapping("/{parentId}/students")
    public ApiResponse<List<User>> getStudentsByParentId(@PathVariable Long parentId) {
        try {
            List<User> students = userService.getStudentsByParentId(parentId);
            // 清除密码信息
            students.forEach(user -> user.setPassword(null));
            return ApiResponse.success(students);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取学生的家长列表
     */
    @GetMapping("/{studentId}/parents")
    public ApiResponse<List<User>> getParentsByStudentId(@PathVariable Long studentId) {
        try {
            List<User> parents = userService.getParentsByStudentId(studentId);
            // 清除密码信息
            parents.forEach(user -> user.setPassword(null));
            return ApiResponse.success(parents);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取所有学生列表
     */
    @GetMapping("/students")
    public ApiResponse<List<User>> getAllStudents() {
        try {
            List<User> students = userService.getAllStudents();
            // 清除密码信息
            students.forEach(user -> user.setPassword(null));
            return ApiResponse.success(students);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取所有家长列表
     */
    @GetMapping("/parents")
    public ApiResponse<List<User>> getAllParents() {
        try {
            List<User> parents = userService.getAllParents();
            // 清除密码信息
            parents.forEach(user -> user.setPassword(null));
            return ApiResponse.success(parents);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 