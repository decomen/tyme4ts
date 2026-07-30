/**
 * 金符经值星通书注解构造（替换 providers.ts 的 golden-talisman.pending 占位）。
 *
 * 由 providers.createPublicAnnotations 调用，注入当日金符九星值星注解。
 * 终审前保持 experimental=true / reviewStatus=collating，对齐原 pending 占位的「待审核」语义。
 */
import type { AdaptedDayFacts } from './adapter-tyme4ts.js';
import type { AlmanacAnnotation } from './domain-models.js';
/**
 * 构造当日金符值星注解。
 * @param facts - Adapter 产生的日级官方事实（取 solarDate 复算值星）。
 * @returns golden-talisman 注解（值星+吉凶+符名+断语+溯源，experimental）。
 */
export declare function createGoldenTalismanAnnotation(facts: AdaptedDayFacts): AlmanacAnnotation;
