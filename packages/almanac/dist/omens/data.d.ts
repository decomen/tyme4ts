export type OmenReviewStatus = 'collating' | 'approved';
/** 单时辰断语：眼跳/耳鸣含 left/right，其余 10 法用 text。 */
export interface OmenHour {
    readonly index: number;
    readonly left?: string;
    readonly right?: string;
    readonly text?: string;
}
/** 单征兆记录。 */
export interface OmenRecord {
    readonly omenId: string;
    readonly cnName: string;
    readonly hasLeftRight: boolean;
    readonly hours: readonly OmenHour[];
}
/** 已校验冻结的十二杂施数据包。 */
export interface LoadedTwelveOmens {
    readonly schemaVersion: string;
    readonly packageVersion: string;
    readonly sourceId: string;
    readonly sourceName: string;
    readonly reviewStatus: OmenReviewStatus;
    readonly note?: string;
    readonly omens: readonly OmenRecord[];
}
/**
 * 校验并冻结十二杂斂数据包。
 * @param input - JSON 兼容的未知数据。
 * @returns 已校验且深度冻结的数据；omens 非数组/非 12 法、任一法时辰非 12 抛 TypeError。
 */
export declare function loadTwelveOmens(input: unknown): LoadedTwelveOmens;
/** 取已校验冻结的十二杂斂数据（首次调用加载并缓存）。 */
export declare function getTwelveOmens(): LoadedTwelveOmens;
/** 数据包溯源信息（统一来源 + locator）。 */
export declare function omenProvenance(locator: string): {
    sourceId: string;
    edition: string;
    locator: string;
    reviewStatus: OmenReviewStatus;
};
