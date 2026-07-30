import { createHash } from 'node:crypto';
import { ACTIVITIES } from './vocabulary.js';
import { createGoldenTalismanAnnotation } from './jinfujing-annotation.js';
/**
 * 为官方原始事项名称生成稳定且不泄漏显示文本的 ID。
 * @param name - tyme4ts 返回的原始事项名称。
 * @returns 带官方命名空间的稳定短哈希 ID。
 */
function officialActivityId(name) {
    const digest = createHash('sha256').update(name).digest('hex').slice(0, 12);
    return `official.${digest}`;
}
/**
 * 将官方基础宜忌映射为结构化公共事项，明确非个性化边界。
 * @param facts - Adapter 产生的日级官方事实。
 * @returns 保留原始名称、映射依据和宜忌结论的事项列表。
 */
export function mapOfficialActivities(facts) {
    const map = (originalName, conclusion) => ({
        activityId: officialActivityId(originalName),
        canonicalName: originalName,
        originalName,
        conclusion,
        mappingBasis: 'tyme4ts@1.5.2-public-api',
        nonPersonalized: true,
    });
    return [
        ...facts.recommends.map((name) => map(name, 'recommend')),
        ...facts.avoids.map((name) => map(name, 'avoid')),
    ];
}
/**
 * 执行已校验的模型知识规则包并生成结构化公共宜忌记录。
 * @param facts - Adapter 产生的日级官方事实。
 * @param rulePackage - 已校验且冻结的模型知识规则包。
 * @returns 仅包含当前建除条件命中项及完整规则溯源的事项记录。
 */
export function mapModelKnowledgeActivities(facts, rulePackage) {
    return rulePackage.rules
        .filter((rule) => rule.conditionKey === `duty=${facts.duty}`)
        .map((rule) => {
        const definition = ACTIVITIES.find((item) => item.activityId === rule.activityId);
        const provenance = {
            sourceId: rule.sourceId,
            edition: rulePackage.packageVersion,
            locator: rule.ruleId,
            interpretation: rule.interpretation,
            reviewStatus: rule.reviewStatus === 'reviewing' ? 'collating' : rule.reviewStatus,
        };
        const ruleHit = {
            ruleId: rule.ruleId,
            activityId: rule.activityId,
            conclusion: rule.conclusion,
            priority: rule.priority,
            timeScope: 'day',
            conditionKey: rule.conditionKey,
            comparable: rule.comparableWhen.length > 0,
            sourceId: rule.sourceId,
            provenance,
        };
        return {
            activityId: rule.activityId,
            canonicalName: definition?.canonicalName ?? rule.activityId,
            originalName: definition?.canonicalName ?? rule.activityId,
            conclusion: rule.conclusion,
            ruleHits: [ruleHit],
        };
    });
}
/**
 * 将官方历法事实转换为相互独立的公共历注展示模型。
 * @param facts - Adapter 产生的日级官方事实。
 * @returns 不含评分且保留体系边界与实验状态的历注列表。
 */
export function createPublicAnnotations(facts) {
    const upstream = { source: 'tyme4ts@1.5.2' };
    const modelProvenance = {
        sourceId: 'model-knowledge.codex',
        edition: '2026-07-25',
        locator: 'build-time-knowledge-package',
        interpretation: '模型知识仅用于构建期释义整理，运行时结果保持确定性',
        reviewStatus: 'approved',
    };
    const annotations = [
        {
            annotationId: 'fetus.day',
            kind: 'fetus',
            name: facts.fetus,
            details: {
                ...upstream,
                occupancy: facts.fetusOccupancy,
                side: facts.fetusSide,
                direction: facts.fetusDirection,
                originalText: facts.fetus,
                interpretation: '胎神占方表示传统通书中当日胎神所在方位，宜避免在所示方位进行扰动性施工。',
            },
            provenance: modelProvenance,
        },
        { annotationId: 'six-star.day', kind: 'six-star', name: facts.sixStar, optionalCulture: true, details: { ...upstream, system: '日本六曜' } },
        {
            annotationId: 'phenology.day',
            kind: 'phenology',
            name: facts.phenology,
            details: { ...upstream, solarTerm: facts.solarTerm, order: facts.phenologyOrder, boundaryBasis: 'tyme4ts-solar-time', boundaryTime: facts.phenologyBoundary },
        },
        {
            annotationId: 'twenty-eight-star.day',
            kind: 'twenty-eight-star',
            name: facts.twentyEightStar,
            details: {
                ...upstream,
                basis: '通书值日宿',
                zone: facts.twentyEightStarZone,
                land: facts.twentyEightStarLand,
                astronomicalPosition: false,
                interpretation: '此处为通书值日宿及其分野信息，不表示月球实时天文宿度。',
            },
            provenance: modelProvenance,
        },
        {
            annotationId: 'peng-zu.day',
            kind: 'peng-zu',
            name: facts.pengZu,
            details: {
                ...upstream,
                originalText: facts.pengZu,
                heavenStemText: facts.pengZuHeavenStem,
                earthBranchText: facts.pengZuEarthBranch,
                interpretation: '彭祖百忌分别依据当日天干与地支展示传统禁忌短句。',
                relatedActivities: '以原文事项为公共参考',
            },
            provenance: modelProvenance,
        },
        { annotationId: 'duty.day', kind: 'duty', name: facts.duty, details: { ...upstream, system: '建除十二值' } },
        { annotationId: `duty-star.${facts.dutyStar}`, kind: 'duty-star', name: facts.dutyStar, details: { ...upstream, classification: facts.ecliptic } },
        createGoldenTalismanAnnotation(facts),
    ];
    annotations.push(...facts.godDetails.map((god) => ({
        annotationId: god.id,
        kind: 'deity',
        name: god.name,
        details: { ...upstream, luck: god.luck, score: false },
    })));
    return annotations;
}
