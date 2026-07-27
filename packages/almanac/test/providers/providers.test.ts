import { describe, expect, it } from 'vitest'

import { Tyme4tsCalendarAdapter } from '../../src/adapter-tyme4ts.js'
import { createPublicAnnotations, mapModelKnowledgeActivities, mapOfficialActivities } from '../../src/providers.js'
import { loadRulePackage } from '../../src/rules/registry.js'

describe('公共历注 Providers', () => {
  it('分别输出值神和黄黑道分类', () => {
    const facts = new Tyme4tsCalendarAdapter().getDay(2024, 6, 26)
    const annotations = createPublicAnnotations(facts)
    const dutyStar = annotations.find((item) => item.kind === 'duty-star')

    expect(dutyStar?.details.classification).toMatch(/黄道|黑道/)
    expect(dutyStar?.name).not.toBe(dutyStar?.details.classification)
  })

  it('六曜明确标记为日本可选文化历注', () => {
    const facts = new Tyme4tsCalendarAdapter().getDay(2021, 1, 15)
    const annotation = createPublicAnnotations(facts).find((item) => item.kind === 'six-star')

    expect(annotation?.optionalCulture).toBe(true)
    expect(annotation?.details.system).toBe('日本六曜')
  })

  it('金符经在未校勘时仅输出实验状态和缺失证据', () => {
    const facts = new Tyme4tsCalendarAdapter().getDay(2024, 6, 26)
    const annotation = createPublicAnnotations(facts).find((item) => item.kind === 'golden-talisman')

    expect(annotation?.experimental).toBe(true)
    expect(annotation?.details.evidence).toBe('pending-review')
  })

  it('胎神输出占方、内外方和模型知识释义', () => {
    const annotation = createPublicAnnotations(new Tyme4tsCalendarAdapter().getDay(2024, 6, 26))
      .find((item) => item.kind === 'fetus')

    expect(annotation?.details.occupancy).toBe('厨灶门')
    expect(annotation?.details.side).toBe('外')
    expect(annotation?.details.direction).toBe('东南')
    expect(annotation?.details.interpretation).toContain('胎神')
    expect(annotation?.provenance?.sourceId).toBe('model-knowledge.codex')
  })

  it('七十二候输出候序、交候口径和边界时刻', () => {
    const annotation = createPublicAnnotations(new Tyme4tsCalendarAdapter().getDay(2024, 6, 26))
      .find((item) => item.kind === 'phenology')

    expect(annotation?.details.order).toBeGreaterThanOrEqual(1)
    expect(annotation?.details.order).toBeLessThanOrEqual(3)
    expect(annotation?.details.boundaryBasis).toBe('tyme4ts-solar-time')
    expect(annotation?.details.boundaryTime).toMatch(/^\d{4}-\d{2}-\d{2}/)
  })

  it('星宿、彭祖和神煞使用独立结构化字段及稳定 ID', () => {
    const annotations = createPublicAnnotations(new Tyme4tsCalendarAdapter().getDay(2024, 6, 26))
    const star = annotations.find((item) => item.kind === 'twenty-eight-star')
    const pengZu = annotations.find((item) => item.kind === 'peng-zu')
    const deities = annotations.filter((item) => item.kind === 'deity')

    expect(star?.details.basis).toBe('通书值日宿')
    expect(star?.details.zone).toBeTruthy()
    expect(star?.details.interpretation).toContain('值日宿')
    expect(pengZu?.details.heavenStemText).toContain('辛不')
    expect(pengZu?.details.earthBranchText).toContain('酉不')
    expect(pengZu?.details.interpretation).toContain('天干与地支')
    expect(pengZu?.details.relatedActivities).toBe('以原文事项为公共参考')
    expect(deities.every((item) => item.annotationId.startsWith('deity.'))).toBe(true)
    expect(deities.every((item) => item.details.luck === '吉' || item.details.luck === '凶')).toBe(true)
    expect(deities.every((item) => item.details.score === false)).toBe(true)
  })
})

describe('官方宜忌映射', () => {
  it('保留原始名称并声明非个性化边界', () => {
    const facts = new Tyme4tsCalendarAdapter().getDay(2024, 6, 26)
    const activities = mapOfficialActivities(facts)

    expect(activities.length).toBeGreaterThan(0)
    expect(activities.every((item) => item.originalName.length > 0)).toBe(true)
    expect(activities.every((item) => item.nonPersonalized)).toBe(true)
  })
})

describe('模型知识宜忌 Provider', () => {
  it('只执行匹配建除条件的版本化知识规则并保留 RuleHit', () => {
    const facts = new Tyme4tsCalendarAdapter().getDay(2024, 6, 26)
    const rulePackage = loadRulePackage({
      schemaVersion: '1.0.0', packageVersion: '2026.07.25', status: 'released',
      rules: [
        {
          ruleId: 'duty.level.repair.v1', activityId: 'repair.dwelling', conclusion: 'recommend', priority: 100,
          comparableWhen: ['same-activity', 'same-time-scope', 'same-condition'], conditionKey: 'duty=平',
          sourceId: 'model-knowledge.codex', confidence: 0.84, interpretation: '平日修缮公共规则',
          reviewStatus: 'approved', changeReason: '首版模型知识规则',
        },
        {
          ruleId: 'duty.build.travel.v1', activityId: 'travel.depart', conclusion: 'recommend', priority: 100,
          comparableWhen: ['same-activity', 'same-time-scope', 'same-condition'], conditionKey: 'duty=建',
          sourceId: 'model-knowledge.codex', confidence: 0.86, interpretation: '建日出行公共规则',
          reviewStatus: 'approved', changeReason: '反例条件规则',
        },
      ],
    })

    const records = mapModelKnowledgeActivities(facts, rulePackage)

    expect(records).toHaveLength(1)
    expect(records[0]?.activityId).toBe('repair.dwelling')
    expect(records[0]?.conclusion).toBe('recommend')
    expect(records[0]?.ruleHits[0]?.sourceId).toBe('model-knowledge.codex')
    expect(records[0]?.ruleHits[0]?.provenance?.edition).toBe('2026.07.25')
  })
})
