<script lang="ts" setup>
defineOptions({
  tags: ['areacharts', 'stacked']
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
    let total = 0
    for (const r of ratingLookup) total += ratingMap.get(r) ?? 0
    if (!total) return { year: String(year), ...Object.fromEntries(ratingKeys.map(k => [k, 0])) } as YearData

    const pcts = ratingLookup.map(r => (ratingMap.get(r) ?? 0) / total * 100)
    const rounded = pcts.map(v => Math.round(v))
    const diff = 100 - rounded.reduce((s, v) => s + v, 0)
    if (diff !== 0) {
      const remainders = pcts.map((v, i) => ({ i, r: v - Math.floor(v) }))
      remainders.sort((a, b) => b.r - a.r)
      for (let j = 0; j < Math.abs(diff); j++) {
        rounded[remainders[j % remainders.length].i] += Math.sign(diff)
      }
    }

    const item: YearData = { year: String(year) }
    for (let i = 0; i < ratingKeys.length; i++) {
      item[ratingKeys[i]] = rounded[i]
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
const yFormatter = (value: number): string => `${value}%`
</script>

<template>
  <ChartsChartWrapper title="Rating Share By Years" :show-title="showTitle">
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
      :y-grid-line="true"
      :x-grid-line="false"
    />
  </ChartsChartWrapper>
</template>
