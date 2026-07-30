export type ActivityConclusion = 'recommend' | 'avoid' | 'conditional-recommend' | 'conditional-avoid' | 'neutral' | 'unrecorded' | 'only-listed-matters' | 'avoid-all';
export interface Provenance {
    readonly sourceId: string;
    readonly edition: string;
    readonly locator: string;
    readonly originalText?: string;
    readonly interpretation?: string;
    readonly reviewStatus: 'pending' | 'collating' | 'approved';
}
export interface RuleHit {
    readonly ruleId: string;
    readonly activityId: string;
    readonly conclusion: ActivityConclusion;
    readonly priority: number;
    readonly timeScope: 'day' | 'hour';
    readonly conditionKey: string;
    readonly comparable: boolean;
    readonly sourceId: string;
    readonly provenance?: Provenance;
}
export interface CalendarFacts {
    readonly solarDate: string;
    readonly lunarDate: string;
    readonly dayCycle: string;
    readonly solarTerm?: string;
    readonly phenology?: string;
}
export interface AlmanacActivityRecord {
    readonly activityId: string;
    readonly canonicalName: string;
    readonly originalName: string;
    readonly conclusion: ActivityConclusion;
    readonly ruleHits: readonly RuleHit[];
}
export interface AlmanacAnnotation {
    readonly annotationId: string;
    readonly kind: string;
    readonly name: string;
    readonly optionalCulture?: boolean;
    readonly experimental?: boolean;
    readonly details: Readonly<Record<string, string | number | boolean | null>>;
    readonly provenance?: Provenance;
}
export interface AlmanacHour {
    readonly branch: string;
    readonly civilRange: string;
    readonly cycle: string;
    readonly annotations: readonly AlmanacAnnotation[];
    readonly activities: readonly AlmanacActivityRecord[];
}
export interface AlmanacDay {
    readonly date: string;
    readonly facts: CalendarFacts;
    readonly annotations: readonly AlmanacAnnotation[];
    readonly activities: readonly AlmanacActivityRecord[];
    readonly hours: readonly AlmanacHour[];
}
export interface AlmanacSnapshot {
    readonly snapshotId: string;
    readonly ruleSetHash: string;
    readonly resultFingerprint: string;
    readonly schemaVersion: string;
    readonly engineVersion: string;
    readonly ruleSetVersion: string;
    readonly createdAt: string;
    readonly day: AlmanacDay;
}
