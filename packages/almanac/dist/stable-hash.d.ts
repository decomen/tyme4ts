/**
 * 同步确定性 hash（非密码学），用于生成稳定的宜忌事项 ID 与通书快照指纹。
 *
 * 替代 node:crypto 的 createHash('sha256')：node:crypto 在浏览器端被 Vite
 * externalize，导致 tyme4ts-almanac 整包 build 失败（providers.js /
 * application-fingerprint.js 顶层 import 触发）。
 *
 * 采用 cyrb53 变体，两轮不同 seed 拼接，输出 32 位小写十六进制，
 * 足够 officialActivityId(12)/snapshotId(24) 截断。相同输入相同输出（确定性），
 * 非密码学强度（仅用于稳定标识，非安全场景）。
 * @param input - 待摘要的字符串。
 * @returns 32 位小写十六进制摘要。
 */
export declare function stableHash(input: string): string;
