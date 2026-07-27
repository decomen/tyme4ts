import type { RuleHit } from '../domain-models.js'

export interface RuleResolution {
  readonly effective: readonly RuleHit[]
  readonly differences: readonly RuleHit[]
}

/**
 * 对同事项、同时间层级和同条件的可比规则执行低数值优先裁决。
 * @param hits - 已通过 Schema 校验的规则命中列表。
 * @returns 有效命中和被裁决但必须展示的差异命中。
 */
export function resolveRuleHits(hits: readonly RuleHit[]): RuleResolution {
  const effective: RuleHit[] = []
  const differences: RuleHit[] = []
  const comparableGroups = new Map<string, RuleHit[]>()

  for (const hit of hits) {
    if (!hit.comparable) {
      effective.push(hit)
      continue
    }
    const key = `${hit.activityId}\u0000${hit.timeScope}\u0000${hit.conditionKey}`
    const group = comparableGroups.get(key) ?? []
    group.push(hit)
    comparableGroups.set(key, group)
  }

  for (const group of comparableGroups.values()) {
    const ordered = [...group].sort((left, right) => left.priority - right.priority || left.ruleId.localeCompare(right.ruleId))
    const winner = ordered[0]
    if (winner !== undefined) {
      effective.push(winner)
      differences.push(...ordered.slice(1))
    }
  }

  return { effective, differences }
}

