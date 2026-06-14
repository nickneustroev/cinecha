import type { ImportData } from '../../app/types/import'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const CSV_DIR = join(process.cwd(), 'data', 'letterboxd-nikvkino-2026-06-12-10-11-utc')

function parseCSV(text: string): string[][] {
  const lines: string[][] = []
  let current = ''
  let inQuotes = false
  let row: string[] = []

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(current.trim())
      current = ''
    } else if ((ch === '\n' || (ch === '\r' && next === '\n')) && !inQuotes) {
      row.push(current.trim())
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row)
      }
      row = []
      current = ''
      if (ch === '\r') i++
    } else {
      current += ch
    }
  }

  if (row.length > 0 || current) {
    row.push(current.trim())
    lines.push(row)
  }

  return lines
}

function parseCSVFile(filename: string): Record<string, string>[] | null {
  const filePath = join(CSV_DIR, filename)
  if (!existsSync(filePath)) return null
  const text = readFileSync(filePath, 'utf-8')
  const rows = parseCSV(text)
  if (rows.length < 1) return []
  const headers = rows[0]
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? row[i] : ''
    })
    return obj
  })
}

function toNumber(val: string | null | undefined): number | null {
  if (val === null || val === '' || val === undefined) return null
  const n = Number(val)
  return Number.isNaN(n) ? null : n
}

export default defineEventHandler(async (): Promise<ImportData> => {
  const rawDiary = parseCSVFile('diary.csv')
  const rawRatings = parseCSVFile('ratings.csv')
  const rawWatched = parseCSVFile('watched.csv')

  const diary: ImportData['diary'] = (rawDiary || []).map(e => ({
    date: e.Date || null,
    title: e.Name || null,
    year: toNumber(e.Year) ?? 0,
    uri: e['Letterboxd URI'] || null,
    rating: toNumber(e.Rating),
    rewatch: e.Rewatch ? e.Rewatch === 'Yes' : null,
    tags: e.Tags ? e.Tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    watchedDate: e['Watched Date'] || null
  }))

  const ratings: ImportData['ratings'] = (rawRatings || []).map(e => ({
    date: e.Date || null,
    title: e.Name || null,
    year: toNumber(e.Year) ?? 0,
    uri: e['Letterboxd URI'] || null,
    rating: toNumber(e.Rating) ?? 0
  }))

  const watched: ImportData['watched'] = (rawWatched || []).map(e => ({
    date: e.Date || null,
    title: e.Name || null,
    year: toNumber(e.Year) ?? 0,
    uri: e['Letterboxd URI'] || null
  }))

  const allTitles = new Set<string>()
  for (const entry of ratings) if (entry.title) allTitles.add(entry.title)
  for (const entry of watched) if (entry.title) allTitles.add(entry.title)
  for (const entry of diary) if (entry.title) allTitles.add(entry.title)

  let avgRating: number | null = null
  const sum = ratings.reduce((acc, entry) => acc + entry.rating, 0)
  if (ratings.length > 0) avgRating = Math.round((sum / ratings.length) * 100) / 100

  return {
    ratings,
    watched,
    diary,
    stats: {
      totalRatings: ratings.length,
      totalWatched: watched.length,
      totalDiary: diary.length,
      uniqueTitles: allTitles.size,
      avgRating
    }
  }
})
