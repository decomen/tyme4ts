export type DifferenceKind = 'added' | 'changed' | 'removed'

export interface FieldDifference {
  readonly path: string
  readonly kind: DifferenceKind
  readonly actual: unknown
  readonly expected: unknown
  readonly allowed: boolean
}

export interface CompatibilityReport {
  readonly differences: readonly FieldDifference[]
  readonly publishable: boolean
}

/**
 * 将对象展开为稳定排序的字段路径和值。
 * @param value - 要展开的 JSON 兼容数据。
 * @param prefix - 当前递归字段路径。
 * @returns 叶子字段路径到值的映射。
 */
function flatten(value: unknown, prefix = ''): Map<string, unknown> {
  const output = new Map<string, unknown>()
  if (Array.isArray(value)) {
    if (value.length === 0) output.set(prefix, value)
    for (const [index, child] of value.entries()) {
      for (const [childPath, item] of flatten(child, `${prefix}.${index}`)) output.set(childPath, item)
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value).sort(([left], [right]) => left.localeCompare(right))) {
      if (child === undefined) continue
      const path = prefix.length === 0 ? key : `${prefix}.${key}`
      for (const [childPath, item] of flatten(child, path)) output.set(childPath, item)
    }
  } else {
    output.set(prefix, value)
  }
  return output
}

/**
 * 对拍 Adapter 结果并根据允许差异清单计算发布门控。
 * @param actual - 当前 Adapter 输出。
 * @param expected - 黄金案例或上一兼容版本输出。
 * @param allowedPaths - 已审核允许变化的字段路径。
 * @returns 稳定排序的差异列表和是否允许发布。
 */
export function compareAdapterResult(actual: unknown, expected: unknown, allowedPaths: readonly string[]): CompatibilityReport {
  const actualFields = flatten(actual)
  const expectedFields = flatten(expected)
  const paths = [...new Set([...actualFields.keys(), ...expectedFields.keys()])].sort()
  const differences: FieldDifference[] = []

  for (const path of paths) {
    const hasActual = actualFields.has(path)
    const hasExpected = expectedFields.has(path)
    const actualValue = actualFields.get(path)
    const expectedValue = expectedFields.get(path)
    if (hasActual && hasExpected && Object.is(actualValue, expectedValue)) continue
    const kind: DifferenceKind = !hasExpected ? 'added' : !hasActual ? 'removed' : 'changed'
    differences.push({ path, kind, actual: actualValue, expected: expectedValue, allowed: allowedPaths.includes(path) })
  }

  return { differences, publishable: differences.every((item) => item.allowed) }
}
