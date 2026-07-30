export type JinfujingLuck = '吉' | '凶';
export type JinfujingReviewStatus = 'collating' | 'approved';
export interface JinfujingProvenance {
    readonly sourceId: string;
    readonly edition: string;
    readonly locator: string;
    readonly reviewStatus: JinfujingReviewStatus;
}
/** 单颗金符九星记录。 */
export interface JinfujingNineStarRecord {
    readonly index: number;
    readonly id: string;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly luck: JinfujingLuck;
    readonly talisman: string;
    readonly omen: string;
    readonly locator: string;
}
/** 月季组（孟/仲/季）→ 九星起始 index。 */
export interface JinfujingSeasonStart {
    readonly meng: number;
    readonly zhong: number;
    readonly ji: number;
}
/** 已校验冻结的金符九星数据包。 */
export interface LoadedJinfujingNineStar {
    readonly schemaVersion: string;
    readonly packageVersion: string;
    readonly sourceId: string;
    readonly reviewStatus: JinfujingReviewStatus;
    readonly stars: readonly JinfujingNineStarRecord[];
    readonly seasonStart: JinfujingSeasonStart;
    readonly aliases: Readonly<Record<string, string>>;
}
export interface JinfujingTextLayer {
    readonly id: string;
    readonly name: string;
}
export interface JinfujingTextSystem {
    readonly id: string;
    readonly name: string;
    readonly layer: string;
    readonly summary: string;
    readonly locator: string;
}
export interface JinfujingTextEntry {
    readonly name: string;
    readonly system: string;
    readonly summary: string;
    readonly locator: string;
}
/** 已校验冻结的金符经全文索引数据包。 */
export interface LoadedJinfujingTextIndex {
    readonly schemaVersion: string;
    readonly packageVersion: string;
    readonly sourceId: string;
    readonly reviewStatus: JinfujingReviewStatus;
    readonly layers: readonly JinfujingTextLayer[];
    readonly systems: readonly JinfujingTextSystem[];
    readonly entries: readonly JinfujingTextEntry[];
}
/**
 * 校验并冻结金符九星数据包。
 * @param input - JSON 兼容的未知九星数据。
 * @returns 已校验且深度冻结的九星数据；字段缺失或星数不为 9 抛 TypeError。
 */
export declare function loadJinfujingNineStar(input: unknown): LoadedJinfujingNineStar;
/**
 * 校验并冻结金符经全文索引数据包。
 * @param input - JSON 兼容的未知索引数据。
 * @returns 已校验且深度冻结的索引数据；layers/systems/entries 任一缺失抛 TypeError。
 */
export declare function loadJinfujingTextIndex(input: unknown): LoadedJinfujingTextIndex;
/** 取已校验冻结的金符九星数据（首次调用加载并缓存）。 */
export declare function getJinfujingNineStar(): LoadedJinfujingNineStar;
/** 取已校验冻结的金符经全文索引数据（首次调用加载并缓存）。 */
export declare function getJinfujingTextIndex(): LoadedJinfujingTextIndex;
/**
 * 构造金符经溯源信息（统一来源 + 指定小节 locator）。
 * @param locator - 原文小节定位（如星名《煞贡》）。
 * @returns 带 classics.jinfujing-dz1267 来源的溯源信息。
 */
export declare function jinfujingProvenance(locator: string): JinfujingProvenance;
/**
 * 按规范名或异写别名查询九星元信息（异写经 aliases 归一）。
 * @param name - 规范名或异写（如「惑星」「卜水」「角己」）。
 * @returns 命中的九星记录；未命中返回 undefined。
 */
export declare function getNineStarMeta(name: string): JinfujingNineStarRecord | undefined;
