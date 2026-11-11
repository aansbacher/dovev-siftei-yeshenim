import { useSyncExternalStore, useEffect, useState } from 'react'

// ── Shared toggle (persisted, shared across components) ─────────────────────
let enabled = (() => { try { return localStorage.getItem('read-nikud') === '1' } catch { return false } })()
const listeners = new Set<() => void>()

export function setNikudEnabled(v: boolean) {
  enabled = v
  try { localStorage.setItem('read-nikud', v ? '1' : '0') } catch {}
  listeners.forEach((l) => l())
}

export function useNikudEnabled(): boolean {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => enabled,
    () => false,
  )
}

// ── Fetch + cache (one request per distinct text, ever) ─────────────────────
const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

function fetchNikud(text: string): Promise<string> {
  const hit = cache.get(text)
  if (hit !== undefined) return Promise.resolve(hit)
  const pending = inflight.get(text)
  if (pending) return pending
  const p = (async () => {
    try {
      const r = await fetch('/api/nikud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const j = await r.json()
      const out = j && typeof j.nikud === 'string' && j.nikud ? j.nikud : text
      cache.set(text, out)
      return out
    } catch {
      cache.set(text, text) // cache the fallback so we don't keep retrying
      return text
    } finally {
      inflight.delete(text)
    }
  })()
  inflight.set(text, p)
  return p
}

/** The text to display: nikud'd when the toggle is on (fetched once, cached), else the original. */
export function useNikud(text: string | null | undefined): string {
  const on = useNikudEnabled()
  const src = text ?? ''
  const [out, setOut] = useState(() => (on ? cache.get(src) ?? src : src))
  useEffect(() => {
    if (!on || !src.trim()) { setOut(src); return }
    const cached = cache.get(src)
    if (cached !== undefined) { setOut(cached); return }
    let alive = true
    setOut(src) // show plain text immediately; swap in nikud when it arrives
    fetchNikud(src).then((v) => { if (alive) setOut(v) })
    return () => { alive = false }
  }, [on, src])
  return out
}
