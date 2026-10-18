---
pcmp_version: '2.1'
revision: 1
updated: 2026-10-19
---

# 已知缺陷与技术风险跟踪 (ISSUES)

## ISSUE-001 — Biome 静态检查提示 39 处代码风格与 Import 排序问题

- **状态**: `[事实]` Open
- **严重等级**: 低 (Low) — 静态检查层面，不影响编译及功能
- **涉及模块**:
  - `src/locales/*.ts` (多个语种模块的 notices 引用排序)
  - `src/component/CreateNote/index.tsx` (AntD 与内部组件引用顺序)
  - `src/para/Item.ts`、`src/para/Archive.ts` (import 语句顺序)
  - `src/theme/upgrade-plan.ts` (第 25 行 `useSingleVarDeclarator` 需拆分变量声明)
- **影响评估**:
  - `pnpm test` (测试) 100% 通过；
  - `pnpm run build` (生产构建) 正常输出；
  - 但执行 `pnpm run lint` 会触发 exit code 1，对 pre-commit 勾子造成额外校验摩擦。
- **缓解与建议方案**:
  - `[提议]` 在后续独立治理任务中，使用 `pnpm biome check --write` 或手动安全整理 import 排序与变量声明；
  - 注意需在隔离测试后提交，防止误改影响运行时加载顺序。

---

## ISSUE-002 — Inverstar 定制特性尚缺独立自动化单元测试

- **状态**: `[事实]` Open
- **严重等级**: 中 (Medium) — 长期质量与维护风险
- **涉及模块**:
  - `src/para/Archive.ts` 中的 `collectFiles`、`getNoteTags`、`isTagMatch`、`isArchived` 过滤逻辑
  - `src/periodic/File.ts` 中的 `collectSubFolders` 深层目录扫描逻辑
- **影响评估**:
  - 当前代码经人工核验与编译打包是完整可用的；
  - 但现有 `tests/` 目录下的 101 项测试用例绝大部分继承自上游 1.29.2，未针对 Inverstar 特色功能（例如 `#AI` 匹配 `#AI/agent`、多级嵌套文件夹同名索引扫描等）编写断言；
  - 未来再次同步或合并上游改动时，容易引发静默的逻辑回归或覆盖。
- **缓解与建议方案**:
  - `[提议]` 在 `tests/` 目录下新增 `archive-custom.test.mts` 与 `subfolders.test.mts`，将 Inverstar 的定制特性转化为受保护的自动化测试用例。

---

## ISSUE-003 — 跨环境多端宿主复测覆盖待持续补充

- **状态**: `[未决]` Open
- **严重等级**: 低 (Low) — 环境兼容性验证
- **涉及模块**:
  - 移动端虚拟键盘交互（`ThemePicker.ts`、`keyboard-height` 计算）
  - 阿拉伯语 RTL 布局样式
- **影响评估**:
  - 1.29.2 候选阶段主测试环境在桌面端，移动端及低版本 Obsidian (如 1.4.5) 缺少真实宿主自动化矩阵。
- **缓解与建议方案**:
  - 保持在移动端（手机/平板）安装 `periodic-para-1.29.2.zip` 进行手动冒烟验证并记录核验日志。
