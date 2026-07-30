import { describe, expect, it } from 'vitest'

import type { AdaptedDayFacts } from '../../src/adapter-tyme4ts.js'
import { createGoldenTalismanAnnotation } from '../../src/jinfujing/annotation.js'

/** 构造仅含 solarDate 的最小 facts（注解构造只用 solarDate 复算）。 */
function factsOn(date: string): AdaptedDayFacts {
  return { solarDate: date } as unknown as AdaptedDayFacts
}

describe('金符经值星注解构造', () => {
  it('2026-07-30 = 人专(吉)，kind=golden-talisman', () => {
    const a = createGoldenTalismanAnnotation(factsOn('2026-07-30'))
    expect(a.kind).toBe('golden-talisman')
    expect(a.name).toBe('人专(吉)')
  })

  it('annotationId 为 golden-talisman.day（不以 .pending 结尾）', () => {
    const a = createGoldenTalismanAnnotation(factsOn('2026-07-30'))
    expect(a.annotationId).toBe('golden-talisman.day')
    expect(a.annotationId.endsWith('.pending')).toBe(false)
  })

  it('details 含值星/吉凶/符名/断语', () => {
    const details = createGoldenTalismanAnnotation(factsOn('2026-07-30')).details
    expect(details.star).toBe('人专')
    expect(details.luck).toBe('吉')
    expect(details.talisman).toBe('六阴金堂符')
    expect(String(details.omen).length).toBeGreaterThan(0)
    expect(details.source).toBe('classics.jinfujing-dz1267')
  })

  it('终审前保持 experimental=true', () => {
    expect(createGoldenTalismanAnnotation(factsOn('2026-07-30')).experimental).toBe(true)
  })

  it('Provenance reviewStatus=collating + classics 来源', () => {
    const p = createGoldenTalismanAnnotation(factsOn('2026-07-30')).provenance
    expect(p?.reviewStatus).toBe('collating')
    expect(p?.sourceId).toBe('classics.jinfujing-dz1267')
    expect(p?.locator).toBe('人专')
  })

  it('不同日期产出不同值星（联动）', () => {
    const a = createGoldenTalismanAnnotation(factsOn('2026-07-30')).name
    const b = createGoldenTalismanAnnotation(factsOn('2026-01-15')).name
    expect(a).toBe('人专(吉)')
    expect(b).toBe('立早(凶)')
  })
})
