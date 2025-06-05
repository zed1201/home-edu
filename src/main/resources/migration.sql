-- 数据库迁移脚本
-- 为 task_assignment 表添加 submit_content 字段

USE home_edu;

-- 检查并添加 submit_content 字段
ALTER TABLE `task_assignment` 
ADD COLUMN IF NOT EXISTS `submit_content` TEXT COMMENT '学生提交内容' 
AFTER `student_submit`; 