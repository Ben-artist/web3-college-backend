# Web3大学后端API接口文档

## 项目概述

Web3大学是一个完全去中心化的Web3教育平台，基于区块链技术构建。用户通过Web3钱包登录，使用YD币支付课程费用，获得NFT证书。所有数据存储在Storacha IPFS上，课程和证书都通过智能合约管理，实现真正的去中心化教育。

## 技术栈

- **框架**: NestJS
- **数据库**: PostgreSQL + TypeORM
- **包管理器**: pnpm
- **API文档**: Swagger
- **认证**: Web3钱包签名验证
- **区块链**: Ethereum
- **存储**: Storacha IPFS (去中心化存储)
- **支付**: YD币
- **证书**: NFT (ERC-721)
- **Web3库**: wagmi (React Hooks for Ethereum)

## 项目结构

```
src/
├── modules/
│   ├── user/           # 用户管理模块
│   ├── auth/           # 认证模块
│   ├── course/         # 课程管理模块
│   ├── lesson/         # 课时管理模块
│   ├── storage/        # Web3存储模块
│   ├── certificate/    # NFT证书模块
│   ├── payment/        # YD币支付模块
│   ├── notification/   # 通知模块
│   ├── community/      # 社区模块
│   └── admin/          # 管理员模块
```

## 开发计划

### 第一阶段：基础功能

1. ✅ 用户管理模块
2. 🔄 认证模块
3. 📋 课程管理模块
4. 📋 课时管理模块
5. 📋 Web3存储模块

### 第二阶段：核心功能

1. 📋 NFT证书模块
2. 📋 YD币支付模块
3. 📋 通知模块

### 第三阶段：高级功能

1. 📋 社区模块
2. 📋 管理员模块

## 本地开发说明

### 环境要求

- Node.js 18+
- PostgreSQL 13+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 环境配置

复制 `env.example` 到 `.env` 并配置：

```env
# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_PASSWORD=your_supabase_db_password

# 签名验证配置
SIGNATURE_TIMEOUT=300000 # 5分钟签名有效期（毫秒）

# IPFS存储配置
# 选择存储方式：simple (免费) 或 storacha (需要钱包认证)
STORAGE_TYPE=simple
IPFS_GATEWAY=https://ipfs.io
STORACHA_GATEWAY=https://w3s.link

# YD币合约配置
YD_TOKEN_CONTRACT=0x... # YD币合约地址
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id

# NFT证书合约配置
NFT_CERTIFICATE_CONTRACT=0x... # NFT证书合约地址
```

### 如果想使用docker

docker-compose up -d
**使用 Docker 启动 PostgreSQL 服务：**
**PostgreSQL（端口：5432）**
**数据将持久化存储在 `localStoreData/` 目录下。**

### 运行项目

```bash
# 开发模式
pnpm run dev

# 生产模式
pnpm run build
pnpm run start:prod
```

### 部署说明

项目使用Supabase作为数据库服务：

1. **Supabase部署**：使用Supabase作为后端服务，支持自动扩展和全球CDN
2. **Docker部署**：使用Docker Compose进行容器化部署（仅用于PostgreSQL等辅助服务）
3. **传统服务器部署**：在Linux/Windows服务器上直接运行
4. **云服务部署**：支持各大云服务商的标准部署方式

#### Supabase部署优势

- 🚀 **快速部署**：几分钟内完成数据库和API部署
- 🌍 **全球CDN**：自动全球内容分发，低延迟访问
- 📊 **实时监控**：内置性能监控和错误追踪
- 🔒 **安全可靠**：企业级安全防护和自动备份
- 💰 **成本效益**：免费额度充足，按需付费
- 🔧 **易于维护**：自动更新和维护，无需手动管理

## API接口设计

[项目设计文档](./project-design.md)

### API文档

启动项目后访问：`http://localhost:3000/api` 查看Swagger API文档

## 注意事项

1. **Web3安全性**：所有API都需要钱包签名验证，确保去中心化安全
2. **数据验证**：使用class-validator进行请求数据验证
3. **错误处理**：统一的错误处理机制
4. **日志记录**：记录所有重要操作和区块链交易
5. **性能优化**：使用数据库索引和查询优化
6. **区块链集成**：
   - 支持YD币支付
   - NFT证书铸造和管理
   - Storacha IPFS去中心化存储
   - 智能合约交互
