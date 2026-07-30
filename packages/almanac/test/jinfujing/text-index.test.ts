import { describe, expect, it } from 'vitest'

import { getFrameworkLayers, queryByName, queryBySystem, querySystemsByLayer } from '../../src/jinfujing/text-index.js'

describe('金符经全文索引查询', () => {
  it('理论框架三层：基础层 / 择日应用层 / 神煞辅佐层', () => {
    expect(getFrameworkLayers().map((l) => l.id)).toEqual(['basic', 'application', 'auxiliary'])
  })

  it('基础层含五行 / 八卦 / 天干 / 地支', () => {
    const ids = querySystemsByLayer('basic').map((s) => s.id)
    expect(ids).toContain('wuxing-order')
    expect(ids).toContain('bagua-order')
    expect(ids).toContain('tiangan')
    expect(ids).toContain('dizhi')
  })

  it('择日应用层含金符九星值日 + 诸葛出行图', () => {
    const ids = querySystemsByLayer('application').map((s) => s.id)
    expect(ids).toContain('jinfujing-nine-star')
    expect(ids).toContain('zhuge-travel')
  })

  it('神煞辅佐层含九良星 / 各类贵人良辰', () => {
    const ids = querySystemsByLayer('auxiliary').map((s) => s.id)
    expect(ids).toContain('jiuliang-fang')
    expect(ids).toContain('tianguan')
    expect(ids).toContain('tiande')
  })

  it('按体系查询：诸葛出行图含 22 条三元将军日（上6+中8+下8）', () => {
    const entries = queryBySystem('zhuge-travel')
    expect(entries).toHaveLength(22)
    expect(entries.some((e) => e.name === '白虎头日')).toBe(true)
    expect(entries.some((e) => e.name === '顺阳日')).toBe(true)
  })

  it('按名称查询条目：白虎头日命中且归属诸葛出行图', () => {
    const { entries } = queryByName('白虎头日')
    expect(entries).toHaveLength(1)
    expect(entries[0]?.system).toBe('zhuge-travel')
  })

  it('按名称查询体系：诸葛先生万年出行图命中', () => {
    const { systems } = queryByName('诸葛先生万年出行图')
    expect(systems).toHaveLength(1)
    expect(systems[0]?.id).toBe('zhuge-travel')
  })

  it('每条 entry locator 非空（原文溯源）', () => {
    for (const entry of queryBySystem('zhuge-travel')) {
      expect(entry.locator.length).toBeGreaterThan(0)
      expect(entry.summary.length).toBeGreaterThan(0)
    }
  })

  it('每个体系节点 locator 非空', () => {
    for (const system of querySystemsByLayer('application')) {
      expect(system.locator.length).toBeGreaterThan(0)
    }
  })

  it('静态检索：同一体系多次查询结果一致（不逐日推算）', () => {
    const a = queryBySystem('zhuge-travel')
    const b = queryBySystem('zhuge-travel')
    expect(a.length).toBe(b.length)
    // 查询函数不接收日期参数，纯静态索引检索
    expect(queryByName('天财日').entries).toHaveLength(1)
  })

  it('未命中返回空（不抛错）', () => {
    expect(queryBySystem('not-exist')).toEqual([])
    expect(queryByName('不存在的术语').systems).toEqual([])
  })
})
