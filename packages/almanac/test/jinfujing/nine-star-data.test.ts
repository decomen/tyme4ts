import { describe, expect, it } from 'vitest'

import nsInput from '../../rules/jinfujing/nine-star.json' with { type: 'json' }
import { getJinfujingNineStar, getNineStarMeta, jinfujingProvenance, loadJinfujingNineStar } from '../../src/jinfujing/data.js'

describe('金符九星数据加载层', () => {
  it('合法输入深度冻结只读', () => {
    const data = loadJinfujingNineStar(nsInput)
    expect(Object.isFrozen(data)).toBe(true)
    expect(Object.isFrozen(data.stars)).toBe(true)
    expect(() => {
      ;(data.stars[0] as { name: string }).name = '篡改'
    }).toThrow()
  })

  it('九星顺序：妖→或→禾刀→煞贡→直→卜木→角巳→人专→立早', () => {
    expect(getJinfujingNineStar().stars.map((s) => s.name)).toEqual([
      '妖星', '或星', '禾刀', '煞贡', '直星', '卜木', '角巳', '人专', '立早',
    ])
  })

  it('吉凶分类：吉 3 凶 6', () => {
    const stars = getJinfujingNineStar().stars
    expect(stars.filter((s) => s.luck === '吉').map((s) => s.name)).toEqual(['煞贡', '直星', '人专'])
    expect(stars.filter((s) => s.luck === '凶')).toHaveLength(6)
  })

  it('每星 talisman/omen/locator/id 非空', () => {
    for (const s of getJinfujingNineStar().stars) {
      expect(s.id.length).toBeGreaterThan(0)
      expect(s.talisman.length).toBeGreaterThan(0)
      expect(s.omen.length).toBeGreaterThan(0)
      expect(s.locator.length).toBeGreaterThan(0)
    }
  })

  it('月季起例：孟 0 / 仲 1 / 季 2', () => {
    expect(getJinfujingNineStar().seasonStart).toEqual({ meng: 0, zhong: 1, ji: 2 })
  })

  it('异写归一：惑星→或星、卜水→卜木、角己→角巳', () => {
    expect(getNineStarMeta('惑星')?.name).toBe('或星')
    expect(getNineStarMeta('卜水')?.name).toBe('卜木')
    expect(getNineStarMeta('卜星')?.name).toBe('卜木')
    expect(getNineStarMeta('角己')?.name).toBe('角巳')
    expect(getNineStarMeta('角已')?.name).toBe('角巳')
  })

  it('规范名直接命中且吉凶正确', () => {
    expect(getNineStarMeta('煞贡')?.luck).toBe('吉')
    expect(getNineStarMeta('妖星')?.luck).toBe('凶')
  })

  it('未知星名返回 undefined', () => {
    expect(getNineStarMeta('不存在的星')).toBeUndefined()
  })

  it('provenance 来源 classics.jinfujing-dz1267 + collating', () => {
    const p = jinfujingProvenance('煞贡')
    expect(p.sourceId).toBe('classics.jinfujing-dz1267')
    expect(p.reviewStatus).toBe('collating')
    expect(p.locator).toBe('煞贡')
  })

  it('非法输入抛错', () => {
    expect(() => loadJinfujingNineStar(null)).toThrow()
    expect(() => loadJinfujingNineStar({})).toThrow()
    expect(() => loadJinfujingNineStar({ ...nsInput, stars: [] })).toThrow()
    expect(() => loadJinfujingNineStar({ ...nsInput, stars: nsInput.stars.slice(0, 8) })).toThrow()
    expect(() => loadJinfujingNineStar({ ...nsInput, seasonStart: null })).toThrow()
  })
})
