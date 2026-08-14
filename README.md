# Growher｜孕期目标推进助手

面向孕期女性的目标拆解与日常推进 MVP。当前版本包含个人孕周资料、能量确认、今日行动推荐、任务重排和阶段总结等前端交互。

## 当前边界

- 当前使用本地模拟数据与浏览器本地存储。
- 尚未连接真实数据库、用户账号、AI 模型或外部提醒 API。
- 页面内容不能替代医生诊断或医疗建议。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://127.0.0.1:3000/`。

## 检查与构建

```bash
npm run test:design
npm run lint
npm test
npm run build
```

## Cloudflare Pages

- 构建命令：`npm run build`
- 输出目录：`dist`
- 生产分支：`main`

真实数据/API、用户账户与产品落地页将在后续迭代中接入。
