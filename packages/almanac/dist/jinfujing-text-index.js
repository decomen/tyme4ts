import { getJinfujingTextIndex } from './jinfujing-data.js';
/** 按体系 id 查询其下全部术语条目。 */
export function queryBySystem(system) {
    return getJinfujingTextIndex().entries.filter((entry) => entry.system === system);
}
/** 按体系 id 查询体系节点本身。 */
export function getSystem(system) {
    return getJinfujingTextIndex().systems.find((item) => item.id === system || item.name === system);
}
/** 按名称查询体系节点与同名条目（体系按 name 或 id 命中，条目按 name 命中）。 */
export function queryByName(name) {
    const data = getJinfujingTextIndex();
    return {
        systems: data.systems.filter((item) => item.name === name || item.id === name),
        entries: data.entries.filter((item) => item.name === name),
    };
}
/** 取理论框架全部分层（基础层 / 择日应用层 / 神煞辅佐层）。 */
export function getFrameworkLayers() {
    return getJinfujingTextIndex().layers;
}
/** 按层 id 查询归属该层的全部体系节点。 */
export function querySystemsByLayer(layer) {
    return getJinfujingTextIndex().systems.filter((item) => item.layer === layer);
}
