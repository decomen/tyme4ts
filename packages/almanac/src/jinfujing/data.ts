/**
 * 金符经数据加载层（对标 src/rules/registry.ts::loadRulePackage 的「校验 + 深度冻结」范式）。
 *
 * 数据资产位于 rules/jinfujing/*.json（典籍来源 / 九星 / 全文索引），经 import attributes
 * 加载，由 loadJinfujing* 校验并深度冻结，module 级惰性缓存。计算层（engine / text-index /
 * annotation）通过 getJinfujingNineStar() / getJinfujingTextIndex() 访问只读数据。
 *
 * 来源：ctext《九天上圣秘传金符经》DZ1267（URN ctp:ws344744）。
 */
import nsInput from '../../rules/jinfujing/nine-star.json' with { type: 'json' }
import tiInput from '../../rules/jinfujing/text-index.json' with { type: 'json' }
import sourceInput from '../../rules/jinfujing/source.json' with { type: 'json' }

// ============ 公开类型 ============

export type JinfujingLuck = '吉' | '凶'
export type JinfujingReviewStatus = 'collating' | 'approved'

export interface JinfujingProvenance {
  readonly sourceId: string
  readonly edition: string
  readonly locator: string
  readonly reviewStatus: JinfujingReviewStatus
}

/** 单颗金符九星记录。 */
export interface JinfujingNineStarRecord {
  readonly index: number
  readonly id: string
  readonly name: string
  readonly aliases: readonly string[]
  readonly luck: JinfujingLuck
  readonly talisman: string
  readonly omen: string
  readonly locator: string
}

/** 月季组（孟/仲/季）→ 九星起始 index。 */
export interface JinfujingSeasonStart {
  readonly meng: number
  readonly zhong: number
  readonly ji: number
}

/** 已校验冻结的金符九星数据包。 */
export interface LoadedJinfujingNineStar {
  readonly schemaVersion: string
  readonly packageVersion: string
  readonly sourceId: string
  readonly reviewStatus: JinfujingReviewStatus
  readonly stars: readonly JinfujingNineStarRecord[]
  readonly seasonStart: JinfujingSeasonStart
  readonly aliases: Readonly<Record<string, string>>
}

export interface JinfujingTextLayer {
  readonly id: string
  readonly name: string
}
export interface JinfujingTextSystem {
  readonly id: string
  readonly name: string
  readonly layer: string
  readonly summary: string
  readonly locator: string
}
export interface JinfujingTextEntry {
  readonly name: string
  readonly system: string
  readonly summary: string
  readonly locator: string
}
/** 已校验冻结的金符经全文索引数据包。 */
export interface LoadedJinfujingTextIndex {
  readonly schemaVersion: string
  readonly packageVersion: string
  readonly sourceId: string
  readonly reviewStatus: JinfujingReviewStatus
  readonly layers: readonly JinfujingTextLayer[]
  readonly systems: readonly JinfujingTextSystem[]
  readonly entries: readonly JinfujingTextEntry[]
}

// ============ 校验与冻结工具 ============

/** 判断未知输入是否为可按字段读取的普通对象。 */
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

/** 将未知值归一为合法 reviewStatus，非法回退 collating。 */
function asReview(value: unknown): JinfujingReviewStatus {
  return (VALID_REVIEW as readonly string[]).includes(value as string) ? (value as JinfujingReviewStatus) : 'collating'
}

// ============ 加载函数（校验 + 深度冻结） ============

/**
 * 校验并冻结金符九星数据包。
 * @param input - JSON 兼容的未知九星数据。
 * @returns 已校验且深度冻结的九星数据；字段缺失或星数不为 9 抛 TypeError。
 */
