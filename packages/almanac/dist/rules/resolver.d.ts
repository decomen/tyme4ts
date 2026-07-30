import type { RuleHit } from '../domain-models.js';
export interface RuleResolution {
    readonly effective: readonly RuleHit[];
    readonly differences: readonly RuleHit[];
}
/**
 * 对同事项、同时间层级和同条件的可比规则执行低数值优先裁决。
 * @param hits - 已通过 Schema 校验的规则命中列表。
 * @returns 有效命中和被裁决但必须展示的差异命中。
 */
export declare function resolveRuleHits(hits: readonly RuleHit[]): RuleResolution;
