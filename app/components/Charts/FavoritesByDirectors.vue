<script lang="ts" setup>
import type { EnrichedMovie } from '~/types/import'

defineOptions({
  tags: ['barcharts', 'vertical']
})

const props = defineProps<{
  data: EnrichedMovie[]
  showTitle?: boolean
}>()

interface DirectorEntry {
  director: string
  count: number
}

const chartData = computed(() => {
  if (!props.data.length) return []

  const map = new Map<string, number>()

  for (const movie of props.data) {
    for (const d of movie.directors) {
      map.set(d.name, (map.get(d.name) ?? 0) + 1)
    }
  }

  return Array.from(map.entries())
    .map(([director, count]) => ({ director, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
    .reverse()
})

const xAxisConfig = {
  tickTextFontSize: '12px'
} as const

const yAxisConfig = {

} as const

const chartCategories = computed(() => ({
  count: {
    name: 'Movies',
    color: '#6366f1'
  }
}))

const xFormatter = (tick: number) => tick.toString()
const yFormatter = (_tick: number | Date, i?: number) => {
  const idx = i ?? 0
  return chartData.value[idx]?.director ?? String(_tick)
}
</script>

<template>
  <ChartsChartWrapper
    :title="$t('charts.top_30_directors_count')"
    :show-title="showTitle"
  >
    <BarChart
      :data="chartData"
      :orientation="Orientation.Horizontal"
      :height="600"
      :categories="chartCategories"
      :y-axis="['count']"
      :y-num-ticks="chartData.length"
      :radius="4"
      :x-grid-line="true"
      :x-num-ticks="8"
      :x-formatter="xFormatter"
      :x-axis-config="xAxisConfig"
      :y-formatter="yFormatter"
      :y-axis-config="yAxisConfig"
      :legend-position="LegendPosition.TopRight"
    />
  </ChartsChartWrapper>
</template>
