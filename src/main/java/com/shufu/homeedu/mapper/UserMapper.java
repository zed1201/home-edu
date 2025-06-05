package com.shufu.homeedu.mapper;

import com.shufu.homeedu.entity.User;
import com.shufu.homeedu.enums.UserRole;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 用户Mapper接口
 */
@Mapper
public interface UserMapper {

    /**
     * 根据ID查询用户
     */
    @Select("SELECT * FROM user WHERE id = #{id}")
    User findById(Long id);

    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM user WHERE username = #{username}")
    User findByUsername(String username);

    /**
     * 插入用户
     */
    @Insert("INSERT INTO user(username, password, role, real_name, avatar_url) " +
            "VALUES(#{username}, #{password}, #{role}, #{realName}, #{avatarUrl})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    /**
     * 更新用户信息
     */
    @Update("UPDATE user SET real_name = #{realName}, avatar_url = #{avatarUrl} WHERE id = #{id}")
    int update(User user);

    /**
     * 根据角色查询用户列表
     */
    @Select("SELECT * FROM user WHERE role = #{role}")
    List<User> findByRole(UserRole role);

    /**
     * 绑定家长和学生关系
     */
    @Insert("INSERT INTO parent_student(parent_id, student_id) VALUES(#{parentId}, #{studentId})")
    int bindParentStudent(@Param("parentId") Long parentId, @Param("studentId") Long studentId);

    /**
     * 查询家长的学生列表
     */
    @Select("SELECT u.* FROM user u INNER JOIN parent_student ps ON u.id = ps.student_id WHERE ps.parent_id = #{parentId}")
    List<User> findStudentsByParentId(Long parentId);

    /**
     * 查询学生的家长列表
     */
    @Select("SELECT u.* FROM user u INNER JOIN parent_student ps ON u.id = ps.parent_id WHERE ps.student_id = #{studentId}")
    List<User> findParentsByStudentId(Long studentId);
} 