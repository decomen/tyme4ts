export type ReviewStatus = 'pending' | 'reviewing' | 'approved';
export type RulePackageStatus = 'experimental' | 'released' | 'deprecated';
export interface ValidationResult {
    readonly ok: boolean;
    readonly errors: readonly string[];
}
/**
 * 校验来源包的基本版本字段和模型知识元数据。
 * @param input - 从 JSON 或调用方传入的来源包数据。
 * @returns 包含是否通过及全部可修复错误的校验结果。
 */
export declare function validateSourcePackage(input: unknown): ValidationResult;
/**
 * 校验规则包版本、知识来源、优先级与正式发布审核门槛。
 * @param input - 从 JSON 或调用方传入的规则包数据。
 * @returns 包含是否通过及全部可修复错误的校验结果。
 */
export declare function validateRulePackage(input: unknown): ValidationResult;
