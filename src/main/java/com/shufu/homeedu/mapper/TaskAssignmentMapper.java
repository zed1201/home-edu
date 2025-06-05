package com.shufu.homeedu.mapper;

import com.shufu.homeedu.dto.TaskAssignmentResponse;
import com.shufu.homeedu.entity.TaskAssignment;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务分配Mapper接口
 */
@Mapper
public interface TaskAssignmentMapper {

    /**
     * 根据任务ID和学生ID查询分配记录
     */
    @Select("SELECT * FROM task_assignment WHERE task_id = #{taskId} AND student_id = #{studentId}")
    TaskAssignment findByTaskIdAndStudentId(@Param("taskId") Long taskId, @Param("studentId") Long studentId);

    /**
     * 根据任务ID查询所有分配记录
     */
    @Select("SELECT * FROM task_assignment WHERE task_id = #{taskId}")
    List<TaskAssignment> findByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据任务ID查询所有分配记录（包含学生姓名）
     */
    @Select("SELECT ta.id, ta.task_id as taskId, ta.student_id as studentId, " +
            "u.real_name as studentName, ta.assigned_at as assignTime, " +
            "ta.student_submit as submitTime, ta.submit_content as submitContent, " +
            "ta.confirmed_at as confirmTime, ta.final_point as finalPoint, ta.remark " +
            "FROM task_assignment ta " +
            "INNER JOIN user u ON ta.student_id = u.id " +
            "WHERE ta.task_id = #{taskId} " +
            "ORDER BY ta.assigned_at DESC")
    List<TaskAssignmentResponse> findByTaskIdWithStudentName(@Param("taskId") Long taskId);

    /**
     * 插入任务分配记录
     */
    @Insert("INSERT INTO task_assignment(task_id, student_id) VALUES(#{taskId}, #{studentId})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TaskAssignment taskAssignment);

    /**
     * 更新学生提交时间和内容
     */
    @Update("UPDATE task_assignment SET student_submit = #{submitTime}, submit_content = #{submitContent} WHERE task_id = #{taskId} AND student_id = #{studentId}")
    int updateStudentSubmit(@Param("taskId") Long taskId, @Param("studentId") Long studentId, 
                           @Param("submitTime") LocalDateTime submitTime, @Param("submitContent") String submitContent);

    /**
     * 更新家长确认信息
     */
    @Update("UPDATE task_assignment SET confirmed_at = #{confirmedAt}, final_point = #{finalPoint}, remark = #{remark} " +
            "WHERE task_id = #{taskId} AND student_id = #{studentId}")
    int updateConfirm(@Param("taskId") Long taskId, @Param("studentId") Long studentId, 
                     @Param("confirmedAt") LocalDateTime confirmedAt, @Param("finalPoint") Integer finalPoint, 
                     @Param("remark") String remark);
} 