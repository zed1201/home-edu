# 家庭教育任务积分系统

这是一个典型的"任务+积分+奖品"管理系统，面向家长端与学生端，实现家庭激励教育。

## 系统功能

### 家长端功能
- 用户注册和登录
- 创建/发布任务（设置积分、截止时间、说明）
- 审核任务完成情况，确认是否完成
- 决定最终积分（可打折扣）
- 发布奖品（设置积分兑换值、时效、库存）
- 查看学生积分记录、兑换记录
- 绑定学生账号

### 学生端功能
- 用户注册和登录
- 查看任务列表（可领取任务）
- 执行任务，标记完成
- 等待家长确认完成
- 兑换奖品
- 查看积分明细

## 技术栈

- **框架**: Spring Boot 2.7.18（兼容Java 8）
- **数据库**: MySQL 8.0
- **ORM**: MyBatis 2.3.2
- **构建工具**: Maven
- **开发语言**: Java 8+

## 项目结构

```
src/main/java/com/shufu/homeedu/
├── controller/           # 控制器层
│   ├── UserController.java
│   ├── TaskController.java
│   ├── PrizeController.java
│   └── PointController.java
├── service/             # 服务层
│   ├── UserService.java
│   ├── TaskService.java
│   ├── PrizeService.java
│   └── PointService.java
├── mapper/              # 数据访问层
│   ├── UserMapper.java
│   ├── TaskMapper.java
│   ├── PrizeMapper.java
│   └── ...
├── entity/              # 实体类
│   ├── User.java
│   ├── Task.java
│   ├── Prize.java
│   └── ...
├── dto/                 # 数据传输对象
├── vo/                  # 视图对象
├── enums/               # 枚举类
├── util/                # 工具类
└── exception/           # 异常处理
```

## 数据库设计

系统包含以下核心表：
- `user` - 用户表（家长、学生）
- `parent_student` - 家长学生绑定关系表
- `task` - 任务表
- `task_assignment` - 任务领取记录表
- `point_log` - 积分流水表
- `prize` - 奖品表
- `prize_exchange` - 奖品兑换记录表

## 快速开始

### 1. 环境要求
- JDK 8+
- MySQL 8.0+
- Maven 3.6+

### 2. 数据库初始化
```sql
-- 执行 src/main/resources/schema.sql 创建表结构
-- 执行 src/main/resources/data.sql 插入示例数据
```

### 3. 配置数据库连接
修改 `src/main/resources/application.properties`：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/home_edu
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. 启动应用
```bash
mvn spring-boot:run
```

应用将在 http://localhost:8080 启动

## API接口

### 用户认证接口

#### 用户登录
- `POST /api/users/login` - 用户登录（家长/学生通用）

请求体：
```json
{
  "username": "parent001",
  "password": "123456"
}
```

响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": 1,
    "username": "parent001",
    "realName": "张妈妈",
    "role": "PARENT",
    "avatarUrl": null,
    "token": "token_1_1672934400000"
  }
}
```

#### 用户注册
- `POST /api/users/register` - 用户注册

请求体：
```json
{
  "username": "newuser",
  "password": "123456",
  "role": "STUDENT",
  "realName": "新用户"
}
```

#### 其他用户接口
- `GET /api/users/{id}` - 获取用户信息
- `POST /api/users/bind` - 绑定家长和学生关系
- `GET /api/users/{parentId}/students` - 获取家长的学生列表
- `GET /api/users/{studentId}/parents` - 获取学生的家长列表
- `GET /api/users/students` - 获取所有学生列表
- `GET /api/users/parents` - 获取所有家长列表

### 任务相关接口

**注意：以下接口需要在请求头中添加 `User-Id` 字段来标识当前用户**

#### 家长端
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/{taskId}/confirm` - 审核任务
- `GET /api/tasks/my-created` - 获取我创建的任务
- `GET /api/tasks/pending-confirm` - 获取待确认的任务

#### 学生端
- `GET /api/tasks/available` - 获取可领取的任务
- `POST /api/tasks/{id}/assign` - 领取任务
- `POST /api/tasks/{id}/submit` - 提交任务
- `GET /api/tasks/my-assigned` - 获取我领取的任务

### 奖品相关接口

#### 家长端
- `POST /api/prizes` - 创建奖品
- `PUT /api/prizes/{id}` - 更新奖品
- `GET /api/prizes/my-created` - 获取我创建的奖品
- `PUT /api/prizes/exchanges/{exchangeId}/confirm` - 确认兑换

#### 学生端
- `GET /api/prizes/available` - 获取可兑换的奖品
- `POST /api/prizes/{id}/exchange` - 兑换奖品
- `GET /api/prizes/exchanges/my` - 获取我的兑换记录

### 积分相关接口
- `GET /api/points` - 获取积分详情
- `GET /api/points/current` - 获取当前积分
- `GET /api/points/logs` - 获取积分明细

## 示例数据

系统预置了以下示例数据：
- 家长账号：parent001 / 123456
- 学生账号：student001 / 123456, student002 / 123456
- 示例任务：完成数学作业、整理房间、帮忙洗碗
- 示例奖品：玩具小汽车、看电影票、零花钱

## 使用流程

### 1. 用户注册/登录
```bash
# 家长登录
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"parent001","password":"123456"}'

# 学生登录  
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student001","password":"123456"}'
```

### 2. 业务操作
登录成功后，使用返回的 `userId` 作为后续请求的 `User-Id` 请求头：

```bash
# 学生查看可领取的任务
curl -X GET http://localhost:8080/api/tasks/available \
  -H "User-Id: 2"

# 家长创建任务
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "User-Id: 1" \
  -d '{"title":"完成英语作业","description":"完成第3单元练习","point":15,"deadline":"2024-01-01T18:00:00"}'
```

## 业务流程

### 任务流程
1. 家长登录并创建任务（PUBLISHED状态）
2. 学生登录并领取任务（IN_PROGRESS状态）
3. 学生提交任务（WAIT_CONFIRM状态）
4. 家长确认任务（DONE状态，自动添加积分）

### 奖品兑换流程
1. 家长创建奖品
2. 学生使用积分兑换奖品（PENDING状态）
3. 家长确认兑换（CONFIRMED状态）

## 扩展功能

系统设计具有良好的扩展性，可以轻松添加以下功能：
- JWT Token认证（当前使用简化版本）
- Spring Security安全框架
- 任务分类和标签
- 积分等级制度
- 消息通知系统
- 统计报表功能
- 文件上传（任务证明、奖品图片）

## 许可证

MIT License 