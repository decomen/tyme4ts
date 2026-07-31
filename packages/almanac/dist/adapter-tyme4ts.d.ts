export interface AdaptedHourFacts {
    readonly branch: string;
    readonly cycle: string;
    readonly civilHour: number;
    readonly recommends: readonly string[];
    readonly avoids: readonly string[];
}
export interface AdaptedGodFact {
    readonly id: string;
    readonly name: string;
    readonly luck: string;
}
export interface AdaptedDayFacts {
    readonly solarDate: string;
    readonly lunarDate: string;
    readonly dayCycle: string;
    readonly dayLu: string;
    readonly solarTerm: string;
    readonly phenology: string;
    readonly phenologyOrder: number;
    readonly phenologyBoundary: string;
    readonly fetus: string;
    readonly fetusOccupancy: string;
    readonly fetusSide: string;
    readonly fetusDirection: string;
    readonly sixStar: string;
    readonly twentyEightStar: string;
    readonly twentyEightStarZone: string;
    readonly twentyEightStarLand: string;
    readonly pengZu: string;
    readonly pengZuHeavenStem: string;
    readonly pengZuEarthBranch: string;
    readonly duty: string;
    readonly dutyStar: string;
    readonly ecliptic: string;
    readonly gods: readonly string[];
    readonly godDetails: readonly AdaptedGodFact[];
    readonly recommends: readonly string[];
    readonly avoids: readonly string[];
    readonly hours: readonly AdaptedHourFacts[];
}
/** 官方 tyme4ts 公共 API 的只读隔离适配器。 */
export declare class Tyme4tsCalendarAdapter {
    /**
     * 读取指定公历日的基础历法事实、历注和十二时辰宜忌。
     * @param year - 公历年。
     * @param month - 公历月，范围 1 至 12。
     * @param day - 公历日。
     * @returns 与上游对象解耦的可序列化只读事实。
     */
    getDay(year: number, month: number, day: number): AdaptedDayFacts;
}
