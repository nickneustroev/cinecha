<script lang="ts" setup>
import type { EnrichedMovie } from '~/types/import'
import type { ChartCategories, PercentByYearDatum } from '~/utils/home-analytics'

defineOptions({
  tags: ['areacharts', 'stacked']
})

const props = withDefaults(defineProps<{
  data?: EnrichedMovie[]
  items?: PercentByYearDatum[]
  categoriesData?: ChartCategories
  showTitle?: boolean
}>(), {
  data: () => []
})

const GENRE_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea',
  '#db2777', '#0d9488', '#ea580c', '#4f46e5', '#65a30d',
  '#0891b2', '#c026d3', '#0284c7', '#059669', '#d97706',
  '#7c3aed', '#4d7c0f', '#0f766e', '#e11d48', '#0369a1'
]

type YearMode = 'released' | 'watched'

const { t } = useI18n()
const selectedMode = shallowRef<YearMode>('released')
const selectedMinRating = shallowRef(3)
const selectedMinYear = shallowRef<string | null>(null)

const minRatingOptions = [
  { label: '0.5', value: 0.5 },
  { label: '1', value: 1 },
  { label: '1.5', value: 1.5 },
  { label: '2', value: 2 },
  { label: '2.5', value: 2.5 },
  { label: '3', value: 3 },
  { label: '3.5', value: 3.5 },
  { label: '4', value: 4 },
  { label: '4.5', value: 4.5 },
  { label: '5', value: 5 }
] as const

const filteredMovies = computed(() => {
  return props.data.filter(movie => movie.userRating >= selectedMinRating.value)
})

const yearModeOptions = computed(() => {
  return [
    { label: t('charts.count_by_year_released_option'), value: 'released' as const },
    { label: t('charts.count_by_year_watched_option'), value: 'watched' as const }
  ]
})

const allGenres = computed(() => {
  if (!props.data.length) return []
  const set = new Set<string>()
  for (const movie of filteredMovies.value) {
    for (const genre of movie.genres) {
      set.add(genre)
    }
  }
  return Array.from(set).sort()
})

function getWatchedYear(movie: EnrichedMovie): number | null {
  if (!movie.dateRated) return null

  const year = Number.parseInt(movie.dateRated.slice(0, 4), 10)

  return Number.isNaN(year) ? null : year
}

const rawChartData = computed(() => {
  if (props.data.length) {
    const genres = allGenres.value
    const genreSet = new Set(genres)

    const yearMap = new Map<number, Map<string, number>>()
    for (const movie of filteredMovies.value) {
      const year = selectedMode.value === 'watched'
        ? getWatchedYear(movie)
        : movie.year

      if (year === null) continue
      if (!yearMap.has(year)) yearMap.set(year, new Map())
      const gm = yearMap.get(year)!
      for (const genre of movie.genres) {
        if (genreSet.has(genre)) {
          gm.set(genre, (gm.get(genre) ?? 0) + 1)
        }
      }
    }

    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b)

    return sortedYears.map((year) => {
      const gm = yearMap.get(year)!
      let total = 0
      for (const c of gm.values()) total += c
      if (!total) return null

      const pcts = genres.map(g => ((gm.get(g) ?? 0) / total) * 100)
      const rounded = pcts.map(v => Math.round(v))
      const diff = 100 - rounded.reduce((s, v) => s + v, 0)
      if (diff !== 0) {
        const remainders = pcts.map((v, i) => ({ i, r: v - Math.floor(v) }))
        remainders.sort((a, b) => b.r - a.r)
        for (let j = 0; j < Math.abs(diff); j++) {
          rounded[remainders[j % remainders.length]!.i]! += Math.sign(diff)
        }
      }

      const item: Record<string, string | number> = { year: String(year) }
      for (let i = 0; i < genres.length; i++) {
        item[genres[i]!] = rounded[i]!
      }
      return item
    }).filter(Boolean) as Record<string, string | number>[]
  }

  if (props.items) return props.items

  return []
})

const minYearOptions = computed(() => {
  return rawChartData.value
    .map(entry => entry.year as string)
    .filter((year, index, years) => years.indexOf(year) === index)
    .sort((left, right) => left.localeCompare(right))
    .map(year => ({
      label: year,
      value: year
    }))
})

watch(minYearOptions, (options) => {
  if (!options.length) {
    selectedMinYear.value = null
    return
  }

  const hasSelectedYear = selectedMinYear.value !== null
    && options.some(option => option.value === selectedMinYear.value)

  if (!hasSelectedYear) {
    selectedMinYear.value = options.find(option => option.value === '1990')?.value ?? options[0]!.value
  }
}, { immediate: true })

const chartData = computed(() => {
  if (!selectedMinYear.value) {
    return rawChartData.value
  }

  return rawChartData.value.filter(entry => (entry.year as string) >= selectedMinYear.value!)
})

const chartCategories = computed(() => {
  if (props.data.length) {
    const cats: Record<string, { name: string, color: string }> = {}
    allGenres.value.forEach((g, i) => {
      cats[g] = { name: g, color: GENRE_COLORS[i % GENRE_COLORS.length]! }
    })
    return cats
  }

  if (props.categoriesData) return props.categoriesData
  const cats: Record<string, { name: string, color: string }> = {}
  allGenres.value.forEach((g, i) => {
    cats[g] = { name: g, color: GENRE_COLORS[i % GENRE_COLORS.length]! }
  })
  return cats
})

const xFormatter = (i: number): string => (chartData.value[i]?.year as string ?? '').slice(2)
const yFormatter = (value: number): string => `${value}%`
</script>

<template>
  <ChartsChartWrapper
    :title="t('charts.genre_share_by_year_released')"
    :show-title="showTitle"
  >
    <template #header-right>
      <div
        v-if="props.data.length"
        class="flex flex-col gap-3 sm:flex-row"
      >
        <USelect
          :items="yearModeOptions"
          value-key="value"
          class="w-full sm:w-48"
          :model-value="selectedMode"
          @update:model-value="selectedMode = $event"
        />
        <div
          v-if="minYearOptions.length"
          class="flex items-center gap-2"
        >
          <span class="text-sm text-muted whitespace-nowrap">
            {{ t('charts.starting_from') }}
          </span>
          <USelect
            :items="minYearOptions"
            value-key="value"
            class="w-full sm:w-24"
            :model-value="selectedMinYear"
            @update:model-value="selectedMinYear = $event"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted whitespace-nowrap">
            {{ t('charts.min_rating') }}
          </span>
          <USelect
            :items="minRatingOptions"
            value-key="value"
            class="w-full sm:w-24"
            :model-value="selectedMinRating"
            @update:model-value="selectedMinRating = $event"
          />
        </div>
      </div>
    </template>

    <AreaChart
      :data="chartData"
      :stacked="true"
      :height="300"
      :categories="chartCategories"
      :x-num-ticks="chartData.length"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :curve-type="CurveType.MonotoneX"
      :legend-position="LegendPosition.TopRight"
      :hide-legend="false"
      legend-style="flex-wrap: wrap; max-width: 100%; margin-bottom: 12px"
      :y-num-ticks="10"
      :y-grid-line="true"
      :x-grid-line="false"
    />
  </ChartsChartWrapper>
</template>
