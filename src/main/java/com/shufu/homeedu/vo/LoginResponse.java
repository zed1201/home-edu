package com.shufu.homeedu.vo;

import com.shufu.homeedu.enums.UserRole;
import lombok.Data;

/**
 * 登录响应VO
 */
@Data
public class LoginResponse {
    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 角色
     */
    private UserRole role;

    /**
     * 头像URL
     */
    private String avatarUrl;

    /**
     * 登录token（简化版本，实际项目中应该使用JWT）
     */
    private String token;
} 