import { describe, expect, it } from 'vitest'

import { AlmanacService, SnapshotRepository } from '../../src/application-service.js'
import { Tyme4tsCalendarAdapter } from '../../src/adapter-tyme4ts.js'
import { createCalculationContext } from '../../src/domain-context.js'

const context = createCalculationContext({
  civilDateTime: '2024-06-26T12:00:00',
  timeZone: 'Asia/Shanghai',
  dayBoundary: 'midnight',
  ruleSetVersion: '2026.07.25',
  engineVersion: 'tyme4ts@1.5.2',
  schemaVersion: '1.0.0',
})

describe('AlmanacService', () => {
  const service = new AlmanacService(new Tyme4tsCalendarAdapter())

  it('聚合可序列化日级结果和十二时辰', () => {
    const day = service.getDay(context)

    expect(day.date).toBe('2024-06-26')
    expect(day.hours).toHaveLength(12)
    expect(() => JSON.stringify(day)).not.toThrow()
  })

  it('创建带完整版本口径和确定性指纹的不可变快照', () => {
    const first = service.createSnapshot(context)
    const second = service.createSnapshot(context)

    expect(first.snapshotId).toBe(second.snapshotId)
    expect(first.resultFingerprint).toBe(second.resultFingerprint)
    expect(first.engineVersion).toBe('tyme4ts@1.5.2')
    expect(Object.isFrozen(first)).toBe(true)
  })

  it('公共事项检索不返回个性化推荐', () => {
    const result = service.searchActivity([context], service.getDay(context).activities[0]?.activityId ?? '')

    expect(result.disclaimer).toBe('公共通书记录，非个性化择日结论')
    expect(result.records.every((record) => !('score' in record))).toBe(true)
  })
})

describe('SnapshotRepository', () => {
  it('按快照版本保存、读取和回滚当前发布版本', () => {
    const service = new AlmanacService(new Tyme4tsCalendarAdapter())
    const repository = new SnapshotRepository()
    const first = service.createSnapshot(context)
    const second = service.createSnapshot({ ...context, ruleSetVersion: '2026.07.26' })

    repository.publish(first)
    repository.publish(second)
    expect(repository.current()?.snapshotId).toBe(second.snapshotId)
    expect(first.resultFingerprint).not.toBe(second.resultFingerprint)
    repository.rollback(first.snapshotId)
    expect(repository.current()?.snapshotId).toBe(first.snapshotId)
    expect(repository.get(first.snapshotId)).toEqual(first)
  })

  it('按历史快照版本复算并报告指纹是否一致', () => {
    const service = new AlmanacService(new Tyme4tsCalendarAdapter())
    const repository = new SnapshotRepository()
    const snapshot = service.createSnapshot(context)
    repository.publish(snapshot)

    const result = repository.verifyRecalculation(snapshot.snapshotId, service, context)

    expect(result.matches).toBe(true)
    expect(result.recordedFingerprint).toBe(snapshot.resultFingerprint)
    expect(result.recalculatedFingerprint).toBe(snapshot.resultFingerprint)
  })
})
