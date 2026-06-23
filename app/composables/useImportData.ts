import type { EnrichedImportData } from '~/types/import'
import { get, set, del } from 'idb-keyval'

const STORAGE_KEY = 'letterboxd-import'
const STORAGE_VERSION_KEY = 'letterboxd-import-version'
const STORAGE_VERSION = 2

interface FetchErrorLike {
  data?: {
    message?: string
  }
  message?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  const fetchError = error as FetchErrorLike
  return fetchError.data?.message || fetchError.message || fallback
}

function isCurrentCacheShape(cached: EnrichedImportData) {
  return cached.movies.every(movie => 'englishTitle' in movie)
}

export function useImportData() {
  const status = ref<'idle' | 'loading' | 'done' | 'error'>('idle')
  const data = shallowRef<EnrichedImportData | null>(null)
  const error = ref<string | null>(null)

  async function load(): Promise<boolean> {
    try {
      const version = await get<number>(STORAGE_VERSION_KEY)
      const cached = await get<EnrichedImportData>(STORAGE_KEY)

      if (cached && version === STORAGE_VERSION && isCurrentCacheShape(cached)) {
        data.value = cached
        status.value = 'done'
        return true
      }

      await del(STORAGE_KEY)
      await set(STORAGE_VERSION_KEY, STORAGE_VERSION)
    } catch (cacheError) {
      void cacheError
    }
    return false
  }

  async function process(minRating: number | undefined = undefined, tmdbRequired = true) {
    status.value = 'loading'
    error.value = null

    try {
      const result = await $fetch<EnrichedImportData>('/api/process', {
        method: 'POST',
        body: minRating === undefined ? { tmdbRequired } : { minRating, tmdbRequired }
      })
      data.value = result
      status.value = 'done'

      try {
        await set(STORAGE_KEY, result)
        await set(STORAGE_VERSION_KEY, STORAGE_VERSION)
      } catch (cacheError) {
        void cacheError
      }
    } catch (e: unknown) {
      status.value = 'idle'
      error.value = getErrorMessage(e, 'Import failed')
    }
  }

  async function processFromFile(file: File, minRating?: number) {
    status.value = 'loading'
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (minRating !== undefined) {
        formData.append('minRating', String(minRating))
      }
      const result = await $fetch<EnrichedImportData>('/api/upload', {
        method: 'POST',
        body: formData
      })
      data.value = result
      status.value = 'done'

      try {
        await set(STORAGE_KEY, result)
        await set(STORAGE_VERSION_KEY, STORAGE_VERSION)
      } catch (cacheError) {
        void cacheError
      }
    } catch (e: unknown) {
      status.value = 'idle'
      error.value = getErrorMessage(e, 'Import failed')
    }
  }

  async function clear() {
    data.value = null
    status.value = 'idle'
    error.value = null
    try {
      await del(STORAGE_KEY)
      await del(STORAGE_VERSION_KEY)
    } catch (cacheError) {
      void cacheError
    }
  }

  return { data, status, error, load, process, processFromFile, clear }
}
