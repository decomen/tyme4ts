import type { AdaptedDayFacts } from './adapter-tyme4ts.js';
import type { ActivityConclusion, AlmanacActivityRecord, AlmanacAnnotation } from './domain-models.js';
import type { LoadedRulePackage } from './rules/registry.js';
export interface PublicActivityRecord {
    readonly activityId: string;
    readonly canonicalName: string;
    readonly originalName: string;
    readonly conclusion: ActivityConclusion;
    readonly mappingBasis: 'tyme4ts@1.5.2-public-api';
    readonly nonPersonalized: true;
}
/**
 * 将官方基础宜忌映射为结构化公共事项，明确非个性化边界。
 * @param facts - Adapter 产生的日级官方事实。
 * @returns 保留原始名称、映射依据和宜忌结论的事项列表。
 */
export declare function mapOfficialActivities(facts: AdaptedDayFacts): readonly PublicActivityRecord[];
/**
 * 执行已校验的模型知识规则包并生成结构化公共宜忌记录。
 * @param facts - Adapter 产生的日级官方事实。
 * @param rulePackage - 已校验且冻结的模型知识规则包。
 * @returns 仅包含当前建除条件命中项及完整规则溯源的事项记录。
 */
export declare function mapModelKnowledgeActivities(facts: AdaptedDayFacts, rulePackage: LoadedRulePackage): readonly AlmanacActivityRecord[];
/**
 * 将官方历法事实转换为相互独立的公共历注展示模型。
 * @param facts - Adapter 产生的日级官方事实。
 * @returns 不含评分且保留体系边界与实验状态的历注列表。
 */
export declare function createPublicAnnotations(facts: AdaptedDayFacts): readonly AlmanacAnnotation[];
