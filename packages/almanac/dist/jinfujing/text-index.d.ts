/**
 * 金符经全文体系索引查询（静态检索，不逐日推算）。
 *
 * 数据来自 rules/jinfujing/text-index.json（经 jinfujing-data 加载冻结）。
 * 提供：框架分层遍历、按体系/按名称（含体系名）查询术语条目。
 * 仅静态索引检索，不接收日期、不调用 tyme4ts 推算。
 *
 * 来源：ctext《九天上圣秘传金符经》DZ1267，URN ctp:ws344744。
 */
import type { JinfujingTextEntry, JinfujingTextLayer, JinfujingTextSystem } from './data.js';
/** 按体系 id 查询其下全部术语条目。 */
export declare function queryBySystem(system: string): readonly JinfujingTextEntry[];
/** 按体系 id 查询体系节点本身。 */
export declare function getSystem(system: string): JinfujingTextSystem | undefined;
/** 按名称查询体系节点与同名条目（体系按 name 或 id 命中，条目按 name 命中）。 */
export declare function queryByName(name: string): {
    readonly systems: readonly JinfujingTextSystem[];
    readonly entries: readonly JinfujingTextEntry[];
};
/** 取理论框架全部分层（基础层 / 择日应用层 / 神煞辅佐层）。 */
export declare function getFrameworkLayers(): readonly JinfujingTextLayer[];
/** 按层 id 查询归属该层的全部体系节点。 */
export declare function querySystemsByLayer(layer: string): readonly JinfujingTextSystem[];
