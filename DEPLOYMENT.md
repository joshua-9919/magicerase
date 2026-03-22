# MagicErase 部署指南

## 📋 部署前准备

### 1. 获取 Clipdrop API Key

1. 访问 [Clipdrop API](https://clipdrop.co/apis)
2. 注册/登录账号
3. 进入 [API Dashboard](https://clipdrop.co/dashboard)
4. 复制你的 API Key

### 2. 配置 Cloudflare

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/sign-up)
2. 注册/登录账号（免费）
3. 安装 Wrangler CLI（如果本地开发）：
   ```bash
   npm install -g wrangler
   ```

---

## 🚀 部署步骤

### 方式 A：一键部署（推荐）

#### 步骤 1：配置 API Key

在 Cloudflare Dashboard 设置环境变量：

```bash
# 登录 Cloudflare
wrangler login

# 设置 API Key 密钥
wrangler secret put CLIPDROP_API_KEY
# 粘贴你的 Clipdrop API Key
```

#### 步骤 2：部署到 Cloudflare

```bash
cd magicerase
npm install
npm run deploy
```

部署成功后，你会得到类似这样的 URL：
```
https://magicerase.your-subdomain.workers.dev
```

#### 步骤 3：配置自定义域名（可选）

1. 访问 [Cloudflare Workers 自定义域名](https://dash.cloudflare.com/?to=/:account/workers/pages/domains)
2. 点击 "Add Custom Domain"
3. 输入你的域名（如 `magicerase.app`）
4. 按照提示配置 DNS

---

### 方式 B：Cloudflare Pages 部署

#### 步骤 1：连接 GitHub 仓库

1. 访问 [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. 点击 "Create a project"
3. 连接 GitHub 账号
4. 选择 `joshua-9919/magicerase` 仓库

#### 步骤 2：配置构建设置

- **Production branch**: `main`
- **Build command**: 留空（不需要构建）
- **Build output directory**: `public`

#### 步骤 3：设置环境变量

在 Pages 设置中添加环境变量：
- 变量名：`CLIPDROP_API_KEY`
- 值：你的 Clipdrop API Key

#### 步骤 4：部署

点击 "Save and Deploy"，等待部署完成。

---

## ✅ 验证部署

### 测试清单

- [ ] 网站可以正常访问
- [ ] 图片上传功能正常
- [ ] 涂抹工具可以使用
- [ ] AI 擦除功能返回结果
- [ ] 下载功能正常
- [ ] 移动端显示正常

### 测试图片

建议使用以下测试图片验证效果：
- 有路人干扰的风景照
- 需要移除的水印或杂物
- 商品图片的背景清理

---

## 💰 成本管理

### Cloudflare Workers 免费额度

- **请求数**: 100,000 次/天
- **CPU 时间**: 10ms/请求
- **出站流量**: 100GB/月

### Clipdrop API 费用

| 层级 | 价格 | 额度 |
|------|------|------|
| 免费 | $0 | 100 次/月 |
| 按量 | $0.02/次 | 无限制 |

**示例计算**：
- 每天 100 张图片 × 30 天 = 3000 次/月
- 免费额度：100 次
- 付费部分：2900 × $0.02 = $58/月

### 优化建议

1. **设置使用限制**：在代码中添加每日配额
2. **图片压缩**：前端压缩后再上传，减少处理时间
3. **缓存结果**：对相同图片缓存结果（需要注意隐私）
4. **监控用量**：定期检查 Clipdrop Dashboard

---

## 🔧 故障排查

### 常见问题

#### 1. 部署失败：`Error: Missing CLIPDROP_API_KEY`

**解决方案**：
```bash
wrangler secret put CLIPDROP_API_KEY
```

#### 2. API 返回错误：`401 Unauthorized`

**原因**：Clipdrop API Key 无效或过期

**解决方案**：
- 检查 API Key 是否正确
- 在 Clipdrop Dashboard 重新生成 Key
- 更新 Workers 环境变量

#### 3. 图片处理超时

**原因**：图片过大或网络问题

**解决方案**：
- 限制图片大小（当前为 10MB）
- 在前端压缩图片
- 检查 Clipdrop API 状态

#### 4. CORS 错误

**原因**：跨域请求被阻止

**解决方案**：
- 检查 Workers 代码中的 CORS headers
- 确保所有响应都包含 CORS headers

---

## 📊 监控与分析

### Cloudflare Analytics

访问 [Cloudflare Analytics](https://dash.cloudflare.com/?to=/:account/workers/analytics) 查看：
- 请求数量
- 响应时间
- 错误率
- 流量分布

### 自定义监控

可以在 Workers 代码中添加日志：

```typescript
console.log('Processing image:', imageFile.size, 'bytes');
```

日志查看：
```bash
wrangler tail
```

---

## 🔄 更新部署

修改代码后重新部署：

```bash
# 提交更改
git add .
git commit -m "feat: 更新说明"
git push

# 重新部署
npm run deploy
```

Cloudflare Pages 会自动检测 GitHub 推送并重新部署。

---

## 📞 支持

遇到问题？

- 📖 查看 [README.md](README.md)
- 🐛 提交 [GitHub Issue](https://github.com/joshua-9919/magicerase/issues)
- 📧 联系：周建华

---

**祝部署顺利！** 🎉
