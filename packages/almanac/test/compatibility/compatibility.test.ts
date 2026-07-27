import { describe, expect, it } from 'vitest'

import { compareAdapterResult } from '../../src/compatibility.js'

describe('官方结果差分门控', () => {
  it('输出新增、删除和变化字段并阻止未确认差异', () => {
    const report = compareAdapterResult(
      { fetus: '甲', removed: undefined, added: '新值' },
      { fetus: '乙', removed: '旧值' },
      [],
    )

    expect(report.differences.map((item) => item.kind)).toEqual(['added', 'changed', 'removed'])
    expect(report.publishable).toBe(false)
  })

  it('允许清单覆盖的差异不阻止发布', () => {
    const report = compareAdapterResult({ fetus: '甲' }, { fetus: '乙' }, ['fetus'])

    expect(report.differences[0]?.allowed).toBe(true)
    expect(report.publishable).toBe(true)
  })
})
