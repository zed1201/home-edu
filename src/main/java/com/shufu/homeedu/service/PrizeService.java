package com.shufu.homeedu.service;

import com.shufu.homeedu.dto.PrizeCreateRequest;
import com.shufu.homeedu.dto.PrizeExchangeResponse;
import com.shufu.homeedu.entity.PointLog;
import com.shufu.homeedu.entity.Prize;
import com.shufu.homeedu.entity.PrizeExchange;
import com.shufu.homeedu.enums.ExchangeStatus;
import com.shufu.homeedu.enums.PointLogType;
import com.shufu.homeedu.enums.PrizeStatus;
import com.shufu.homeedu.mapper.PointLogMapper;
import com.shufu.homeedu.mapper.PrizeExchangeMapper;
import com.shufu.homeedu.mapper.PrizeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 奖品服务类
 */
@Service
@RequiredArgsConstructor
public class PrizeService {

    private final PrizeMapper prizeMapper;
    private final PrizeExchangeMapper prizeExchangeMapper;
    private final PointLogMapper pointLogMapper;

    /**
     * 创建奖品（家长）
     */
    public Prize createPrize(Long parentId, PrizeCreateRequest request) {
        Prize prize = new Prize();
        prize.setParentId(parentId);
        prize.setName(request.getName());
        prize.setDescription(request.getDescription());
        prize.setCostPoints(request.getCostPoints());
        prize.setStock(request.getStock());
        prize.setExpireAt(request.getExpireAt());
        prize.setImageUrl(request.getImageUrl());
        prize.setStatus(PrizeStatus.ACTIVE);
        
        prizeMapper.insert(prize);
        return prize;
    }

    /**
     * 更新奖品信息（家长）
     */
    public void updatePrize(Long prizeId, PrizeCreateRequest request) {
        Prize prize = prizeMapper.findById(prizeId);
        if (prize == null) {
            throw new RuntimeException("奖品不存在");
        }
        
        prize.setName(request.getName());
        prize.setDescription(request.getDescription());
        prize.setCostPoints(request.getCostPoints());
        prize.setStock(request.getStock());
        prize.setExpireAt(request.getExpireAt());
        prize.setImageUrl(request.getImageUrl());
        
        prizeMapper.update(prize);
    }

    /**
     * 兑换奖品（学生）
     */
    @Transactional
    public void exchangePrize(Long prizeId, Long studentId) {
        Prize prize = prizeMapper.findById(prizeId);
        if (prize == null || prize.getStatus() != PrizeStatus.ACTIVE) {
            throw new RuntimeException("奖品不存在或不可兑换");
        }
        
        if (prize.getStock() <= 0) {
            throw new RuntimeException("奖品库存不足");
        }
        
        if (prize.getExpireAt() != null && prize.getExpireAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("奖品已过期");
        }
        
        // 检查学生积分是否足够
        Integer currentPoints = pointLogMapper.getCurrentPointsByStudentId(studentId);
        if (currentPoints < prize.getCostPoints()) {
            throw new RuntimeException("积分不足");
        }
        
        // 减少库存
        int updated = prizeMapper.decreaseStock(prizeId);
        if (updated == 0) {
            throw new RuntimeException("奖品库存不足");
        }
        
        // 创建兑换记录
        PrizeExchange exchange = new PrizeExchange();
        exchange.setPrizeId(prizeId);
        exchange.setStudentId(studentId);
        exchange.setCostPoints(prize.getCostPoints());
        exchange.setStatus(ExchangeStatus.PENDING);
        prizeExchangeMapper.insert(exchange);
        
        // 扣除积分
        PointLog pointLog = new PointLog();
        pointLog.setStudentId(studentId);
        pointLog.setType(PointLogType.PRIZE);
        pointLog.setRefId(prizeId);
        pointLog.setPoints(-prize.getCostPoints());
        pointLog.setDescription("兑换奖品：" + prize.getName());
        pointLogMapper.insert(pointLog);
    }

    /**
     * 确认兑换（家长）
     */
    public void confirmExchange(Long exchangeId, boolean confirmed) {
        PrizeExchange exchange = prizeExchangeMapper.findById(exchangeId);
        if (exchange == null) {
            throw new RuntimeException("兑换记录不存在");
        }
        
        ExchangeStatus status = confirmed ? ExchangeStatus.CONFIRMED : ExchangeStatus.CANCELLED;
        prizeExchangeMapper.updateStatus(exchangeId, status, LocalDateTime.now());
        
        // 如果取消兑换，需要退还积分和恢复库存
        if (!confirmed) {
            Prize prize = prizeMapper.findById(exchange.getPrizeId());
            if (prize != null) {
                // 恢复库存
                prize.setStock(prize.getStock() + 1);
                prizeMapper.update(prize);
                
                // 退还积分
                PointLog pointLog = new PointLog();
                pointLog.setStudentId(exchange.getStudentId());
                pointLog.setType(PointLogType.ADJUST);
                pointLog.setRefId(exchange.getPrizeId());
                pointLog.setPoints(exchange.getCostPoints());
                pointLog.setDescription("兑换取消，退还积分：" + prize.getName());
                pointLogMapper.insert(pointLog);
            }
        }
    }

    /**
     * 获取家长创建的奖品列表
     */
    public List<Prize> getPrizesByParentId(Long parentId) {
        return prizeMapper.findByParentId(parentId);
    }

    /**
     * 获取学生可兑换的奖品列表
     */
    public List<Prize> getAvailablePrizesByStudentId(Long studentId) {
        return prizeMapper.findAvailablePrizesByStudentId(studentId);
    }

    /**
     * 获取学生的兑换记录
     */
    public List<PrizeExchangeResponse> getExchangesByStudentId(Long studentId) {
        return prizeExchangeMapper.findByStudentIdWithPrizeName(studentId);
    }

    /**
     * 获取家长需要确认的兑换记录
     */
    public List<PrizeExchangeResponse> getPendingExchangesByParentId(Long parentId) {
        return prizeExchangeMapper.findPendingExchangesByParentIdWithPrizeName(parentId);
    }
} 