import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { Tyme4tsCalendarAdapter } from '../../src/adapter-tyme4ts.js'
import { compareAdapterResult } from '../../src/compatibility.js'

interface GoldenCase {
  readonly date: string
  readonly expected: Readonly<Record<string, unknown>>
}

describe('tyme4ts@1.5.2 黄金案例', () => {
  it('逐字段对拍胎神、六曜、候、星宿、彭祖、神煞和基础宜忌', async () => {
    const cases = JSON.parse(await readFile(new URL('../../rules/golden/tyme4ts-1.5.2.json', import.meta.url), 'utf8')) as readonly GoldenCase[]
    const adapter = new Tyme4tsCalendarAdapter()

    for (const golden of cases) {
      const [year, month, day] = golden.date.split('-').map(Number) as [number, number, number]
      const actual = adapter.getDay(year, month, day)
      const projection = Object.fromEntries(Object.keys(golden.expected).map((key) => [key, actual[key as keyof typeof actual]]))
      expect(compareAdapterResult(projection, golden.expected, [])).toEqual({ differences: [], publishable: true })
    }
  })
})
