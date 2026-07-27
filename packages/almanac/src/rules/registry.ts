import { validateRulePackage } from './schema.js'
import type { ActivityConclusion } from '../domain-models.js'

export interface KnowledgeRule {
  readonly ruleId: string
  readonly activityId: string
  readonly conclusion: ActivityConclusion
  readonly priority: number
  readonly comparableWhen: readonly string[]
  readonly conditionKey: string
  readonly sourceId: string
  readonly confidence: number
  readonly interpretation: string
  readonly reviewStatus: 'pending' | 'reviewing' | 'approved'
  readonly changeReason: string
}

export interface LoadedRulePackage {
  readonly schemaVersion: string
  readonly packageVersion: string
  readonly status: string
  readonly rules: readonly KnowledgeRule[]
}

/**
 * 深度冻结规则包，防止发布后的知识规则被调用方修改。
 * @param value - 待冻结的规则包对象或数组。
 * @returns 原值的深度只读视图。
 */
function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (typeof child === 'object' && child !== null && !Object.isFrozen(child)) deepFreeze(child)
  }
  return Object.freeze(value)
}

/**
 * 校验并加载模型知识规则包。
 * @param input - JSON 兼容的未知规则包输入。
 * @returns 已校验且深度冻结的规则包。
 */
export function loadRulePackage(input: unknown): LoadedRulePackage {
  const result = validateRulePackage(input)
  if (!result.ok) throw new TypeError(result.errors.join('; '))
  if (typeof input !== 'object' || input === null) throw new TypeError('规则包必须是对象')
  return deepFreeze(structuredClone(input)) as LoadedRulePackage
}

/** 保留全部历史版本并支持发布指针回滚的规则包仓库。 */
export class RulePackageRegistry {
  private readonly packages = new Map<string, LoadedRulePackage>()
  private currentVersion: string | undefined

  /**
   * 发布一个已校验规则包，不覆盖同版本历史。
   * @param rulePackage - 已冻结的规则包。
   * @returns 无返回值。
   */
  publish(rulePackage: LoadedRulePackage): void {
    if (this.packages.has(rulePackage.packageVersion)) throw new Error(`规则包版本已存在: ${rulePackage.packageVersion}`)
    this.packages.set(rulePackage.packageVersion, rulePackage)
    this.currentVersion = rulePackage.packageVersion
  }

  /** 按版本读取历史规则包。 */
  get(packageVersion: string): LoadedRulePackage | undefined {
    return this.packages.get(packageVersion)
  }

  /** 读取当前发布的规则包。 */
  current(): LoadedRulePackage | undefined {
    return this.currentVersion === undefined ? undefined : this.packages.get(this.currentVersion)
  }

  /** 将当前发布指针回滚到已有历史版本。 */
  rollback(packageVersion: string): void {
    if (!this.packages.has(packageVersion)) throw new Error(`规则包版本不存在: ${packageVersion}`)
    this.currentVersion = packageVersion
  }
}
