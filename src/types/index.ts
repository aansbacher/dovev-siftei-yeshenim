export interface Tzaddik {
  id: number
  popularName: string
  fullName?: string
  years?: string
  quote?: string
  stream?: string
  role?: string
  imageUrl?: string
  sources?: string[]
  importanceScore?: number
  // Content tabs
  biography?: string
  story?: string
  torah?: string
  // Date
  hebrewDay?: number
  hebrewMonth?: string
}

export interface DailySpark {
  id: number
  content: string
  source: string
  relatedTo?: string
}

export interface Subscriber {
  id?: number
  email: string
  phone?: string
  viaEmail: boolean
  viaWhatsapp: boolean
  created_at?: string
}
