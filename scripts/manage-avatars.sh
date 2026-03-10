#!/bin/bash

# Agent 头像管理脚本

AVATARS_DIR="/home/bdcp/openclaw-office-next/public/avatars"

echo "📸 Agent 头像管理工具"
echo "========================"
echo ""
echo "当前图片统计："
echo ""
echo "女性头像：$(ls -1 $AVATARS_DIR/female/face/*.jpg 2>/dev/null | wc -l) 张"
echo "女性全身照：$(ls -1 $AVATARS_DIR/female/fullbody/*.jpg 2>/dev/null | wc -l) 张"
echo "男性头像：$(ls -1 $AVATARS_DIR/male/face/*.jpg 2>/dev/null | wc -l) 张"
echo "男性全身照：$(ls -1 $AVATARS_DIR/male/fullbody/*.jpg 2>/dev/null | wc -l) 张"
echo ""
echo "使用说明："
echo "1. 将图片复制到对应目录"
echo "2. 重命名为数字（1.jpg, 2.jpg...）"
echo "3. 刷新浏览器"
echo ""
echo "详细文档：$AVATARS_DIR/INSTRUCTIONS.md"
