import { createSnapshotIdentity } from './application-fingerprint.js';
import { createPublicAnnotations, mapModelKnowledgeActivities, mapOfficialActivities } from './providers.js';
/**
 * 递归冻结快照对象和数组，避免历史结果被调用方修改。
 * @param value - 待冻结的对象。
 * @returns 原对象的深度只读视图。
 */
function deepFreeze(value) {
    for (const child of Object.values(value)) {
        if (typeof child === 'object' && child !== null && !Object.isFrozen(child))
            deepFreeze(child);
    }
    return Object.freeze(value);
}
/** 公共通书聚合、检索和快照应用服务。 */
export class AlmanacService {
    adapter;
    rulePackage;
    /**
     * 创建公共通书服务。
     * @param adapter - 仅封装官方公开 API 的日历适配器。
     */
    constructor(adapter, rulePackage) {
        this.adapter = adapter;
        this.rulePackage = rulePackage;
    }
    /**
     * 按显式计算口径聚合日级和十二时辰结果。
     * @param context - 已校验的民用时间、时区和版本口径。
     * @returns 可序列化且日时结果互不共享数组的通书日。
     */
    getDay(context) {
        const date = context.civilDateTime.slice(0, 10);
        const [year, month, day] = date.split('-').map(Number);
        if (year === undefined || month === undefined || day === undefined)
            throw new RangeError('无效民用日期');
        const facts = this.adapter.getDay(year, month, day);
        const activities = mapOfficialActivities(facts).map((item) => ({ ...item, ruleHits: [] }));
        const knowledgeActivities = this.rulePackage === undefined ? [] : mapModelKnowledgeActivities(facts, this.rulePackage);
        return {
            date,
            facts: { solarDate: facts.solarDate, lunarDate: facts.lunarDate, dayCycle: facts.dayCycle, solarTerm: facts.solarTerm, phenology: facts.phenology },
            annotations: createPublicAnnotations(facts),
            activities: [...activities, ...knowledgeActivities],
            hours: facts.hours.map((hour) => ({
                branch: hour.branch,
                civilRange: `${hour.civilHour.toString().padStart(2, '0')}:00`,
                cycle: hour.cycle,
                annotations: [],
                activities: [
                    ...hour.recommends.map((name) => ({ activityId: `hour.${name}`, canonicalName: name, originalName: name, conclusion: 'recommend', ruleHits: [] })),
                    ...hour.avoids.map((name) => ({ activityId: `hour.${name}`, canonicalName: name, originalName: name, conclusion: 'avoid', ruleHits: [] })),
                ],
            })),
        };
    }
    /**
     * 生成携带规则、引擎和 Schema 版本的确定性不可变快照。
     * @param context - 已校验计算口径。
     * @returns 可持久化和历史复算的深度冻结快照。
     */
    createSnapshot(context) {
        const day = this.getDay(context);
        const identity = createSnapshotIdentity({ context, day, rules: [context.ruleSetVersion] });
        return deepFreeze({
            ...identity,
            schemaVersion: context.schemaVersion,
            engineVersion: context.engineVersion,
            ruleSetVersion: context.ruleSetVersion,
            createdAt: `${context.civilDateTime}[${context.timeZone}]`,
            day,
        });
    }
    /**
     * 在多个计算日中检索指定公共事项记录。
     * @param contexts - 要对照的日期计算口径。
     * @param activityId - 稳定公共事项 ID。
     * @returns 仅包含通书记录和非个性化声明的结果。
     */
    searchActivity(contexts, activityId) {
        const records = contexts.flatMap((item) => {
            const day = this.getDay(item);
            return day.activities.filter((activity) => activity.activityId === activityId).map((activity) => ({ date: day.date, activity }));
        });
        return { disclaimer: '公共通书记录，非个性化择日结论', records };
    }
}
/** 不覆盖历史数据的内存快照版本仓库。 */
export class SnapshotRepository {
    snapshots = new Map();
    currentId;
    /** 发布并切换当前快照。 */
    publish(snapshot) {
        this.snapshots.set(snapshot.snapshotId, snapshot);
        this.currentId = snapshot.snapshotId;
    }
    /** 按 ID 读取历史快照。 */
    get(snapshotId) {
        return this.snapshots.get(snapshotId);
    }
    /** 读取当前发布快照。 */
    current() {
        return this.currentId === undefined ? undefined : this.snapshots.get(this.currentId);
    }
    /** 将当前版本指针回滚到已存在的历史快照。 */
    rollback(snapshotId) {
        if (!this.snapshots.has(snapshotId))
            throw new Error(`快照不存在: ${snapshotId}`);
        this.currentId = snapshotId;
    }
    /**
     * 使用快照记录的版本口径复算并比较结果指纹。
     * @param snapshotId - 要验证的历史快照 ID。
     * @param service - 使用对应历史引擎的通书服务。
     * @param context - 与快照版本一致的历史计算上下文。
     * @returns 记录指纹、复算指纹及二者是否一致。
     */
    verifyRecalculation(snapshotId, service, context) {
        const recorded = this.snapshots.get(snapshotId);
        if (recorded === undefined)
            throw new Error(`快照不存在: ${snapshotId}`);
        if (recorded.engineVersion !== context.engineVersion || recorded.ruleSetVersion !== context.ruleSetVersion || recorded.schemaVersion !== context.schemaVersion) {
            throw new Error('复算上下文版本与历史快照不一致');
        }
        const recalculated = service.createSnapshot(context);
        return {
            matches: recorded.resultFingerprint === recalculated.resultFingerprint,
            recordedFingerprint: recorded.resultFingerprint,
            recalculatedFingerprint: recalculated.resultFingerprint,
        };
    }
}
