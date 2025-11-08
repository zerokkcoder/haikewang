# 骇课网（资源下载站）

基于 Next.js App Router 的资源下载站，包含前台站点、用户系统、支付（支付宝当面付）、管理后台与站点设置。已完成站点的主要功能与统一视觉（Violet 紫色）。

## 功能概览

- 前台站点
  - 首页：Hero 背景图（可配置）、站点副标题（H1，可配置）、搜索与资源列表、排序（最新/下载最多/浏览最多）
  - 分类/子分类/标签：Hero 背景图统一、资源网格列表与分页加载
  - 资源详情：Markdown 内容、下载/购买区（含提取码与复制）、侧栏快速下载与猜你喜欢/最新文章
  - 下载记录页：展示用户最近下载的资源（需登录）
  - 个人中心：左右布局菜单（概览、头像设置、基本信息、最近下载、订单记录），支持头像上传与持久化
  - 登录/注册页：整页动漫动效背景、顶部品牌区（站点 Logo 与标题）

- 管理后台
  - 站点设置：Logo、站点名称、站点副标题（首页 H1）、Slogan、关键词、描述、首页 Hero 图、Footer 文本
  - 支付配置：支付宝 AppID、私钥（PKCS8）、支付宝公钥（必填）、网关、回调地址（Notify URL）
  - 保存成功自动重载，站点前台立即使用最新配置

- 支付（支付宝当面付）
  - 预下单（生成二维码）、查询与回调
  - 成功后发放资源访问授权，或用于会员权益发放

## 目录结构

主要目录（简要）：

- `app/`：Next.js App Router 路由（前台与后台）
  - `(site)/`：前台分组（首页、分类、标签、资源详情、下载记录、个人中心、VIP）
  - `admin/`：管理后台（站点设置等）
  - `api/`：后端接口（资源、用户、支付、站点设置、上传等）
- `components/`：站点组件（Header、Footer、Toast、ResourceCard 等）
- `lib/`：业务库（Prisma、支付与下载逻辑等）
- `prisma/`：Prisma schema 与 seed 脚本
- `public/`：静态资源（Logo、Hero 背景图等）

## 环境要求

- Node.js 18+
- MySQL 数据库（`DATABASE_URL`）

## 配置与启动

1) 安装依赖并启动 Dev 服务：

```bash
npm install
npm run dev
# 访问 http://localhost:3000/
```

2) 数据库同步（开发环境）：

```bash
npx prisma db push
npx prisma generate
```

注意（Windows 环境）：部分情况下 Prisma Client 生成可能因文件锁报 `EPERM`。当前项目在关键点使用了原生 SQL 作为回退（如站点设置与头像），确保不影响开发。推荐在空闲时关闭 dev 进程后再次执行 `npx prisma generate`，恢复到完整的 Prisma Client 类型。

3) 必需环境变量（.env）：

- `DATABASE_URL`：MySQL 连接串
- `ADMIN_JWT_SECRET`：后台登录 JWT 密钥
- `SITE_JWT_SECRET`：站点用户登录 JWT 密钥
- 支付宝（作为兜底，站点设置优先生效）：
  - `ALIPAY_APP_ID`
  - `ALIPAY_PRIVATE_KEY`（PKCS8）
  - `ALIPAY_PUBLIC_KEY`
  - `ALIPAY_GATEWAY`（如沙箱 `https://openapi-sandbox.dl.alipaydev.com/gateway.do`）
  - `ALIPAY_NOTIFY_URL`

## 站点设置使用说明

- 入口：`/admin/settings`
- 品牌与展示配置：
  - 站点 Logo（建议 1:1 或横向）
  - 站点名称（Header 与元信息）
  - 站点副标题（首页 Hero H1）
  - Slogan、关键词（逗号分隔）、描述（用于 SEO）
  - 首页 Hero 图（`/public/haike_hero.svg` 为默认）
  - Footer 文本（首页尾部显示）
- 支付配置：
  - App ID、私钥（PKCS8）、支付宝公钥（必填）、Gateway 与 Notify URL
- 保存成功后页面会自动重载，前台各处（含 SSR 元信息）将即时生效。

## 支付与访问授权

- 预下单：`POST /api/pay/alipay/precreate`（返回二维码与交易号）
- 回调：`POST /api/pay/alipay/notify`
- 查询：`POST /api/pay/alipay/query`
- 支付成功后，后端会给用户发放对应资源访问权限；用户刷新资源页即可下载。

## 主要接口（简要）

- 资源与列表
  - `GET /api/resources`：分页列表（支持 q/categoryId/subcategoryId/tagId/sort）
  - `GET /api/resources/[id]`：资源详情
  - `GET /api/resources/prev-next`：上一篇/下一篇
  - `GET /api/resources/random`：猜你喜欢
- 用户与下载
  - `POST /api/user/me`：用户信息（含 VIP 与头像）
  - `POST /api/user/downloads`：下载记录
  - `POST /api/user/avatar`：更新头像（上传后保存到数据库）
- 站点与后台
  - `GET /api/site/settings`：前台读取站点展示配置
  - `GET/PUT /api/admin/settings`：后台站点设置（展示与支付配置）

## 视觉与主题

- 统一视觉：Violet 紫色（按钮/标签/装饰色），可进一步在 `app/globals.css` 的 CSS 变量中将 `--primary`/`--ring` 改为紫色，完成全站主题切换。
- 登录与注册：整页动漫动效背景（`/public/auth_bg_animated.svg`），顶部品牌区显示站点 Logo 与标题。

## 开发提示

- SSR 避免闪烁：Header 使用服务端注入的 `initialSiteConfig`（名称与 Logo）避免初始渲染显示默认值后再替换。
- 头像与本地缓存：上传后会调用 `/api/user/avatar` 写库，并同步 `localStorage.site_user.avatarUrl`；登录成功也会从 `/api/user/me` 同步头像与 VIP 状态到本地缓存。
- 原生 SQL 回退：为规避 Prisma Client 在 Windows 环境生成失败的情况，站点设置与头像接口默认走原生 SQL，待生成恢复后可改回 Prisma Client。
- 邮件类型声明：如需在 `app/api/auth/reset-code/route.ts` 使用 nodemailer，已在 `types/shims-nodemailer.d.ts` 添加最简声明；也可安装 `@types/nodemailer`。

## 启动与部署

- 本地开发：`npm run dev`，访问 `http://localhost:3000/`
- 生产构建：

```bash
npm run build
npm run start
```

请确保数据库与 `.env` 正确配置，且后台站点设置已完成必要的展示与支付配置。

---

如需进一步的站点定制（主题色、更多页面的独立 Hero 配置、后台用户管理等），欢迎提出需求，我们会按模块进行扩展与接入。