7. **去中心化特性**：
   - 用户通过钱包地址标识
   - 所有重要数据上链存储
   - 支持NFT证书转移和交易
   - 课程内容存储在Storacha IPFS
8. **Gas费优化**：合理设计智能合约，减少Gas消耗
9. **多链支持**：后续可扩展支持Polygon、BSC等链
10. **灵活部署**：支持Docker、传统服务器、云服务等多种部署方式

## 实体设计分析报告

### 📊 原始实体设计问题分析

#### ❌ 主要问题

1. **缺少Web3核心字段**：原始设计缺少`walletAddress`等Web3去中心化平台必需字段
2. **实体关系不完整**：缺少NFT证书、支付记录、学习进度等核心实体
3. **字段设计不符合Web3特性**：缺少价格、分类、IPFS存储等字段
4. **数据类型选择不当**：价格字段应使用字符串存储大数

#### ✅ 改进后的实体设计

### 🏗️ 核心实体结构

#### 1. User实体（用户）

```typescript
- walletAddress: string (主要标识符)
- username: string
- email?: string
- role: 'student' | 'instructor' | 'admin'
- isVerified: boolean
- nonce?: string (签名验证)
- 学习统计字段
```

#### 2. Teacher实体（讲师）

```typescript
- walletAddress: string
- specializations?: string[]
- level: 'junior' | 'senior' | 'expert'
- rating: number
- socialLinks?: object
```

#### 3. Course实体（课程）

```typescript
- instructorWallet: string
- category: string
- level: 'beginner' | 'intermediate' | 'advanced'
- price: string (YD币价格)
- priceInUSD: number
- nftContract?: string
- resources?: object
```

#### 4. Lesson实体（课时）

```typescript
- courseId: number
- videoUrl?: string (IPFS链接)
- videoCid?: string
- type: 'video' | 'text' | 'quiz' | 'assignment'
- status: 'draft' | 'published' | 'archived'
```

#### 5. NFTCertificate实体（NFT证书）

```typescript
- tokenId: string
- contractAddress: string
- walletAddress: string
- metadata: string (IPFS链接)
- image: string (IPFS链接)
- transactionHash: string
```

#### 6. Payment实体（支付记录）

```typescript
- courseId: number
- walletAddress: string
- amount: string (YD币数量)
- transactionHash: string
- status: 'pending' | 'confirmed' | 'failed' | 'refunded'
```

#### 7. UserCourseFavorite实体（用户课程收藏）

```typescript
- userId: number
- courseId: number
- user: User (关联用户)
- course: Course (关联课程)
- notes?: string (用户备注)
```

#### 8. UserCoursePurchase实体（用户课程购买记录）

```typescript
- userId: number
- courseId: number
- user: User (关联用户)
- course: Course (关联课程)
- amount: string (支付金额，YD币)
- status: 'pending' | 'confirmed' | 'failed' | 'refunded'
- transactionHash?: string (区块链交易哈希)
- paidAt?: Date (支付时间)
- refundedAt?: Date (退款时间)
- refundTransactionHash?: string (退款交易哈希)
```

#### 9. LearningProgress实体（学习进度）

```typescript
- walletAddress: string
- courseId: number
- lessonId: number
- status: 'not_started' | 'in_progress' | 'completed'
- completionPercentage: number
```

#### 10. Notification实体（通知）

```typescript
- walletAddress: string
- type: 'course_update' | 'payment_success' | 'certificate_minted'
- priority: 'low' | 'medium' | 'high' | 'urgent'
- isRead: boolean
```

### 🔗 实体关系设计

```
User (1) ←→ (N) Course (作为讲师)
User (1) ←→ (N) UserCourseFavorite (收藏课程)
User (1) ←→ (N) UserCoursePurchase (购买课程)
User (1) ←→ (N) UserCourseProgress (学习进度)
User (1) ←→ (N) NFTCertificate
User (1) ←→ (N) Notification

Course (1) ←→ (N) Chapter
Course (1) ←→ (N) UserCourseFavorite
Course (1) ←→ (N) UserCoursePurchase
Course (1) ←→ (N) UserCourseProgress
Course (1) ←→ (N) NFTCertificate
```

### 📝 设计决策说明

