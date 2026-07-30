import { describe, expect, it } from 'vitest'

import { computeJinfujingStar, computeJinfujingStarByCycle, monthToSeasonGroup } from '../../src/jinfujing/nine-star-engine.js'

// ctext《九天上圣秘传金符经》四孟之月（正/四/七/十）六十甲子值星表，甲子起妖星。
// 异写归一：卜水/卜星→卜木、禾力→禾刀、角己→角已→角巳。作为独立期望验证公式。
const MENG_60: readonly string[] = [
  '妖星', '或星', '禾刀', '煞贡', '直星', '卜木', '角巳', '人专', '立早', // 1-9 甲子-壬申
  '妖星', // 10 癸酉
  '或星', '禾刀', '煞贡', '直星', '卜木', '角巳', '人专', '立早', '妖星', '或星', // 11-20
  '禾刀', '煞贡', '直星', '卜木', '角巳', '人专', '立早', '妖星', '或星', '禾刀', // 21-30
  '煞贡', '直星', '卜木', '角巳', '人专', '立早', '妖星', '或星', '禾刀', '煞贡', // 31-40
  '直星', '卜木', '角巳', '人专', '立早', '妖星', '或星', '禾刀', '煞贡', '直星', // 41-50
  '卜木', '角巳', '人专', '立早', '妖星', '或星', '禾刀', '煞贡', '直星', '卜木', // 51-60
]

describe('金符九星复算引擎', () => {
  describe('monthToSeasonGroup 月季判定', () => {
    it('正/四/七/十=孟，二/五/八/十一=仲，三/六/九/十二=季', () => {
      expect(monthToSeasonGroup(1)).toBe('meng')
      expect(monthToSeasonGroup(4)).toBe('meng')
      expect(monthToSeasonGroup(2)).toBe('zhong')
      expect(monthToSeasonGroup(5)).toBe('zhong')
      expect(monthToSeasonGroup(3)).toBe('ji')
      expect(monthToSeasonGroup(6)).toBe('ji')
      expect(monthToSeasonGroup(12)).toBe('ji')
      expect(monthToSeasonGroup(11)).toBe('zhong')
    })
    it('闰月按同月数判定（闰六月=季）', () => {
      expect(monthToSeasonGroup(6)).toBe('ji')
    })
  })

  describe('纯公式层 computeJinfujingStarByCycle（ctext 四孟表穷举）', () => {
    it('四孟 60 甲子全量匹配 ctext 原文四孟表', () => {
      for (let i = 1; i <= 60; i += 1) {
        expect(computeJinfujingStarByCycle('meng', i).name, `孟月第${i}甲子`).toBe(MENG_60[i - 1])
      }
    })
    it('孟月甲子=妖星、丁卯(4)=煞贡', () => {
      expect(computeJinfujingStarByCycle('meng', 1).name).toBe('妖星')
      expect(computeJinfujingStarByCycle('meng', 4).name).toBe('煞贡')
    })
    it('仲月甲子=或星（ctext 四仲表）', () => {
      expect(computeJinfujingStarByCycle('zhong', 1).name).toBe('或星')
      expect(computeJinfujingStarByCycle('zhong', 2).name).toBe('禾刀')
      expect(computeJinfujingStarByCycle('zhong', 9).name).toBe('妖星')
    })
    it('季月甲子=禾刀（ctext 四季表）', () => {
      expect(computeJinfujingStarByCycle('ji', 1).name).toBe('禾刀')
      expect(computeJinfujingStarByCycle('ji', 2).name).toBe('煞贡')
      expect(computeJinfujingStarByCycle('ji', 9).name).toBe('或星')
    })
    it('任一月季组连续 9 日九星各出现一次（循环性）', () => {
      for (const group of ['meng', 'zhong', 'ji'] as const) {
        const nine = new Set(Array.from({ length: 9 }, (_, k) => computeJinfujingStarByCycle(group, k + 1).name))
        expect(nine.size, group).toBe(9)
      }
    })
    it('日干支序越界抛 RangeError', () => {
      expect(() => computeJinfujingStarByCycle('meng', 0)).toThrow()
      expect(() => computeJinfujingStarByCycle('meng', 61)).toThrow()
      expect(() => computeJinfujingStarByCycle('meng', 1.5)).toThrow()
    })
  })

  describe('公历转换层 computeJinfujingStar', () => {
    it('2026-07-30（农历六月/季，乙巳序42）= 人专(吉)', () => {
      const r = computeJinfujingStar(2026, 7, 30)
      expect(r.star).toBe('人专')
      expect(r.luck).toBe('吉')
      expect(r.talisman).toBe('六阴金堂符')
      expect(r.provenance.sourceId).toBe('classics.jinfujing-dz1267')
      expect(r.provenance.reviewStatus).toBe('collating')
    })
    it('2026-01-15（农历十一月/仲，己丑序26）= 立早(凶)', () => {
      expect(computeJinfujingStar(2026, 1, 15).star).toBe('立早')
    })
    it('闰月日期按同月数判定（2025-08-01 闰六月/季）= 直星(吉)', () => {
      // 2025-08-01 农历闰六月（getMonth=6→季），壬寅序39 → (2+39-1)%9=4 → 直星
      expect(computeJinfujingStar(2025, 8, 1).star).toBe('直星')
    })
    it('返回结构完整：star/luck/talisman/omen/provenance', () => {
      const r = computeJinfujingStar(2026, 7, 30)
      expect(typeof r.star).toBe('string')
      expect(['吉', '凶']).toContain(r.luck)
      expect(r.omen.length).toBeGreaterThan(0)
      expect(r.provenance.locator.length).toBeGreaterThan(0)
    })
  })
})
