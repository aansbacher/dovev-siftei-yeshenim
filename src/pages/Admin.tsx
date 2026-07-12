import { useState, useEffect, useCallback, useRef } from 'react'

interface TzaddikRow {
  id: number
  popular_name: string
  full_name: string | null
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
  image_url: string
  biography: string
  story: string
  torah: string
  quote: string
}

const PAGE_SIZE = 25
const PW_KEY = 'admin_pw'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(PW_KEY))
  const [pwInput, setPwInput] = useState('')
  const [loginErr, setLoginErr] = useState('')

  const [tzaddikim, setTzaddikim] = useState<TzaddikRow[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)

  const [selected, setSelected] = useState<TzaddikRow | null>(null)
  const [form, setForm] = useState<FormData>({ image_url: '', biography: '', story: '', torah: '', quote: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-list?q=${encodeURIComponent(q)}&page=${p}&size=${PAGE_SIZE}`)
      const data = await res.json()
      setTzaddikim(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(search, page), 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [authed, search, page, load])

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
      setLoginErr('סיסמה שגויה')
    }
  }

  function select(t: TzaddikRow) {
    setSelected(t)
    setForm({
      image_url: t.image_url ?? '',
      biography: t.biography ?? '',
      story: t.story ?? '',
      torah: t.torah ?? '',
      quote: t.quote ?? '',
    })
    setMsg(null)
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    setMsg(null)
    const pw = sessionStorage.getItem(PW_KEY) ?? ''
    try {
      const res = await fetch('/api/admin-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, id: selected.id, fields: form }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ text: 'נשמר בהצלחה ✓', ok: true })
        const updated = { ...selected, ...form }
        setSelected(updated)
        setTzaddikim(prev => prev.map(t => t.id === selected.id ? { ...t, ...form } : t))
      } else {
        setMsg({ text: `שגיאה: ${data.error}`, ok: false })
      }
    } catch (e: any) {
      setMsg({ text: `שגיאה: ${e.message}`, ok: false })
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
        setForm(f => ({ ...f, image_url: data.url }))
        setMsg({ text: 'תמונה הועלתה — לחץ שמור לאישור', ok: true })
      } else {
        setMsg({ text: `שגיאת העלאה: ${data.error}`, ok: false })
      }
    } catch (e: any) {
      setMsg({ text: `שגיאת העלאה: ${e.message}`, ok: false })
    }
    setUploading(false)
  }

  const s: Record<string, React.CSSProperties> = {
    root: { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl' as const },
    sidebar: { width: 300, flexShrink: 0, borderLeft: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' as const },
    searchWrap: { padding: 12, borderBottom: '1px solid #e2e8f0' },
    searchInput: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0', fontSize: 14, boxSizing: 'border-box' as const, outline: 'none' },
    list: { flex: 1, overflowY: 'auto' as const },
    item: (active: boolean): React.CSSProperties => ({
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
      cursor: 'pointer', borderBottom: '1px solid #f0f4f8',
      backgroundColor: active ? '#ebf4ff' : 'transparent',
    }),
    thumb: { width: 40, height: 40, borderRadius: 6, objectFit: 'cover' as const, flexShrink: 0, backgroundColor: '#e2e8f0' },
    itemName: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
    itemMeta: { fontSize: 11, color: '#718096' },
    pagination: { display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderTop: '1px solid #e2e8f0' },
    pgBtn: { flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid #cbd5e0', cursor: 'pointer', fontSize: 13, backgroundColor: '#fff' },
    editor: { flex: 1, padding: '32px 40px', overflowY: 'auto' as const, backgroundColor: '#f7fafc' },
    fieldLabel: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#2d3748' },
    textInput: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0', fontSize: 13, boxSizing: 'border-box' as const, backgroundColor: '#fff', outline: 'none' },
    textarea: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0', fontSize: 13, resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.65, boxSizing: 'border-box' as const, backgroundColor: '#fff', outline: 'none' },
    saveBtn: { padding: '10px 28px', borderRadius: 8, backgroundColor: '#1E2A38', color: '#F7F3EA', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', border: 'none' },
    uploadBtn: { padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e0', cursor: 'pointer', fontSize: 13, backgroundColor: '#fff' },
  }

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
          <button
            onClick={login}
            style={{ padding: '10px 0', borderRadius: 8, backgroundColor: '#C9A84C', color: '#1E2A38', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', border: 'none' }}
          >
            כניסה
          </button>
          {loginErr && <p style={{ color: '#fc8181', margin: 0, fontSize: 14 }}>{loginErr}</p>}
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.searchWrap}>
          <input
            type="search"
            placeholder="חיפוש שם..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={s.searchInput}
          />
        </div>
        <div style={s.list}>
          {loading && <div style={{ padding: 16, color: '#a0aec0', fontSize: 13 }}>טוען...</div>}
          {tzaddikim.map(t => (
            <div key={t.id} onClick={() => select(t)} style={s.item(selected?.id === t.id)}>
              <img
                src={t.image_url ?? ''}
                alt=""
                onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
                style={s.thumb}
              />
              <div style={{ minWidth: 0 }}>
                <div style={s.itemName}>{t.popular_name}</div>
                <div style={s.itemMeta}>{t.hebrew_month} {t.hebrew_day} · {t.importance_score ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={s.pagination}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={s.pgBtn}>הקודם</button>
          <span style={{ fontSize: 13, color: '#718096', whiteSpace: 'nowrap' }}>{page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={tzaddikim.length < PAGE_SIZE} style={s.pgBtn}>הבא</button>
        </div>
      </div>

      {/* Editor */}
      <div style={s.editor}>
        {!selected ? (
          <div style={{ color: '#a0aec0', fontSize: 18, textAlign: 'center', marginTop: 100 }}>
            בחר צדיק מהרשימה לעריכה
          </div>
        ) : (
          <div style={{ maxWidth: 680 }}>
            <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: '0 0 4px' }}>{selected.popular_name}</h2>
            <p style={{ color: '#718096', margin: '0 0 28px', fontSize: 13 }}>
              {selected.full_name && <>{selected.full_name} · </>}{selected.hebrew_month} {selected.hebrew_day}
              {selected.importance_score != null && <> · ציון חשיבות: {selected.importance_score}</>}
            </p>

            {/* Image field */}
            <div style={{ marginBottom: 22 }}>
              <label style={s.fieldLabel}>תמונה</label>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 90, height: 90, borderRadius: 8, overflow: 'hidden', flexShrink: 0, backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                  {form.image_url && (
                    <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    placeholder="הדבק URL של תמונה"
                    value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    style={{ ...s.textInput, marginBottom: 8 }}
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])}
                  />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} style={s.uploadBtn}>
                    {uploading ? 'מעלה...' : 'העלאת קובץ מהמחשב'}
                  </button>
                </div>
              </div>
            </div>

            {/* Text fields */}
            {([
              { key: 'biography', label: 'ביוגרפיה', rows: 4 },
              { key: 'story',     label: 'סיפור',    rows: 5 },
              { key: 'torah',     label: 'תורה',     rows: 4 },
              { key: 'quote',     label: 'ציטוט',    rows: 2 },
            ] as const).map(({ key, label, rows }) => (
              <div key={key} style={{ marginBottom: 20 }}>
                <label style={s.fieldLabel}>{label}</label>
                <textarea
                  rows={rows}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={s.textarea}
                />
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <button onClick={save} disabled={saving} style={s.saveBtn}>
                {saving ? 'שומר...' : 'שמור שינויים'}
              </button>
              {msg && (
                <span style={{ fontSize: 14, color: msg.ok ? '#38a169' : '#e53e3e' }}>
                  {msg.text}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
