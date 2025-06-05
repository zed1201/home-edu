package com.shufu.homeedu.mapper;

import com.shufu.homeedu.entity.Prize;
import com.shufu.homeedu.enums.PrizeStatus;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 奖品Mapper接口
 */
@Mapper
public interface PrizeMapper {

    /**
     * 根据ID查询奖品
     */
    @Select("SELECT * FROM prize WHERE id = #{id}")
    Prize findById(Long id);

    /**
     * 插入奖品
     */
    @Insert("INSERT INTO prize(parent_id, name, description, cost_points, stock, expire_at, image_url) " +
            "VALUES(#{parentId}, #{name}, #{description}, #{costPoints}, #{stock}, #{expireAt}, #{imageUrl})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Prize prize);

    /**
     * 更新奖品信息
     */
    @Update("UPDATE prize SET name = #{name}, description = #{description}, cost_points = #{costPoints}, " +
            "stock = #{stock}, expire_at = #{expireAt}, image_url = #{imageUrl} WHERE id = #{id}")
    int update(Prize prize);

    /**
     * 更新奖品状态
     */
    @Update("UPDATE prize SET status = #{status} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") PrizeStatus status);

    /**
     * 减少库存
     */
    @Update("UPDATE prize SET stock = stock - 1 WHERE id = #{id} AND stock > 0")
    int decreaseStock(Long id);

    /**
     * 查询家长创建的奖品列表
     */
    @Select("SELECT * FROM prize WHERE parent_id = #{parentId} ORDER BY created_at DESC")
    List<Prize> findByParentId(Long parentId);

    /**
     * 查询可兑换的奖品列表（有效且有库存的）
     */
    @Select("SELECT p.* FROM prize p " +
            "INNER JOIN parent_student ps ON p.parent_id = ps.parent_id " +
            "WHERE ps.student_id = #{studentId} " +
            "AND p.status = 'ACTIVE' " +
            "AND p.stock > 0 " +
            "AND (p.expire_at IS NULL OR p.expire_at > NOW()) " +
            "ORDER BY p.created_at DESC")
    List<Prize> findAvailablePrizesByStudentId(Long studentId);
} 