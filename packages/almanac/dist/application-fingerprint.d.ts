export interface SnapshotIdentity {
    readonly snapshotId: string;
    readonly ruleSetHash: string;
    readonly resultFingerprint: string;
}
/**
 * 为相同语义输入生成稳定的快照 ID、规则集哈希和结果指纹。
 * @param input - 完整计算输入或快照结果。
 * @returns 可缓存、引用和跨版本比较的三个确定性标识。
 */
export declare function createSnapshotIdentity(input: unknown): SnapshotIdentity;
