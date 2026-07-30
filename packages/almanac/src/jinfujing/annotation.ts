/**
 * 金符经值星通书注解构造（替换 providers.ts 的 golden-talisman.pending 占位）。
 *
 * 由 providers.createPublicAnnotations 调用，注入当日金符九星值星注解。
 * 终审前保持 experimental=true / reviewStatus=collating，对齐原 pending 占位的「待审核」语义。
 */
import type { AdaptedDayFacts } from '../adapter-tyme4ts.js'
import type { AlmanacAnnotation } from '../domain-models.js'
import { computeJinfujingStar } from './nine-star-engine.js'

/**
 * 构造当日金符值星注解。
 * @param facts - Adapter 产生的日级官方事实（取 solarDate 复算值星）。
 * @returns golden-talisman 注解（值星+吉凶+符名+断语+溯源，experimental）。
 */
export function createGoldenTalismanAnnotation(facts: AdaptedDayFacts): AlmanacAnnotation {
  const parts = facts.solarDate.split('-').map(Number)
  const y = parts[0]
  const m = parts[1]
  const d = parts[2]
  if (y === undefined || m === undefined || d === undefined) {
    throw new RangeError(`无效 solarDate: ${facts.solarDate}`)
  }
  const result = computeJinfujingStar(y, m, d)
  return {
    annotationId: 'golden-talisman.day',
    kind: 'golden-talisman',
    name: `${result.star}(${result.luck})`,
    optionalCulture: true,
    experimental: true,
    details: {
      star: result.star,
      luck: result.luck,
      talisman: result.talisman,
      omen: result.omen,
      source: result.provenance.sourceId,
    },
    provenance: {
      sourceId: result.provenance.sourceId,
      edition: result.provenance.edition,
      locator: result.provenance.locator,
      reviewStatus: result.provenance.reviewStatus,
    },
  }
}
