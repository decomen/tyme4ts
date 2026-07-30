export type DifferenceKind = 'added' | 'changed' | 'removed';
export interface FieldDifference {
    readonly path: string;
    readonly kind: DifferenceKind;
    readonly actual: unknown;
    readonly expected: unknown;
    readonly allowed: boolean;
}
export interface CompatibilityReport {
    readonly differences: readonly FieldDifference[];
    readonly publishable: boolean;
}
/**
 * 对拍 Adapter 结果并根据允许差异清单计算发布门控。
 * @param actual - 当前 Adapter 输出。
 * @param expected - 黄金案例或上一兼容版本输出。
 * @param allowedPaths - 已审核允许变化的字段路径。
 * @returns 稳定排序的差异列表和是否允许发布。
 */
export declare function compareAdapterResult(actual: unknown, expected: unknown, allowedPaths: readonly string[]): CompatibilityReport;
