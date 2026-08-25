import { supabase } from './supabase'
import type { DailySpark, Subscriber, Tzaddik } from '../types'

const hebrewMonthAliases: Record<string, string[]> = {
  'חשוון': ['חשוון', 'חשון'],
  'חשון': ['חשון', 'חשוון'],
}

function monthQueryValues(month: string) {
  return hebrewMonthAliases[month] ?? [month]
}

const HONORIFIC_SUFFIX = /[\s,]+(?:זצ"ל|זצ״ל|זי"ע|זי״ע|נ"ע|נ״ע|זכותו יגן עלינו|זיע"א|זיע״א|זצוקלה"ה|זצוקללה"ה|ז"ל|ז״ל)\s*$/u

function cleanName(name: string): string {
  return (name ?? '').replace(HONORIFIC_SUFFIX, '').trim()
}

// Transform snake_case Supabase row → camelCase Tzaddik
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Tzaddik {
  return {
    id:             row.id,
    popularName:    cleanName(row.popular_name),
    fullName:       row.full_name,
    years:          row.years,
    quote:          row.quote,
    stream:         row.stream,
    role:           row.role,
    imageUrl:       row.image_url ?? row.image_filename,
    sources:        Array.isArray(row.sources) ? row.sources : (row.sources ? String(row.sources).split('|').map((s: string) => s.trim()).filter(Boolean) : []),
    importanceScore: row.importance_score ? Number(row.importance_score) : 0,
    biography:      row.biography,
    story:          row.story,
    torah:          row.torah,
    hebrewDay:      row.hebrew_day,
    hebrewMonth:    row.hebrew_month,
  }
}

export async function getTzaddikimForDate(hebrewDay: number, hebrewMonth: string) {
  const months = monthQueryValues(hebrewMonth)
  console.log('Fetching tzaddikim for:', hebrewDay, hebrewMonth, 'months:', months)

  const query = supabase
    .from('tzaddikim')
    .select('*')
    .eq('hebrew_day', hebrewDay)

  const filteredQuery = months.length === 1
    ? query.eq('hebrew_month', months[0])
    : query.or(months.map(m => `hebrew_month.eq.${m}`).join(','))

  const { data, error } = await filteredQuery
    .gte('importance_score', 30) // hide suppressed duplicates/junk (scored <=25)
    .order('importance_score', { ascending: false, nullsFirst: false })
    .limit(4)

  if (error) {
    console.error('Error fetching tzaddikim:', error)
    throw error
  }

  console.log('Fetched tzaddikim:', data?.length || 0, 'records')
  return (data ?? []).map(mapRow)
}

export async function getDailySparkForDate(hebrewDay: number, hebrewMonth: string, parasha: string) {
  const months = monthQueryValues(hebrewMonth)
  console.log('Fetching daily spark for:', hebrewDay, hebrewMonth, 'months:', months, 'parasha:', parasha)

  const dayQuery = supabase
    .from('daily_sparks')
    .select('*')
    .eq('hebrew_day', hebrewDay)

  const filteredDayQuery = months.length === 1
    ? dayQuery.eq('hebrew_month', months[0])
    : dayQuery.or(months.map(m => `hebrew_month.eq.${m}`).join(','))

  const { data: dayData, error: dayError } = await filteredDayQuery
    .limit(1)
    .single()

  if (dayError && dayError.code !== 'PGRST116') {
    throw dayError
  }

  if (dayData) {
    return dayData as DailySpark
  }

  if (!parasha || parasha === 'לא ידוע') {
    return null
  }

  const { data: parashaData, error: parashaError } = await supabase
    .from('daily_sparks')
    .select('*')
    .eq('parasha', parasha)
    .limit(1)
    .single()

  if (parashaError && parashaError.code !== 'PGRST116') {
    throw parashaError
  }

  return (parashaData as DailySpark) ?? null
}

export async function subscribeUser(subscriber: Subscriber) {
  const { email, phone, viaEmail, viaWhatsapp } = subscriber

  if (!viaEmail && !viaWhatsapp) {
    throw new Error('At least one delivery method is required')
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert({ email, phone, via_email: viaEmail, via_whatsapp: viaWhatsapp })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Subscriber
}
