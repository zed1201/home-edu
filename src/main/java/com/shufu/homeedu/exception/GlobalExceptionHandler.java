package com.shufu.homeedu.exception;

import com.shufu.homeedu.vo.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 处理静态资源未找到异常
     * 主要用于忽略Chrome开发者工具等的无关请求
     */
    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleNoResourceFoundException(NoResourceFoundException e) {
        String resourcePath = e.getResourcePath();
        
        // 忽略常见的开发者工具或浏览器插件请求
        if (resourcePath != null && (
                resourcePath.contains(".well-known") ||
                resourcePath.contains("favicon.ico") ||
                resourcePath.contains("apple-touch-icon") ||
                resourcePath.contains("manifest.json") ||
                resourcePath.contains("robots.txt") ||
                resourcePath.contains("sitemap.xml")
        )) {
            // 这些请求是正常的，不需要记录错误日志
            log.debug("Ignoring resource request: {}", resourcePath);
        } else {
            // 其他静态资源请求记录警告
            log.warn("Static resource not found: {}", resourcePath);
        }
        
        // 不返回任何内容，让Spring处理404响应
    }

    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public ApiResponse<Object> handleRuntimeException(RuntimeException e) {
        log.error("业务异常: ", e);
        return ApiResponse.error(e.getMessage());
    }

    /**
     * 处理所有异常
     */
    @ExceptionHandler(Exception.class)
    public ApiResponse<Object> handleException(Exception e) {
        log.error("系统异常: ", e);
        return ApiResponse.error("系统内部错误");
    }
} 