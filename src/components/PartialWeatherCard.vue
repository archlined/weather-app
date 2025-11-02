<script setup lang="ts">
import { defineProps } from 'vue'
import type { SavedEntry } from '@/stores/saved_weathers'

const _props = defineProps<{
  saved_entry: SavedEntry
}>()

const emit = defineEmits(['saved_entry_selected', 'remove_saved_entry_selected'])
</script>

<template>
  <li
    class="relative flex flex-row items-center justify-between p-3 hover:cursor-pointer hover:bg-gray-800"
    @click="() => emit('saved_entry_selected', saved_entry)"
  >
    <div>
      <p>{{ saved_entry.location.name }}, {{ saved_entry.location.country }}</p>
      <p>{{ saved_entry.current_weather.weather_code }}</p>
    </div>
    <div class="mr-4 flex flex-col items-center">
      <img src="/temp.svg" alt="temp" class="h-10 w-10 invert" />
      <span>{{ saved_entry.current_weather.temperature }}°C</span>
      <button
        class="absolute top-0 right-0 flex h-8 w-8 items-center justify-center text-3xl hover:cursor-pointer hover:text-5xl"
        @click="() => emit('remove_saved_entry_selected', saved_entry)"
      >
        <span>-</span>
      </button>
    </div>
  </li>
</template>

<style scoped>
.invert {
  filter: invert(1);
}
</style>
