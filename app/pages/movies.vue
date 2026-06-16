<script setup lang="ts">
const { data, status, load } = useImportData()
const { t } = useI18n()

onMounted(async () => {
  await load()
})

const tabItems = computed(() => [
  { label: t('pages.movies.tabs.ratings'), value: 'ratings' },
  { label: t('pages.movies.tabs.last_watched'), value: 'last-watched' }
])

const route = useRoute()
const router = useRouter()
const activeTab = ref((route.query.tab as string) || 'ratings')

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } })
})
</script>

<template>
  <UContainer class="bg-muted border-x border-muted pb-12">
    <div
      v-if="status === 'loading'"
      class="flex flex-col items-center justify-center gap-4 py-20"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-muted"
      />
      <p class="text-sm text-muted">
        {{ $t('pages.movies.loading') }}
      </p>
    </div>

    <template v-if="data">
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        size="xl"
        variant="link"
        class="pt-6"
      />

      <div class="flex flex-col gap-y-8 pt-8">
        <MoviesGrid
          v-if="activeTab === 'ratings'"
          :data="data.enriched"
          :import-date="data.stats.importDate"
          :limit="100"
          :show-more="100"
          :title="$t('charts.top_movies_by_rating')"
          show-year-filter
        />
        <MoviesGrid
          v-if="activeTab === 'last-watched'"
          :data="data.enriched"
          :import-date="data.stats.importDate"
          :limit="100"
          :show-more="100"
          sort-by="dateRated"
          :title="$t('charts.last_watched')"
        />
      </div>
    </template>
  </UContainer>
</template>
