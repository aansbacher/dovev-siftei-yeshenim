import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const HEBREW_MONTHS = ['תשרי','חשוון','כסלו','טבת','שבט','אדר','אדר א','ניסן','אייר','סיוון','סיון','תמוז','אב','אלול']

interface TzaddikRow {
  id: number
  popular_name: string
  full_name: string | null
  years: string | null
  stream: string | null
  role: string | null
  hebrew_month: string | null
  hebrew_day: number | null
  image_url: string | null
  biography: string | null
  story: string | null
  torah: string | null
  quote: string | null
  importance_score: number | null
}

type FormData = {
  popular_name: string
  full_name: string
  years: string
  stream: string
  role: string
  hebrew_month: string
  hebrew_day: string
  importance_score: string
  image_url: string
  biography: string
  story: string
  torah: string
  quote: string
}

const PAGE_SIZE = 30
const PW_KEY = 'admin_pw'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function rowToForm(t: TzaddikRow): FormData {
  return {
    popular_name:    t.popular_name ?? '',
    full_name:       t.full_name ?? '',
    years:           t.years ?? '',
    stream:          t.stream ?? '',
    role:            t.role ?? '',
    hebrew_month:    t.hebrew_month ?? '',
    hebrew_day:      t.hebrew_day != null ? String(t.hebrew_day) : '',
    importance_score: t.importance_score != null ? String(t.importance_score) : '',
    image_url:       t.image_url ?? '',
    biography:       t.biography ?? '',
    story:           t.story ?? '',
    torah:           t.torah ?? '',
    quote:           t.quote ?? '',
  }
}

type Mode = 'intake' | 'queue' | 'edit'

function ModeBar({ mode, setMode, onLogout }: { mode: string; setMode: (m: Mode) => void; onLogout: () => void }) {
  const btn = (active: boolean): React.CSSProperties => ({ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: active ? '#1E2A38' : '#edf2f7', color: active ? '#F7F3EA' : '#4a5568' })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #e2e8f0', background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
      <button onClick={() => setMode('intake')} style={btn(mode === 'intake')}>הזנת תוכן</button>
      <button onClick={() => setMode('queue')} style={btn(mode === 'queue')}>ממתינים לעיבוד</button>
      <button onClick={() => setMode('edit')} style={btn(mode === 'edit')}>עריכה ידנית</button>
      <button onClick={onLogout} style={{ marginInlineStart: 'auto', padding: '7px 12px', borderRadius: 7, border: '1px solid #cbd5e0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#718096' }}>יציאה</button>
    </div>
  )
}

