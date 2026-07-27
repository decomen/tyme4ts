import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

import { validateRulePackage, validateSourcePackage } from '../../src/rules/schema.js'

async function readJson(relativePath: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8')) as unknown
}

describe('版本化模型知识资产', () => {
  it('首个来源包和规则包通过 Schema 校验', async () => {
    const sourcePackage = await readJson('../../rules/sources/2026.07.25.json')
    const rulePackage = await readJson('../../rules/packages/2026.07.25.json')

    expect(validateSourcePackage(sourcePackage)).toEqual({ ok: true, errors: [] })
    expect(validateRulePackage(rulePackage)).toEqual({ ok: true, errors: [] })
  })

  it('发布清单归档规则、黄金案例和允许差异清单', async () => {
    const manifest = await readJson('../../rules/release-manifest.json') as Readonly<Record<string, unknown>>

    expect(manifest.packageVersion).toBe('2026.07.25')
    expect(manifest.rulePackage).toBe('packages/2026.07.25.json')
    expect(manifest.goldenCases).toBe('golden/tyme4ts-1.5.2.json')
    expect(manifest.allowedDifferences).toBe('allowed-differences.json')
  })
})
