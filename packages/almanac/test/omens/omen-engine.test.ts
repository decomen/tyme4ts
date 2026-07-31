import { describe, expect, it } from 'vitest'

import { getTwelveOmens } from '../../src/omens/data.js'
import { getOmen, listOmens } from '../../src/omens/omen-engine.js'

describe('十二杂占（《玉匣记》杂占篇）', () => {
  it('眼跳含左/右断语（子时 index 0）', () => {
    const r = getOmen('eyelid', 0)
    expect(r?.left).toBe('左有贵人')
    expect(r?.right).toBe('右有酒食')
    expect(r?.cnName).toBe('眼跳')
    expect(r?.text).toBeUndefined()
  })

  it('釜鸣单条断语（午时 index 6）', () => {
    const r = getOmen('potRing', 6)
    expect(r?.text).toBe('主官事消散，大吉昌')
    expect(r?.left).toBeUndefined()
    expect(r?.right).toBeUndefined()
  })

  it('12 法 × 12 时辰完整（无缺时辰、断语非空）', () => {
    const data = getTwelveOmens()
    expect(data.omens).toHaveLength(12)
    for (const omen of data.omens) {
      expect(omen.hours).toHaveLength(12)
      // 时辰 index 0-11 唯一覆盖
      const idx = omen.hours.map((h) => h.index).sort((a, b) => a - b)
      expect(idx).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      // 每时辰断语非空（left/right 或 text）
      for (const h of omen.hours) {
        const ok = (h.left && h.right) || h.text
        expect(ok).toBeTruthy()
      }
    }
  })

  it('listOmens 返回 12 法元信息', () => {
    const list = listOmens()
    expect(list).toHaveLength(12)
    const ids = list.map((o) => o.omenId)
    expect(ids).toContain('eyelid')
    expect(ids).toContain('magpieCry')
    expect(ids).toContain('potRing')
  })

  it('越界与未知 id 兜底 null', () => {
    expect(getOmen('eyelid', -1)).toBeNull()
    expect(getOmen('eyelid', 12)).toBeNull()
    expect(getOmen('unknown', 0)).toBeNull()
  })

  it('数据已深度冻结（防篡改）', () => {
    const data = getTwelveOmens()
    expect(Object.isFrozen(data)).toBe(true)
    expect(Object.isFrozen(data.omens)).toBe(true)
  })

  it('溯源标注《玉匣记》杂占篇', () => {
    const data = getTwelveOmens()
    expect(data.sourceId).toContain('yuxiaji')
    expect(data.sourceName).toContain('玉匣记')
  })
})
