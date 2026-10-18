# 项目定位与核心目标 (PROJECT)

- **项目名称**：Obsidian LifeOS (插件 ID: `periodic-para`, 社区显示名: `LifeOS`)
- **代码仓库**：`Inverstar/obsidian-lifeos` (基于 `quanru/obsidian-periodic-para` 深度演进与本地定制)
- **协议版本**：PCMP 2.1
- **当前版本**：`1.29.2` (最低支持 Obsidian `1.4.5`)

---

## 1. 项目定位与宗旨 (Mission & Purpose)

LifeOS 是面向 Obsidian 用户的**个人全周期生命管理系统与数字第二大脑插件**。  
系统深度整合 **PARA 组织法**（Projects 项目, Areas 领域, Resources 资源, Archives 归档）、**周期笔记**（Periodic Notes：日、周、月、季、年）与**快速记录**（Quick Capture），并支持独立普通主题笔记（Plain Theme Notes）以及可选的 usememos 闪念同步，致力于帮助用户在本地离线环境下低摩擦构建高价值的个人知识管理（PKM）闭环。

---

## 2. 核心目标 (Core Goals)

1. **结构化 PARA 组织系统**

   - 规范管理 Projects、Areas、Resources 与 Archives 目录；
   - 支持同名索引（`Folder/Folder.md`）与通用 README 索引（`Folder/README.md`）；
   - 保留 Inverstar 深度定制的层级标签递归匹配（如 `#AI` 匹配 `#AI/agent`、`#AI/mem/study`）、子目录递归发现与归档状态过滤（`isArchived: true`）。

2. **多周期笔记与时间维度聚合 (Periodic Notes)**

   - 自动生成符合日、周（ISO 周标准）、月、季、年规则的周期笔记；
   - 动态通过 `LifeOS` 渲染器聚合时间维度的任务、子弹笔记与项目进展；
   - 遵循严格的本地模板防护，确保重复创建或向导修复时不覆盖用户手写反思与已有笔记。

3. **原生快速记录 (Quick Capture)**

   - 支持原生 Live Preview 实时预览编辑，兼容 Markdown 语法、任务复选框、双向链接与剪贴板图片；
   - 支持历史浏览与卡片行内就地编辑 (Inline Edit)，修改精准回写至当日日记指定区块；
   - 自动提取并关联多维主题标签，在录入界面动态反馈主题归属。

4. **独立普通主题笔记 (Plain Theme Notes)**

   - 允许用户在脱离强制 PARA 的模式下管理独立主题笔记，拥有自主目录、模板与首标签；
   - 主题汇总页深度聚焦未完成任务，支持即时勾选回写源日记，自动排除打卡/习惯块；
   - 提供查询升级安全预览机制（Diff Preview），杜绝强制覆盖用户自定义查询与笔记内容。

5. **全方位多语言工作区 (Multilingual Support)**

   - 核心界面、引导向导与配套模板完整支持 10 种语言：英语、简体中文、繁体中文、德语、西班牙语、法语、葡萄牙语、日语、韩语、阿拉伯语（含 RTL 布局适配）。

6. **高可靠性与依赖感知**
   - 核心记录与创建功能零依赖外部插件即可运行；
   - 复杂查询视图深度适配 Dataview，并提供未安装/未启用/等待索引完成的即时状态提示与自动恢复重试。

---

## 3. 边界与非目标 (Scope & Non-Goals)

1. **[事实] 拒绝闭源逻辑与远程遥测 (No Telemetry / No Proprietary Code)**
   - 本项目为纯开源工具，绝对不包含 LifeOS Pro 闭源付费代码或激活授权机制；
   - 绝不引入远程广告、第三方用户行为遥测或静默上传用户笔记至云端。
2. **[事实] 本地优先与数据主权 (Local-First Authority)**
   - 用户的所有知识数据严格保存在本地 Vault 中；
   - 插件不对外部网络服务（如云端同步）产生不可逆强绑定。
3. **[事实] 零静默覆写 (Zero Silent Overwrite)**
   - 任何涉及笔记模板、主题查询或日常记录的升级/修复，均不得静默覆盖或清空用户手写反思；
   - 必须通过差异对比、用户显式确认或只读预览后局部操作。
4. **[事实] 协议严格解耦 (Protocol Decoupling)**
   - PCMP 协议规范仅用于工程管理与 AI 协同，严禁将协议逻辑、元数据标记硬编码为运行时产品代码依赖。

---

## 4. 硬约束与安全边界 (Hard Constraints & Safety Boundaries)

1. **[强约束] 数据完整性与原子性**：
   - 针对日记文件的编辑、任务勾选回写，必须维持原有换行符（CRLF/LF）、缩进及前后空白，绝不允许截断或篡改邻近内容。
2. **[强约束] Obsidian 兼容底线**：
   - 必须维持对 Obsidian 1.4.5 及以上版本的向后兼容；
   - 代码须同时适配桌面端 (macOS/Windows/Linux) 与移动端 (iOS/Android 软键盘及触控交互)。
3. **[强约束] 测试与构建健康门禁**：
   - 所有提交必须确保 `pnpm test` (当前 101/101 pass) 100% 通过；
   - `pnpm run build` 必须无类型报错 (TypeScript 5.3) 并顺利输出 `main.js` 与 `styles.css`。
