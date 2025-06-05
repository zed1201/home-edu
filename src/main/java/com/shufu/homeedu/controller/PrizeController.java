package com.shufu.homeedu.controller;

import com.shufu.homeedu.dto.PrizeCreateRequest;
import com.shufu.homeedu.dto.PrizeExchangeResponse;
import com.shufu.homeedu.entity.Prize;
import com.shufu.homeedu.entity.PrizeExchange;
import com.shufu.homeedu.service.PrizeService;
import com.shufu.homeedu.vo.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 奖品控制器
 */
@RestController
@RequestMapping("/api/prizes")
@RequiredArgsConstructor
public class PrizeController {

    private final PrizeService prizeService;

    /**
     * 创建奖品（家长）
     */
    @PostMapping
    public ApiResponse<Prize> createPrize(@RequestHeader("User-Id") Long parentId,
                                         @RequestBody PrizeCreateRequest request) {
        try {
            Prize prize = prizeService.createPrize(parentId, request);
            return ApiResponse.success("奖品创建成功", prize);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 更新奖品（家长）
     */
    @PutMapping("/{id}")
    public ApiResponse<String> updatePrize(@PathVariable Long id,
                                         @RequestBody PrizeCreateRequest request) {
        try {
            prizeService.updatePrize(id, request);
            return ApiResponse.success("奖品更新成功", "success");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 兑换奖品（学生）
     */
    @PostMapping("/{id}/exchange")
    public ApiResponse<String> exchangePrize(@PathVariable Long id,
                                           @RequestHeader("User-Id") Long studentId) {
        try {
            prizeService.exchangePrize(id, studentId);
            return ApiResponse.success("奖品兑换成功", "success");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 确认兑换（家长）
     */
    @PutMapping("/exchanges/{exchangeId}/confirm")
    public ApiResponse<String> confirmExchange(@PathVariable Long exchangeId,
                                             @RequestParam boolean confirmed) {
        try {
            prizeService.confirmExchange(exchangeId, confirmed);
            String message = confirmed ? "兑换确认成功" : "兑换已取消";
            return ApiResponse.success(message, "success");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取我创建的奖品列表（家长）
     */
    @GetMapping("/my-created")
    public ApiResponse<List<Prize>> getMyCreatedPrizes(@RequestHeader("User-Id") Long parentId) {
        try {
            List<Prize> prizes = prizeService.getPrizesByParentId(parentId);
            return ApiResponse.success(prizes);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取可兑换的奖品列表（学生）
     */
    @GetMapping("/available")
    public ApiResponse<List<Prize>> getAvailablePrizes(@RequestHeader("User-Id") Long studentId) {
        try {
            List<Prize> prizes = prizeService.getAvailablePrizesByStudentId(studentId);
            return ApiResponse.success(prizes);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取我的兑换记录（学生）
     */
    @GetMapping("/exchanges/my")
    public ApiResponse<List<PrizeExchangeResponse>> getMyExchanges(@RequestHeader("User-Id") Long studentId) {
        try {
            List<PrizeExchangeResponse> exchanges = prizeService.getExchangesByStudentId(studentId);
            return ApiResponse.success(exchanges);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取待确认的兑换记录（家长）
     */
    @GetMapping("/exchanges/pending")
    public ApiResponse<List<PrizeExchangeResponse>> getPendingExchanges(@RequestHeader("User-Id") Long parentId) {
        try {
            List<PrizeExchangeResponse> exchanges = prizeService.getPendingExchangesByParentId(parentId);
            return ApiResponse.success(exchanges);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 