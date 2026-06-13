export interface RatingEntry {
  date: string
  title: string
  year: number
  uri: string
  rating: number
}

export const ratingMeta = [
  { key: '0.5', label: '0.5', color: '#7f1d1d' },
  { key: '1.0', label: '1', color: '#dc2626' },
  { key: '1.5', label: '1.5', color: '#ea580c' },
  { key: '2.0', label: '2', color: '#d97706' },
  { key: '2.5', label: '2.5', color: '#eab308' },
  { key: '3.0', label: '3', color: '#65a30d' },
  { key: '3.5', label: '3.5', color: '#22c55e' },
  { key: '4.0', label: '4', color: '#16a34a' },
  { key: '4.5', label: '4.5', color: '#0d9488' },
  { key: '5.0', label: '5', color: '#2563eb' }
]

export const ratingKeys = ratingMeta.map(m => m.key)
export const ratingLookup = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

export function buildRatingCategories() {
  const cats: Record<string, { name: string, color: string }> = {}
  for (const m of ratingMeta) {
    cats[m.key] = { name: m.label, color: m.color }
  }
  return cats
}

export function groupRatingsByYear(ratings: RatingEntry[], minYear = 1990) {
  const map = new Map<number, Map<number, number>>()

  for (const entry of ratings) {
    if (entry.year < minYear) continue
    if (!map.has(entry.year)) map.set(entry.year, new Map())
    const rm = map.get(entry.year)!
    rm.set(entry.rating, (rm.get(entry.rating) ?? 0) + 1)
  }

  const sortedYears = [...map.keys()].sort((a, b) => a - b)
  return { map, sortedYears }
}
