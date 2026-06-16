<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const availableLocales = computed(() => locales.value as { code: string; name: string }[])

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

const title = computed(() => `${t('nav.home')} - Cinecha`)
const description = 'A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})

function switchLocale(code: 'en' | 'ru') {
  setLocale(code)
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <div class="flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-xl font-bold shrink-0"
          >
            Cinecha
          </NuxtLink>

          <UNavigationMenu
            :items="[
              { label: $t('nav.home'), to: '/' },
              { label: $t('nav.movies'), to: '/movies' },
              { label: $t('nav.directors'), to: '/directors' }
            ]"
          />
        </div>
      </template>

      <template #right>
        <UButton
          v-for="loc in availableLocales"
          :key="loc.code"
          size="sm"
          :color="locale === loc.code ? 'primary' : 'neutral'"
          variant="ghost"
          @click="switchLocale(loc.code as 'en' | 'ru')"
        >
          {{ loc.name }}
        </UButton>

        <UColorModeButton />

        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <UMain class="bg-accented">
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
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
