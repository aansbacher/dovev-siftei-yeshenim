import { HDate, HebrewCalendar, flags } from '@hebcal/core'

// @hebcal/core month numbers: 1=Nisan, 2=Iyar, ..., 7=Tishrei, 8=Cheshvan, ..., 13=Adar II
const hebrewMonthNames: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
  7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר ב',
}

const hebrewNumerals = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט', 'ל']

function toHebrewNumeral(num: number): string {
  return hebrewNumerals[num] || num.toString()
}

export interface SpecialDay {
  label: string
  type: 'holiday' | 'fast' | 'roshchodesh' | 'omer' | 'special'
}

function getSpecialDays(hd: HDate): SpecialDay[] {
  try {
    const dayEvents = HebrewCalendar.calendar({
      start: hd,
      end: hd,
      il: true,
    })

    const result: SpecialDay[] = []
    const seen = new Set<string>()

    for (const event of dayEvents) {
      const f = event.getFlags()
      const heLabel = event.render('he')

      if (f & flags.ROSH_CHODESH) {
        if (!seen.has('rc')) { result.push({ label: 'ראש חודש', type: 'roshchodesh' }); seen.add('rc') }
      } else if (f & flags.MAJOR_FAST) {
        if (!seen.has(heLabel)) { result.push({ label: heLabel, type: 'fast' }); seen.add(heLabel) }
      } else if (f & flags.MINOR_FAST) {
        if (!seen.has(heLabel)) { result.push({ label: heLabel, type: 'fast' }); seen.add(heLabel) }
      } else if (f & flags.CHAG) {
        if (!seen.has(heLabel)) { result.push({ label: heLabel, type: 'holiday' }); seen.add(heLabel) }
      } else if (f & flags.OMER_COUNT) {
        if (!seen.has('omer')) { result.push({ label: heLabel, type: 'omer' }); seen.add('omer') }
      }
    }
    return result
  } catch {
    return []
  }
}

export function getHebrewDate(date: Date) {
  const hd = new HDate(date)
  const hebrewDay = hd.getDate()
  const hebrewDayNumeral = toHebrewNumeral(hebrewDay)
  const hebrewMonth = hebrewMonthNames[hd.getMonth()] ?? ''
  const hebrewDateDisplay = `${hebrewDayNumeral} ב${hebrewMonth}`
  const gregorianDate = date

  // Check if Elul (month of Slichot)
  const specialDays = getSpecialDays(hd)
  if (hd.getMonth() === 6 && !specialDays.find(s => s.label === 'אלול')) {
    specialDays.unshift({ label: 'חודש אלול', type: 'special' })
  }

  // Find the Shabbat of this week
  const saturday = new Date(date)
  const daysUntilSaturday = (6 - saturday.getDay() + 7) % 7
  saturday.setDate(saturday.getDate() + daysUntilSaturday)

  const events = HebrewCalendar.calendar({
    start: new HDate(saturday),
    end: new HDate(saturday),
    sedrot: true,
    il: true,
  })

  const parashaEvent = events.find(e => (e.getFlags() & flags.PARSHA_HASHAVUA) !== 0)
  const parasha = parashaEvent ? parashaEvent.render('he') : ''

  return {
    hebrewDay,
    hebrewDayNumeral,
    hebrewMonth,
    hebrewDateDisplay,
    parasha,
    gregorianDate,
    specialDays,
  }
}
