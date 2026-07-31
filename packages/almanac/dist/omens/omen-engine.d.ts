/** 单次查询结果（含左/右或单条）。 */
export interface OmenResult {
    readonly omenId: string;
    readonly cnName: string;
    readonly hourIndex: number;
    readonly left?: string;
    readonly right?: string;
    readonly text?: string;
}
/**
 * 查询指定征兆在指定时辰的断语。
 * @param omenId - 征兆 id（eyelid/earRinging/earHot/faceHot/fleshTwitch/heartFear/sneeze/clothCatch/potRing/fireLeap/dogBark/magpieCry）
 * @param hourIndex - 时辰索引 0-11（子~亥）
 * @returns 断语结果；omenId 未知或 hourIndex 越界返回 null
 */
export declare function getOmen(omenId: string, hourIndex: number): OmenResult | null;
/**
 * 列出全部 12 征兆元信息（id + 中文名 + 是否分左右）。
 * @returns 12 条征兆元信息（顺序同数据包）
 */
export declare function listOmens(): readonly {
    omenId: string;
    cnName: string;
    hasLeftRight: boolean;
}[];
