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
  <div
    class="mx-auto max-w-3xl space-y-6 rounded-lg"
    :class="showTitle ? 'p-6' : ''"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        {{ title }}
      </h3>
    </div>
    <slot />
  </div>
</template>
