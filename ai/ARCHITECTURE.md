# 系统架构与技术约定 (ARCHITECTURE)

- **协议版本**：PCMP 2.1
- **更新日期**：2026-10-19
- **权威等级**：强指导 (长期稳定)

---

## 1. 技术栈选型 (Technology Stack)

| 领域             | 选型                                | 版本/规范               | 说明                                               |
| :--------------- | :---------------------------------- | :---------------------- | :------------------------------------------------- |
| **运行时宿主**   | Obsidian Plugin API                 | >= 1.4.5                | 支持桌面端与移动端运行                             |
| **编程语言**     | TypeScript                          | 5.3.3                   | 严格类型检查 (`tsc -noEmit -skipLibCheck`)         |
| **构建工具**     | esbuild                             | 0.25.12                 | 编译为单个 `main.js`；Less 转译合并为 `styles.css` |
| **UI 视图库**    | React / React-DOM / AntD            | React 18, AntD 5.21     | 设置面板、创建笔记窗口及历史卡片局部使用           |
| **样式方案**     | Less / Vanilla CSS                  | esbuild-plugin-less     | 模块化 Less，打包生成根目录 `styles.css`           |
| **日期与国际化** | dayjs / moment / tyme4ts            | 统一按语种注入 locale   | 支撑 ISO 周规则与多语言日历格式化                  |
| **外部生态插件** | Dataview API (可选)                 | 0.5.68 类型集成         | 用于任务/记录聚合，支持未安装优雅降级              |
| **测试框架**     | Node.js 原生 Test Runner            | `node scripts/test.mjs` | 当前维护 101 项集成与单元测试                      |
| **代码规范**     | Biome / Prettier / simple-git-hooks | Biome 1.8.1             | Pre-commit 阶段触发格式化与检查                    |

---

## 2. 架构分层与模块依赖 (Architecture & Directory Map)

```text
src/
├── main.ts                    # 插件主入口 (LifeOS 继承 Plugin)，生命周期/命令/代码块分发
├── constant.ts / type.ts      # 全局常量、配置类型与接口定义
├── util.ts / markdown-lines.ts# 通用文件操作、正则生成、Markdown行解析与错误呈现
├── integration.ts             # 全局助手与多环境查询语言注册 (LifeOS / LifeOSOpen)
│
├── para/                      # PARA 四大要素模型与聚合逻辑
│   ├── Item.ts                # PARA 基类，实现通用 Markdown 渲染与 Dataview 查询
│   ├── Project.ts             # 项目管理：时间消耗累加、周期文件聚合、项目快照
│   ├── Area.ts                # 领域管理：按时间/按季度聚合领域链接
│   ├── Resource.ts            # 资源管理：按标签索引资源笔记
│   └── Archive.ts             # 归档管理：[Inverstar定制] 递归子目录检索、层级标签多级匹配、isArchived 过滤
│
├── periodic/                  # 周期笔记与任务处理核心
│   ├── Bullet.ts              # 闪念/子弹笔记：按时间/标签聚合列表项
│   ├── Task.ts                # 待办任务：监听 Dataview 索引、任务状态勾选回写
│   ├── DailyRecord.ts         # 日记同步：解析 daily note 记录，对接 memos 闪念
│   ├── Date.ts                # 周期日期解析引擎：日/周/月/季/年文件路径推导
│   ├── File.ts                # 文件管理：[Inverstar定制] collectSubFolders 递归目录、同名/README 索引查找
│   ├── calendar.ts            # ISO 周算法与日历周期计算
│   └── paths.ts               # 库根目录及多级路径标准化
│
├── capture/                   # 快速记录子系统 (Quick Capture)
│   ├── QuickCaptureModal.ts   # 快速记录与速记任务弹窗
│   ├── DraftEditor.ts         # 原生实时预览编辑器容器
│   ├── RecordView.ts          # 历史记录流视图、就地编辑 (Inline Edit)
│   ├── composer.ts            # 内容组合器 (时间戳、标签、任务复选框格式化)
│   ├── history.ts             # 历史记录与日记条目匹配、行号/块ID 定位
│   └── theme-model.ts         # 快速记录与主题多标签动态关联
│
├── theme/                     # 独立普通主题笔记系统 (Plain Theme Notes)
│   ├── Theme.ts               # 主题模型与视图入口 (ThemeListByTag / ThemeListByFolder)
│   ├── ThemeSettings.tsx      # 主题配置面板 (目录规范、索引模式、默认首标签)
│   ├── ThemeUpgradeModal.ts   # 主题查询安全升级弹窗 (Diff Preview 差异对比防护)
│   ├── query-summary.ts       # 主题汇总未完成待办聚焦与统计
│   ├── rename.ts              # 主题重命名与标签同步协同
│   └── upgrade-plan.ts        # 模板与笔记升级变更计划计算
│
├── onboarding/                # 首次使用向导与工作区模板引擎
│   ├── OnboardingModal.ts     # 初始化向导弹窗 (选择周期笔记 / PARA 模式)
│   ├── workspace.ts           # 10 种语言工作区目录脚手架搭建
│   ├── templates.ts           # 国际化内置模板注入与防覆盖保护
│   └── quick-start.ts         # 5分钟快速开始体验流
│
├── dependencies/              # 外部插件协同与优雅降级
│   ├── dataview.ts            # Dataview 运行状态探测 (ready / disabled / missing / indexing)
│   ├── QueryIndexWait.ts      # 索引中加载动画与重试机制
│   └── template-creation.ts   # Templater 异步解析调用与单次执行保障
│
├── locales/ & i18n.ts         # 10 种语言的多语种文案与 AntD / Dayjs 语言包映射
├── product/                   # 产品使用说明、今日日记直达与对比指引
└── view/                      # 基础视图组件 (SettingTab, CreateNote 等)
```

