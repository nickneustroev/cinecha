import { join } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import type { ImportData } from '~/types/import'

const CSV_DIR = join(process.cwd(), 'data', 'letterboxd-nikvkino-2026-06-12-10-11-utc')
const CACHE_PATH = join(process.cwd(), 'data', 'tmdb-cache.json')

function readCSV(filename: string): string {
  const filePath = join(CSV_DIR, filename)
  if (!existsSync(filePath)) return ''
  return readFileSync(filePath, 'utf-8')
}

export default defineEventHandler(async (): Promise<ImportData> => {
  const diary = readCSV('diary.csv')
  const ratings = readCSV('ratings.csv')
  const watched = readCSV('watched.csv')

  return processCSVData({ diary, ratings, watched }, CACHE_PATH)
})
