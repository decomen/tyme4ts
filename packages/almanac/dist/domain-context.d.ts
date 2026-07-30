export interface GeoLocation {
    readonly latitude: number;
    readonly longitude: number;
}
export type DayBoundary = 'midnight' | 'zi-hour';
export interface CalculationContext {
    readonly civilDateTime: string;
    readonly timeZone: string;
    readonly location?: GeoLocation;
    readonly dayBoundary: DayBoundary;
    readonly ruleSetVersion: string;
    readonly engineVersion: string;
    readonly schemaVersion: string;
}
/**
 * 验证并固化公共通书计算所需的全部时间和版本口径。
 * @param input - 民用时间、IANA 时区、可选地点、换日及版本信息。
 * @returns 冻结后的计算上下文，避免计算期间被调用方修改。
 */
export declare function createCalculationContext(input: CalculationContext): Readonly<CalculationContext>;
