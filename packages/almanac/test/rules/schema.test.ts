import { describe, expect, it } from 'vitest'

import {
  validateRulePackage,
  validateSourcePackage,
} from '../../src/rules/schema.js'

describe('来源包 Schema', () => {
  it('接受具有版本、置信度和审核状态的模型知识来源', () => {
    const result = validateSourcePackage({
      schemaVersion: '1.0.0',
      packageVersion: '2026.07.25',
      sources: [{
        sourceId: 'model-knowledge.codex',
        kind: 'model-knowledge',
        model: 'gpt-5',
        knowledgeVersion: '2026-07-25',
        confidence: 0.9,
        reviewStatus: 'approved',
        changeReason: '首个公共通书知识版本',
      }],
    })

    expect(result.ok).toBe(true)
  })

  it('拒绝置信度越界或缺少知识版本的来源', () => {
    const result = validateSourcePackage({
      schemaVersion: '1.0.0',
      packageVersion: '2026.07.25',
      sources: [{
        sourceId: 'model-knowledge.invalid',
        kind: 'model-knowledge',
        model: 'gpt-5',
        confidence: 1.2,
        reviewStatus: 'approved',
        changeReason: '无版本',
      }],
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('模型知识来源必须声明 knowledgeVersion')
    expect(result.errors).toContain('confidence 必须是 0 到 1 之间的数值')
  })
})

describe('规则包 Schema', () => {
  it('接受正整数低值优先级和模型知识来源', () => {
    const result = validateRulePackage({
      schemaVersion: '1.0.0',
      packageVersion: '2026.07.25',
      status: 'experimental',
      rules: [{
        ruleId: 'rule-demo-1',
        activityId: 'daily.travel',
        conclusion: 'avoid',
        priority: 10,
        comparableWhen: ['same-activity', 'same-time-scope', 'same-condition'],
        conditionKey: 'duty=建',
        sourceId: 'model-knowledge.codex',
        confidence: 0.9,
        interpretation: '模型知识整理的公共出行规则',
        reviewStatus: 'approved',
        changeReason: '初始规则',
      }],
    })

    expect(result.ok).toBe(true)
  })

  it('拒绝零、负数和小数优先级', () => {
    for (const priority of [0, -1, 1.5]) {
      const result = validateRulePackage({
        schemaVersion: '1.0.0',
        packageVersion: '2026.07.25',
        status: 'experimental',
        rules: [{
          ruleId: `rule-${priority}`,
          activityId: 'daily.travel',
          conclusion: 'avoid',
          priority,
          comparableWhen: ['same-activity'],
          sourceId: 'model-knowledge.codex',
          confidence: 0.9,
          interpretation: '优先级边界测试',
          reviewStatus: 'approved',
          changeReason: '测试',
        }],
      })

      expect(result.ok).toBe(false)
    }
  })

  it('禁止低置信度或未审核规则进入正式规则包', () => {
    const result = validateRulePackage({
      schemaVersion: '1.0.0',
      packageVersion: '2026.07.25',
      status: 'released',
      rules: [{
        ruleId: 'rule-unverified',
        activityId: 'daily.travel',
        conclusion: 'avoid',
        priority: 10,
        comparableWhen: ['same-activity'],
        sourceId: 'model-knowledge.codex',
        confidence: 0.6,
        interpretation: '待审核规则',
        reviewStatus: 'pending',
        changeReason: '实验整理',
      }],
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('released 规则包不得包含未审核或低置信度规则')
  })
})
