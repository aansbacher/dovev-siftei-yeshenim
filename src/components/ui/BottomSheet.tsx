import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const startY = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return
    const dy = e.changedTouches[0].clientY - startY.current
    if (dy > 80) onClose()
    startY.current = null
  }

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute inset-x-0 bottom-0 bg-bg rounded-t-3xl shadow-2xl transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '90dvh', overflowY: 'auto' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-bg">
          <div className="h-1 w-10 rounded-full bg-gray-light" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-rule sticky top-5 bg-bg z-10">
          {title && (
            <div>
              <div className="text-[10px] font-bold tracking-[2px] text-gold mb-1">בַּעַל הַהִילּוּלָא</div>
              <h3 className="font-display text-xl font-bold text-ink leading-tight">{title}</h3>
            </div>
          )}
          <button
            onClick={onClose}
            className="mr-auto p-2 rounded-full hover:bg-surface-2 transition text-ink-soft hover:text-ink"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 pb-safe">
          {children}
        </div>
      </div>
    </div>
  )
}
