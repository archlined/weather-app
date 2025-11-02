<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

import {
  get_current_weather,
  get_weather_forecast_next_24_hours,
  search_location,
  get_unique_location_id,
  type Weather,
  type Location,
} from '@/logic/weather_provider'

import {
  saved,
  load_from_local_storage,
  save_and_sync_local_storage,
  remove_and_sync_local_storage,
  update_all_saved_weathers,
  type SavedEntry,
} from './stores/saved_weathers'

import MainWeatherCard from './components/MainWeatherCard.vue'
import LocationCard from './components/LocationCard.vue'
import PartialWeatherCard from './components/PartialWeatherCard.vue'

onMounted(() => {
  load_from_local_storage()
  update_all_saved_weathers()
  // every 15 minutes
  periodic_update_interval_handle = setInterval(periodic_update, 15 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(periodic_update_interval_handle)
})

const search_string = ref('')
let search_timeout_handle: number | null = null

let periodic_update_interval_handle: number

const selected_saved_entry_id: Ref<string | null> = ref(null)

const main_view: Ref<
  | {
      state: 'welcome'
    }
  | {
      state: 'loading_weather_display'
    }
  | {
      state: 'weather_display'
      location: Location
      current_weather: Weather
      next_24hour_forecast: Weather[]
    }
  | {
      state: 'loading_search_results_display'
      prev_display: {
        location: Location
        current_weather: Weather
        next_24hour_forecast: Weather[]
      } | null
    }
  | {
      state: 'search_results_display'
      search_results: Location[]
      prev_displayed: {
        location: Location
        current_weather: Weather
        next_24hour_forecast: Weather[]
      } | null
    }
> = ref({
  state: 'welcome',
})

const periodic_update = async () => {
  console.log('Periodic update ran')
  update_all_saved_weathers()

  if (main_view.value.state == 'weather_display') {
    const current_viewed_location = main_view.value.location
    const found = saved.value.find(
      (x) => get_unique_location_id(x.location) == get_unique_location_id(current_viewed_location),
    )

    if (found) {
      main_view.value.current_weather = found.current_weather
      main_view.value.next_24hour_forecast = found.next_24hours_forecast
      return
    }

    const updated_current_weather = await get_current_weather(current_viewed_location)
    const updated_next_24hour_forecast =
      await get_weather_forecast_next_24_hours(current_viewed_location)
    main_view.value.current_weather = updated_current_weather
    main_view.value.next_24hour_forecast = updated_next_24hour_forecast
  }
}

watch(search_string, (new_search: string, old_search: string) => {
  if (main_view.value.state == 'loading_weather_display') return
  if (!old_search) {
    // clearTimeout(search_timeout_handle!)
    search_timeout_handle = setTimeout(() => {
      search(search_string.value)
    }, 500)
  } else if (old_search && new_search == '') {
    clearTimeout(search_timeout_handle!)
    if (main_view.value.state == 'search_results_display') {
      if (main_view.value.prev_displayed) {
        main_view.value = {
          state: 'weather_display',
          location: main_view.value.prev_displayed.location,
          current_weather: main_view.value.prev_displayed.current_weather,
          next_24hour_forecast: main_view.value.prev_displayed.next_24hour_forecast,
        }
      } else {
        main_view.value = {
          state: 'welcome',
        }
      }
    }
  } else {
    clearTimeout(search_timeout_handle!)
    search_timeout_handle = setTimeout(() => {
      search(search_string.value)
    }, 500)
  }
})

const search_pressed = async (search_term: string) => {
  clearTimeout(search_timeout_handle!)
  search(search_term)
}

const search = async (search_term: string) => {
  let prev = null

  switch (main_view.value.state) {
    case 'welcome': {
      break
    }
    case 'weather_display': {
      prev = {
        location: main_view.value.location,
        current_weather: main_view.value.current_weather,
        next_24hour_forecast: main_view.value.next_24hour_forecast,
      }
      console.log('saved', prev)
      break
    }
    case 'search_results_display': {
      prev = main_view.value.prev_displayed
      break
    }
    case 'loading_search_results_display': {
      break
    }
    case 'loading_weather_display': {
      break
    }
    default:
      const _exhaustive_check: never = main_view.value
  }

  main_view.value = {
    state: 'loading_search_results_display',
    prev_display: prev,
  }

  const search_results = await search_location(search_term)

  main_view.value = {
    state: 'search_results_display',
    search_results: search_results,
    prev_displayed: main_view.value.prev_display,
  }
}

const location_clicked = async (location: Location) => {
  main_view.value = {
    state: 'loading_weather_display',
  }
  search_string.value = ''
  const current_weather = await get_current_weather(location)
  const forecast = await get_weather_forecast_next_24_hours(location)

  main_view.value = {
    state: 'weather_display',
    current_weather: current_weather,
    next_24hour_forecast: forecast,
    location: location,
  }
}

const saved_entry_clicked = (saved_weather: SavedEntry) => {
  main_view.value = {
    state: 'weather_display',
    location: saved_weather.location,
    current_weather: saved_weather.current_weather,
    next_24hour_forecast: saved_weather.next_24hours_forecast,
  }
  selected_saved_entry_id.value = get_unique_location_id(saved_weather.location)
}

const remove_saved_entry_clicked = (saved_weather: SavedEntry) => {
  remove_and_sync_local_storage(saved_weather.location)
}

const add_clicked = () => {
  if (main_view.value.state != 'weather_display') {
    console.log('ERROR')
    return
  }

  save_and_sync_local_storage({
    location: main_view.value.current_weather.location,
    current_weather: main_view.value.current_weather,
    next_24hours_forecast: main_view.value.next_24hour_forecast,
  })
}

//
</script>

<template>
  <div class="flex min-h-screen w-screen flex-row bg-gray-900 text-gray-100">
    <!-- The nav section of the page -->
    <nav class="w-3/8">
      <ul v-if="saved" class="h-screen overflow-x-scroll">
        <PartialWeatherCard
          v-for="saved_entry in saved"
          v-bind:key="get_unique_location_id(saved_entry.location)"
          :saved_entry="saved_entry"
          :class="{
            'bg-gray-800': selected_saved_entry_id == get_unique_location_id(saved_entry.location),
          }"
          @saved_entry_selected="saved_entry_clicked"
          @remove_saved_entry_selected="remove_saved_entry_clicked"
        />
      </ul>
      <div v-else>
        <span>Your saved weathers will appear here</span>
      </div>
    </nav>

    <!-- The search and the main view -->
    <div class="flex w-5/8 flex-col gap-6 px-3 py-3">
      <!-- Search -->
      <div class="flex flex-row justify-center gap-3">
        <input
          type="text"
          class="h-10 w-full bg-gray-100 pl-3 text-black"
          name="searchbar"
          placeholder="Type your search here"
          v-model="search_string"
          @keyup.enter="() => search_pressed(search_string)"
        />
        <!-- <svg src="/search.svg" alt="search" class="h-10 w-1/6" /> -->
      </div>

      <!-- Main View -->
      <div class="flex flex-1 flex-col">
        <div
          v-if="main_view.state == 'welcome'"
          class="flex h-full flex-col items-center justify-center gap-3"
        >
          <span>Welcome to my weather app!</span>
          <span>Type something into the search to get started</span>
          <span>Your saved locations will be saved on the left</span>
        </div>
        <div
          v-if="
            main_view.state == 'loading_weather_display' ||
            main_view.state == 'loading_search_results_display'
          "
          class="flex h-full flex-col items-center justify-center gap-3"
        >
          <div
            class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800"
          ></div>
        </div>
        <MainWeatherCard
          v-else-if="main_view.state == 'weather_display'"
          class="flex-1 p-3"
          :location="main_view.location"
          :current_weather="main_view.current_weather"
          :next_24hour_forecast="main_view.next_24hour_forecast"
          @add="() => add_clicked()"
        ></MainWeatherCard>
        <ul
          v-else-if="main_view.state == 'search_results_display'"
          class="flex flex-col gap-2 overflow-x-scroll [&>*]:hover:bg-gray-600"
        >
          <span v-if="main_view.search_results.length == 0" class="mx-auto">No results</span>
          <LocationCard
            v-for="result in main_view.search_results"
            v-bind:location="result"
            v-bind:key="get_unique_location_id(result)"
            class="bg-gray-800 p-2 hover:cursor-pointer"
            @click="() => location_clicked(result)"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
html {
  background-color: var(--color-gray-900);
}
</style>
