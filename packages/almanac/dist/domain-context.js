/**
 * 验证并固化公共通书计算所需的全部时间和版本口径。
 * @param input - 民用时间、IANA 时区、可选地点、换日及版本信息。
 * @returns 冻结后的计算上下文，避免计算期间被调用方修改。
 */
export function createCalculationContext(input) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input.civilDateTime)) {
        throw new RangeError('civilDateTime 必须使用 YYYY-MM-DDTHH:mm:ss');
    }
    try {
        new Intl.DateTimeFormat('zh-CN', { timeZone: input.timeZone }).format();
    }
    catch {
        throw new RangeError(`无效 IANA 时区: ${input.timeZone}`);
    }
    if (input.location !== undefined) {
        const { latitude, longitude } = input.location;
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            throw new RangeError('地点经纬度超出有效范围');
        }
    }
    const location = input.location === undefined ? undefined : Object.freeze({ ...input.location });
    return Object.freeze({ ...input, ...(location === undefined ? {} : { location }) });
}
