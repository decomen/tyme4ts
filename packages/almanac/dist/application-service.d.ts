import type { Tyme4tsCalendarAdapter } from './adapter-tyme4ts.js';
import type { CalculationContext } from './domain-context.js';
import type { AlmanacActivityRecord, AlmanacDay, AlmanacSnapshot } from './domain-models.js';
import type { LoadedRulePackage } from './rules/registry.js';
export interface ActivitySearchRecord {
    readonly date: string;
    readonly activity: AlmanacActivityRecord;
}
export interface ActivitySearchResult {
    readonly disclaimer: '公共通书记录，非个性化择日结论';
    readonly records: readonly ActivitySearchRecord[];
}
/** 公共通书聚合、检索和快照应用服务。 */
export declare class AlmanacService {
    private readonly adapter;
    private readonly rulePackage?;
    /**
     * 创建公共通书服务。
     * @param adapter - 仅封装官方公开 API 的日历适配器。
     */
    constructor(adapter: Tyme4tsCalendarAdapter, rulePackage?: LoadedRulePackage | undefined);
    /**
     * 按显式计算口径聚合日级和十二时辰结果。
     * @param context - 已校验的民用时间、时区和版本口径。
     * @returns 可序列化且日时结果互不共享数组的通书日。
     */
    getDay(context: CalculationContext): AlmanacDay;
    /**
     * 生成携带规则、引擎和 Schema 版本的确定性不可变快照。
     * @param context - 已校验计算口径。
     * @returns 可持久化和历史复算的深度冻结快照。
     */
    createSnapshot(context: CalculationContext): AlmanacSnapshot;
    /**
     * 在多个计算日中检索指定公共事项记录。
     * @param contexts - 要对照的日期计算口径。
     * @param activityId - 稳定公共事项 ID。
     * @returns 仅包含通书记录和非个性化声明的结果。
     */
    searchActivity(contexts: readonly CalculationContext[], activityId: string): ActivitySearchResult;
}
/** 不覆盖历史数据的内存快照版本仓库。 */
export declare class SnapshotRepository {
    private readonly snapshots;
    private currentId;
    /** 发布并切换当前快照。 */
    publish(snapshot: AlmanacSnapshot): void;
    /** 按 ID 读取历史快照。 */
    get(snapshotId: string): AlmanacSnapshot | undefined;
    /** 读取当前发布快照。 */
    current(): AlmanacSnapshot | undefined;
    /** 将当前版本指针回滚到已存在的历史快照。 */
    rollback(snapshotId: string): void;
    /**
     * 使用快照记录的版本口径复算并比较结果指纹。
     * @param snapshotId - 要验证的历史快照 ID。
     * @param service - 使用对应历史引擎的通书服务。
     * @param context - 与快照版本一致的历史计算上下文。
     * @returns 记录指纹、复算指纹及二者是否一致。
     */
    verifyRecalculation(snapshotId: string, service: AlmanacService, context: CalculationContext): {
        readonly matches: boolean;
        readonly recordedFingerprint: string;
        readonly recalculatedFingerprint: string;
    };
}
