import type { ActivityConclusion } from '../domain-models.js';
export interface KnowledgeRule {
    readonly ruleId: string;
    readonly activityId: string;
    readonly conclusion: ActivityConclusion;
    readonly priority: number;
    readonly comparableWhen: readonly string[];
    readonly conditionKey: string;
    readonly sourceId: string;
    readonly confidence: number;
    readonly interpretation: string;
    readonly reviewStatus: 'pending' | 'reviewing' | 'approved';
    readonly changeReason: string;
}
export interface LoadedRulePackage {
    readonly schemaVersion: string;
    readonly packageVersion: string;
    readonly status: string;
    readonly rules: readonly KnowledgeRule[];
}
/**
 * 校验并加载模型知识规则包。
 * @param input - JSON 兼容的未知规则包输入。
 * @returns 已校验且深度冻结的规则包。
 */
export declare function loadRulePackage(input: unknown): LoadedRulePackage;
/** 保留全部历史版本并支持发布指针回滚的规则包仓库。 */
export declare class RulePackageRegistry {
    private readonly packages;
    private currentVersion;
    /**
     * 发布一个已校验规则包，不覆盖同版本历史。
     * @param rulePackage - 已冻结的规则包。
     * @returns 无返回值。
     */
    publish(rulePackage: LoadedRulePackage): void;
    /** 按版本读取历史规则包。 */
    get(packageVersion: string): LoadedRulePackage | undefined;
    /** 读取当前发布的规则包。 */
    current(): LoadedRulePackage | undefined;
    /** 将当前发布指针回滚到已有历史版本。 */
    rollback(packageVersion: string): void;
}
