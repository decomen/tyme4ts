import { describe, expect, it } from 'vitest'

import { createCalculationContext } from '../../src/domain-context.js'
import type { AlmanacDay, RuleHit } from '../../src/domain-models.js'
import { resolveRuleHits } from '../../src/rules/resolver.js'
import { createSnapshotIdentity } from '../../src/application-fingerprint.js'

describe('计算上下文', () => {
  it('显式保留民用时间、时区、地点、换日和版本口径', () => {
    const context = createCalculationContext({
      civilDateTime: '2026-07-25T12:30:00',
      timeZone: 'Asia/Shanghai',
      location: { latitude: 24.48, longitude: 118.08 },
      dayBoundary: 'midnight',
      ruleSetVersion: '2026.07.25',
      engineVersion: 'tyme4ts@1.5.2',
      schemaVersion: '1.0.0',
    })

    expect(context.timeZone).toBe('Asia/Shanghai')
    expect(context.location?.longitude).toBe(118.08)
  })

  it('拒绝无效 IANA 时区', () => {
    expect(() => createCalculationContext({
      civilDateTime: '2026-07-25T12:30:00',
      timeZone: 'Mars/Olympus',
      dayBoundary: 'midnight',
      ruleSetVersion: '2026.07.25',
      engineVersion: 'tyme4ts@1.5.2',
      schemaVersion: '1.0.0',
    })).toThrow('无效 IANA 时区')
  })
})

describe('通书 DTO', () => {
  it('日级与时辰级结果可独立序列化', () => {
    const day: AlmanacDay = {
      date: '2026-07-25',
      facts: { solarDate: '2026-07-25', lunarDate: '农历六月十二', dayCycle: '庚子' },
      annotations: [],
      activities: [],
      hours: [{
        branch: '子',
        civilRange: '23:00-00:59',
        cycle: '丙子',
        annotations: [],
        activities: [],
      }],
    }

    expect(JSON.parse(JSON.stringify(day)).hours[0].branch).toBe('子')
  })
})

describe('规则冲突裁决', () => {
  const base: Omit<RuleHit, 'ruleId' | 'priority' | 'conclusion'> = {
    activityId: 'daily.travel',
    timeScope: 'day',
    conditionKey: 'same',
    comparable: true,
    sourceId: 'model-knowledge.codex.2026-07-25',
  }

  it('可比规则选择最低 priority 并保留其他差异', () => {
    const resolved = resolveRuleHits([
      { ...base, sourceId: 'model-knowledge.codex.2026-07-24', ruleId: 'later', priority: 20, conclusion: 'recommend' },
      { ...base, ruleId: 'winner', priority: 10, conclusion: 'avoid' },
    ])

    expect(resolved.effective.map((hit) => hit.ruleId)).toEqual(['winner'])
    expect(resolved.differences.map((hit) => hit.ruleId)).toEqual(['later'])
    expect(resolved.effective[0]?.sourceId).toBe('model-knowledge.codex.2026-07-25')
    expect(resolved.differences[0]?.sourceId).toBe('model-knowledge.codex.2026-07-24')
  })

  it('不可比规则并列保留而不强制覆盖', () => {
    const resolved = resolveRuleHits([
      { ...base, comparable: false, ruleId: 'a', priority: 20, conclusion: 'recommend' },
      { ...base, comparable: false, ruleId: 'b', priority: 10, conclusion: 'avoid' },
    ])

    expect(resolved.effective).toHaveLength(2)
    expect(resolved.differences).toHaveLength(0)
  })
})

describe('快照标识', () => {
  it('相同语义输入生成确定性哈希', () => {
    const first = createSnapshotIdentity({ date: '2026-07-25', rules: ['a', 'b'] })
    const second = createSnapshotIdentity({ rules: ['a', 'b'], date: '2026-07-25' })

    expect(first).toEqual(second)
    expect(first.snapshotId).toMatch(/^almanac_[a-f0-9]{24}$/)
  })
})
