# 🚀 快速入门指南

## 1️⃣ 替换图片（5分钟）

### 女性头像
```bash
# 将您的图片复制到这个目录
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/face/1.jpg
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/face/2.jpg
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/face/3.jpg
```

### 女性全身照
```bash
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/fullbody/1.jpg
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/fullbody/2.jpg
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/fullbody/3.jpg
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/fullbody/4.jpg
cp /path/to/your/photo.jpg /home/bdcp/openclaw-office-next/public/avatars/female/fullbody/5.jpg
```

### 男性头像和全身照
```bash
# 同上，将 female 改为 male
```

## 2️⃣ 查看效果

1. 打开浏览器：http://127.0.0.1:8088/
2. 点击任意 Agent 头像
3. 查看图片是否正确显示

## 3️⃣ 调整图片

### 如果图片太大或位置不对：

1. 点击 **"设置形象"** 按钮
2. 使用 **放大/缩小** 按钮调整大小
3. **拖拽** 图片到合适位置（需先放大）
4. 调整 **裁剪框** 选择显示区域
5. 点击 **"确认选择"** 保存

## 4️⃣ 完成！

刷新浏览器，您的图片已经完美显示了！

---

## ⚠️ 常见问题

### 图片不显示？
- ✅ 检查文件名是否为数字（1.jpg, 2.jpg）
- ✅ 检查文件格式（JPG 或 PNG）
- ✅ 刷新浏览器（Ctrl+F5）

### 图片位置不对？
- ✅ 使用"设置形象"功能调整
- ✅ 缩放和拖拽图片
- ✅ 调整裁剪框

### 想要更多图片？
- ✅ 添加更多编号的图片（4.jpg, 5.jpg...）
- ✅ 修改代码中的 maxImages 参数

---

## 📞 需要帮助？

查看详细文档：
- `INSTRUCTIONS.md` - 完整使用指南
- `README.md` - 基本说明

或运行管理脚本：
```bash
bash /home/bdcp/openclaw-office-next/scripts/manage-avatars.sh
```
