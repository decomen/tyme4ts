import { SolarDay } from 'tyme4ts'

export interface AdaptedHourFacts {
  readonly branch: string
  readonly cycle: string
  readonly civilHour: number
  readonly recommends: readonly string[]
  readonly avoids: readonly string[]
}

export interface AdaptedGodFact {
  readonly id: string
  readonly name: string
  readonly luck: string
}

export interface AdaptedDayFacts {
  readonly solarDate: string
  readonly lunarDate: string
  readonly dayCycle: string
  readonly solarTerm: string
  readonly phenology: string
  readonly phenologyOrder: number
  readonly phenologyBoundary: string
  readonly fetus: string
  readonly fetusOccupancy: string
  readonly fetusSide: string
  readonly fetusDirection: string
  readonly sixStar: string
  readonly twentyEightStar: string
  readonly twentyEightStarZone: string
  readonly twentyEightStarLand: string
  readonly pengZu: string
  readonly pengZuHeavenStem: string
  readonly pengZuEarthBranch: string
  readonly duty: string
  readonly dutyStar: string
  readonly ecliptic: string
  readonly gods: readonly string[]
  readonly godDetails: readonly AdaptedGodFact[]
  readonly recommends: readonly string[]
  readonly avoids: readonly string[]
  readonly hours: readonly AdaptedHourFacts[]
}

/** 官方 tyme4ts 公共 API 的只读隔离适配器。 */
export class Tyme4tsCalendarAdapter {
  /**
   * 读取指定公历日的基础历法事实、历注和十二时辰宜忌。
   * @param year - 公历年。
   * @param month - 公历月，范围 1 至 12。
   * @param day - 公历日。
   * @returns 与上游对象解耦的可序列化只读事实。
   */
  getDay(year: number, month: number, day: number): AdaptedDayFacts {
    const solar = SolarDay.fromYmd(year, month, day)
    const lunar = solar.getLunarDay()
    const fetus = lunar.getFetusDay()
    const phenology = solar.getPhenology()
    const phenologyBoundary = phenology.getJulianDay().getSolarTime()
    const twentyEightStar = lunar.getTwentyEightStar()
    const pengZu = lunar.getSixtyCycle().getPengZu()
    const hours = lunar.getHours().slice(0, 12).map((hour): AdaptedHourFacts => {
      const cycle = hour.getSixtyCycle()
      return {
        branch: cycle.getEarthBranch().getName(),
        cycle: cycle.getName(),
        civilHour: hour.getSolarTime().getHour(),
        recommends: hour.getRecommends().map((item) => item.getName()),
        avoids: hour.getAvoids().map((item) => item.getName()),
      }
    })

    return {
      solarDate: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      lunarDate: lunar.toString(),
      dayCycle: lunar.getSixtyCycle().getName(),
      solarTerm: solar.getTerm().getName(),
      phenology: phenology.getName(),
      phenologyOrder: phenology.getIndex() % 3 + 1,
      phenologyBoundary: `${phenologyBoundary.getYear().toString().padStart(4, '0')}-${phenologyBoundary.getMonth().toString().padStart(2, '0')}-${phenologyBoundary.getDay().toString().padStart(2, '0')}T${phenologyBoundary.getHour().toString().padStart(2, '0')}:${phenologyBoundary.getMinute().toString().padStart(2, '0')}:${phenologyBoundary.getSecond().toString().padStart(2, '0')}`,
      fetus: fetus.getName(),
      fetusOccupancy: `${fetus.getFetusHeavenStem().getName()}${fetus.getFetusEarthBranch().getName()}`,
      fetusSide: fetus.getSide() === 0 ? '内' : '外',
      fetusDirection: fetus.getDirection().getName(),
      sixStar: lunar.getSixStar().getName(),
      twentyEightStar: twentyEightStar.getName(),
      twentyEightStarZone: twentyEightStar.getZone().getName(),
      twentyEightStarLand: twentyEightStar.getLand().getName(),
      pengZu: pengZu.getName(),
      pengZuHeavenStem: pengZu.getPengZuHeavenStem().getName(),
      pengZuEarthBranch: pengZu.getPengZuEarthBranch().getName(),
      duty: lunar.getDuty().getName(),
      dutyStar: lunar.getTwelveStar().getName(),
      ecliptic: lunar.getTwelveStar().getEcliptic().getName(),
      gods: lunar.getGods().map((item) => item.getName()),
      godDetails: lunar.getGods().map((item) => ({ id: `deity.${item.getIndex()}`, name: item.getName(), luck: item.getLuck().getName() })),
      recommends: lunar.getRecommends().map((item) => item.getName()),
      avoids: lunar.getAvoids().map((item) => item.getName()),
      hours,
    }
  }
}
