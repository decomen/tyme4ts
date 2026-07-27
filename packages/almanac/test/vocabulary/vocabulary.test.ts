import { describe, expect, it } from 'vitest'

import { ACTIVITY_DOMAINS, ACTIVITIES } from '../../src/vocabulary.js'

describe('公共事项本体', () => {
  it('覆盖规划的十一个领域且 ID 唯一', () => {
    expect(ACTIVITY_DOMAINS.map((item) => item.domainId)).toEqual([
      'marriage', 'construction', 'residence', 'commerce', 'travel', 'ritual',
      'funeral', 'medical', 'agriculture', 'repair', 'daily-life',
    ])
    expect(new Set(ACTIVITIES.map((item) => item.activityId)).size).toBe(ACTIVITIES.length)
  })

  it('每个首批事项声明别名、关系和不等价项', () => {
    expect(ACTIVITIES.every((item) => Array.isArray(item.aliases))).toBe(true)
    expect(ACTIVITIES.every((item) => Array.isArray(item.relatedIds))).toBe(true)
    expect(ACTIVITIES.every((item) => Array.isArray(item.notEquivalentIds))).toBe(true)
  })
})