/** Mobile-first content intake: pick a tzaddik (or new), paste text and/or upload photos → queued for processing. */
function Intake() {
  const [existing, setExisting] = useState(true)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ id: number; popular_name: string; hebrew_month: string | null; hebrew_day: number | null }[]>([])
  const [picked, setPicked] = useState<{ id: number; name: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [newMonth, setNewMonth] = useState('')
  const [newDay, setNewDay] = useState('')
  const [note, setNote] = useState('')
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!existing || q.trim().length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('tzaddikim').select('id,popular_name,hebrew_month,hebrew_day').ilike('popular_name', `%${q.trim()}%`).limit(8)
      setResults((data ?? []) as typeof results)
    }, 300)
    return () => clearTimeout(t)
  }, [q, existing])

  async function addImage(file: File) {
    setUploading(true); setMsg(null)
    try {
      const pw = sessionStorage.getItem(PW_KEY) ?? ''
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/admin-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, base64, filename: file.name }) })
      const data = await res.json()
      if (res.ok && data.url) setImages(prev => [...prev, data.url as string])
      else setMsg({ text: `שגיאת העלאה: ${data.error}`, ok: false })
    } catch (e) { setMsg({ text: `שגיאה: ${e instanceof Error ? e.message : 'unknown'}`, ok: false }) }
    setUploading(false)
  }

  async function submit() {
    if (existing && !picked) { setMsg({ text: 'בחרו צדיק קיים', ok: false }); return }
    if (!existing && !newName.trim()) { setMsg({ text: 'הזינו שם צדיק', ok: false }); return }
    if (!text.trim() && images.length === 0) { setMsg({ text: 'הוסיפו טקסט או תמונה', ok: false }); return }
    setBusy(true); setMsg(null)
    try {
      const content = [
        note.trim() && `הערה: ${note.trim()}`,
        text.trim(),
        images.length > 0 && 'תמונות:\n' + images.join('\n'),
      ].filter(Boolean).join('\n\n')
      const { error } = await supabase.from('suggestions').insert({
        type: existing ? 'add_info' : 'new_tzaddik',
        tzaddik_id: existing ? picked!.id : null,
        tzaddik_name: existing ? picked!.name : newName.trim(),
        hebrew_date: existing ? null : (`${newDay} ${newMonth}`.trim() || null),
        content,
        sources: 'הזנה מהאדמין',
        submitter_name: 'admin',
      })
      if (error) throw error
      // auto-trigger the processor (fire-and-forget; the queue tab also has a manual button)
      void runProcessor(sessionStorage.getItem(PW_KEY) ?? '')
      setMsg({ text: 'נשלח בהצלחה ✓ נכנס לעיבוד אוטומטי — עקוב בטאב "ממתינים לעיבוד"', ok: true })
      setText(''); setNote(''); setImages([]); setPicked(null); setQ(''); setNewName(''); setNewMonth(''); setNewDay('')
    } catch (e) { setMsg({ text: `שגיאה: ${e instanceof Error ? e.message : 'unknown'}`, ok: false }) }
    setBusy(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e0', fontSize: 16, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', background: '#fff' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#2d3748' }
  const toggle = (active: boolean): React.CSSProperties => ({ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: active ? '#1E2A38' : '#edf2f7', color: active ? '#fff' : '#4a5568' })

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 60px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1E2A38', margin: '4px 0 4px' }}>הזנת תוכן</h1>
      <p style={{ fontSize: 14, color: '#718096', margin: '0 0 20px', lineHeight: 1.6 }}>הוסיפו טקסט או צילום של סיפור/דיוקן. התוכן ייכנס לעיבוד: שכתוב לפורמט האתר, אימות והכנסה.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setExisting(true)} style={toggle(existing)}>צדיק קיים</button>
        <button onClick={() => setExisting(false)} style={toggle(!existing)}>צדיק חדש</button>
      </div>

      {existing ? (
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>חיפוש צדיק</label>
          {picked ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#ebf4ff', border: '1px solid #bee3f8' }}>
              <span style={{ fontWeight: 700, color: '#1E2A38' }}>{picked.name}</span>
              <button onClick={() => { setPicked(null); setQ('') }} style={{ background: 'none', border: 'none', color: '#3182ce', cursor: 'pointer', fontSize: 14 }}>שנה</button>
            </div>
          ) : (
            <>
              <input style={inp} placeholder="הקלידו שם..." value={q} onChange={e => setQ(e.target.value)} />
              {results.length > 0 && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, marginTop: 6, overflow: 'hidden', background: '#fff' }}>
                  {results.map(r => (
                    <div key={r.id} onClick={() => { setPicked({ id: r.id, name: r.popular_name }); setResults([]) }} style={{ padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f4f8', fontSize: 14 }}>
                      {r.popular_name} <span style={{ color: '#a0aec0', fontSize: 12 }}>· {r.hebrew_month} {r.hebrew_day}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>שם הצדיק החדש</label>
          <input style={{ ...inp, marginBottom: 10 }} placeholder="לדוגמה: רבי..." value={newName} onChange={e => setNewName(e.target.value)} />
          <div style={{ display: 'flex', gap: 10 }}>
            <select style={{ ...inp, flex: 2 }} value={newMonth} onChange={e => setNewMonth(e.target.value)}>
              <option value="">חודש פטירה</option>
              {HEBREW_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input style={{ ...inp, flex: 1 }} type="number" min={1} max={30} placeholder="יום" value={newDay} onChange={e => setNewDay(e.target.value)} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>טקסט (הדביקו סיפור / וורט / מידע)</label>
        <textarea rows={6} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={text} onChange={e => setText(e.target.value)} placeholder="אפשר להשאיר ריק אם מעלים רק תמונה" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>תמונות (צילום של סיפור מספר / צילום מסך / דיוקן)</label>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = '' }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: '100%', padding: '14px', borderRadius: 10, border: '2px dashed #cbd5e0', background: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#4a5568' }}>
          {uploading ? 'מעלה...' : '+ הוספת תמונה'}
        </button>
        {images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {images.map((u, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={u} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, insetInlineEnd: -6, width: 20, height: 20, borderRadius: '50%', background: '#e53e3e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '20px', padding: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>הערה (אופציונלי)</label>
        <input style={inp} placeholder={'לדוגמה: "לשכתב", "להוסיף סיפור", "זה הדיוקן שלו"'} value={note} onChange={e => setNote(e.target.value)} />
      </div>

      <button onClick={submit} disabled={busy} style={{ width: '100%', padding: '15px', borderRadius: 12, background: '#C9A84C', color: '#1E2A38', fontWeight: 800, fontSize: 17, border: 'none', cursor: 'pointer' }}>
        {busy ? 'שולח...' : 'שליחה לעיבוד'}
      </button>
      {msg && <p style={{ textAlign: 'center', marginTop: 14, fontSize: 15, fontWeight: 600, color: msg.ok ? '#2f855a' : '#e53e3e' }}>{msg.text}</p>}
    </div>
  )
}

interface SuggestionRow {
  id: number
  created_at: string
  type: string
  tzaddik_id: number | null
  tzaddik_name: string | null
  hebrew_date: string | null
  content: string | null
  sources: string | null
  status: string | null
}

const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  pending:      { label: 'ממתין',  bg: '#fefcbf', fg: '#975a16' },
  processing:   { label: 'בעיבוד…', bg: '#bee3f8', fg: '#2a4365' },
  needs_review: { label: 'טיוטה — לבדיקה', bg: '#fbd38d', fg: '#7b341e' },
  done:         { label: 'טופל ✓', bg: '#c6f6d5', fg: '#22543d' },
  rejected:     { label: 'נדחה',   bg: '#fed7d7', fg: '#822727' },
}

// Trigger the automatic processor (fire-and-forget on submit, or awaited from the queue button).
async function runProcessor(pw: string): Promise<{ done: boolean; message?: string }> {
  try {
    const res = await fetch('/api/process-queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) })
    const data = await res.json().catch(() => ({}))
    return { done: !data.processed, message: data.name || data.message || data.error }
  } catch { return { done: true } }
}

/** Read-only view of the submission queue so the owner can confirm intake landed and track processing. */
function Queue() {
  const [rows, setRows] = useState<SuggestionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [working, setWorking] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true); setErr('')
    try {
      const pw = sessionStorage.getItem(PW_KEY) ?? ''
      const res = await fetch('/api/admin-suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, action: 'list' }) })
      const data = await res.json()
      if (res.ok) setRows(data.rows as SuggestionRow[])
      else setErr(`שגיאה: ${data.error}`)
    } catch (e) { setErr(`שגיאה: ${e instanceof Error ? e.message : 'unknown'}`) }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function setStatus(id: number, status: string) {
    const pw = sessionStorage.getItem(PW_KEY) ?? ''
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    await fetch('/api/admin-suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, action: 'set_status', id, status }) })
  }

  const OPEN = ['pending', 'processing', 'needs_review']
  const shown = rows.filter(r => filter === 'all' || OPEN.includes(r.status ?? 'pending'))
  const openCount = rows.filter(r => (r.status ?? 'pending') === 'pending').length

  async function processAll() {
    const pw = sessionStorage.getItem(PW_KEY) ?? ''
    for (let i = 0; i < 25; i++) {
      setWorking(`מעבד פריט ${i + 1}…`)
      const r = await runProcessor(pw)
      await refresh()
      if (r.done) break
    }
    setWorking(null)
  }

  const chip = (active: boolean): React.CSSProperties => ({ padding: '6px 12px', borderRadius: 7, border: '1px solid #cbd5e0', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? '#1E2A38' : '#fff', color: active ? '#fff' : '#4a5568' })

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1E2A38', margin: 0 }}>ממתינים לעיבוד</h1>
        {openCount > 0 && <span style={{ background: '#C9A84C', color: '#1E2A38', fontWeight: 800, fontSize: 13, borderRadius: 999, padding: '2px 10px' }}>{openCount}</span>}
        <button onClick={processAll} disabled={!!working} style={{ marginInlineStart: 'auto', ...chip(true) }}>{working || 'עבד עכשיו ⚡'}</button>
        <button onClick={refresh} style={chip(false)}>רענון ⟳</button>
      </div>
      <p style={{ fontSize: 14, color: '#718096', margin: '0 0 16px', lineHeight: 1.6 }}>כל מה שהוזן דרך "הזנת תוכן" נשמר כאן. "עבד עכשיו" מריץ את המעבד האוטומטי: קורא, מאמת, וכותב. מה שלא אומת נשמר כטיוטה לבדיקה ולא עולה לאוויר.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setFilter('open')} style={chip(filter === 'open')}>פתוחים</button>
        <button onClick={() => setFilter('all')} style={chip(filter === 'all')}>הכול</button>
      </div>

      {loading && <div style={{ color: '#a0aec0', fontSize: 14 }}>טוען...</div>}
      {err && <div style={{ color: '#e53e3e', fontSize: 14 }}>{err}</div>}
      {!loading && !err && shown.length === 0 && <div style={{ color: '#a0aec0', fontSize: 15, textAlign: 'center', marginTop: 40 }}>אין פריטים</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {shown.map(r => {
          const st = STATUS_META[r.status ?? 'pending'] ?? STATUS_META.pending
          const imgs = (r.content ?? '').match(/https?:\/\/\S+\.(?:jpg|jpeg|png|webp|gif)/gi) ?? []
          const noteMatch = (r.content ?? '').match(/הערה:\s*([^\n]+)/)
          const bodyText = (r.content ?? '').replace(/תמונות:[\s\S]*$/, '').replace(/הערה:\s*[^\n]+\n?/, '').trim()
          const when = new Date(r.created_at).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
          return (
            <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ background: st.bg, color: st.fg, fontWeight: 700, fontSize: 12, borderRadius: 6, padding: '2px 8px' }}>{st.label}</span>
                <span style={{ background: r.type === 'new_tzaddik' ? '#e9d8fd' : '#e2e8f0', color: '#4a5568', fontWeight: 700, fontSize: 12, borderRadius: 6, padding: '2px 8px' }}>{r.type === 'new_tzaddik' ? 'צדיק חדש' : 'עיבוי קיים'}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1E2A38' }}>{r.tzaddik_name ?? '—'}</span>
                {r.tzaddik_id && <span style={{ fontSize: 12, color: '#a0aec0' }}>#{r.tzaddik_id}</span>}
                {r.hebrew_date && <span style={{ fontSize: 12, color: '#718096' }}>· {r.hebrew_date}</span>}
                <span style={{ marginInlineStart: 'auto', fontSize: 12, color: '#a0aec0' }}>{when}</span>
              </div>
              {noteMatch && <div style={{ fontSize: 13, color: '#975a16', background: '#fffbeb', borderRadius: 7, padding: '6px 10px', marginBottom: 8 }}>הערה: {noteMatch[1]}</div>}
              {bodyText && <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 8, maxHeight: 120, overflow: 'auto' }}>{bodyText}</div>}
              {imgs.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {imgs.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer">
                      <img src={u} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    </a>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {(r.status ?? 'pending') !== 'done' && <button onClick={() => setStatus(r.id, 'done')} style={{ ...chip(false), color: '#22543d', borderColor: '#9ae6b4' }}>סמן כטופל ✓</button>}
                {(r.status ?? 'pending') === 'done' && <button onClick={() => setStatus(r.id, 'pending')} style={chip(false)}>החזר לממתין</button>}
                {(r.status ?? 'pending') !== 'rejected' && <button onClick={() => setStatus(r.id, 'rejected')} style={{ ...chip(false), color: '#822727', borderColor: '#feb2b2' }}>דחה</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(PW_KEY))
  const [pwInput, setPwInput] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [mode, setMode] = useState<Mode>('intake')

  const [tzaddikim, setTzaddikim] = useState<TzaddikRow[]>([])
  const [search, setSearch] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  const [selected, setSelected] = useState<TzaddikRow | null>(null)
  const [form, setForm] = useState<FormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (q: string, month: string, day: string, p: number) => {
    setLoading(true)
    setLoadErr('')
    try {
      let query = supabase
        .from('tzaddikim')
        .select('id, popular_name, full_name, years, stream, role, hebrew_month, hebrew_day, image_url, biography, story, torah, quote, importance_score')
        .order('importance_score', { ascending: false, nullsFirst: false })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)

      if (q)     query = (query as any).ilike('popular_name', `%${q}%`)
      if (month) query = (query as any).eq('hebrew_month', month)
      if (day)   query = (query as any).eq('hebrew_day', parseInt(day))

      const { data, error } = await query
      if (error) { setLoadErr(`שגיאה: ${error.message}`); return }
      setTzaddikim((data ?? []) as TzaddikRow[])
    } catch (e: unknown) {
      setLoadErr(`שגיאה: ${e instanceof Error ? e.message : 'unknown'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(search, filterMonth, filterDay, page), 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [authed, search, filterMonth, filterDay, page, load])

  async function login() {
    setLoginErr('')
    const res = await fetch('/api/admin-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwInput, checkOnly: true }),
    })
    if (res.ok) {
      sessionStorage.setItem(PW_KEY, pwInput)
      setAuthed(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setLoginErr(`שגיאה: ${data.error ?? res.status}`)
    }
  }

  function select(t: TzaddikRow) {
    setSelected(t)
    setForm(rowToForm(t))
    setMsg(null)
  }

  function setField(key: keyof FormData, value: string) {
    setForm(f => f ? { ...f, [key]: value } : f)
  }

  async function save() {
    if (!selected || !form) return
    setSaving(true)
    setMsg(null)
    const pw = sessionStorage.getItem(PW_KEY) ?? ''
    const fields: Record<string, unknown> = {
      popular_name:    form.popular_name || null,
      full_name:       form.full_name || null,
      years:           form.years || null,
      stream:          form.stream || null,
      role:            form.role || null,
      hebrew_month:    form.hebrew_month || null,
      hebrew_day:      form.hebrew_day ? parseInt(form.hebrew_day) : null,
      importance_score: form.importance_score ? parseInt(form.importance_score) : null,
      image_url:       form.image_url || null,
      biography:       form.biography || null,
      story:           form.story || null,
      torah:           form.torah || null,
      quote:           form.quote || null,
    }
    try {
      const res = await fetch('/api/admin-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, id: selected.id, fields }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ text: 'נשמר בהצלחה ✓', ok: true })
        const updated = { ...selected, ...fields } as TzaddikRow
        setSelected(updated)
        setTzaddikim(prev => prev.map(t => t.id === selected.id ? updated : t))
      } else {
        setMsg({ text: `שגיאה: ${data.error}`, ok: false })
      }
    } catch (e: unknown) {
      setMsg({ text: `שגיאה: ${e instanceof Error ? e.message : 'unknown'}`, ok: false })
    }
    setSaving(false)
  }

  async function uploadImage(file: File) {
    setUploading(true)
    setMsg(null)
    const pw = sessionStorage.getItem(PW_KEY) ?? ''
    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/admin-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, base64, filename: file.name }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setField('image_url', data.url)
        setMsg({ text: 'תמונה הועלתה — לחץ שמור לאישור', ok: true })
      } else {
        setMsg({ text: `שגיאת העלאה: ${data.error}`, ok: false })
      }
    } catch (e: unknown) {
      setMsg({ text: `שגיאת העלאה: ${e instanceof Error ? e.message : 'unknown'}`, ok: false })
    }
    setUploading(false)
  }

  // ── styles ──────────────────────────────────────────────────────────────────
  const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #cbd5e0', fontSize: 13, boxSizing: 'border-box', backgroundColor: '#fff', outline: 'none', fontFamily: 'inherit' }
  const ta: React.CSSProperties = { ...inp, resize: 'vertical', lineHeight: 1.65 }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.04em' }
  const section: React.CSSProperties = { marginBottom: 28 }
  const sectionTitle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a0aec0', marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }

  if (!authed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#1E2A38', color: '#F7F3EA', direction: 'rtl' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 280 }}>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>ממשק אדמין</h1>
          <input
            type="password"
            placeholder="סיסמה"
            value={pwInput}
            onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            autoFocus
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #4a5568', backgroundColor: '#2C3E52', color: '#F7F3EA', fontSize: 16, outline: 'none' }}
          />
          <button onClick={login} style={{ padding: '10px 0', borderRadius: 8, backgroundColor: '#C9A84C', color: '#1E2A38', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', border: 'none' }}>
            כניסה
          </button>
          {loginErr && <p style={{ color: '#fc8181', margin: 0, fontSize: 14 }}>{loginErr}</p>}
        </div>
      </div>
    )
  }

  if (mode === 'intake' || mode === 'queue') {
    return (
      <div style={{ minHeight: '100vh', direction: 'rtl', fontFamily: 'system-ui,-apple-system,sans-serif', background: '#f7fafc' }}>
        <ModeBar mode={mode} setMode={setMode} onLogout={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false) }} />
        {mode === 'intake' ? <Intake /> : <Queue />}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif', direction: 'rtl' }}>
      <ModeBar mode={mode} setMode={setMode} onLogout={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false) }} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 290, flexShrink: 0, borderLeft: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>

        {/* Filters */}
        <div style={{ padding: 12, borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="search"
            placeholder="חיפוש שם..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{ ...inp, fontSize: 14 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              value={filterMonth}
              onChange={e => { setFilterMonth(e.target.value); setFilterDay(''); setPage(0) }}
              style={{ ...inp, flex: 2 }}
            >
              <option value="">כל החודשים</option>
              {HEBREW_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              type="number"
              placeholder="יום"
              min={1} max={30}
              value={filterDay}
              onChange={e => { setFilterDay(e.target.value); setPage(0) }}
              style={{ ...inp, flex: 1 }}
            />
          </div>
          {(filterMonth || filterDay || search) && (
            <button onClick={() => { setSearch(''); setFilterMonth(''); setFilterDay(''); setPage(0) }}
              style={{ fontSize: 12, color: '#718096', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', padding: 0 }}>
              נקה סינון ✕
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ padding: 16, color: '#a0aec0', fontSize: 13 }}>טוען...</div>}
          {loadErr && <div style={{ padding: 16, color: '#e53e3e', fontSize: 13 }}>{loadErr}</div>}
          {!loading && !loadErr && tzaddikim.length === 0 && (
            <div style={{ padding: 16, color: '#a0aec0', fontSize: 13 }}>לא נמצאו תוצאות</div>
          )}
          {tzaddikim.map(t => (
            <div
              key={t.id}
              onClick={() => select(t)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f4f8', backgroundColor: selected?.id === t.id ? '#ebf4ff' : 'transparent' }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 6, flexShrink: 0, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                {t.image_url && (
                  <img src={t.image_url} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.popular_name}</div>
                <div style={{ fontSize: 11, color: '#718096' }}>{t.hebrew_month} {t.hebrew_day}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderTop: '1px solid #e2e8f0' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid #cbd5e0', cursor: 'pointer', fontSize: 13, backgroundColor: '#fff' }}>הקודם</button>
          <span style={{ fontSize: 13, color: '#718096' }}>{page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={tzaddikim.length < PAGE_SIZE}
            style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid #cbd5e0', cursor: 'pointer', fontSize: 13, backgroundColor: '#fff' }}>הבא</button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div style={{ flex: 1, padding: '28px 40px', overflowY: 'auto', backgroundColor: '#f7fafc' }}>
        {!selected || !form ? (
          <div style={{ color: '#a0aec0', fontSize: 18, textAlign: 'center', marginTop: 100 }}>
            בחר צדיק מהרשימה לעריכה
          </div>
        ) : (
          <div style={{ maxWidth: 700 }}>

            {/* ── כותרת ── */}
            <div style={{ ...section }}>
              <div style={sectionTitle}>פרטי זיהוי</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>שם מוכר</label>
                  <input style={inp} value={form.popular_name} onChange={e => setField('popular_name', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>שם מלא</label>
                  <input style={inp} value={form.full_name} onChange={e => setField('full_name', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>שנים</label>
                  <input style={inp} placeholder="לדוגמה: 1700–1760" value={form.years} onChange={e => setField('years', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>ציון חשיבות</label>
                  <input style={inp} type="number" min={0} max={100} value={form.importance_score} onChange={e => setField('importance_score', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>זרם</label>
                  <input style={inp} placeholder="חסידות / ליטאי / ספרדי..." value={form.stream} onChange={e => setField('stream', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>תפקיד</label>
                  <input style={inp} placeholder="ראש ישיבה / מקובל / פוסק..." value={form.role} onChange={e => setField('role', e.target.value)} />
                </div>
              </div>
            </div>

            {/* ── תאריך פטירה ── */}
            <div style={{ ...section }}>
              <div style={sectionTitle}>תאריך יארצייט</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 2 }}>
                  <label style={lbl}>חודש</label>
                  <select style={{ ...inp }} value={form.hebrew_month} onChange={e => setField('hebrew_month', e.target.value)}>
                    <option value="">— בחר חודש —</option>
                    {HEBREW_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>יום</label>
                  <input style={inp} type="number" min={1} max={30} value={form.hebrew_day} onChange={e => setField('hebrew_day', e.target.value)} />
                </div>
              </div>
            </div>

            {/* ── תמונה ── */}
            <div style={{ ...section }}>
              <div style={sectionTitle}>תמונה</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 100, height: 100, borderRadius: 10, overflow: 'hidden', flexShrink: 0, backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                  {form.image_url && <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>URL תמונה</label>
                  <input type="url" style={{ ...inp, marginBottom: 8 }} placeholder="https://..." value={form.image_url} onChange={e => setField('image_url', e.target.value)} />
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e0', cursor: 'pointer', fontSize: 13, backgroundColor: '#fff' }}>
                    {uploading ? 'מעלה...' : 'העלאת קובץ'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── תוכן ── */}
            <div style={{ ...section }}>
              <div style={sectionTitle}>תוכן</div>
              {([
                { key: 'biography', label: 'ביוגרפיה', rows: 4 },
                { key: 'story',     label: 'סיפור',    rows: 5 },
                { key: 'torah',     label: 'תורה',     rows: 4 },
                { key: 'quote',     label: 'ציטוט',    rows: 2 },
              ] as const).map(({ key, label, rows }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={lbl}>{label}</label>
                  <textarea rows={rows} style={ta} value={form[key]} onChange={e => setField(key, e.target.value)} />
                </div>
              ))}
            </div>

            {/* ── שמור ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 40 }}>
              <button onClick={save} disabled={saving}
                style={{ padding: '11px 32px', borderRadius: 8, backgroundColor: '#1E2A38', color: '#F7F3EA', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', border: 'none' }}>
                {saving ? 'שומר...' : 'שמור שינויים'}
              </button>
              {msg && <span style={{ fontSize: 14, color: msg.ok ? '#38a169' : '#e53e3e' }}>{msg.text}</span>}
            </div>

          </div>
        )}
      </div>
    </div>
    </div>
  )
}
