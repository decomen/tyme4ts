export interface ActivityDomain {
    readonly domainId: string;
    readonly name: string;
}
export interface ActivityDefinition {
    readonly activityId: string;
    readonly domainId: string;
    readonly canonicalName: string;
    readonly aliases: readonly string[];
    readonly parentId?: string;
    readonly relatedIds: readonly string[];
    readonly notEquivalentIds: readonly string[];
}
export declare const ACTIVITY_DOMAINS: readonly ActivityDomain[];
export declare const ACTIVITIES: readonly ActivityDefinition[];
