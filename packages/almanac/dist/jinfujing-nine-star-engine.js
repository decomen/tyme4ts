/**
 * 金符九星值日复算引擎（纯函数，确定性，可穷举复算）。
 *
 * 两层分解：
 *   - 纯公式层 computeJinfujingStarByCycle(seasonGroup, dayCycleIndex)：月季组 + 日干支序 → 九星。
 *     公式：starIndex = (seasonStart[group] + dayCycleIndex − 1) mod 9。
 *     月季起例：孟→妖星(0)、仲→或星(1)、季→禾刀(2)。纯算术，可被 ctext 原文三表穷举验证。
 *   - 公历转换层 computeJinfujingStar(year, month, day)：经 tyme4ts 取农历月季 + 日干支序 → 调纯公式层。
 *
 * tyme4ts API（实现前已验证）：
 *   - getSixtyCycle().getIndex() 为 0-based（甲子=0）→ dayCycleIndex = getIndex() + 1
 *   - getLunarMonth().getMonth() 返回正数，闰月同月数（闰六月=6）→ 月季 (month−1)%3 天然正确
 *
 * 来源：ctext《九天上圣秘传金符经》DZ1267，URN ctp:ws344744。
 */
import { SolarDay } from 'tyme4ts';
import { getJinfujingNineStar, jinfujingProvenance } from './jinfujing-data.js';
/**
 * 农历月数（1-12，闰月同月数）→ 月季组孟/仲/季。
 * @param lunarMonth 农历月数（正月=1…腊月=12；闰月按同月数，如闰六月=6）。
 * @returns 孟/仲/季；非法月数回退孟（保守不抛错）。
 */
export function monthToSeasonGroup(lunarMonth) {
    const group = (Math.abs(lunarMonth) - 1) % 3;
    return group === 0 ? 'meng' : group === 1 ? 'zhong' : 'ji';
}
/**
 * 纯公式复算：月季组 + 日干支序 → 九星记录。
 * @param group 月季组（孟/仲/季）。
 * @param dayCycleIndex 日干支序 1-60（甲子=1…癸亥=60）。
 * @returns 当日所值九星记录；序号越界抛 RangeError。
 */
export function computeJinfujingStarByCycle(group, dayCycleIndex) {
    if (!Number.isInteger(dayCycleIndex) || dayCycleIndex < 1 || dayCycleIndex > 60) {
        throw new RangeError('日干支序必须为 1-60 的整数');
    }
    const start = getJinfujingNineStar().seasonStart[group];
    const starIndex = (start + dayCycleIndex - 1) % 9;
    const star = getJinfujingNineStar().stars[starIndex];
    if (!star)
        throw new Error(`九星计算越界: starIndex=${starIndex}`);
    return star;
}
/**
 * 公历日期 → 当日金符九星值星（跨变更公共 API，biz-h5 仅传 y/m/d）。
 * @param year 公历年。
 * @param month 公历月 1-12。
 * @param day 公历日。
 * @returns 值星 + 吉凶 + 符名 + 断语 + 溯源；日期非法由 tyme4ts 抛错。
 */
export function computeJinfujingStar(year, month, day) {
    const lunarDay = SolarDay.fromYmd(year, month, day).getLunarDay();
    const dayCycleIndex = lunarDay.getSixtyCycle().getIndex() + 1;
    const lunarMonth = lunarDay.getLunarMonth().getMonth();
    const star = computeJinfujingStarByCycle(monthToSeasonGroup(lunarMonth), dayCycleIndex);
    return {
        star: star.name,
        luck: star.luck,
        talisman: star.talisman,
        omen: star.omen,
        provenance: jinfujingProvenance(star.locator),
    };
}
