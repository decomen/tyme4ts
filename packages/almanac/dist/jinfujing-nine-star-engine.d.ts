import type { JinfujingNineStarRecord, JinfujingProvenance } from './jinfujing-data.js';
/** 月季组：四孟 / 四仲 / 四季。 */
export type JinfujingSeasonGroup = 'meng' | 'zhong' | 'ji';
/** 金符值星复算结果（跨变更公共 API 返回形态）。 */
export interface JinfujingStarResult {
    readonly star: string;
    readonly luck: '吉' | '凶';
    readonly talisman: string;
    readonly omen: string;
    readonly provenance: JinfujingProvenance;
}
/**
 * 农历月数（1-12，闰月同月数）→ 月季组孟/仲/季。
 * @param lunarMonth 农历月数（正月=1…腊月=12；闰月按同月数，如闰六月=6）。
 * @returns 孟/仲/季；非法月数回退孟（保守不抛错）。
 */
export declare function monthToSeasonGroup(lunarMonth: number): JinfujingSeasonGroup;
/**
 * 纯公式复算：月季组 + 日干支序 → 九星记录。
 * @param group 月季组（孟/仲/季）。
 * @param dayCycleIndex 日干支序 1-60（甲子=1…癸亥=60）。
 * @returns 当日所值九星记录；序号越界抛 RangeError。
 */
export declare function computeJinfujingStarByCycle(group: JinfujingSeasonGroup, dayCycleIndex: number): JinfujingNineStarRecord;
/**
 * 公历日期 → 当日金符九星值星（跨变更公共 API，biz-h5 仅传 y/m/d）。
 * @param year 公历年。
 * @param month 公历月 1-12。
 * @param day 公历日。
 * @returns 值星 + 吉凶 + 符名 + 断语 + 溯源；日期非法由 tyme4ts 抛错。
 */
export declare function computeJinfujingStar(year: number, month: number, day: number): JinfujingStarResult;
