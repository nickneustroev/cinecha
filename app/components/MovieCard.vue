<script setup lang="ts">
import type { EnrichedMovie } from '~/types/import'
import { getRatingColor } from '~/utils/ratings'

const props = defineProps<{
  movie: EnrichedMovie
  importDate?: string | null
}>()

const { locale } = useI18n()

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const date = new Date(Number(y!), Number(m!) - 1, Number(d!))
  const month = date.toLocaleDateString(locale.value, { month: 'short' }).replace(/\.$/, '')
  return `${Number(d!)} ${month} ${y!}`
}

const watchedDates = computed(() => {
  if (props.movie.watchedDates?.length) {
    return props.movie.watchedDates
  }

  return props.movie.dateRated ? [props.movie.dateRated] : []
})

const formattedWatchedDates = computed(() => watchedDates.value.map(formatDate))
const shouldShowEnglishTitle = computed(() =>
  !!props.movie.englishTitle && !locale.value.toLowerCase().startsWith('en')
)
const letterboxdUri = computed(() =>
  props.movie.uri.startsWith('http') ? props.movie.uri : null
)
const tmdbUri = computed(() =>
  props.movie.tmdbId ? `https://www.themoviedb.org/movie/${props.movie.tmdbId}` : null
)
</script>

<template>
  <SimpleCard
    :photo="movie.poster"
    :name="movie.title"
  >
    <template #title>
      {{ movie.title }} <span class="text-muted">({{ movie.year }})</span>
    </template>
    <div class="flex flex-wrap gap-x-3 gap-y-2">
      <p
        class="inline-flex items-center justify-center w-8 h-8 rounded-full text-base font-semibold"
        :style="{ backgroundColor: getRatingColor(movie.userRating) }"
      >
        {{ movie.userRating }}
      </p>
      <UUser
        v-for="d in movie.directors"
        :key="d.name"
        :name="d.name"
        :ui="{
          root: 'bg-elevated rounded-full pe-3',
          name: 'font-thin'
        }"
      >
        <template #avatar>
          <img
            v-if="d.photo"
            :src="`https://image.tmdb.org/t/p/w45${d.photo}`"
            :alt="d.name"
            class="size-8 shrink-0 rounded-full object-cover"
          >
          <span
            v-else
            aria-hidden="true"
            class="size-8 shrink-0 rounded-full bg-accented"
          />
        </template>
      </UUser>
    </div>
    <div class="flex flex-wrap gap-2 mt-3">
      <UBadge
        v-for="genre in movie.genres"
        :key="genre"
        size="md"
        color="primary"
        variant="subtle"
      >
        {{ genre }}
      </UBadge>
    </div>
    <div
      v-if="formattedWatchedDates.length"
      class="mt-3 flex flex-wrap items-center gap-2"
    >
      <UBadge
        size="md"
        color="secondary"
        variant="soft"
        class="px-2"
      >
        <UIcon
          name="i-lucide-eye"
          class="size-4 shrink-0"
        />
      </UBadge>
      <UBadge
        v-for="watchedDate in formattedWatchedDates"
        :key="watchedDate"
        size="md"
        color="secondary"
        variant="subtle"
      >
        {{ watchedDate }}
      </UBadge>
    </div>
    <p
      v-if="shouldShowEnglishTitle || letterboxdUri || tmdbUri"
      class="mt-3 text-muted leading-relaxed"
    >
      <span class="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          v-if="shouldShowEnglishTitle"
          class="italic"
        >
          {{ movie.englishTitle }}
        </span>
        <a
          v-if="letterboxdUri"
          :href="letterboxdUri"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open on Letterboxd"
          class="group inline-flex items-center rounded-sm transition-colors hover:text-primary"
        >
          <img
            src="/letterboxd-favicon.ico"
            alt=""
            aria-hidden="true"
            class="size-4 opacity-80 transition duration-150 hover:opacity-100"
          >
        </a>
        <a
          v-if="tmdbUri"
          :href="tmdbUri"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open on TMDB"
          class="group inline-flex items-center rounded-sm transition-colors hover:text-primary"
        >
          <img
            src="/tmdb-favicon.ico"
            alt=""
            aria-hidden="true"
            class="size-4 opacity-60 transition duration-150 hover:opacity-100"
          >
        </a>
      </span>
    </p>
  </SimpleCard>
</template>
