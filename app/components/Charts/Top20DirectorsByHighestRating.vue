<script setup lang="ts">
import { tv } from '@nuxt/ui/utils/tv'
import type { EnrichedMovie } from '~/types/import'
import theme from '#build/ui/page-card'

const appConfig = useAppConfig()
const pageCardUi = computed(() =>
  tv({ extend: tv(theme), ...appConfig.ui?.pageCard || {} })({
    orientation: 'vertical',
    reverse: false,
    variant: 'outline',
    to: false,
    title: false,
    highlight: false,
    spotlight: false
  })
)

defineOptions({
  tags: ['cards', 'page']
})

const props = defineProps<{
  data: EnrichedMovie[]
  showTitle?: boolean
}>()

interface DirectorCard {
  director: string
  maxRating: number
  topCount: number
  topMaxYear: number
  movies: { title: string; year: number; userRating: number }[]
}

const cards = computed(() => {
  if (!props.data.length) return []

  const map = new Map<string, { maxRating: number; movies: { title: string; year: number; userRating: number }[] }>()

  for (const movie of props.data) {
    for (const d of movie.directors) {
      const entry = map.get(d.name) ?? { maxRating: 0, movies: [] }
      entry.movies.push({ title: movie.title, year: movie.year, userRating: movie.userRating })
      if (movie.userRating > entry.maxRating) {
        entry.maxRating = movie.userRating
      }
      map.set(d.name, entry)
    }
  }

  return Array.from(map.entries())
    .map(([director, entry]) => {
      const topMovies = entry.movies.filter(m => m.userRating === entry.maxRating)
      return {
        director,
        maxRating: entry.maxRating,
        topCount: topMovies.length,
        topMaxYear: Math.max(...topMovies.map(m => m.year)),
        movies: topMovies
      }
    })
    .sort((a, b) => b.maxRating - a.maxRating || b.topCount - a.topCount || b.topMaxYear - a.topMaxYear)
    .slice(0, 20)
})
</script>

<template>
  <div class="mx-auto pt-12">
    <h3 class="mb-6 text-2xl font-semibold">
      Top-20 Directors by Highest Movie Rating
    </h3>
    <UPageGrid :ui="{ base: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' }">
      <UPageCard
        v-for="(card, index) in cards"
        :key="index"
      >
        <template #body>
          <div :class="pageCardUi.title()">
            {{ card.director }}
          </div>
          <div :class="pageCardUi.description()">
            Highest: {{ card.maxRating }}
          </div>
          <ul class="mt-2 list-inside list-disc">
            <li
              v-for="(movie, mi) in card.movies"
              :key="mi"
            >
              {{ movie.title }} <span class="text-muted">({{ movie.year }}) · {{ movie.userRating }}</span>
            </li>
          </ul>
        </template>
      </UPageCard>
    </UPageGrid>
  </div>
</template>
