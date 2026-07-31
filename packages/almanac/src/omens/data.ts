/**
 * 十二杂占数据加载层（《玉匣记》杂占篇，对标 jinfujing/data.ts 的「校验 + 深度冻结」范式）。
 *
 * 数据资产 rules/omens/twelve-omens.json（12法×12时辰断语），经 import attributes 加载，
 * 由 loadTwelveOmens 校验并深度冻结，module 级惰性缓存。查询层（omen-engine）通过 getTwelveOmens() 访问只读数据。
 *
 * 来源：《玉匣记》杂占篇（眼跳/耳鸣/耳热/面热/肉颤/心惊/嚏喷/衣留/釜鸣/火逸/犬吠/鹊噪）。
 */
import nsInput from '../../rules/omens/twelve-omens.json' with { type: 'json' }

// ============ 公开类型 ============

export type OmenReviewStatus = 'collating' | 'approved'

/** 单时辰断语：眼跳/耳鸣含 left/right，其余 10 法用 text。 */
export interface OmenHour {
  readonly index: number
  readonly left?: string
  readonly right?: string
  readonly text?: string
}

/** 单征兆记录。 */
export interface OmenRecord {
  readonly omenId: string
  readonly cnName: string
  readonly hasLeftRight: boolean
  readonly hours: readonly OmenHour[]
}

/** 已校验冻结的十二杂施数据包。 */
export interface LoadedTwelveOmens {
  readonly schemaVersion: string
  readonly packageVersion: string
  readonly sourceId: string
  readonly sourceName: string
  readonly reviewStatus: OmenReviewStatus
  readonly note?: string
  readonly omens: readonly OmenRecord[]
}

// ============ 校验与冻结工具 ============

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 递归深度冻结，防止校验后的数据被调用方篡改。 */
function deepFreeze<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (typeof child === 'object' && child !== null && !Object.isFrozen(child)) deepFreeze(child as object)
  }
  return Object.freeze(value)
}

const VALID_REVIEW = ['collating', 'approved'] as const

function asReview(value: unknown): OmenReviewStatus {
  return (VALID_REVIEW as readonly string[]).includes(value as string) ? (value as OmenReviewStatus) : 'collating'
}

// ============ 加载函数（校验 + 深度冻结） ============

/**
 * 校验并冻结十二杂斂数据包。
 * @param input - JSON 兼容的未知数据。
 * @returns 已校验且深度冻结的数据；omens 非数组/非 12 法、任一法时辰非 12 抛 TypeError。
 */
export function loadTwelveOmens(input: unknown): LoadedTwelveOmens {
  if (!isRecord(input)) throw new TypeError('十二杂斂数据必须是对象')
  if (typeof input.schemaVersion !== 'string' || typeof input.packageVersion !== 'string') throw new TypeError('十二杂斂数据必须声明 schemaVersion 和 packageVersion')
  if (typeof input.sourceId !== 'string') throw new TypeError('十二杂斂数据必须声明 sourceId')
  if (!Array.isArray(input.omens) || input.omens.length !== 12) throw new TypeError('十二杂斂数据必须包含 12 法')
  for (const omen of input.omens) {
    if (!isRecord(omen) || typeof omen.omenId !== 'string' || typeof omen.cnName !== 'string') throw new TypeError('每法必须声明 omenId 和 cnName')
    if (!Array.isArray(omen.hours) || omen.hours.length !== 12) throw new TypeError(`征兆 ${String(omen.omenId)} 必须含 12 时辰`)
  }
  return deepFreeze(structuredClone(input)) as unknown as LoadedTwelveOmens
}

// ============ module 级惰性装配（缓存） ============

let cache: LoadedTwelveOmens | undefined

/** 取已校验冻结的十二杂斂数据（首次调用加载并缓存）。 */
export function getTwelveOmens(): LoadedTwelveOmens {
  if (!cache) cache = loadTwelveOmens(nsInput)
  return cache
}

/** 数据包溯源信息（统一来源 + locator）。 */
export function omenProvenance(locator: string) {
  const data = getTwelveOmens()
  return { sourceId: data.sourceId, edition: data.packageVersion, locator, reviewStatus: asReview(data.reviewStatus) }
}
