import { computeJinfujingStar } from './jinfujing-nine-star-engine.js';
/**
 * 构造当日金符值星注解。
 * @param facts - Adapter 产生的日级官方事实（取 solarDate 复算值星）。
 * @returns golden-talisman 注解（值星+吉凶+符名+断语+溯源，experimental）。
 */
export function createGoldenTalismanAnnotation(facts) {
    const parts = facts.solarDate.split('-').map(Number);
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    if (y === undefined || m === undefined || d === undefined) {
        throw new RangeError(`无效 solarDate: ${facts.solarDate}`);
    }
    const result = computeJinfujingStar(y, m, d);
    return {
        annotationId: 'golden-talisman.day',
        kind: 'golden-talisman',
        name: `${result.star}(${result.luck})`,
        optionalCulture: true,
        experimental: true,
        details: {
            star: result.star,
            luck: result.luck,
            talisman: result.talisman,
            omen: result.omen,
            source: result.provenance.sourceId,
        },
        provenance: {
            sourceId: result.provenance.sourceId,
            edition: result.provenance.edition,
            locator: result.provenance.locator,
            reviewStatus: result.provenance.reviewStatus,
        },
    };
}
