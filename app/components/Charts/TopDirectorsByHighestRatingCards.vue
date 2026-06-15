<script setup lang="ts">
import type { EnrichedMovie } from '~/types/import'

defineOptions({
  tags: ['cards', 'page']
})

const props = withDefaults(defineProps<{
  data: EnrichedMovie[]
  showTitle?: boolean
  title?: string
  limit?: number
  link?: string
}>(), {
  limit: 20
})

interface DirectorCard {
  director: string
  photo: string | null
  maxRating: number
  topCount: number
  topMaxYear: number
  movies: { title: string, year: number, userRating: number }[]
}


const cards = computed(() => {
  if (!props.data.length) return []

  const map = new Map<string, { photo: string | null, maxRating: number, movies: { title: string, year: number, userRating: number }[] }>()

  for (const movie of props.data) {
    for (const d of movie.directors) {
      const entry = map.get(d.name) ?? { photo: d.photo, maxRating: 0, movies: [] }
      if (!entry.photo) entry.photo = d.photo
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
        photo: entry.photo,
        maxRating: entry.maxRating,
        topCount: topMovies.length,
        topMaxYear: Math.max(...topMovies.map(m => m.year)),
        movies: topMovies
      }
    })
    .sort((a, b) => b.maxRating - a.maxRating || b.topCount - a.topCount || b.topMaxYear - a.topMaxYear)
    .slice(0, props.limit)
})
</script>

<template>
  <div class="mx-auto">
    <h3 class="mb-6 text-2xl font-semibold">
      {{ props.title ?? `Top-${props.limit} Directors by Highest Movie Rating` }}
    </h3>
    <UPageGrid :ui="{ base: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' }">
      <SimpleCard
        v-for="(card, index) in cards"
        :key="index"
        :photo="card.photo"
        :name="card.director"
        :description="`Highest: ${card.maxRating}`"
      >
        <ul class="list-inside list-disc">
          <li
            v-for="(movie, mi) in card.movies"
            :key="mi"
          >
            {{ movie.title }} <span class="text-muted">({{ movie.year }}) · {{ movie.userRating }}</span>
          </li>
        </ul>
      </SimpleCard>
    </UPageGrid>

    <div
      v-if="props.link"
      class="flex justify-center mt-8"
    >
      <UButton
        :to="props.link"
        size="xl"
      >
        Смотреть всех
      </UButton>
    </div>
  </div>
</template>
