<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t, locale, setLocale } = useI18n()
const route = useRoute()
const isMobile = useIsMobile()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: computed(() => locale.value)
  }
})

const title = computed(() => `${t('nav.home')} - Cinesta`)
const description = 'Cinesta помогает загружать экспорт Letterboxd, обогащать фильмы данными из TMDB и смотреть аналитику по фильмам, режиссерам и оценкам.'

const navigationItems = computed<NavigationMenuItem[]>(() => [
  {
    label: t('nav.home'),
    to: '/',
    active: route.path === '/'
  },
  {
    label: t('nav.movies'),
    to: '/movies',
    active: route.path.startsWith('/movies')
  },
  {
    label: t('nav.directors'),
    to: '/directors',
    active: route.path.startsWith('/directors')
  }
])

const localeItems = [
  { label: 'English', shortLabel: 'EN', value: 'en' },
  { label: 'Русский', shortLabel: 'RU', value: 'ru' }
]
const localeSelectClass = computed(() => isMobile.value ? 'w-16' : 'w-32')

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

function switchLocale(code: string) {
  setLocale(code as 'en' | 'ru')
}

function getLocaleLabel(value: string | undefined) {
  const item = localeItems.find(item => item.value === value)

  if (!item) {
    return ''
  }

  return isMobile.value ? item.shortLabel : item.label
}
</script>

<template>
  <UApp :toaster="{ position: 'top-right' }">
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="text-2xl font-bold shrink-0"
        >
          Cinesta
        </NuxtLink>
      </template>

      <UNavigationMenu
        :ui="{ linkLabel: 'text-base' }"
        :items="navigationItems"
      />

      <template #right>
        <USelect
          :items="localeItems"
          value-key="value"
          :size="isMobile ? 'sm' : 'md'"
          :class="localeSelectClass"
          :model-value="locale"
          @update:model-value="switchLocale"
        >
          <template #default="{ modelValue }">
            {{ getLocaleLabel(modelValue) }}
          </template>

          <template #item-label="{ item }">
            {{ isMobile ? item.shortLabel : item.label }}
          </template>
        </USelect>

        <UColorModeButton />

        <UButton
          to="https://github.com/nickneustroev/cinesta"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
          class="hidden sm:inline-flex"
        />
      </template>

      <template #body>
        <UNavigationMenu
          :items="navigationItems"
          orientation="vertical"
          class="-mx-2.5"
          :ui="{ linkLabel: 'text-base' }"
        />

        <USeparator class="my-6" />

        <div class="flex flex-col gap-3">
          <UButton
            to="https://github.com/nickneustroev/cinesta"
            target="_blank"
            icon="i-simple-icons-github"
            label="GitHub"
            color="neutral"
            variant="subtle"
            block
          />
        </div>
      </template>
    </UHeader>

    <UMain class="bg-accented">
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          {{ t('footer.built_with') }}
          <a
            href="https://nuxt.com"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-default transition-colors"
          >
            Nuxt
          </a>,
          <a
            href="https://ui.nuxt.com"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-default transition-colors"
          >
            Nuxt UI
          </a>,
          <a
            href="https://nuxtcharts.com"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-default transition-colors"
          >
            Nuxt Charts
          </a>,
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-default transition-colors"
          >
            {{ t('footer.tmdb') }}
          </a>
          • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nickneustroev/cinesta"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
