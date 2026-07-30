/**
 * 判断未知输入是否为可按字段读取的普通对象。
 * @param value - 待判断的未知输入。
 * @returns 输入可作为字符串键对象读取时返回 true。
 */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * 校验来源包的基本版本字段和模型知识元数据。
 * @param input - 从 JSON 或调用方传入的来源包数据。
 * @returns 包含是否通过及全部可修复错误的校验结果。
 */
export function validateSourcePackage(input) {
    const errors = [];
    if (!isRecord(input)) {
        return { ok: false, errors: ['来源包必须是对象'] };
    }
    if (typeof input.schemaVersion !== 'string' || typeof input.packageVersion !== 'string') {
        errors.push('来源包必须声明 schemaVersion 和 packageVersion');
    }
    if (!Array.isArray(input.sources)) {
        errors.push('来源包必须包含 sources 数组');
        return { ok: false, errors };
    }
    for (const source of input.sources) {
        if (!isRecord(source)) {
            errors.push('来源记录必须是对象');
            continue;
        }
        if (typeof source.sourceId !== 'string' || !source.sourceId.startsWith('model-knowledge.')) {
            errors.push('sourceId 必须使用 model-knowledge 命名空间');
        }
        if (source.kind !== 'model-knowledge' || typeof source.model !== 'string') {
            errors.push('来源必须声明模型知识类型和 model');
        }
        if (typeof source.knowledgeVersion !== 'string') {
            errors.push('模型知识来源必须声明 knowledgeVersion');
        }
        if (typeof source.confidence !== 'number' || source.confidence < 0 || source.confidence > 1) {
            errors.push('confidence 必须是 0 到 1 之间的数值');
        }
        if (!['pending', 'reviewing', 'approved'].includes(String(source.reviewStatus))) {
            errors.push('模型知识来源必须声明有效 reviewStatus');
        }
        if (typeof source.changeReason !== 'string' || source.changeReason.length === 0) {
            errors.push('模型知识来源必须声明 changeReason');
        }
    }
    return { ok: errors.length === 0, errors };
}
/**
 * 校验规则包版本、知识来源、优先级与正式发布审核门槛。
 * @param input - 从 JSON 或调用方传入的规则包数据。
 * @returns 包含是否通过及全部可修复错误的校验结果。
 */
export function validateRulePackage(input) {
    const errors = [];
    if (!isRecord(input)) {
        return { ok: false, errors: ['规则包必须是对象'] };
    }
    if (typeof input.schemaVersion !== 'string' || typeof input.packageVersion !== 'string') {
        errors.push('规则包必须声明 schemaVersion 和 packageVersion');
    }
    if (!Array.isArray(input.rules)) {
        errors.push('规则包必须包含 rules 数组');
        return { ok: false, errors };
    }
    for (const rule of input.rules) {
        if (!isRecord(rule)) {
            errors.push('规则记录必须是对象');
            continue;
        }
        if (typeof rule.priority !== 'number' || !Number.isInteger(rule.priority) || rule.priority <= 0) {
            errors.push('priority 必须是正整数且数值越小优先级越高');
        }
        if (!['recommend', 'avoid', 'conditional-recommend', 'conditional-avoid', 'neutral', 'unrecorded', 'only-listed-matters', 'avoid-all'].includes(String(rule.conclusion))) {
            errors.push('规则必须声明有效 conclusion');
        }
        if (typeof rule.conditionKey !== 'string' || !Array.isArray(rule.comparableWhen)) {
            errors.push('规则必须声明 conditionKey 和 comparableWhen');
        }
        if (typeof rule.sourceId !== 'string' || !rule.sourceId.startsWith('model-knowledge.')) {
            errors.push('规则来源必须使用 model-knowledge 命名空间');
        }
        if (typeof rule.confidence !== 'number' || rule.confidence < 0 || rule.confidence > 1) {
            errors.push('规则 confidence 必须是 0 到 1 之间的数值');
        }
        if (typeof rule.interpretation !== 'string' || typeof rule.changeReason !== 'string') {
            errors.push('规则必须声明 interpretation 和 changeReason');
        }
        if (input.status === 'released' && (rule.reviewStatus !== 'approved' || typeof rule.confidence !== 'number' || rule.confidence < 0.8)) {
            errors.push('released 规则包不得包含未审核或低置信度规则');
        }
    }
    return { ok: errors.length === 0, errors };
}