---

## 3. 核心数据流 (Core Data Flows)

### 3.1 代码块查询与渲染数据流 (`LifeOS` CodeBlock)

````text
用户笔记编写 ```LifeOS \n ViewName \n Params ```
   ↓
main.ts 中的 markdownCodeBlockProcessor 捕获代码块
   ↓
检查 Dataview 运行状态 (dependencies/dataview.ts)
   ├── 若未就绪/索引中 ➔ 挂载 QueryIndexWait 降级提示与重试按钮
   └── 若就绪 (或非 Dataview 视图) ➔ 调用 views[ViewName] 处理函数
        ↓
para/ 或 periodic/ 模块根据上下文 (sourcePath) 读取当前笔记元数据
        ↓
聚合目标笔记列表 (MarkdownRenderer.render 渲染至 DOM 容器)
````

### 3.2 快速记录与逆向日记回写数据流

```text
用户在 QuickCaptureModal 录入文本 / 勾选主题 / 添加任务
   ↓
capture/composer 组装 Markdown 块 (添加时间戳、关联标签、^block-id)
   ↓
通过 periodic/paths 确定今日日记文件路径 (若不存在则通过模板安全创建)
   ↓
使用 Vault API 挂载至日记指定区块 (如 ## 记录 或 ## 闪念)
   ↓
编辑已存历史记录时 ➔ capture/history 依据 ^block-id 定位行，原子局部替换，保持 CRLF 与邻近段落不变
```

---

## 4. Inverstar 定制特性与技术约定 (Inverstar Custom Features)

1. **递归目录与层级标签多级匹配 (`src/para/Archive.ts`)**：

   - 支持递归扫描目标目录下的所有子文件夹 (`collectFiles`)；
   - 实现了 `isTagMatch(fileTag, tag)`：不仅支持完全匹配，还支持父子标签互相包含（如当前笔记标签为 `AI`，可命中 `#AI/agent` 与 `#AI/mem/study`）；
   - 支持显式参数：在代码块第二行传入可选的自定义扫描目录；
   - 过滤条件严格判断 `frontmatter.isArchived === true`。

2. **子目录递归发现与同名索引查找 (`src/periodic/File.ts`)**：

   - 实现了 `collectSubFolders`，解决 PARA 目录下存在多级深层嵌套子领域/子项目时索引断层的问题；
   - 兼容 `folderName`（同名文件，如 `Folder/Folder.md`）与 `README`（如 `Folder/README.md`）双重索引模式。

3. **Memos 用户名兼容与平滑处理**：
   - 对接第三方 usememos 时支持兼容基于 username 的用户资源过滤。

---

## 5. 编码与安全规范 (Conventions & Safety Guidelines)

- **只读预览先行**：涉及可能改动用户笔记的大规模变动（如主题查询升级），必须遵循 `upgrade-plan.ts` 输出差异对比，严禁无感知自动化批处理。
- **换行符保真**：文本处理使用 `replace(/\r?\n$/, '')`，回写保持原文件 CRLF/LF 换行风格。
- **国际化无回退遗漏**：所有面向用户的新增 Notice、UI 按钮、错误提示必须在 `locales/` 中 10 种语言完整注册，严禁遗漏造成硬编码英文回退。
