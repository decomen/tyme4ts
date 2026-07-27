import { describe, expect, it } from 'vitest'

import { RulePackageRegistry, loadRulePackage } from '../../src/rules/registry.js'

const releasedPackage = {
  schemaVersion: '1.0.0',
  packageVersion: '2026.07.25',
  status: 'released',
  rules: [{
    ruleId: 'daily.travel.model-v1', activityId: 'daily.travel', conclusion: 'avoid', priority: 10,
    comparableWhen: ['same-activity'], conditionKey: 'duty=建', sourceId: 'model-knowledge.codex', confidence: 0.9,
    interpretation: '公共通书出行宜忌知识', reviewStatus: 'approved', changeReason: '初始版本',
  }],
} as const

describe('规则包加载与版本治理', () => {
  it('加载后冻结规则包并保留知识溯源字段', () => {
    const loaded = loadRulePackage(releasedPackage)

    expect(loaded.rules[0]?.sourceId).toBe('model-knowledge.codex')
    expect(Object.isFrozen(loaded)).toBe(true)
    expect(Object.isFrozen(loaded.rules)).toBe(true)
  })

  it('发布新版本后可回滚且旧版本不被覆盖', () => {
    const registry = new RulePackageRegistry()
    const first = loadRulePackage(releasedPackage)
    const second = loadRulePackage({ ...releasedPackage, packageVersion: '2026.07.26' })

    registry.publish(first)
    registry.publish(second)
    expect(registry.current()?.packageVersion).toBe('2026.07.26')
    registry.rollback('2026.07.25')
    expect(registry.current()?.packageVersion).toBe('2026.07.25')
    expect(registry.get('2026.07.26')).toBe(second)
  })
})
