export interface ActivityDomain {
  readonly domainId: string
  readonly name: string
}

export interface ActivityDefinition {
  readonly activityId: string
  readonly domainId: string
  readonly canonicalName: string
  readonly aliases: readonly string[]
  readonly parentId?: string
  readonly relatedIds: readonly string[]
  readonly notEquivalentIds: readonly string[]
}

export const ACTIVITY_DOMAINS: readonly ActivityDomain[] = [
  { domainId: 'marriage', name: '婚姻' },
  { domainId: 'construction', name: '营造' },
  { domainId: 'residence', name: '居宅' },
  { domainId: 'commerce', name: '商业' },
  { domainId: 'travel', name: '出行' },
  { domainId: 'ritual', name: '祭祀' },
  { domainId: 'funeral', name: '丧葬' },
  { domainId: 'medical', name: '医疗' },
  { domainId: 'agriculture', name: '农牧' },
  { domainId: 'repair', name: '修缮' },
  { domainId: 'daily-life', name: '日常生活' },
]

export const ACTIVITIES: readonly ActivityDefinition[] = [
  { activityId: 'marriage.wedding', domainId: 'marriage', canonicalName: '嫁娶', aliases: ['结婚'], relatedIds: ['marriage.engagement'], notEquivalentIds: ['marriage.engagement'] },
  { activityId: 'construction.build', domainId: 'construction', canonicalName: '修造', aliases: ['营建'], relatedIds: ['repair.dwelling'], notEquivalentIds: ['repair.dwelling'] },
  { activityId: 'residence.move-in', domainId: 'residence', canonicalName: '入宅', aliases: ['迁入新宅'], relatedIds: [], notEquivalentIds: ['travel.relocate'] },
  { activityId: 'commerce.open', domainId: 'commerce', canonicalName: '开市', aliases: ['开业'], relatedIds: [], notEquivalentIds: ['commerce.trade'] },
  { activityId: 'travel.depart', domainId: 'travel', canonicalName: '出行', aliases: ['启行'], relatedIds: [], notEquivalentIds: ['travel.relocate'] },
  { activityId: 'ritual.sacrifice', domainId: 'ritual', canonicalName: '祭祀', aliases: ['祭礼'], relatedIds: [], notEquivalentIds: [] },
  { activityId: 'funeral.burial', domainId: 'funeral', canonicalName: '安葬', aliases: ['葬埋'], relatedIds: [], notEquivalentIds: ['funeral.exhumation'] },
  { activityId: 'medical.treatment', domainId: 'medical', canonicalName: '求医', aliases: ['就医'], relatedIds: [], notEquivalentIds: ['medical.surgery'] },
  { activityId: 'agriculture.sow', domainId: 'agriculture', canonicalName: '播种', aliases: ['下种'], relatedIds: [], notEquivalentIds: ['agriculture.harvest'] },
  { activityId: 'repair.dwelling', domainId: 'repair', canonicalName: '修缮', aliases: ['修葺'], relatedIds: ['construction.build'], notEquivalentIds: ['construction.build'] },
  { activityId: 'daily-life.clean', domainId: 'daily-life', canonicalName: '扫舍', aliases: ['清扫房舍'], relatedIds: [], notEquivalentIds: [] },
]
