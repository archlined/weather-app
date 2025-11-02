<script setup lang="ts">
import { computed, defineProps, ref, watchEffect, type Ref } from 'vue'
import { get_unique_location_id, type Location, type Weather } from '@/logic/weather_provider'
import { saved } from '@/stores/saved_weathers'

const props = defineProps<{
  location: Location
  current_weather: Weather
  next_24hour_forecast: Weather[]
}>()

const emit = defineEmits(['add'])

const forecast_texts: Ref<HTMLElement[]> = ref([])
const main_icon = ref('/cloud.svg')

watchEffect(
  () => {
    // await nextTick()
    console.log('watch effect ran')
    const weather_code = props.current_weather.weather_code
    if (weather_code == 'Clear sky' || weather_code == 'Mainly clear') {
      if (props.current_weather.is_day) {
        main_icon.value = '/sun.svg'
      } else {
        main_icon.value = '/moon.svg'
      }
    } else if (
      weather_code == 'Partly cloudy' ||
      weather_code == 'Overcast' ||
      weather_code == 'Fog' ||
      weather_code == 'Depositing rime fog'
    ) {
      main_icon.value = '/cloud.svg'
    } else {
      main_icon.value = '/rain.svg'
    }

    for (const el of forecast_texts.value) {
      const range = document.createRange()
      range.selectNodeContents(el)
      const rects = range.getClientRects()
      const lines = rects.length
      if (lines > 1) el.classList.add('text-lg')
      else el.classList.remove('text-lg')
    }
  },
  { flush: 'post' },
)

const add_clicked = () => {
  emit('add')
}

const is_already_saved = computed(() => {
  return (
    saved.value.findIndex(
      (x) => get_unique_location_id(x.location) == get_unique_location_id(props.location),
    ) != -1
  )
})

const time_string = (timestamp: string) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Name + time | Image  -->
    <div class="relative flex flex-row items-center justify-between">
      <div class="flex flex-col gap-3">
        <div>
          <h1 class="t text-5xl">{{ location.name }}, {{ location.country }}</h1>
          <span class="text-sm text-gray-300"
            >as of {{ time_string(current_weather.timestamp) }} local time</span
          >
        </div>
        <h1 class="text-4xl">{{ current_weather.weather_code }}</h1>
      </div>
      <img v-bind:src="main_icon" alt="cloud" class="mr-15 h-40 invert" />
      <button
        v-if="!is_already_saved"
        class="absolute top-0 right-0 flex h-10 w-10 items-center justify-center text-3xl hover:cursor-pointer hover:text-5xl"
        @click="() => add_clicked()"
      >
        <span>+</span>
      </button>
    </div>

    <!-- 3x3 grid with temp, wind, humid, rain, uv, cloudcover -->
    <div class="grid flex-1 grid-cols-2 items-center gap-3">
      <!-- temperature -->
      <div class="flex flex-col gap-1 justify-self-center">
        <div class="flex w-full flex-row gap-3">
          <span class="text-4xl"> {{ current_weather.temperature }}°C</span>
          <img src="/temp.svg" alt="temp" class="h-10 invert" />
        </div>
        <span class="text-center text-gray-200">
          Feels like {{ current_weather.apparent_temperature }}°C</span
        >
      </div>
      <!-- rain -->
      <div class="flex flex-col gap-1 justify-self-center">
        <div class="flex flex-row justify-center gap-3">
          <img src="/rain.svg" alt="rain" class="h-10 invert" />
          <span class="text-4xl">
            {{ current_weather.precipitation }}<span class="text-3xl">mm</span></span
          >
        </div>
        <span class="text-center text-gray-200">Precipitation</span>
      </div>
      <!-- humidity -->
      <div class="flex flex-col gap-1 justify-self-center">
        <div class="flex flex-row justify-center gap-3">
          <span class="text-4xl"> {{ current_weather.humidity }}%</span>
          <img src="/humidity.svg" alt="humidity" class="h-10 invert" />
        </div>
        <span class="text-center text-gray-200">Humidity</span>
      </div>
      <!-- wind -->
      <div class="flex flex-col gap-1 justify-self-center">
        <div class="flex flex-row justify-center gap-3">
          <img src="/wind.svg" alt="wind" class="h-10 invert" />
          <span class="text-4xl"> {{ current_weather.wind }}<span class="text-3xl">kmh</span></span>
        </div>
        <span class="text-center text-gray-200">Wind speed</span>
      </div>
      <!-- UV -->
      <div class="flex flex-col gap-1 justify-self-center">
        <div class="flex w-full flex-row justify-center gap-3">
          <span class="text-4xl"> ~{{ current_weather.approx_uv.toFixed(2) }}</span>
          <img src="/uv.svg" alt="uv" class="h-10 invert" />
        </div>
        <span class="text-center text-gray-200">Approximate UV index</span>
      </div>
      <!-- Cloudcover -->
      <div class="flex flex-col gap-1 justify-self-center">
        <div class="flex flex-row justify-center gap-3">
          <img src="/cloud.svg" alt="cloud" class="h-10 invert" />
          <span class="text-4xl"> {{ current_weather.cloudcover }}%</span>
        </div>
        <span class="text-center text-gray-200">Cloud cover</span>
      </div>
    </div>

    <div class="flex flex-row gap-4 overflow-x-auto p-4">
      <div
        v-for="forecast in next_24hour_forecast"
        v-bind:key="forecast.timestamp"
        class="flex h-32 w-48 flex-none flex-col items-center justify-center rounded-xl bg-gray-700 text-2xl text-white"
      >
        <div>
          {{ time_string(forecast.timestamp) }}
        </div>
        <div>{{ forecast.temperature }}°C</div>

        <div ref="forecast_texts" class="text-center">
          {{ forecast.weather_code }}
          <!-- {{ 'Thunderstorm with hail (moderate)' }} -->
          <!-- {{ 'Moderate rain showers' }} -->
          <!-- {{ 'Overcast' }} -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invert {
  filter: invert(1);
}
</style>
