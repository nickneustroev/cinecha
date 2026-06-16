<script setup lang="ts">
import type { EnrichedMovie } from '~/types/import'

const props = defineProps<{
  data: EnrichedMovie[]
  importDate?: string | null
  limit?: number
  title?: string
  showMore?: number
  link?: string
  sortBy?: 'rating' | 'dateRated'
}>()

const visibleCount = ref(props.limit ?? 8)

const sortedList = computed(() => {
  const list = [...props.data]
  if (props.sortBy === 'dateRated') {
    const filtered = list.filter(m => m.dateRated && m.dateRated !== props.importDate)
    filtered.sort((a, b) => {
      if (!a.dateRated) return 1
      if (!b.dateRated) return -1
      return b.dateRated.localeCompare(a.dateRated)
    })
    return filtered
  }
  list.sort((a, b) => b.userRating - a.userRating)
  return list
})

const cards = computed(() => sortedList.value.slice(0, visibleCount.value))

const hasMore = computed(() => visibleCount.value < sortedList.value.length)

function showMoreCards() {
  visibleCount.value += props.showMore!
}
</script>

<template>
  <div>
    <h3
      v-if="title"
      class="text-2xl font-semibold mb-4"
    >
      {{ title }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MovieCard
        v-for="(movie, index) in cards"
        :key="index"
        :movie="movie"
        :import-date="importDate"
      />
    </div>
    <div
      v-if="showMore && hasMore"
      class="flex justify-center mt-4"
    >
      <UButton
        size="lg"
        color="primary"
        @click="showMoreCards"
      >
        Показать еще {{ showMore }}
      </UButton>
    </div>
    <div
      v-if="link"
      class="flex justify-center mt-8"
    >
      <UButton
        :to="link"
        size="xl"
      >
        Смотреть всех
      </UButton>
    </div>
  </div>
</template>
