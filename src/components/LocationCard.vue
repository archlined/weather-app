<script setup lang="ts">
import type { Location } from '@/logic/weather_provider'

const _props = defineProps<{
  location: Location
}>()
</script>

<template>
  <div>
    <h1 class="text-gray-100">{{ location.name }}, {{ location.country }}</h1>
    <span class="text-sm text-gray-300">
      lat: {{ location.latitude }} long: {{ location.longitude }}</span
    >
  </div>
</template>
