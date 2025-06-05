package com.shufu.homeedu.mapper;

import com.shufu.homeedu.entity.PointLog;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 积分日志Mapper接口
 */
@Mapper
public interface PointLogMapper {

    /**
     * 插入积分日志
     */
    @Insert("INSERT INTO point_log(student_id, type, ref_id, points, description) " +
            "VALUES(#{studentId}, #{type}, #{refId}, #{points}, #{description})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(PointLog pointLog);

    /**
     * 查询学生的积分日志
     */
    @Select("SELECT * FROM point_log WHERE student_id = #{studentId} ORDER BY created_at DESC")
    List<PointLog> findByStudentId(Long studentId);

    /**
     * 查询学生当前总积分
     */
    @Select("SELECT COALESCE(SUM(points), 0) FROM point_log WHERE student_id = #{studentId}")
    Integer getCurrentPointsByStudentId(Long studentId);

    /**
     * 分页查询学生积分日志
     */
    @Select("SELECT * FROM point_log WHERE student_id = #{studentId} ORDER BY created_at DESC LIMIT #{offset}, #{size}")
    List<PointLog> findByStudentIdWithPage(@Param("studentId") Long studentId, @Param("offset") Integer offset, @Param("size") Integer size);
} 