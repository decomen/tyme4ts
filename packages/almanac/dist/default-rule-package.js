import rulePackageJson from '../rules/packages/2026.07.25.json' with { type: 'json' };
import { loadRulePackage } from './rules/registry.js';
/**
 * 默认模型知识规则包（packageVersion=2026.07.25）。
 *
 * 真相源为 rules/packages/2026.07.25.json，本模块仅做 loadRulePackage 校验+深度冻结，
 * 不复制规则数据。build 时经 tsc resolveJsonModule 将 JSON 作为模块依赖保留，
 * 运行时由宿主（Node/Vite）解析，无需 node:fs，浏览器端可直接消费。
 *
 * 用于 biz-h5 getYiJi 经 mapModelKnowledgeActivities 生成建除十二值扩展宜忌。
 */
export const DEFAULT_RULE_PACKAGE = loadRulePackage(rulePackageJson);
