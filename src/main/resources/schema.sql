-- 创建数据库
CREATE DATABASE IF NOT EXISTS home_edu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE home_edu;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '加密密码',
    `role` ENUM('PARENT', 'STUDENT') NOT NULL COMMENT '角色：家长/学生',
    `real_name` VARCHAR(50) COMMENT '真实姓名',
    `avatar_url` VARCHAR(255) COMMENT '头像URL',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 绑定关系表
CREATE TABLE IF NOT EXISTS `parent_student` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` BIGINT NOT NULL COMMENT '家长ID',
    `student_id` BIGINT NOT NULL COMMENT '学生ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
    UNIQUE KEY `uk_parent_student` (`parent_id`, `student_id`),
    FOREIGN KEY (`parent_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='家长学生绑定关系表';

-- 3. 任务表
CREATE TABLE IF NOT EXISTS `task` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` BIGINT NOT NULL COMMENT '创建者家长ID',
    `title` VARCHAR(100) NOT NULL COMMENT '任务标题',
    `description` TEXT COMMENT '任务说明',
    `point` INT NOT NULL DEFAULT 0 COMMENT '原始积分',
    `deadline` DATETIME COMMENT '截止时间',
    `status` ENUM('PUBLISHED', 'IN_PROGRESS', 'WAIT_CONFIRM', 'DONE', 'EXPIRED') 
        NOT NULL DEFAULT 'PUBLISHED' COMMENT '任务状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`parent_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 4. 任务领取记录表
CREATE TABLE IF NOT EXISTS `task_assignment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL COMMENT '任务ID',
    `student_id` BIGINT NOT NULL COMMENT '学生ID',
    `assigned_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    `student_submit` DATETIME COMMENT '学生提交时间',
    `submit_content` TEXT COMMENT '学生提交内容',
    `confirmed_at` DATETIME COMMENT '家长确认时间',
    `final_point` INT COMMENT '最终获得积分（家长可调）',
    `remark` TEXT COMMENT '备注',
    UNIQUE KEY `uk_task_student` (`task_id`, `student_id`),
    FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    INDEX `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务领取记录表';

-- 5. 积分流水表
CREATE TABLE IF NOT EXISTS `point_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `student_id` BIGINT NOT NULL COMMENT '学生ID',
    `type` ENUM('TASK', 'PRIZE', 'ADJUST') NOT NULL COMMENT '类型：任务/奖品/调整',
    `ref_id` BIGINT COMMENT '关联任务/奖品ID',
    `points` INT NOT NULL COMMENT '正数为收入，负数为支出',
    `description` VARCHAR(255) COMMENT '描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '时间戳',
    FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    INDEX `idx_student_id` (`student_id`),
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分流水表';

-- 6. 奖品表
CREATE TABLE IF NOT EXISTS `prize` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` BIGINT NOT NULL COMMENT '创建者家长ID',
    `name` VARCHAR(100) NOT NULL COMMENT '奖品名称',
    `description` TEXT COMMENT '奖品说明',
    `cost_points` INT NOT NULL DEFAULT 0 COMMENT '所需积分',
    `stock` INT NOT NULL DEFAULT 0 COMMENT '当前库存',
    `expire_at` DATETIME COMMENT '有效期',
    `image_url` VARCHAR(255) COMMENT '奖品图片',
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`parent_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖品表';

-- 7. 奖品兑换记录表
CREATE TABLE IF NOT EXISTS `prize_exchange` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `prize_id` BIGINT NOT NULL COMMENT '奖品ID',
    `student_id` BIGINT NOT NULL COMMENT '学生ID',
    `cost_points` INT NOT NULL COMMENT '花费积分',
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING' COMMENT '状态',
    `exchanged_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '兑换时间',
    `confirmed_at` DATETIME COMMENT '确认时间',
    FOREIGN KEY (`prize_id`) REFERENCES `prize`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    INDEX `idx_student_id` (`student_id`),
    INDEX `idx_prize_id` (`prize_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖品兑换记录表';

-- 8. 学生积分汇总表（用于快速查询当前积分）
CREATE TABLE IF NOT EXISTS `student_points` (
    `student_id` BIGINT PRIMARY KEY COMMENT '学生ID',
    `total_points` INT NOT NULL DEFAULT 0 COMMENT '当前总积分',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (`student_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生积分汇总表'; 