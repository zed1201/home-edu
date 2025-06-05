package com.shufu.homeedu.dto;

import com.shufu.homeedu.enums.UserRole;
import lombok.Data;

/**
 * 用户注册请求DTO
 */
@Data
public class UserRegisterRequest {
    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 角色
     */
    private UserRole role;

    /**
     * 真实姓名
     */
    private String realName;
} 