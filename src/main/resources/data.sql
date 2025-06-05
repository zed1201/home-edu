-- 示例数据
USE home_edu;

-- 插入示例用户（密码都是123456，MD5加密后为：e10adc3949ba59abbe56e057f20f883e）
INSERT INTO `user` (username, password, role, real_name) VALUES
('parent001', 'e10adc3949ba59abbe56e057f20f883e', 'PARENT', '张妈妈'),
('parent002', 'e10adc3949ba59abbe56e057f20f883e', 'PARENT', '张爸爸'),
('student001', 'e10adc3949ba59abbe56e057f20f883e', 'STUDENT', '张小明'),
('student002', 'e10adc3949ba59abbe56e057f20f883e', 'STUDENT', '张小红');

-- 建立家长学生关系（张妈妈和张爸爸都与两个孩子建立关系）
INSERT INTO `parent_student` (parent_id, student_id) VALUES
-- 张妈妈的绑定关系
((SELECT id FROM user WHERE username = 'parent001'), (SELECT id FROM user WHERE username = 'student001')),
((SELECT id FROM user WHERE username = 'parent001'), (SELECT id FROM user WHERE username = 'student002')),
-- 张爸爸的绑定关系
((SELECT id FROM user WHERE username = 'parent002'), (SELECT id FROM user WHERE username = 'student001')),
((SELECT id FROM user WHERE username = 'parent002'), (SELECT id FROM user WHERE username = 'student002'));

-- 插入示例任务
-- 张妈妈创建的任务
INSERT INTO `task` (parent_id, title, description, point, deadline, status) VALUES
((SELECT id FROM user WHERE username = 'parent001'), '完成数学作业', '完成今天的数学作业并检查', 10, DATE_ADD(NOW(), INTERVAL 1 DAY), 'PUBLISHED'),
((SELECT id FROM user WHERE username = 'parent001'), '整理房间', '把自己的房间整理干净', 15, DATE_ADD(NOW(), INTERVAL 2 DAY), 'PUBLISHED'),
((SELECT id FROM user WHERE username = 'parent001'), '帮忙洗碗', '晚饭后帮忙洗碗', 5, DATE_ADD(NOW(), INTERVAL 1 DAY), 'PUBLISHED');

-- 张爸爸创建的任务
INSERT INTO `task` (parent_id, title, description, point, deadline, status) VALUES
((SELECT id FROM user WHERE username = 'parent002'), '完成英语作业', '认真完成英语练习册', 12, DATE_ADD(NOW(), INTERVAL 1 DAY), 'PUBLISHED'),
((SELECT id FROM user WHERE username = 'parent002'), '户外运动', '到楼下跑步30分钟', 8, DATE_ADD(NOW(), INTERVAL 1 DAY), 'PUBLISHED'),
((SELECT id FROM user WHERE username = 'parent002'), '阅读课外书', '阅读课外书籍半小时', 10, DATE_ADD(NOW(), INTERVAL 2 DAY), 'PUBLISHED');

-- 插入示例奖品
-- 张妈妈创建的奖品
INSERT INTO `prize` (parent_id, name, description, cost_points, stock, status) VALUES
((SELECT id FROM user WHERE username = 'parent001'), '玩具小汽车', '精美的遥控小汽车', 50, 2, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent001'), '看电影票', '可以看一场电影', 30, 5, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent001'), '零花钱10元', '额外的零花钱奖励', 20, 10, 'ACTIVE');

-- 张爸爸创建的奖品
INSERT INTO `prize` (parent_id, name, description, cost_points, stock, status) VALUES
((SELECT id FROM user WHERE username = 'parent002'), '篮球', '儿童专用篮球', 40, 3, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent002'), '游乐园门票', '周末游乐园一日游', 80, 2, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent002'), '零花钱20元', '额外的零花钱奖励', 35, 8, 'ACTIVE'),
((SELECT id FROM user WHERE username = 'parent002'), '新书一本', '选择喜欢的课外书', 25, 5, 'ACTIVE');

-- 插入示例积分记录（给学生一些初始积分）
INSERT INTO `point_log` (student_id, type, points, description) VALUES
((SELECT id FROM user WHERE username = 'student001'), 'ADJUST', 25, '初始积分'),
((SELECT id FROM user WHERE username = 'student002'), 'ADJUST', 15, '初始积分'); 