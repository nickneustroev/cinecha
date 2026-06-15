<script setup lang="ts">
import type { EnrichedMovie } from '~/types/import'

defineOptions({
  tags: ['cards', 'page']
})

const BOOST = 1

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
  count: number
  points: number
  pointsBreakdown: string
  movies: { title: string, year: number, userRating: number }[]
}



const cards = computed(() => {
  if (!props.data.length) return []

  const map = new Map<string, { photo: string | null, count: number, points: number, breakdownParts: string[], movies: { title: string, year: number, userRating: number }[] }>()

  for (const movie of props.data) {
    for (const d of movie.directors) {
      const entry = map.get(d.name) ?? { photo: d.photo, count: 0, points: 0, breakdownParts: [] as string[], movies: [] }
      if (!entry.photo) entry.photo = d.photo
      entry.count++
      const contribution = (movie.userRating * BOOST) ** 2
      entry.points += contribution
      entry.breakdownParts.push(`${movie.title} (${movie.userRating}² = ${contribution})`)
      entry.movies.push({ title: movie.title, year: movie.year, userRating: movie.userRating })
      map.set(d.name, entry)
    }
  }

  return Array.from(map.entries())
    .map(([director, entry]) => ({
      director,
      photo: entry.photo,
      count: entry.count,
      points: entry.points,
      pointsBreakdown: entry.breakdownParts.join(' + '),
      movies: entry.movies.sort((a, b) => b.userRating - a.userRating || b.year - a.year)
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, props.limit)
})
</script>

<template>
  <div class="mx-auto">
    <h3 class="mb-6 text-2xl font-semibold">
      {{ title ?? `Top-${limit} Directors by Points` }}
    </h3>
    <UPageGrid :ui="{ base: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' }">
      <SimpleCard
        v-for="(card, index) in cards"
        :key="index"
        :photo="card.photo"
        :name="card.director"
        :description="`Points: ${card.points}`"
        :description-title="card.pointsBreakdown"
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
