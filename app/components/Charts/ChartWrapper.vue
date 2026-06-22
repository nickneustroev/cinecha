<script lang="ts" setup>
withDefaults(
  defineProps<{
    title: string
    showTitle?: boolean
  }>(),
  {
    showTitle: false
  }
)
</script>

<template>
  <UCard
    :ui="{
      root: 'w-full mx-auto'

    }"
  >
    <template #header>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 class="text-2xl font-semibold">
          {{ title }}
        </h3>
        <slot name="header-right" />
      </div>
    </template>

    <slot />
  </UCard>
</template>
