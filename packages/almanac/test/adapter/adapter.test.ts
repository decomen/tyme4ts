import { describe, expect, it } from 'vitest'

import { Tyme4tsCalendarAdapter } from '../../src/adapter-tyme4ts.js'

describe('Tyme4tsCalendarAdapter', () => {
  const adapter = new Tyme4tsCalendarAdapter()

  it('通过公开 API 读取日级历法事实', () => {
    const day = adapter.getDay(2021, 11, 13)

    expect(day.solarDate).toBe('2021-11-13')
    expect(day.fetus).toBe('碓磨厕 外东南')
    expect(day.sixStar.length).toBeGreaterThan(0)
    expect(day.pengZu).toContain(' ')
    expect(day.gods.every((name) => name.length > 0)).toBe(true)
  })

  it('读取七十二候、二十八宿和官方基础宜忌', () => {
    const day = adapter.getDay(2024, 6, 26)

    expect(day.phenology.length).toBeGreaterThan(0)
    expect(day.twentyEightStar.length).toBeGreaterThan(0)
    expect(day.recommends.length + day.avoids.length).toBeGreaterThan(0)
  })

  it('通过公开 API 暴露历注所需的结构化事实', () => {
    const day = adapter.getDay(2024, 6, 26)

    expect(day.fetusSide).toBe('外')
    expect(day.fetusDirection).toBe('东南')
    expect(day.phenologyOrder).toBeGreaterThanOrEqual(1)
    expect(day.phenologyOrder).toBeLessThanOrEqual(3)
    expect(day.phenologyBoundary).toMatch(/^\d{4}-\d{2}-\d{2}/)
    expect(day.twentyEightStarZone.length).toBeGreaterThan(0)
    expect(day.pengZuHeavenStem).toContain('辛不')
    expect(day.pengZuEarthBranch).toContain('酉不')
    expect(day.godDetails.every((god) => god.id.startsWith('deity.'))).toBe(true)
    expect(day.godDetails.every((god) => god.luck === '吉' || god.luck === '凶')).toBe(true)
  })

  it('返回十二个独立时辰而不复用日级数组', () => {
    const day = adapter.getDay(2024, 6, 25)

    expect(day.hours).toHaveLength(12)
    expect(day.hours[0]?.recommends).not.toBe(day.recommends)
    expect(new Set(day.hours.map((hour) => hour.cycle)).size).toBe(12)
  })

  it('覆盖节气交接、闰月、跨年和时辰边界', () => {
    const beforeYearEnd = adapter.getDay(2023, 12, 31)
    const afterYearStart = adapter.getDay(2024, 1, 1)
    const termBoundary = adapter.getDay(2024, 2, 4)
    const leapMonth = adapter.getDay(2023, 3, 22)

    expect(beforeYearEnd.solarDate).toBe('2023-12-31')
    expect(afterYearStart.solarDate).toBe('2024-01-01')
    expect(termBoundary.solarTerm).toBe('立春')
    expect(termBoundary.phenologyBoundary).toMatch(/^2024-02/)
    expect(leapMonth.lunarDate).toContain('闰二月')
    expect(termBoundary.hours.map((hour) => hour.civilHour)).toEqual([0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21])
    expect(termBoundary.hours[0]?.branch).toBe('子')
  })
})
