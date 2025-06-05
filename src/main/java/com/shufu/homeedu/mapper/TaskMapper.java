package com.shufu.homeedu.mapper;

import com.shufu.homeedu.entity.Task;
import com.shufu.homeedu.enums.TaskStatus;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 任务Mapper接口
 */
@Mapper
public interface TaskMapper {

    /**
     * 根据ID查询任务
     */
    @Select("SELECT * FROM task WHERE id = #{id}")
    Task findById(Long id);

    /**
     * 插入任务
     */
    @Insert("INSERT INTO task(parent_id, title, description, point, deadline) " +
            "VALUES(#{parentId}, #{title}, #{description}, #{point}, #{deadline})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Task task);

    /**
     * 更新任务状态
     */
    @Update("UPDATE task SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") TaskStatus status);

    /**
     * 查询家长创建的任务列表
     */
    @Select("SELECT * FROM task WHERE parent_id = #{parentId} ORDER BY created_at DESC")
    List<Task> findByParentId(Long parentId);

    /**
     * 查询可领取的任务列表（未过期且状态为PUBLISHED）
     */
    @Select("SELECT t.* FROM task t " +
            "INNER JOIN parent_student ps ON t.parent_id = ps.parent_id " +
            "WHERE ps.student_id = #{studentId} " +
            "AND t.status = 'PUBLISHED' " +
            "AND (t.deadline IS NULL OR t.deadline > NOW()) " +
            "AND NOT EXISTS (SELECT 1 FROM task_assignment ta WHERE ta.task_id = t.id AND ta.student_id = #{studentId}) " +
            "ORDER BY t.created_at DESC")
    List<Task> findAvailableTasksByStudentId(Long studentId);

    /**
     * 查询学生已领取的任务列表
     */
    @Select("SELECT t.* FROM task t " +
            "INNER JOIN task_assignment ta ON t.id = ta.task_id " +
            "WHERE ta.student_id = #{studentId} " +
            "ORDER BY ta.assigned_at DESC")
    List<Task> findAssignedTasksByStudentId(Long studentId);

    /**
     * 查询待确认的任务列表
     */
    @Select("SELECT t.* FROM task t " +
            "WHERE t.parent_id = #{parentId} " +
            "AND t.status = 'WAIT_CONFIRM' " +
            "ORDER BY t.updated_at DESC")
    List<Task> findPendingConfirmTasksByParentId(Long parentId);
} 