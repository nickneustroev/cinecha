<script lang="ts" setup>
defineOptions({
  tags: ['barcharts', 'stacked']
})

withDefaults(
  defineProps<{
    showTitle?: boolean
  }>(),
  {
    showTitle: false
  }
)

interface RatingEntry {
  date: string
  title: string
  year: number
  uri: string
  rating: number
}

const { data: ratingsRaw } = await useFetch<RatingEntry[]>('/data/ratings.json')

const ratingMeta = [
  { key: '0.5', label: '0.5', color: '#7f1d1d' },
  { key: '1.0', label: '1', color: '#dc2626' },
  { key: '1.5', label: '1.5', color: '#ea580c' },
  { key: '2.0', label: '2', color: '#d97706' },
  { key: '2.5', label: '2.5', color: '#eab308' },
  { key: '3.0', label: '3', color: '#65a30d' },
  { key: '3.5', label: '3.5', color: '#22c55e' },
  { key: '4.0', label: '4', color: '#16a34a' },
  { key: '4.5', label: '4.5', color: '#0d9488' },
  { key: '5.0', label: '5', color: '#2563eb' }
]

const ratingKeys = ratingMeta.map(m => m.key)
const ratingLookup = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

interface YearData {
  [key: string]: string | number
  year: string
}

const chartData = computed(() => {
  if (!ratingsRaw.value) return []

  const map = new Map<number, Map<number, number>>()

  for (const entry of ratingsRaw.value) {
    if (entry.year < 1990) continue
    const year = entry.year
    const rating = entry.rating
    if (!map.has(year)) map.set(year, new Map())
    const ratingMap = map.get(year)!
    ratingMap.set(rating, (ratingMap.get(rating) ?? 0) + 1)
  }

  const sortedYears = [...map.keys()].sort((a, b) => a - b)

  return sortedYears.map((year) => {
    const ratingMap = map.get(year)!
    const item: YearData = { year: String(year) }
    for (let i = 0; i < ratingKeys.length; i++) {
      item[ratingKeys[i]] = ratingMap.get(ratingLookup[i]) ?? 0
    }
    return item
  })
})

const chartCategories = computed(() => {
  const cats: Record<string, { name: string; color: string }> = {}
  for (const m of ratingMeta) {
    cats[m.key] = { name: m.label, color: m.color }
  }
  return cats
})

const xFormatter = (i: number): string => (chartData.value[i]?.year as string ?? '').slice(2)
const yFormatter = (tick: number) => tick.toString()
</script>

<template>
  <ChartsChartWrapper title="Rating Stacked By Years" :show-title="showTitle">
    <BarChart
      :data="chartData"
      :stacked="true"
      :height="300"
      :categories="chartCategories"
      :y-axis="ratingKeys"
      :group-padding="0"
      :bar-padding="0.2"
      :x-num-ticks="chartData.length"
      :radius="4"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :legend-position="LegendPosition.TopRight"
      :hide-legend="false"
      :y-grid-line="true"
    />
  </ChartsChartWrapper>
</template>
