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

export function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(PW_KEY))
  const [pwInput, setPwInput] = useState('')
  const [loginErr, setLoginErr] = useState('')

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif', direction: 'rtl' }}>

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
  )
}
