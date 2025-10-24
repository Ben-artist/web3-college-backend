#!/bin/bash

# SonarCloud 本地测试脚本
# 用于在本地运行 SonarCloud 分析

echo "🔍 开始 SonarCloud 本地分析..."

# 检查环境变量
if [ -z "$SONAR_TOKEN" ]; then
    echo "❌ 请设置 SONAR_TOKEN 环境变量"
    echo "💡 获取方式: SonarCloud → Administration → Security → Generate Token"
    exit 1
fi

# 检查项目配置
if [ ! -f "sonar-project.properties" ]; then
    echo "❌ 未找到 sonar-project.properties 文件"
    echo "💡 请先创建配置文件"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
pnpm build

# 运行测试
echo "🧪 运行测试..."
pnpm test --coverage

# 运行 SonarCloud 分析
echo "🔍 运行 SonarCloud 分析..."
pnpm sonar:local

# 检查分析结果
if [ $? -eq 0 ]; then
    echo "✅ SonarCloud 分析完成！"
    echo "📊 查看报告: https://sonarcloud.io/project/overview?id=web3-university-backend"
else
    echo "❌ SonarCloud 分析失败"
    echo "💡 请检查配置和网络连接"
    exit 1
fi

echo "🎉 分析完成！"
