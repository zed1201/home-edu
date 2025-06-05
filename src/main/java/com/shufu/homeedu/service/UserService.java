package com.shufu.homeedu.service;

import com.shufu.homeedu.dto.LoginRequest;
import com.shufu.homeedu.dto.UserRegisterRequest;
import com.shufu.homeedu.entity.User;
import com.shufu.homeedu.enums.UserRole;
import com.shufu.homeedu.mapper.UserMapper;
import com.shufu.homeedu.util.PasswordUtil;
import com.shufu.homeedu.vo.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 用户服务类
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        User user = userMapper.findByUsername(request.getUsername());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 简化版本的密码验证，实际项目中应该使用更安全的方式
        if (!PasswordUtil.verifyPassword(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 构建登录响应
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRealName(user.getRealName());
        response.setRole(user.getRole());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setToken(PasswordUtil.generateToken(user.getId(), user.getUsername()));

        return response;
    }

    /**
     * 用户注册
     */
    @Transactional
    public User register(UserRegisterRequest request) {
        // 检查用户名是否已存在
        User existingUser = userMapper.findByUsername(request.getUsername());
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(PasswordUtil.encryptPassword(request.getPassword()));
        user.setRole(request.getRole());
        user.setRealName(request.getRealName());

        userMapper.insert(user);
        return user;
    }

    /**
     * 根据ID查询用户
     */
    public User getUserById(Long id) {
        return userMapper.findById(id);
    }

    /**
     * 绑定家长和学生关系
     */
    @Transactional
    public void bindParentStudent(Long parentId, Long studentId) {
        User parent = userMapper.findById(parentId);
        User student = userMapper.findById(studentId);
        
        if (parent == null || parent.getRole() != UserRole.PARENT) {
            throw new RuntimeException("家长用户不存在");
        }
        
        if (student == null || student.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("学生用户不存在");
        }

        userMapper.bindParentStudent(parentId, studentId);
    }

    /**
     * 获取家长的学生列表
     */
    public List<User> getStudentsByParentId(Long parentId) {
        return userMapper.findStudentsByParentId(parentId);
    }

    /**
     * 获取学生的家长列表
     */
    public List<User> getParentsByStudentId(Long studentId) {
        return userMapper.findParentsByStudentId(studentId);
    }

    /**
     * 获取所有学生
     */
    public List<User> getAllStudents() {
        return userMapper.findByRole(UserRole.STUDENT);
    }

    /**
     * 获取所有家长
     */
    public List<User> getAllParents() {
        return userMapper.findByRole(UserRole.PARENT);
    }
} 