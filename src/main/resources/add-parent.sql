-- 添加张爸爸用户和相关数据的脚本
USE home_edu;

-- 添加张爸爸用户（如果不存在）
INSERT IGNORE INTO `user` (username, password, role, real_name) VALUES
('parent002', 'e10adc3949ba59abbe56e057f20f883e', 'PARENT', '张爸爸');

-- 建立张爸爸与学生的绑定关系（如果不存在）
INSERT IGNORE INTO `parent_student` (parent_id, student_id) VALUES
((SELECT id FROM user WHERE username = 'parent002'), (SELECT id FROM user WHERE username = 'student001')),
((SELECT id FROM user WHERE username = 'parent002'), (SELECT id FROM user WHERE username = 'student002'));

-- 为张爸爸添加一些示例任务
INSERT INTO `task` (parent_id, title, description, point, deadline, status) VALUES
((SELECT id FROM user WHERE username = 'parent002'), '完成英语作业', '认真完成英语练习册', 12, DATE_ADD(NOW(), INTERVAL 1 DAY), 'PUBLISHED'),
((SELECT id FROM user WHERE username = 'parent002'), '户外运动', '到楼下跑步30分钟', 8, DATE_ADD(NOW(), INTERVAL 1 DAY), 'PUBLISHED'),
((SELECT id FROM user WHERE username = 'parent002'), '阅读课外书', '阅读课外书籍半小时', 10, DATE_ADD(NOW(), INTERVAL 2 DAY), 'PUBLISHED');

-- 为张爸爸添加一些示例奖品
INSERT INTO `prize` (parent_id, name, description, cost_points, stock, status) VALUES
((SELECT id FROM user WHERE username = 'parent002'), '篮球', '儿童专用篮球', 40, 3, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent002'), '游乐园门票', '周末游乐园一日游', 80, 2, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent002'), '零花钱20元', '额外的零花钱奖励', 35, 8, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent002'), '新书一本', '选择喜欢的课外书', 25, 5, 'ACTIVE'); 