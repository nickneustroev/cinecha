<script setup lang="ts">
const { data, status, load } = useImportData()
const { t } = useI18n()

onMounted(async () => {
  await load()
})

const tabItems = computed(() => [
  { label: t('pages.directors.tabs.points'), value: 'points' },
  { label: t('pages.directors.tabs.highest'), value: 'highest' }
])

const route = useRoute()
const router = useRouter()
const activeTab = ref((route.query.tab as string) || 'points')

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
        {{ $t('pages.directors.loading') }}
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
        <DirectorsGrid
          v-if="activeTab === 'points'"
          :data="data.enriched"
          :title="$t('pages.directors.title.points')"
          :limit="100"
          :show-more="100"
          sort-by="points"
        />
        <DirectorsGrid
          v-if="activeTab === 'highest'"
          :data="data.enriched"
          :title="$t('pages.directors.title.highest')"
          :limit="100"
          :show-more="100"
          sort-by="highestMovieRating"
        />
      </div>
    </template>
  </UContainer>
</template>
