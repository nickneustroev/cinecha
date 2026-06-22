import { debugMatchMovie } from '../../utils/tmdb'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    title?: string
    year?: number
    uri?: string
    locale?: string
  }>(event)

  const title = body?.title?.trim()
  const year = body?.year
  const uri = body?.uri?.trim()
  const locale = body?.locale?.trim() || getCookie(event, 'i18n_lang') || 'en-US'

  if (!title || !uri || !year) {
    throw createError({ statusCode: 400, statusMessage: 'Missing title, year or uri' })
  }

  return await debugMatchMovie({ title, year, uri }, locale)
})
