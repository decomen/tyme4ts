import { createHash } from 'node:crypto'

export interface SnapshotIdentity {
  readonly snapshotId: string
  readonly ruleSetHash: string
  readonly resultFingerprint: string
}

/**
 * 将未知 JSON 兼容数据转换为键顺序稳定的表示。
 * @param value - 待参与哈希的结构化输入。
 * @returns 递归排序对象键后的 JSON 兼容值。
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]))
  }
  return value
}

/**
 * 计算结构化输入的 SHA-256 十六进制摘要。
 * @param value - 参与摘要的 JSON 兼容输入。
 * @returns 64 位小写十六进制摘要。
 */
function hash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')
}

/**
 * 为相同语义输入生成稳定的快照 ID、规则集哈希和结果指纹。
 * @param input - 完整计算输入或快照结果。
 * @returns 可缓存、引用和跨版本比较的三个确定性标识。
 */
export function createSnapshotIdentity(input: unknown): SnapshotIdentity {
  const resultFingerprint = hash(input)
  const ruleSetHash = hash(typeof input === 'object' && input !== null && 'rules' in input ? (input as Readonly<Record<string, unknown>>).rules : input)
  return { snapshotId: `almanac_${resultFingerprint.slice(0, 24)}`, ruleSetHash, resultFingerprint }
}
