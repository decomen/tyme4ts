# @taiwei/tyme4ts-almanac

独立公共通书扩展包。它只通过 `tyme4ts` 的公开 API 获取历法事实，规则、来源和快照由本包分层管理，不修改官方库源码。

本包位于 `tyme4ts` monorepo 的 `packages/almanac/` 下，以 pnpm workspace 形式与官方库 `tyme4ts`（根包）同仓库共存；依赖通过 `workspace:*` 协议解析到本地源码，官方库零侵入。

宜忌扩展规则由模型知识能力在构建期整理并固化为 `rules/packages/<version>.json`。运行时先使用 `loadRulePackage` 校验并冻结规则包，再将其注入 `AlmanacService`；运行时不会调用模型临时生成规则。

## 目录

- `src/adapter-tyme4ts.ts`：官方 API 适配。
- `src/domain-*.ts`：公开 DTO 与计算上下文。
- `src/rules/`：规则 Schema、加载、裁决与版本治理。
- `src/providers.ts`：公共历注 Provider。
- `src/application-*.ts`：聚合、检索、快照与复算。
- `test/<模块>`：与业务代码严格分离的测试。
- `rules`：版本化来源、活动词典和规则资产。

## 命令

在 monorepo 根目录（`tyme4ts/`）执行：

```powershell
# 类型检查
pnpm --filter @taiwei/tyme4ts-almanac check

# 单元测试
pnpm --filter @taiwei/tyme4ts-almanac test

# 构建
pnpm --filter @taiwei/tyme4ts-almanac build

# 或等价的根级聚合命令
pnpm check:almanac
pnpm test:almanac
pnpm build:almanac
```
