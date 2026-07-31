import { SolarDay } from 'tyme4ts';
/**
 * 十干禄固定映射表（典籍《三命通会·论十干禄》：「甲禄寅、乙禄卯、丙戊禄巳、丁己禄午、庚禄申、辛禄酉、壬禄亥、癸禄子」）。
 * 日干 → 禄神地支；丙戊同禄巳、丁己同禄午（戊寄巳、己寄午）。用于派生 AdaptedDayFacts.dayLu。
 */
const DAY_LU_BRANCH = {
    '甲': '寅', '乙': '卯', '丙': '巳', '戊': '巳',
    '丁': '午', '己': '午', '庚': '申', '辛': '酉',
    '壬': '亥', '癸': '子',
};
/** 官方 tyme4ts 公共 API 的只读隔离适配器。 */
export class Tyme4tsCalendarAdapter {
    /**
     * 读取指定公历日的基础历法事实、历注和十二时辰宜忌。
     * @param year - 公历年。
     * @param month - 公历月，范围 1 至 12。
     * @param day - 公历日。
     * @returns 与上游对象解耦的可序列化只读事实。
     */
    getDay(year, month, day) {
        const solar = SolarDay.fromYmd(year, month, day);
        const lunar = solar.getLunarDay();
        const fetus = lunar.getFetusDay();
        const phenology = solar.getPhenology();
        const phenologyBoundary = phenology.getJulianDay().getSolarTime();
        const twentyEightStar = lunar.getTwentyEightStar();
        const pengZu = lunar.getSixtyCycle().getPengZu();
        // 日禄（互禄+进禄，对齐吉真万年历）：
        //   互禄=日干自己的禄地支「X命互禄」；进禄=日支对应哪些天干的禄（日支反查禄干）「Y命进禄」
        const dayLuCycle = lunar.getSixtyCycle();
        const dayLuStem = dayLuCycle.getHeavenStem().getName();
        const dayLuBranch = dayLuCycle.getEarthBranch().getName();
        const luBranch = DAY_LU_BRANCH[dayLuStem];
        const advanceStems = Object.keys(DAY_LU_BRANCH).filter((s) => DAY_LU_BRANCH[s] === dayLuBranch);
        const dayLu = luBranch ? `${luBranch}命互禄${advanceStems.length ? ` ${advanceStems.join('、')}命进禄` : ''}` : '';
        const hours = lunar.getHours().slice(0, 12).map((hour) => {
            const cycle = hour.getSixtyCycle();
            return {
                branch: cycle.getEarthBranch().getName(),
                cycle: cycle.getName(),
                civilHour: hour.getSolarTime().getHour(),
                recommends: hour.getRecommends().map((item) => item.getName()),
                avoids: hour.getAvoids().map((item) => item.getName()),
            };
        });
        return {
            solarDate: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            lunarDate: lunar.toString(),
            dayCycle: lunar.getSixtyCycle().getName(),
            dayLu,
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
        };
    }
}
