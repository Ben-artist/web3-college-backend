#!/bin/bash

# Web3 University API 部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 Web3 University API..."

# 检查环境变量
if [ -z "$EC2_HOST" ] || [ -z "$EC2_USERNAME" ] || [ -z "$EC2_SSH_KEY" ]; then
    echo "❌ 请设置环境变量: EC2_HOST, EC2_USERNAME, EC2_SSH_KEY"
    exit 1
fi

# 构建应用
echo "📦 构建应用..."
pnpm install
pnpm build

# 创建部署包
echo "📦 创建部署包..."
tar -czf deployment.tar.gz dist/ package.json pnpm-lock.yaml

# 部署到EC2
echo "🚀 部署到EC2..."
scp -i "$EC2_SSH_KEY" deployment.tar.gz "$EC2_USERNAME@$EC2_HOST:/tmp/"

# 在EC2上执行部署
ssh -i "$EC2_SSH_KEY" "$EC2_USERNAME@$EC2_HOST" << 'EOF'
    echo "🔄 在EC2上执行部署..."

    # 停止服务
    sudo systemctl stop web3-university-api || true

    # 备份当前版本
    if [ -d "/opt/web3-university-api" ]; then
        sudo mv /opt/web3-university-api /opt/web3-university-api.backup.$(date +%Y%m%d_%H%M%S)
    fi

    # 创建新目录
    sudo mkdir -p /opt/web3-university-api
    sudo chown $USER:$USER /opt/web3-university-api

    # 解压文件
    cd /opt/web3-university-api
    tar -xzf /tmp/deployment.tar.gz
    rm /tmp/deployment.tar.gz

    # 安装依赖
    pnpm install --prod

    # 复制系统服务文件
    sudo cp /opt/web3-university-api/deploy/web3-university-api.service /etc/systemd/system/
    sudo systemctl daemon-reload

    # 启动服务
    sudo systemctl start web3-university-api
    sudo systemctl enable web3-university-api

    # 健康检查
    echo "🔍 健康检查..."
    sleep 10
    curl -f http://localhost:4000/api/health || {
        echo "❌ 健康检查失败"
        sudo systemctl status web3-university-api
        exit 1
    }

    echo "✅ 部署成功！"
    sudo systemctl status web3-university-api
EOF

# 清理本地文件
rm deployment.tar.gz

echo "🎉 部署完成！"
