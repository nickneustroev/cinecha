<script lang="ts" setup>
import type { RatingEntry } from '~/types/import'

defineOptions({
  tags: ['barcharts', 'vertical']
})

const props = defineProps<{
  data: RatingEntry[]
  showTitle?: boolean
}>()

const chartData = computed(() => {
  if (!props.data.length) return []

  const map = new Map<number, number>()

  for (const entry of props.data) {
    map.set(entry.rating, (map.get(entry.rating) ?? 0) + 1)
  }

  const result: { rating: string, count: number }[] = []

  for (let r = 0.5; r <= 5; r += 0.5) {
    result.push({ rating: r.toString(), count: map.get(r) ?? 0 })
  }

  return result
})

const chartCategories = computed(() => ({
  count: {
    name: 'Movies Rated',
    color: '#22c55e'
  }
}))

const xFormatter = (i: number): string => chartData.value[i]?.rating ?? ''
const yFormatter = (tick: number) => tick.toString()

const chartOptions = {
  xAxis: 'rating' as keyof { rating: string, count: number },
  groupPadding: 0,
  barPadding: 0.2
}
</script>

<template>
  <ChartsChartWrapper
    :title="$t('charts.watched_all_by_rating')"
    :show-title="showTitle"
  >
    <BarChart
      :data="chartData"
      :height="300"
      :categories="chartCategories"
      :y-axis="['count']"
      :x-num-ticks="chartData.length"
      :radius="4"
      :y-grid-line="true"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :legend-position="LegendPosition.TopRight"
      v-bind="chartOptions"
    />
  </ChartsChartWrapper>
</template>
