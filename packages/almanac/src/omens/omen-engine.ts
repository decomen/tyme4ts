/**
 * 十二杂占查询引擎。
 *
 * getOmen(omenId, hourIndex) 返回指定征兆在指定时辰的断语（眼跳/耳鸣含左/右，其余单条 text）。
 * 数据经 omens/data.ts 校验冻结，本层仅做只读查询。越界或未知 id 返回 null（调用方兜底）。
 */
import { getTwelveOmens, type OmenHour, type OmenRecord } from './data.js'

/** 单次查询结果（含左/右或单条）。 */
export interface OmenResult {
  readonly omenId: string
  readonly cnName: string
  readonly hourIndex: number
  readonly left?: string
  readonly right?: string
  readonly text?: string
}

/**
 * 查询指定征兆在指定时辰的断语。
 * @param omenId - 征兆 id（eyelid/earRinging/earHot/faceHot/fleshTwitch/heartFear/sneeze/clothCatch/potRing/fireLeap/dogBark/magpieCry）
 * @param hourIndex - 时辰索引 0-11（子~亥）
 * @returns 断语结果；omenId 未知或 hourIndex 越界返回 null
 */
export function getOmen(omenId: string, hourIndex: number): OmenResult | null {
  if (!Number.isInteger(hourIndex) || hourIndex < 0 || hourIndex > 11) return null
  const data = getTwelveOmens()
  const omen: OmenRecord | undefined = data.omens.find((o) => o.omenId === omenId)
  if (!omen) return null
  const hour: OmenHour | undefined = omen.hours.find((h) => h.index === hourIndex)
  if (!hour) return null
  return {
    omenId: omen.omenId,
    cnName: omen.cnName,
    hourIndex,
    ...(hour.left !== undefined ? { left: hour.left } : {}),
    ...(hour.right !== undefined ? { right: hour.right } : {}),
    ...(hour.text !== undefined ? { text: hour.text } : {}),
  }
}

/**
 * 列出全部 12 征兆元信息（id + 中文名 + 是否分左右）。
 * @returns 12 条征兆元信息（顺序同数据包）
 */
export function listOmens(): readonly { omenId: string; cnName: string; hasLeftRight: boolean }[] {
  return getTwelveOmens().omens.map((o) => ({ omenId: o.omenId, cnName: o.cnName, hasLeftRight: o.hasLeftRight }))
}
