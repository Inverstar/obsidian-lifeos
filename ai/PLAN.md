---
pcmp_version: '2.1'
revision: 1
updated: 2026-10-19
---

# 项目路线图与演进规划 (PLAN)

## 1. 当前阶段定位 (Current Phase)

- **阶段名称**：`1.29.2 稳定化与工程治理阶段`
- **阶段目标**：巩固上游 1.29.2 主线合入成果，健全 PCMP 规范体系，排查代码风格告警，为 Inverstar 专属能力补齐测试防线。

---

## 2. 里程碑规划 (Milestones)

### 里程碑 1：PCMP 2.1 上下文体系初始化 (当前里程碑 — 2026-10)

- **目标**：建立标准化 `ai/` 规范目录，确保跨会话、跨智能体恢复能力。
- **产出**：
  - [x] 确立 `PROJECT.md`、`ARCHITECTURE.md`、`STATE.md`、`TASK.md`、`PLAN.md`、`DECISIONS.md`、`ISSUES.md`；
  - [x] 适配 `.gitignore` 规则以忽略 `ai/.cache/`；
  - [x] 输出详细的项目状态综合评估报告。

### 里程碑 2：工程健康度治理与代码规范化 (近期 — 2026-10/11)

- **目标**：解决静态代码扫描中的 39 项 Biome 报错，使 `pnpm run lint` 纯净通过。
- **任务清单**：
  - [ ] 整理 `src/locales/` 及其他组件中的 import 引用排序；
  - [ ] 修复 `src/theme/upgrade-plan.ts` 中的 `useSingleVarDeclarator` 告警；
  - [ ] 确保在 `simple-git-hooks` / `nano-staged` pre-commit 流程中格式化与检查不报错。

### 里程碑 3：Inverstar 定制特性的自动化测试守护 (中期)

- **目标**：为 Inverstar 定制功能建立专属单元测试，防止未来同步上游时产生回归缺陷。
- **任务清单**：
  - [ ] 新建 `tests/para-archive.test.mts`，针对 `src/para/Archive.ts` 的 `isTagMatch` 进行边界测试（父标签命中子标签、子标签命中父标签、大小写不敏感匹配、非匹配前缀防护）；
  - [ ] 测试 `collectFiles` 递归收集能力与 `isArchived: true` 过滤条件（布尔值与字符串 `'true'`）；
  - [ ] 测试自定义目录参数在 `ArchiveListByTag` 中的生效机制；
  - [ ] 新建 `tests/periodic-subfolder.test.mts`，测试 `collectSubFolders` 深层目录扫描与同名/README 索引的查找。

### 里程碑 4：上游主线演进跟踪与跨端体验打磨 (中远期)

- **目标**：保持对上游仓库新发布版本的平滑追踪与双向融合。
- **任务清单**：
  - [ ] 建立标准 upstream 追踪机制，定期拉取 upstream 新功能与补丁；
  - [ ] 关注移动端在长篇日记和复杂主题树下的虚拟键盘遮挡优化；
  - [ ] 评估是否需要引入 PCMP 的 SQLite 派生索引层（`ai/.cache/index.sqlite`）以加速海量笔记元数据检索。
