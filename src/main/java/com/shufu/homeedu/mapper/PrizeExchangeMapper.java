package com.shufu.homeedu.mapper;

import com.shufu.homeedu.dto.PrizeExchangeResponse;
import com.shufu.homeedu.entity.PrizeExchange;
import com.shufu.homeedu.enums.ExchangeStatus;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 奖品兑换Mapper接口
 */
@Mapper
public interface PrizeExchangeMapper {

    /**
     * 根据ID查询兑换记录
     */
    @Select("SELECT * FROM prize_exchange WHERE id = #{id}")
    PrizeExchange findById(Long id);

    /**
     * 插入兑换记录
     */
    @Insert("INSERT INTO prize_exchange(prize_id, student_id, cost_points) " +
            "VALUES(#{prizeId}, #{studentId}, #{costPoints})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(PrizeExchange prizeExchange);

    /**
     * 更新兑换状态
     */
    @Update("UPDATE prize_exchange SET status = #{status}, confirmed_at = #{confirmedAt} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") ExchangeStatus status, @Param("confirmedAt") LocalDateTime confirmedAt);

    /**
     * 查询学生的兑换记录
     */
    @Select("SELECT * FROM prize_exchange WHERE student_id = #{studentId} ORDER BY exchanged_at DESC")
    List<PrizeExchange> findByStudentId(Long studentId);

    /**
     * 查询学生的兑换记录（包含奖品名称）
     */
    @Select("SELECT pe.id, pe.prize_id as prizeId, p.name as prizeName, pe.student_id as studentId, " +
            "pe.cost_points as costPoints, pe.status, pe.exchanged_at as exchangedAt, pe.confirmed_at as confirmedAt " +
            "FROM prize_exchange pe " +
            "INNER JOIN prize p ON pe.prize_id = p.id " +
            "WHERE pe.student_id = #{studentId} " +
            "ORDER BY pe.exchanged_at DESC")
    List<PrizeExchangeResponse> findByStudentIdWithPrizeName(Long studentId);

    /**
     * 查询家长需要确认的兑换记录
     */
    @Select("SELECT pe.* FROM prize_exchange pe " +
            "INNER JOIN prize p ON pe.prize_id = p.id " +
            "WHERE p.parent_id = #{parentId} AND pe.status = 'PENDING' " +
            "ORDER BY pe.exchanged_at DESC")
    List<PrizeExchange> findPendingExchangesByParentId(Long parentId);

    /**
     * 查询家长需要确认的兑换记录（包含奖品名称）
     */
    @Select("SELECT pe.id, pe.prize_id as prizeId, p.name as prizeName, pe.student_id as studentId, " +
            "pe.cost_points as costPoints, pe.status, pe.exchanged_at as exchangedAt, pe.confirmed_at as confirmedAt " +
            "FROM prize_exchange pe " +
            "INNER JOIN prize p ON pe.prize_id = p.id " +
            "WHERE p.parent_id = #{parentId} AND pe.status = 'PENDING' " +
            "ORDER BY pe.exchanged_at DESC")
    List<PrizeExchangeResponse> findPendingExchangesByParentIdWithPrizeName(Long parentId);
} 