#### 为什么需要单独的收藏和购买表？

1. **功能分离**：收藏和购买是两个不同的业务功能，需要独立管理
2. **数据完整性**：购买记录需要包含支付信息、交易哈希等区块链相关数据
3. **查询优化**：可以独立查询用户的收藏列表和购买记录，提高查询效率
4. **业务逻辑清晰**：收藏可以随时取消，购买记录需要永久保存
5. **扩展性**：未来可以轻松添加收藏夹分类、购买历史分析等功能

#### 为什么不需要Teacher_Course关联表？

1. **一对一关系**：每个课程只有一个主要讲师
2. **简化查询**：直接在Course表中存储讲师信息，避免JOIN查询
3. **性能优化**：减少数据库查询复杂度
4. **Web3特性**：钱包地址作为唯一标识，无需额外关联
5. **数据冗余合理**：讲师姓名和头像在Course表中冗余存储，提高查询效率

### 🎯 设计优势

1. **Web3原生支持**：所有实体都支持钱包地址作为主要标识符
2. **去中心化存储**：使用IPFS链接存储视频、图片等资源
3. **区块链集成**：支持NFT证书、YD币支付等区块链功能
4. **完整的学习流程**：从课程购买到证书获得的完整链路
5. **灵活的权限管理**：支持多角色和权限控制
6. **数据完整性**：使用合适的数据类型和约束

## 代码质量与开发工具

### 🔧 代码格式化与检查工具

项目使用 **Biome** 作为代码格式化和检查工具，配合 **Husky** 和 **lint-staged** 实现自动化代码质量保证。

#### 配置说明

1. **Biome 配置** (`biome.json`)：
   - 自动格式化：缩进2空格，行宽100字符
   - 自动修复：启用所有推荐规则和自动修复
   - 文件类型：支持 TypeScript、JavaScript、JSON、Markdown
   - 忽略文件：`node_modules`、`dist`、`coverage`、`logs` 等

2. **Husky Git Hooks**：
   - **pre-commit**：提交前自动运行代码检查和格式化
   - **pre-push**：推送前运行测试和类型检查

3. **lint-staged 配置**：
   - TypeScript/JavaScript 文件：格式化 + 检查 + 自动修复
   - JSON/Markdown 文件：格式化

#### 使用方法

```bash
# 手动格式化所有文件
pnpm run format

# 检查代码问题
pnpm run check

# 自动修复无风险错误
pnpm run check:fix

# 提交时自动运行（已配置）
git commit -m "your message"
```

#### 自动修复功能

在 commit 时会自动：
- ✅ 格式化代码（缩进、换行、引号等）
- ✅ 修复无风险的 lint 错误
- ✅ 整理 import 语句
- ✅ 修复代码风格问题

#### 注意事项

- 提交时会自动修复无风险错误，无需手动处理
- 如果有高风险错误，commit 会失败并提示需要手动修复
- 所有修改的文件都会在 commit 前自动格式化

## 更新日志

### v1.4.0 (2024-01-15)

- ✅ 配置 Biome 代码格式化和检查工具
- ✅ 优化 Husky Git Hooks 配置
- ✅ 实现 commit 时自动格式化和错误修复
- ✅ 修复 TypeScript 类型安全问题
- ✅ 添加代码质量自动化流程

### v1.3.0 (2024-01-15)

- ✅ 集成Supabase数据库支持
- ✅ 添加Supabase服务模块和配置
- ✅ 创建完整的数据库迁移脚本
- ✅ 完全使用Supabase作为数据库服务
- ✅ 添加Supabase部署指南和最佳实践

### v1.2.0 (2024-01-15)

- ✅ 移除所有Vercel相关配置和代码
- ✅ 简化应用程序启动流程
- ✅ 统一日志配置，支持本地文件日志
- ✅ 优化Swagger文档配置

### v1.1.0 (2024-01-15)

- ✅ 重新设计所有实体结构
- ✅ 添加Web3去中心化特性支持
- ✅ 完善实体间关系设计
- ✅ 添加NFT证书、支付、学习进度等核心实体
- ✅ 优化数据类型和字段设计

### v1.0.0 (2024-01-15)

- 初始项目结构
- 用户管理模块基础功能
- API接口设计文档

---

_此文档将根据项目开发进度持续更新_