export function loadJinfujingNineStar(input: unknown): LoadedJinfujingNineStar {
  if (!isRecord(input)) throw new TypeError('金符九星数据必须是对象')
  if (typeof input.schemaVersion !== 'string' || typeof input.packageVersion !== 'string') throw new TypeError('金符九星数据必须声明 schemaVersion 和 packageVersion')
  if (typeof input.sourceId !== 'string' || typeof input.reviewStatus !== 'string') throw new TypeError('金符九星数据必须声明 sourceId 和 reviewStatus')
  if (!Array.isArray(input.stars) || input.stars.length !== 9) throw new TypeError('金符九星数据必须包含 9 颗星')
  if (!isRecord(input.seasonStart)) throw new TypeError('金符九星数据必须声明 seasonStart')
  if (!isRecord(input.aliases)) throw new TypeError('金符九星数据必须声明 aliases')
  const indices = input.stars.map((star) => (isRecord(star) ? star.index : -1))
  if (indices.some((i) => typeof i !== 'number' || i < 0 || i > 8) || new Set(indices).size !== 9) {
    throw new TypeError('九星 index 必须为 0-8 且唯一')
  }
  return deepFreeze(structuredClone(input)) as unknown as LoadedJinfujingNineStar
}

/**
 * 校验并冻结金符经全文索引数据包。
 * @param input - JSON 兼容的未知索引数据。
 * @returns 已校验且深度冻结的索引数据；layers/systems/entries 任一缺失抛 TypeError。
 */
export function loadJinfujingTextIndex(input: unknown): LoadedJinfujingTextIndex {
  if (!isRecord(input)) throw new TypeError('金符经索引数据必须是对象')
  if (typeof input.schemaVersion !== 'string' || typeof input.packageVersion !== 'string') throw new TypeError('金符经索引数据必须声明 schemaVersion 和 packageVersion')
  if (!Array.isArray(input.layers) || !Array.isArray(input.systems) || !Array.isArray(input.entries)) {
    throw new TypeError('金符经索引数据必须声明 layers/systems/entries 数组')
  }
  return deepFreeze(structuredClone(input)) as unknown as LoadedJinfujingTextIndex
}

// ============ module 级惰性装配（缓存） ============

let nineStarCache: LoadedJinfujingNineStar | undefined
let textIndexCache: LoadedJinfujingTextIndex | undefined

/** 取已校验冻结的金符九星数据（首次调用加载并缓存）。 */
export function getJinfujingNineStar(): LoadedJinfujingNineStar {
  if (!nineStarCache) nineStarCache = loadJinfujingNineStar(nsInput)
  return nineStarCache
}

/** 取已校验冻结的金符经全文索引数据（首次调用加载并缓存）。 */
export function getJinfujingTextIndex(): LoadedJinfujingTextIndex {
  if (!textIndexCache) textIndexCache = loadJinfujingTextIndex(tiInput)
  return textIndexCache
}

// ============ 来源 Provenance ============

const SOURCE_META = isRecord(sourceInput)
  ? { sourceId: String(sourceInput.sourceId ?? ''), edition: String(sourceInput.edition ?? ''), reviewStatus: asReview(sourceInput.reviewStatus) }
  : { sourceId: '', edition: '', reviewStatus: 'collating' as const }

/**
 * 构造金符经溯源信息（统一来源 + 指定小节 locator）。
 * @param locator - 原文小节定位（如星名《煞贡》）。
 * @returns 带 classics.jinfujing-dz1267 来源的溯源信息。
 */
export function jinfujingProvenance(locator: string): JinfujingProvenance {
  return { sourceId: SOURCE_META.sourceId, edition: SOURCE_META.edition, locator, reviewStatus: SOURCE_META.reviewStatus }
}

// ============ 九星元信息查询（规范名/别名归一） ============

/**
 * 按规范名或异写别名查询九星元信息（异写经 aliases 归一）。
 * @param name - 规范名或异写（如「惑星」「卜水」「角己」）。
 * @returns 命中的九星记录；未命中返回 undefined。
 */
export function getNineStarMeta(name: string): JinfujingNineStarRecord | undefined {
  const data = getJinfujingNineStar()
  const canonical = data.aliases[name] ?? name
  return data.stars.find((star) => star.name === canonical || star.aliases.includes(canonical))
}
